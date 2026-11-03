import { NextRequest, NextResponse } from "next/server";
import {
  extractNotionPageId,
  fetchPublicNotionBlocks,
  convertNotionBlocksToHtml,
  parseNotionMarkdown,
} from "@/lib/notion";
import { PressProtocolClient } from "@pressprotocol/sdk";
import { getBackendUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      pageId,
      rawMarkdown,
      rawBlocks,
      tags = ["notion", "sovereign-doc"],
      privateKey,
      autoPublish = false,
    } = body;

    let article;

    // Mode 1: Pasted Notion Markdown
    if (rawMarkdown && typeof rawMarkdown === "string" && rawMarkdown.trim()) {
      article = parseNotionMarkdown(rawMarkdown);
    }
    // Mode 2: Direct Notion Block Tree JSON
    else if (rawBlocks && typeof rawBlocks === "object") {
      const rootId = pageId || Object.keys(rawBlocks.block || {})[0] || "root";
      article = convertNotionBlocksToHtml(rawBlocks, rootId);
    }
    // Mode 3: Public Notion Page URL or ID
    else if (url || pageId) {
      const targetStr = url || pageId;
      const extractedPageId = extractNotionPageId(targetStr);

      if (!extractedPageId) {
        return NextResponse.json(
          {
            error:
              "Could not extract a valid 32-character Notion Page ID from the provided URL. Ensure you have copied the full public share link.",
          },
          { status: 400 }
        );
      }

      try {
        const recordMap = await fetchPublicNotionBlocks(extractedPageId);
        article = convertNotionBlocksToHtml(recordMap, extractedPageId);
        article.sourceUrl = url;
      } catch (fetchErr: any) {
        return NextResponse.json(
          {
            error: `Failed to load public Notion page (${fetchErr.message}). Ensure the Notion page is set to 'Share to Web' in the top-right Share menu.`,
            details: String(fetchErr),
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Please provide a Notion page URL, page ID, or pasted Markdown." },
        { status: 400 }
      );
    }

    if (!article || !article.cleanHtml || article.cleanHtml.length < 10) {
      return NextResponse.json(
        { error: "Could not extract meaningful article content from the Notion source." },
        { status: 422 }
      );
    }

    // If preview only
    if (!autoPublish) {
      return NextResponse.json({
        success: true,
        published: false,
        article,
        stats: article.stats,
      });
    }

    // If autoPublish is requested
    const backendEndpoint = getBackendUrl();
    const client = new PressProtocolClient({
      endpoint: backendEndpoint,
      privateKey: privateKey || undefined,
    });

    const publishResult = await client.publish({
      title: article.title,
      content: article.cleanHtml,
      tags,
      privateKey: privateKey || undefined,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pressprotocol.com";
    const embedCode = `<iframe src="${baseUrl}/embed/${publishResult.cid}?theme=cyber" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;

    return NextResponse.json({
      success: true,
      published: true,
      cid: publishResult.cid,
      shareUrl: `${baseUrl}/read/${publishResult.cid}`,
      embedUrl: `${baseUrl}/embed/${publishResult.cid}`,
      embedCode,
      article,
      stats: article.stats,
      publication: publishResult,
    });
  } catch (err: any) {
    console.error("Error importing Notion document:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to import Notion document",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
