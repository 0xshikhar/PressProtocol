import { Metadata } from "next";
import Link from "next/link";
import { Shield, Key, EyeOff, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy & Zero-Knowledge Architecture | PressProtocol",
  description: "PressProtocol zero-logging architecture, sovereign burner key isolation, and decentralized data handling policies.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent-tint selection:text-primary py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-primary hover:bg-surface text-xs font-mono rounded-[6px]">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-hairline bg-overlay text-secondary font-mono text-xs rounded-[6px]">
              <Shield className="h-3 w-3 mr-1 text-muted" /> Sovereign Architecture
            </Badge>
            <span className="text-xs text-muted font-mono">Last Updated: September 2026</span>
          </div>
          <h1 className="font-hero text-4xl sm:text-5xl font-normal tracking-tight text-primary">
            Privacy Policy &amp; Zero-Log Architecture
          </h1>
          <p className="text-base sm:text-lg text-secondary leading-relaxed font-light">
            PressProtocol is engineered for dissidents, whistleblowers, and independent journalists. Our core architectural invariant is simple: <strong className="text-primary font-normal">we cannot compromise your data because we never collect it.</strong>
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-hairline bg-surface text-primary rounded-[6px]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-[6px] bg-surface-raised border border-hairline flex items-center justify-center text-verified">
                <EyeOff className="h-5 w-5" />
              </div>
              <h3 className="font-sans font-semibold text-base text-primary">Zero Access Logs</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                PressProtocol Node daemons and edge relays do not retain IP addresses, HTTP user-agents, referrers, or reader browsing telemetry.
              </p>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-surface text-primary rounded-[6px]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-[6px] bg-surface-raised border border-hairline flex items-center justify-center text-secondary">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="font-sans font-semibold text-base text-primary">Client-Side Private Keys</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                Ed25519 burner wallets are generated in your browser via WebCrypto. Your private key signs payloads locally and never touches our servers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* In-Depth Sections */}
        <div className="space-y-8 text-secondary font-sans leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">1. Anonymous Publishing &amp; In-Browser Keypairs</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              When publishing without an account, PressProtocol generates an ephemeral <strong className="text-primary font-normal">Ed25519 cryptographic keypair</strong> inside your local browser runtime. 
              The private key is stored exclusively in your browser&apos;s <code className="text-xs font-mono bg-surface-raised border border-hairline text-primary px-1.5 py-0.5 rounded-[4px]">localStorage</code> under your control. 
              Signing occurs on your device before network transit. You can permanently destroy this identity and its local post index at any time by clicking <em>&ldquo;Burn &amp; Regenerate Identity&rdquo;</em>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">2. Decentralized Content Distribution</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Content published through PressProtocol is converted into an immutable, content-addressed <strong className="text-primary font-normal">IPFS CID (Content Identifier)</strong>. 
              Once published, the CID is replicated across public IPFS nodes, pinning clusters, and Tor v3 onion services. 
              Because IPFS is a public peer-to-peer network, content you choose to publish is permanently accessible by anyone with the CID. Do not include unencrypted private credentials or personal identifying information in published articles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">3. Optional Privy Authentication &amp; Profiles</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Authors who desire persistent, cross-device public profiles can optionally connect via <strong className="text-primary font-normal">Privy</strong> (social login or Web3 wallet). 
              If you authenticate via Privy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted font-light">
              <li>Your public wallet address or verified email is associated only with articles you explicitly choose to publish under your <em>&ldquo;Verified Profile&rdquo;</em>.</li>
              <li>You retain the ability to switch into <strong className="text-secondary font-normal">Anonymous Burner mode</strong> for sensitive dispatches with zero linkage to your profile.</li>
              <li>PressProtocol never has access to your Privy wallet private key or MPC recovery shards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">4. Cookies, Analytics &amp; Third-Party Trackers</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              PressProtocol does not use marketing cookies, tracking pixels, or intrusive third-party analytics (e.g., Google Analytics, Meta Pixel). 
              Local state (drafts, burner keypairs, theme preferences) is stored in standard HTML5 local storage on your client device and is never synchronized to central telemetry servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">5. Serverless Gateway Failover &amp; Transport Telemetry</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              When reading content, our edge gateway queries public decentralized gateways (Pinata, Cloudflare, ipfs.io, dweb.link). 
              These requests transmit only the requested CID. No reader profile or reading session history is logged or monetized.
            </p>
          </section>
        </div>

        {/* Contact / Verification Footer */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted font-mono">
            Audited &amp; Open Source under MIT License &bull; Verifiable Cryptographic Sovereign Publishing
          </p>
          <div className="flex gap-3">
            <Link href="/terms">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">Terms of Service</Button>
            </Link>
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">Technical Spec</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
