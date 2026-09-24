import type { Metadata } from "next";
import { fetchArticleMetadata } from "@/lib/article-metadata";
import { siteConfig } from "@/config/site";
import { ReadArticleClient } from "./ReadArticleClient";

interface PageProps {
  params: { cid: string };
  searchParams: { quote?: string; q?: string; v?: string; [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { cid } = params;
  const rawQuote =
    typeof searchParams.quote === "string"
      ? searchParams.quote
      : typeof searchParams.q === "string"
      ? searchParams.q
      : "";
  const quote = rawQuote.trim();

  const baseUrl = (siteConfig.url.base || "https://pressprotocol.com").replace(/\/+$/, "");

  // If a quote was selected and shared, generate a dedicated verified quote card
  // If sharing standard article, add ?v=2 to bust Twitter's stale crawler cache
  const ogImageUrl = quote
    ? `${baseUrl}/api/og/${cid}?quote=${encodeURIComponent(quote.slice(0, 180))}`
    : `${baseUrl}/api/og/${cid}?v=2`;

  try {
    const meta = await fetchArticleMetadata(cid);

    const articleTitle =
      meta.title && meta.title !== "Sovereign Document"
        ? meta.title
        : "Sovereign Article";

    const displayTitle = `${articleTitle} | PressProtocol`;

    const displayDescription = quote
      ? "Click to read this verified sovereign dispatch on PressProtocol."
      : meta.excerpt ||
        "Immutable, cryptographically verified publication preserved on PressProtocol decentralized infrastructure.";

    return {
      title: displayTitle,
      description: displayDescription,
      openGraph: {
        title: displayTitle,
        description: displayDescription,
        type: "article",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: displayTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: displayTitle,
        description: displayDescription,
        images: [ogImageUrl],
      },
    };
  } catch {
    const fallbackTitle = "Sovereign Article | PressProtocol";
    const fallbackDescription = "Click to read this verified sovereign dispatch on PressProtocol.";
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: fallbackTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: [ogImageUrl],
      },
    };
  }
}

export default function Page({ params }: PageProps) {
  return <ReadArticleClient cid={params.cid} />;
}
