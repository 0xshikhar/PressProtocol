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
    <main className="min-h-screen bg-[#050508] text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      {/* Ambient glow matching reference design */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-950/25 via-cyan-950/15 to-transparent blur-3xl pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-6xl space-y-16">
        <DeveloperPortalClient />
      </div>
    </main>
  );
}
