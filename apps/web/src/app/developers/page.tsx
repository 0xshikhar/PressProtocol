import { Metadata } from "next";
import DeveloperPortalClient from "@/components/developers/DeveloperPortalClient";

export const metadata: Metadata = {
  title: "Developer Portal & Infrastructure Gateway | PressProtocol",
  description: "Interactive API explorer, 1-click sandbox API key generation, OpenAPI 3.1 specifications, universal web component playground, and multi-language SDKs for censorship-resistant publishing.",
  openGraph: {
    title: "PressProtocol Developer Portal & Infrastructure Gateway",
    description: "The Stripe for Sovereign Publishing. Integrate decentralized IPFS, Tor v3, and cryptographic Ed25519 publishing rails into any application or CMS.",
    type: "website",
  },
};

export default function DevelopersPage() {
  return (
    <main className="min-h-screen bg-canvas text-text-primary py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient subtle burgundy glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-accent-primary/[0.08] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-6xl space-y-16">
        <DeveloperPortalClient />
      </div>
    </main>
  );
}
