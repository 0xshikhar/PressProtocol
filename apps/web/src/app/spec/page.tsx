"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  Shield, 
  Network, 
  FileCode, 
  ArrowLeft, 
  Copy, 
  Check, 
  Cpu, 
  Globe, 
  Radio, 
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const CANONICAL_JSON_PAYLOAD = `// Canonical Signed Payload (RFC 8785)
{
  "title": "Investigative Dispatch: Decentralized Infrastructure",
  "tags": ["whistleblower", "censorship", "ipfs"],
  "timestamp": "2026-09-11T14:15:00.000Z"
}`;

const IPFS_SOURCE_ENVELOPE = `// IPFS Source of Truth Envelope (Pinned to Swarm)
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
}`;

export default function SpecPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#F0F2F8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-white/[0.08] pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-[11px]">
              <Terminal className="h-3 w-3 mr-1" /> RFC SPECIFICATION
            </Badge>
            <span className="text-xs text-zinc-500 font-mono">SPEC-2026-09-V1.2</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white">
            PressProtocol Architecture Specification
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
            The formal engineering definition for content addressing, client-side sovereign cryptography, multi-transport routing, and failover mechanics.
          </p>
        </div>

        {/* Protocol Invariants */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">PRIMITIVE 01</span>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400" /> RFC 8032 Ed25519
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All author signatures are generated over canonical payloads using 256-bit elliptic curves directly in the browser via WebCrypto.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider">PRIMITIVE 02</span>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-emerald-400" /> CIDv1 Multihash
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Base32/SHA-256 content addressing ensuring tamper-proof bit-level immutability across decentralized storage networks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
            <CardContent className="p-5 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-semibold tracking-wider">PRIMITIVE 03</span>
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Network className="h-4 w-4 text-purple-400" /> Tor v3 Onionize
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                56-character Ed25519 onion services mapped 1:1 with content CIDs for deep censorship evasion and sovereign access.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Transport Failover Visual Diagram */}
        <div className="border border-white/[0.08] rounded-2xl bg-[#0B0D14]/90 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" /> Multi-Transport Resolution Flow
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Automated resilient routing with zero single-point-of-failure</p>
            </div>
            <Badge variant="outline" className="border-white/10 text-[11px] font-mono text-zinc-300 w-fit">
              2,500ms Fast-Path SLA
            </Badge>
          </div>

          {/* Diagram Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Phase 1</span>
                <span className="text-[10px] font-mono text-cyan-300/70 bg-cyan-500/10 px-1.5 py-0.5 rounded">&le; 2.5s</span>
              </div>
              <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-cyan-400" /> Local Node Fast-Path
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Queries local or cloud daemon via <code className="text-cyan-300 font-mono text-[11px]">GET /api/content/[cid]</code>. Aborts at 2,500ms.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Phase 2</span>
                <span className="text-[10px] font-mono text-emerald-300/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">Swarm Race</span>
              </div>
              <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-400" /> Parallel Gateway Race
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fires <code className="text-emerald-300 font-mono text-[11px]">Promise.any()</code> across Pinata, Cloudflare, ipfs.io, and dweb.link.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Phase 3</span>
                <span className="text-[10px] font-mono text-purple-300/70 bg-purple-500/10 px-1.5 py-0.5 rounded">Air-Gapped</span>
              </div>
              <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-purple-400" /> Tor &amp; Proof Verify
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tor v3 onion routing + local cryptographic verification via exported <code className="text-purple-300 font-mono text-[11px]">.pressproof.json</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Specification Body */}
        <div className="space-y-10">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                1. Canonical JSON Schema &amp; Signing Payload
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(CANONICAL_JSON_PAYLOAD, "canon")}
                className="h-7 text-xs font-mono gap-1.5 border-white/10 bg-[#0B0D14] hover:bg-white/[0.08] text-zinc-300"
              >
                {copiedSection === "canon" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                Copy JSON
              </Button>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm">
              To prevent signature malleability across different JSON serialization implementations, PressProtocol conforms to <strong className="text-white">RFC 8785 (JSON Canonicalization Scheme)</strong>. 
              The exact byte sequence signed by the author&apos;s Ed25519 private key is structured as follows:
            </p>
            <pre className="p-4 rounded-xl bg-[#06080F] text-cyan-300 font-mono text-xs overflow-x-auto border border-white/[0.08] leading-relaxed select-all">
              {CANONICAL_JSON_PAYLOAD}
            </pre>
            <p className="text-xs text-zinc-400">
              The signature is encoded as a <strong className="text-zinc-200">64-byte (128 character) hexadecimal string</strong>. Public keys are standard <strong className="text-zinc-200">32-byte (64 character) hex-encoded Ed25519 points</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                2. Immutable IPFS Content Envelope
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(IPFS_SOURCE_ENVELOPE, "envelope")}
                className="h-7 text-xs font-mono gap-1.5 border-white/10 bg-[#0B0D14] hover:bg-white/[0.08] text-zinc-300"
              >
                {copiedSection === "envelope" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                Copy Envelope
              </Button>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm">
              The full document payload pinned to IPFS constitutes the unalterable source of truth:
            </p>
            <pre className="p-4 rounded-xl bg-[#06080F] text-emerald-300 font-mono text-xs overflow-x-auto border border-white/[0.08] leading-relaxed select-all">
              {IPFS_SOURCE_ENVELOPE}
            </pre>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
              3. Multi-Transport Resolution Algorithm
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              When a client or proxy resolves a document by CID, the resolution engine executes a resilient 2-phase failover:
            </p>
            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0B0D14]/80 space-y-1.5">
                <strong className="text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Stage 1 (Local Node Fast-Path)
                </strong>
                <p className="text-xs text-zinc-400">
                  Dispatches <code className="text-xs font-mono bg-black/50 text-cyan-300 px-1.5 py-0.5 rounded border border-white/[0.06]">GET /api/content/[cid]</code> to the local or cloud Node daemon with an active <strong>2,500ms AbortController</strong>. If the node answers within SLA, returns the cached metadata and IPFS block.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0B0D14]/80 space-y-1.5">
                <strong className="text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Stage 2 (Parallel Swarm Race)
                </strong>
                <p className="text-xs text-zinc-400">
                  If the Node daemon times out or responds with an HTTP error, the engine instantly fires concurrent requests across independent public gateways:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <code className="text-[11px] font-mono bg-black/60 text-zinc-300 p-2 rounded border border-white/[0.06]">gateway.pinata.cloud/ipfs/[cid]</code>
                  <code className="text-[11px] font-mono bg-black/60 text-zinc-300 p-2 rounded border border-white/[0.06]">cloudflare-ipfs.com/ipfs/[cid]</code>
                  <code className="text-[11px] font-mono bg-black/60 text-zinc-300 p-2 rounded border border-white/[0.06]">ipfs.io/ipfs/[cid]</code>
                  <code className="text-[11px] font-mono bg-black/60 text-zinc-300 p-2 rounded border border-white/[0.06]">dweb.link/ipfs/[cid]</code>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Using <code className="text-xs font-mono bg-black/50 text-emerald-300 px-1.5 py-0.5 rounded border border-white/[0.06]">Promise.any()</code>, the fastest responsive peer hydrates the document, while slower requests are aborted immediately.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">
            Open Standard &bull; Deterministic Cryptography
          </p>
          <div className="flex gap-3">
            <Link href="/about">
              <Button variant="outline" size="sm" className="text-xs border-white/10 bg-[#0B0D14] hover:bg-white/[0.08] text-zinc-300">About &amp; Mission</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs border-white/10 bg-[#0B0D14] hover:bg-white/[0.08] text-zinc-300">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
