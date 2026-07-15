import { NextRequest, NextResponse } from "next/server";
import { parseFullRssFeed } from "@/lib/scrubber";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedUrl } = body;

    if (!feedUrl || typeof feedUrl !== "string") {
      return NextResponse.json(
        { error: "A valid RSS or Atom feed URL is required." },
        { status: 400 }
      );
    }

    // Validate URL syntax
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(feedUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL syntax provided. Please include http:// or https://" },
        { status: 400 }
      );
    }

    // Fetch the remote feed
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PressProtocol-Archiver/2.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to retrieve feed from ${parsedUrl.hostname}: HTTP ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    if (!xmlText || xmlText.trim().length === 0) {
      return NextResponse.json(
        { error: "The provided URL returned an empty response." },
        { status: 422 }
      );
    }

    // Check if output looks like XML / RSS / Atom
    const looksLikeXml =
      xmlText.includes("<rss") ||
      xmlText.includes("<feed") ||
      xmlText.includes("<?xml") ||
      xmlText.includes("<channel>") ||
      xmlText.includes("<entry>");

    if (!looksLikeXml) {
      return NextResponse.json(
        {
          error:
            "The provided URL does not appear to be an RSS 2.0 or Atom feed. If this is a Substack, try appending '/feed' to the URL (e.g. https://author.substack.com/feed).",
        },
        { status: 422 }
      );
    }

    const feed = parseFullRssFeed(xmlText, parsedUrl.toString());

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json(
        {
          error:
            "No publication articles were found in this RSS/Atom feed. The feed may be empty, private, or paywall-protected.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      feed,
    });
  } catch (err: any) {
    console.error("Error parsing bulk RSS feed:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to parse publication archive feed",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
