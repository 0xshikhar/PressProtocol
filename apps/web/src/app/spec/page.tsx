import { Metadata } from "next";
import Link from "next/link";
import { Cpu, Terminal, Shield, Network, FileCode, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Protocol Technical Specification (v1.2)",
  description: "Official PressProtocol technical specification: RFC 8032 Ed25519 signing, CIDv1 multihashes, Tor v3 onion routing, and multi-transport failover.",
};

export default function SpecPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Navigation */}
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
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
              <Terminal className="h-3 w-3 mr-1" /> RFC SPECIFICATION
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">SPEC-2026-09-V1.2</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            PressProtocol Architecture Specification
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The formal engineering definition for content addressing, client-side sovereign cryptography, multi-transport routing, and failover mechanics.
          </p>
        </div>

        {/* Protocol Invariants */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-cyan-500 font-semibold">PRIMITIVE 01</span>
              <h3 className="font-semibold text-sm">RFC 8032 Ed25519</h3>
              <p className="text-xs text-muted-foreground">
                All author signatures are generated over canonical payloads using 256-bit elliptic curves.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-emerald-500 font-semibold">PRIMITIVE 02</span>
              <h3 className="font-semibold text-sm">CIDv1 Multihash</h3>
              <p className="text-xs text-muted-foreground">
                Base32/SHA-256 content addressing ensuring tamper-proof bit-level immutability.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-purple-500 font-semibold">PRIMITIVE 03</span>
              <h3 className="font-semibold text-sm">Tor v3 Onionize</h3>
              <p className="text-xs text-muted-foreground">
                56-character ed25519 onion services mapped 1:1 with content CIDs for deep censorship evasion.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Specification Body */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">1. Canonical JSON Schema & Signing Payload</h2>
            <p className="text-muted-foreground leading-relaxed">
              To prevent signature malleability across different JSON serialization implementations, PressProtocol conforms to <strong>RFC 8785 (JSON Canonicalization Scheme)</strong>. 
              The exact byte sequence signed by the author&apos;s Ed25519 private key is structured as follows:
            </p>
            <pre className="p-4 rounded-lg bg-zinc-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-zinc-800">
{`// Canonical Signed Payload (RFC 8785)
{
  "title": "Investigative Dispatch: Decentralized Infrastructure",
  "tags": ["whistleblower", "censorship", "ipfs"],
  "timestamp": "2026-09-11T14:15:00.000Z"
}`}
            </pre>
            <p className="text-sm text-muted-foreground">
              The signature is encoded as a <strong>64-byte (128 character) hexadecimal string</strong>. Public keys are standard <strong>32-byte (64 character) hex-encoded Ed25519 points</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">2. Immutable IPFS Content Envelope</h2>
            <p className="text-muted-foreground leading-relaxed">
              The full document payload pinned to IPFS constitutes the unalterable source of truth:
            </p>
            <pre className="p-4 rounded-lg bg-zinc-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-zinc-800">
{`// IPFS Source of Truth Envelope (Pinned to Swarm)
{
  "title": "Investigative Dispatch: Decentralized Infrastructure",
  "content": "<p>Full unredacted editorial content body in HTML...</p>",
  "tags": ["whistleblower", "censorship", "ipfs"],
  "timestamp": "2026-09-11T14:15:00.000Z",
  "publisher": {
    "pubkey": "b47a98cf29e0134f5984719bcae71629857193749bdf83749174910283749210",
    "signature": "8fa3c019284719284...e81928374910293847192039481726354910293847192039481726",
    "walletAddress": "" // Empty string for sovereign anonymous dispatches
  }
}`}
            </pre>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">3. Multi-Transport Resolution Algorithm</h2>
            <p className="text-muted-foreground leading-relaxed">
              When a client or proxy resolves a document by CID, the resolution engine executes a resilient 2-phase failover:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground text-sm leading-relaxed">
              <li>
                <strong>Stage 1 (Local Node Fast-Path)</strong>: Dispatches <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">GET /api/content/[cid]</code> to the local or cloud Node daemon with an active <strong>2,500ms AbortController</strong>. If the node answers within SLA, returns the cached metadata and IPFS block.
              </li>
              <li>
                <strong>Stage 2 (Parallel Swarm Race)</strong>: If the Node daemon times out or responds with an HTTP error, the engine instantly fires concurrent requests across independent public gateways:
                <ul className="list-disc pl-6 mt-1 space-y-1 text-xs">
                  <li><code className="font-mono">https://gateway.pinata.cloud/ipfs/[cid]</code></li>
                  <li><code className="font-mono">https://cloudflare-ipfs.com/ipfs/[cid]</code></li>
                  <li><code className="font-mono">https://ipfs.io/ipfs/[cid]</code></li>
                  <li><code className="font-mono">https://dweb.link/ipfs/[cid]</code></li>
                </ul>
                Using <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">Promise.any()</code>, the fastest responsive peer hydrates the document, while slower requests are aborted immediately.
              </li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            Open Standard &bull; Deterministic Cryptography
          </p>
          <div className="flex gap-3">
            <Link href="/about">
              <Button variant="outline" size="sm" className="text-xs">About & Mission</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
