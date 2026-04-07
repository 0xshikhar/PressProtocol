import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: { cid: string };
}): Promise<Metadata> {
  const { cid } = params;
  return {
    title: `Sovereign Article | PressProtocol Embed`,
    description: `Decentralized, cryptographically verified sovereign publication on PressProtocol (CID: ${cid}).`,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `Sovereign Article | PressProtocol`,
      description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
      images: [
        {
          url: `/api/og/${cid}`,
          width: 1200,
          height: 630,
          alt: "PressProtocol Sovereign Article Card",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Sovereign Article | PressProtocol`,
      description: `Decentralized, cryptographically verified sovereign publication on PressProtocol.`,
      images: [`/api/og/${cid}`],
    },
  };
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full min-h-screen m-0 p-0 antialiased selection:bg-emerald-500/30">
      {children}
    </div>
  );
}
