import { NextRequest, NextResponse } from "next/server";
import { extractArticleFromUrl } from "@/lib/scrubber";
import { PressProtocolClient } from "@pressprotocol/sdk";
import { getBackendUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, tags, privateKey, autoPublish = true } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL or RSS feed string is required" },
        { status: 400 }
      );
    }

    // Validate URL syntax
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL syntax provided" },
        { status: 400 }
      );
    }

    // 1. Extract and purge surveillance trackers
    const scrubbed = await extractArticleFromUrl(url);

    if (!scrubbed.cleanHtml || scrubbed.cleanHtml.length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract meaningful article content from the specified URL. Ensure the article is publicly accessible.",
        },
        { status: 422 }
      );
    }

    const mergedTags = Array.from(new Set([...(tags || []), ...scrubbed.tags]));

    // 2. If autoPublish is false, return preview data
    if (!autoPublish) {
      return NextResponse.json({
        success: true,
        scrubbed,
        telemetry: scrubbed.telemetry,
        published: false,
      });
    }

    // 3. Publish canonical sovereign content using PressProtocol SDK
    const backendEndpoint = getBackendUrl();
    const client = new PressProtocolClient({
      endpoint: backendEndpoint,
      privateKey: privateKey || undefined,
    });

    const publishResult = await client.publish({
      title: scrubbed.title,
      content: scrubbed.cleanHtml,
      tags: mergedTags,
      privateKey: privateKey || undefined,
    });

    // 4. Construct sovereign embed iframe code
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://pressprotocol.com";
    const embedCode = `<iframe src="${baseUrl}/embed/${publishResult.cid}?theme=cyber" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;

    return NextResponse.json({
      success: true,
      published: true,
      cid: publishResult.cid,
      shareUrl: `${baseUrl}/read/${publishResult.cid}`,
      embedUrl: `${baseUrl}/embed/${publishResult.cid}`,
      embedCode,
      article: {
        title: scrubbed.title,
        author: scrubbed.author,
        excerpt: scrubbed.excerpt,
        canonicalUrl: scrubbed.canonicalUrl,
        publishedAt: scrubbed.publishedAt,
        tags: mergedTags,
        cleanHtml: scrubbed.cleanHtml,
      },
      telemetry: scrubbed.telemetry,
      publication: publishResult,
    });
  } catch (err: any) {
    console.error("Error importing article:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to extract and syndicate article",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
