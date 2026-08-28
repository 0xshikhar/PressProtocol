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
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        <DeveloperPortalClient />
      </div>
    </main>
  );
}
