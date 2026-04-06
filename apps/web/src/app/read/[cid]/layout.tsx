import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { cid: string };
}): Promise<Metadata> {
  const { cid } = params;
  const ogImageUrl = `/api/og/${cid}`;

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

export default function ReadArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
