import type { Metadata } from "next";
import { fetchArticleMetadata } from "@/lib/article-metadata";

export async function generateMetadata({
  params,
}: {
  params: { cid: string };
}): Promise<Metadata> {
  const { cid } = params;
  const ogImageUrl = `/api/og/${cid}`;

  try {
    const meta = await fetchArticleMetadata(cid);

    const displayTitle =
      meta.title && meta.title !== "Sovereign Document"
        ? `${meta.title} | PressProtocol`
        : `Sovereign Article | PressProtocol`;

    const displayDescription =
      meta.excerpt ||
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
            alt: meta.title || "PressProtocol Sovereign Publication",
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
    // Guaranteed defensive fallback (preserves previous baseline behavior)
    return {
      title: `Sovereign Article | PressProtocol`,
      description: `Decentralized, cryptographically verified sovereign publication on PressProtocol (CID: ${cid}).`,
      openGraph: {
        title: `Sovereign Article | PressProtocol`,
        description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `PressProtocol Sovereign Article Card (${cid})`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Sovereign Article | PressProtocol`,
        description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
        images: [ogImageUrl],
      },
    };
  }
}

export default function ReadArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
