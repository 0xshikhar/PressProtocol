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

    const displayTitle = quote
      ? `"${quote.length > 60 ? `${quote.slice(0, 57)}...` : quote}" — ${meta.title || "Sovereign Article"} | PressProtocol`
      : meta.title && meta.title !== "Sovereign Document"
      ? `${meta.title} | PressProtocol`
      : `Sovereign Article | PressProtocol`;

    const displayDescription = quote
      ? `Verified sovereign quote from "${meta.title || "Article"}" preserved on PressProtocol (CID: ${cid}).`
      : meta.excerpt ||
        `Decentralized, cryptographically verified publication preserved on PressProtocol (CID: ${cid}).`;

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
    const fallbackTitle = quote
      ? `"${quote.slice(0, 50)}..." | PressProtocol`
      : `Sovereign Article | PressProtocol`;
    return {
      title: fallbackTitle,
      description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
      openGraph: {
        title: fallbackTitle,
        description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
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
        description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
        images: [ogImageUrl],
      },
    };
  }
}

export default function Page({ params }: PageProps) {
  return <ReadArticleClient cid={params.cid} />;
}
