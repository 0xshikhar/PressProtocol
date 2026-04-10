import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { scrubArticleHtml } from "@/lib/scrubber";
import { PressProtocolClient } from "@pressprotocol/sdk";
import { getBackendUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

/**
 * Validates Ghost HMAC-SHA256 signature from Ghost-Signature header.
 * Ghost signature format: sha256=<hash>, t=<timestamp>
 */
function verifyGhostSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const parts = signatureHeader.split(",").reduce(
    (acc, part) => {
      const [k, v] = part.trim().split("=");
      if (k && v) acc[k] = v;
      return acc;
    },
    {} as Record<string, string>
  );

  const signature = parts["sha256"];
  const timestamp = parts["t"];

  if (!signature || !timestamp) {
    return false;
  }

  // Replay attack prevention: verify timestamp within 10 minutes (600,000 ms)
  const webhookTime = parseInt(timestamp, 10);
  const now = Date.now();
  if (isNaN(webhookTime) || Math.abs(now - webhookTime) > 10 * 60 * 1000) {
    console.warn("Ghost webhook timestamp expired or drifted:", { webhookTime, now });
    return false;
  }

  const payload = `${rawBody}${timestamp}`;
  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(computedHash, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("ghost-signature") ||
      req.headers.get("x-ghost-signature");

    const webhookSecret = process.env.GHOST_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      const isValid = verifyGhostSignature(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Ghost HMAC signature or expired timestamp" },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️ GHOST_WEBHOOK_SECRET is not configured in production environment."
      );
    }

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload in Ghost webhook" },
        { status: 400 }
      );
    }

    // Extract post object from Ghost payload
    const post = parsedBody.post?.current || parsedBody.post || parsedBody;

    if (!post || !post.title || !post.html) {
      return NextResponse.json(
        {
          error:
            "Missing post title or html in Ghost payload. Expected post.current.title and post.current.html.",
        },
        { status: 422 }
      );
    }

    // 1. Scrub tracking beacons and ad scripts from Ghost HTML
    const scrubbed = scrubArticleHtml(post.html);

    // 2. Extract tags
    const tags: string[] = [];
    if (Array.isArray(post.tags)) {
      for (const t of post.tags) {
        if (typeof t === "string") tags.push(t);
        else if (t && typeof t.name === "string") tags.push(t.name);
      }
    }

    // 3. Publish to PressProtocol sovereign network via SDK
    const client = new PressProtocolClient({
      endpoint: getBackendUrl(),
      privateKey: process.env.PRESSPROTOCOL_GHOST_PRIVATE_KEY || undefined,
    });

    const publishResult = await client.publish({
      title: post.title,
      content: scrubbed.cleanHtml,
      tags,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://pressprotocol.com";
    const embedCode = `<iframe src="${baseUrl}/embed/${publishResult.cid}?theme=cyber" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;

    return NextResponse.json({
      success: true,
      message: "Ghost publication syndicated to PressProtocol",
      cid: publishResult.cid,
      shareUrl: `${baseUrl}/read/${publishResult.cid}`,
      embedUrl: `${baseUrl}/embed/${publishResult.cid}`,
      embedCode,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        tags,
      },
      telemetry: scrubbed.telemetry,
      publication: publishResult,
    });
  } catch (err: any) {
    console.error("Ghost webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error handling Ghost webhook" },
      { status: 500 }
    );
  }
}
