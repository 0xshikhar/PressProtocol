import { NextRequest, NextResponse } from "next/server";
import { fetchFeedArticles, generateRssFeed, generateAtomFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase();
    const baseUrl = new URL(request.url).origin;

    const articles = await fetchFeedArticles(undefined, 40);

    const xml = format === "atom"
      ? generateAtomFeed(articles, { baseUrl, format: "atom" })
      : generateRssFeed(articles, { baseUrl, format: "rss" });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("Error generating global feed.xml:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error><message>Failed to generate syndication feed</message></error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
