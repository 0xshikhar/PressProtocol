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
  Lock,
  Sliders,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ProtocolSandbox } from "@/components/landing/ProtocolSandbox";
import { TransportNetwork } from "@/components/landing/TransportNetwork";
import { GatewayTelemetry } from "@/components/landing/GatewayTelemetry";

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

type SpecTab = "spec" | "sandbox" | "transport" | "telemetry";

export default function SpecPage() {
  const [activeTab, setActiveTab] = useState<SpecTab>("spec");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas text-primary selection:bg-[var(--accent-tint)] selection:text-primary py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1360px] mx-auto space-y-10">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-primary hover:bg-surface text-xs font-mono rounded-[6px]">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-hairline bg-overlay text-secondary font-mono text-[11px] rounded-[6px]">
                <Terminal className="h-3 w-3 mr-1 text-muted" /> RFC Specification
              </Badge>
              <span className="text-xs text-muted font-mono">SPEC-2026-09-V1.2</span>
            </div>
          </div>

          <div className="border-b border-hairline pb-8">
            <h1 className="font-hero text-3xl sm:text-5xl font-normal tracking-tight text-primary">
              PressProtocol Architecture &amp; Sandboxes
            </h1>
            <p className="mt-3 text-base sm:text-lg text-secondary leading-relaxed font-light max-w-3xl">
              The formal engineering definition for content addressing, client-side sovereign cryptography,
              multi-transport routing, and interactive browser verification sandboxes.
            </p>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap gap-2 border-b border-hairline pb-4">
            <button
              onClick={() => setActiveTab("spec")}
              className={`px-4 py-2 text-xs font-mono rounded-[6px] transition-all flex items-center gap-2 border ${
                activeTab === "spec"
                  ? "bg-surface text-primary border-focus shadow-sm font-medium"
                  : "bg-transparent text-muted border-transparent hover:text-secondary hover:bg-surface/50"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Formal RFC Specification</span>
            </button>

            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-2 text-xs font-mono rounded-[6px] transition-all flex items-center gap-2 border ${
                activeTab === "sandbox"
                  ? "bg-surface text-primary border-focus shadow-sm font-medium"
                  : "bg-transparent text-muted border-transparent hover:text-secondary hover:bg-surface/50"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Cryptographic Verifier Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab("transport")}
              className={`px-4 py-2 text-xs font-mono rounded-[6px] transition-all flex items-center gap-2 border ${
                activeTab === "transport"
                  ? "bg-surface text-primary border-focus shadow-sm font-medium"
                  : "bg-transparent text-muted border-transparent hover:text-secondary hover:bg-surface/50"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>3. Transport Routing &amp; ISP Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-4 py-2 text-xs font-mono rounded-[6px] transition-all flex items-center gap-2 border ${
                activeTab === "telemetry"
                  ? "bg-surface text-primary border-focus shadow-sm font-medium"
                  : "bg-transparent text-muted border-transparent hover:text-secondary hover:bg-surface/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>4. Gateway Telemetry Probes</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Formal RFC Specification */}
        {activeTab === "spec" && (
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
            {/* Protocol Invariants */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-hairline bg-surface rounded-[6px]">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs font-mono text-secondary font-medium tracking-wider">Primitive 01</span>
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <Shield className="h-4 w-4 text-muted" /> RFC 8032 Ed25519
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    All author signatures are generated over canonical payloads using 256-bit elliptic curves directly in the browser via WebCrypto.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hairline bg-surface rounded-[6px]">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs font-mono text-verified font-medium tracking-wider">Primitive 02</span>
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <FileCode className="h-4 w-4 text-verified" /> CIDv1 Multihash
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Base32/SHA-256 content addressing ensuring tamper-proof bit-level immutability across decentralized storage networks.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hairline bg-surface rounded-[6px]">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs font-mono text-anonymous font-medium tracking-wider">Primitive 03</span>
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <Network className="h-4 w-4 text-anonymous" /> Tor v3 Onionize
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    56-character Ed25519 onion services mapped 1:1 with content CIDs for deep censorship evasion and sovereign access.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Multi-Transport Failover Visual Diagram */}
            <div className="border border-hairline rounded-[6px] bg-surface p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
                <div>
                  <h3 className="text-base font-semibold text-primary flex items-center gap-2 font-sans">
                    <Radio className="h-4 w-4 text-muted" /> Multi-Transport Resolution Flow
                  </h3>
                  <p className="text-xs text-muted mt-0.5 font-sans">Automated resilient routing with zero single-point-of-failure</p>
                </div>
                <Badge variant="outline" className="border-hairline text-[11px] font-mono text-muted w-fit rounded-[4px]">
                  2,500ms Fast-Path SLA
                </Badge>
              </div>

              {/* Diagram Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-secondary uppercase tracking-widest font-medium">Phase 1</span>
                    <span className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded-[4px] border border-hairline">&le; 2.5s</span>
                  </div>
                  <div className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <Cpu className="h-4 w-4 text-muted" /> Local Node Fast-Path
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Queries local or cloud daemon via <code className="text-primary font-mono text-[11px]">GET /api/content/[cid]</code>. Aborts at 2,500ms.
                  </p>
                </div>

                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-verified uppercase tracking-widest font-medium">Phase 2</span>
                    <span className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded-[4px] border border-hairline">Swarm Race</span>
                  </div>
                  <div className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <Globe className="h-4 w-4 text-verified" /> Parallel Gateway Race
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Fires <code className="text-primary font-mono text-[11px]">Promise.any()</code> across Pinata, Cloudflare, ipfs.io, and dweb.link.
                  </p>
                </div>

                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-anonymous uppercase tracking-widest font-medium">Phase 3</span>
                    <span className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded-[4px] border border-hairline">Air-Gapped</span>
                  </div>
                  <div className="font-semibold text-sm text-primary flex items-center gap-1.5 font-sans">
                    <Lock className="h-4 w-4 text-anonymous" /> Tor &amp; Proof Verify
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Tor v3 onion routing + local cryptographic verification via exported <code className="text-primary font-mono text-[11px]">.pressproof.json</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Specification Body */}
            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-hero font-normal text-primary">
                    1. Canonical JSON Schema &amp; Signing Payload
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(CANONICAL_JSON_PAYLOAD, "canon")}
                    className="h-7 text-xs font-mono gap-1.5 border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]"
                  >
                    {copiedSection === "canon" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy JSON
                  </Button>
                </div>
                <p className="text-secondary leading-relaxed text-sm font-light">
                  To prevent signature malleability across different JSON serialization implementations, PressProtocol conforms to <strong className="text-primary font-normal">RFC 8785 (JSON Canonicalization Scheme)</strong>. 
                  The exact byte sequence signed by the author&apos;s Ed25519 private key is structured as follows:
                </p>
                <pre className="p-4 rounded-[6px] bg-background text-primary font-mono text-xs overflow-x-auto border border-hairline leading-relaxed select-all">
                  {CANONICAL_JSON_PAYLOAD}
                </pre>
                <p className="text-xs text-muted font-mono">
                  The signature is encoded as a <strong className="text-secondary font-normal">64-byte (128 character) hexadecimal string</strong>. Public keys are standard <strong className="text-secondary font-normal">32-byte (64 character) hex-encoded Ed25519 points</strong>.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-hero font-normal text-primary">
                    2. Immutable IPFS Content Envelope
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(IPFS_SOURCE_ENVELOPE, "envelope")}
                    className="h-7 text-xs font-mono gap-1.5 border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]"
                  >
                    {copiedSection === "envelope" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy Envelope
                  </Button>
                </div>
                <p className="text-secondary leading-relaxed text-sm font-light">
                  The full document payload pinned to IPFS constitutes the unalterable source of truth:
                </p>
                <pre className="p-4 rounded-[6px] bg-background text-primary font-mono text-xs overflow-x-auto border border-hairline leading-relaxed select-all">
                  {IPFS_SOURCE_ENVELOPE}
                </pre>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-hero font-normal text-primary">
                  3. Multi-Transport Resolution Algorithm
                </h2>
                <p className="text-secondary leading-relaxed text-sm font-light">
                  When a client or proxy resolves a document by CID, the resolution engine executes a resilient 2-phase failover:
                </p>
                <div className="space-y-4 text-secondary text-sm leading-relaxed">
                  <div className="p-4 rounded-[6px] border border-hairline bg-surface space-y-1.5">
                    <strong className="text-primary flex items-center gap-2 font-sans font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      Stage 1 (Local Node Fast-Path)
                    </strong>
                    <p className="text-xs text-muted leading-relaxed font-sans">
                      Dispatches <code className="text-xs font-mono bg-background text-primary px-1.5 py-0.5 rounded-[4px] border border-hairline">GET /api/content/[cid]</code> to the local or cloud Node daemon with an active <strong className="text-secondary font-normal">2,500ms AbortController</strong>. If the node answers within SLA, returns the cached metadata and IPFS block.
                    </p>
                  </div>

                  <div className="p-4 rounded-[6px] border border-hairline bg-surface space-y-1.5">
                    <strong className="text-primary flex items-center gap-2 font-sans font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-verified" />
                      Stage 2 (Parallel Swarm Race)
                    </strong>
                    <p className="text-xs text-muted leading-relaxed font-sans">
                      If the Node daemon times out or responds with an HTTP error, the engine instantly fires concurrent requests across independent public gateways:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <code className="text-[11px] font-mono bg-background text-muted p-2 rounded-[4px] border border-hairline">gateway.pinata.cloud/ipfs/[cid]</code>
                      <code className="text-[11px] font-mono bg-background text-muted p-2 rounded-[4px] border border-hairline">cloudflare-ipfs.com/ipfs/[cid]</code>
                      <code className="text-[11px] font-mono bg-background text-muted p-2 rounded-[4px] border border-hairline">ipfs.io/ipfs/[cid]</code>
                      <code className="text-[11px] font-mono bg-background text-muted p-2 rounded-[4px] border border-hairline">dweb.link/ipfs/[cid]</code>
                    </div>
                    <p className="text-xs text-muted mt-2 font-sans">
                      Using <code className="text-xs font-mono bg-background text-primary px-1.5 py-0.5 rounded-[4px] border border-hairline">Promise.any()</code>, the fastest responsive peer hydrates the document, while slower requests are aborted immediately.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Cryptographic Sandbox */}
        {activeTab === "sandbox" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-[6px] border border-hairline bg-surface text-xs font-mono text-secondary flex items-center justify-between">
              <span>Interactive In-Browser RFC 8785 Canonicalizer &amp; Ed25519 WebCrypto Verifier</span>
              <span className="text-verified">Live Client Execution</span>
            </div>
            <ProtocolSandbox />
          </div>
        )}

        {/* TAB 3: Transport Routing & ISP Simulator */}
        {activeTab === "transport" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-[6px] border border-hairline bg-surface text-xs font-mono text-secondary flex items-center justify-between">
              <span>Interactive Multi-Transport Failover Simulation with ISP Block Testing</span>
              <span className="text-verified">Deterministic Failover Engine</span>
            </div>
            <TransportNetwork />
          </div>
        )}

        {/* TAB 4: Gateway Telemetry Probes */}
        {activeTab === "telemetry" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-[6px] border border-hairline bg-surface text-xs font-mono text-secondary flex items-center justify-between">
              <span>Real-Time Edge Gateway &amp; Onion Relay Health Telemetry</span>
              <span className="text-verified">Live Swarm Probes</span>
            </div>
            <GatewayTelemetry />
          </div>
        )}

        {/* Page Footer */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted font-mono">
            Open Standard &bull; Deterministic Cryptography &bull; MIT Licensed
          </p>
          <div className="flex gap-3">
            <Link href="/about">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">About &amp; Mission</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
