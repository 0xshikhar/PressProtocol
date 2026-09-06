import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, EyeOff, Key, Database, RefreshCw, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy & Zero-Knowledge Architecture",
  description: "PressProtocol zero-logging architecture, sovereign burner key isolation, and decentralized data handling policies.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              <Shield className="h-3 w-3 mr-1" /> Sovereign Architecture
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Last Updated: September 2026</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            Privacy Policy & Zero-Log Architecture
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            PressProtocol is engineered for dissidents, whistleblowers, and independent journalists. Our core architectural invariant is simple: <strong>we cannot compromise your data because we never collect it.</strong>
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <EyeOff className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Zero Access Logs</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PressProtocol Node daemons and edge relays do not retain IP addresses, HTTP user-agents, referrers, or reader browsing telemetry.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Client-Side Private Keys</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ed25519 burner wallets are generated in your browser via WebCrypto. Your private key signs payloads locally and never touches our servers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* In-Depth Sections */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">1. Anonymous Publishing & In-Browser Keypairs</h2>
            <p className="text-muted-foreground leading-relaxed">
              When publishing without an account, PressProtocol generates an ephemeral <strong>Ed25519 cryptographic keypair</strong> inside your local browser runtime. 
              The private key is stored exclusively in your browser&apos;s <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">localStorage</code> under your control. 
              Signing occurs on your device before network transit. You can permanently destroy this identity and its local post index at any time by clicking <em>&ldquo;Burn & Regenerate Identity&rdquo;</em>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">2. Decentralized Content Distribution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Content published through PressProtocol is converted into an immutable, content-addressed <strong>IPFS CID (Content Identifier)</strong>. 
              Once published, the CID is replicated across public IPFS nodes, pinning clusters, and Tor v3 onion services. 
              Because IPFS is a public peer-to-peer network, content you choose to publish is permanently accessible by anyone with the CID. Do not include unencrypted private credentials or personal identifying information in published articles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">3. Optional Privy Authentication & Profiles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Authors who desire persistent, cross-device public profiles can optionally connect via <strong>Privy</strong> (social login or Web3 wallet). 
              If you authenticate via Privy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your public wallet address or verified email is associated only with articles you explicitly choose to publish under your <em>&ldquo;Verified Profile&rdquo;</em>.</li>
              <li>You retain the ability to switch into <strong>Anonymous Burner mode</strong> for sensitive dispatches with zero linkage to your profile.</li>
              <li>PressProtocol never has access to your Privy wallet private key or MPC recovery shards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">4. Cookies, Analytics & Third-Party Trackers</h2>
            <p className="text-muted-foreground leading-relaxed">
              PressProtocol does not use marketing cookies, tracking pixels, or intrusive third-party analytics (e.g., Google Analytics, Meta Pixel). 
              Local state (drafts, burner keypairs, theme preferences) is stored in standard HTML5 local storage on your client device and is never synchronized to central telemetry servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">5. Serverless Gateway Failover & Transport Telemetry</h2>
            <p className="text-muted-foreground leading-relaxed">
              When reading content, our edge gateway queries public decentralized gateways (Pinata, Cloudflare, ipfs.io, dweb.link). 
              These requests transmit only the requested CID. No reader profile or reading session history is logged or monetized.
            </p>
          </section>
        </div>

        {/* Contact / Verification Footer */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            Audited & Open Source under MIT License. Verifiable Cryptographic Sovereign Publishing.
          </p>
          <div className="flex gap-3">
            <Link href="/terms">
              <Button variant="outline" size="sm" className="text-xs">Terms of Service</Button>
            </Link>
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs">Technical Spec</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
