import { NextRequest, NextResponse } from "next/server";
import { fetchFeedArticles, generateRssFeed, generateAtomFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  const { tag } = params;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase();
    const baseUrl = new URL(request.url).origin;

    const articles = await fetchFeedArticles(tag, 40);

    const xml = format === "atom"
      ? generateAtomFeed(articles, { tag, baseUrl, format: "atom" })
      : generateRssFeed(articles, { tag, baseUrl, format: "rss" });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error(`Error generating feed for tag #${tag}:`, error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error><message>Failed to generate tag syndication feed</message></error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
