import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Terminal, Copy, ExternalLink, Code, Check, Shield, Globe, Cpu, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "REST API Reference | PressProtocol",
  description: "Official interactive REST API specification for PressProtocol. Ingest, sign, resolve, and verify decentralized dispatches across IPFS and Tor.",
};

const ENDPOINTS = [
  {
    category: "Ingest & Publishing",
    items: [
      {
        id: "publish-raw",
        method: "POST",
        path: "/api/v1/publish/raw",
        summary: "Publish Raw Markdown Content",
        description: "Accepts raw markdown and metadata. The node chunks content using Helia DAG-PB, computes the canonical CIDv1 multihash, and signs the dispatch with node authority if no client signature is provided.",
        auth: "None (Zero-Custody)",
        headers: { "Content-Type": "application/json" },
        requestBody: {
          title: "Global Investigative Dispatches 2026",
          content: "# Sovereign Archival\\n\\nMathematical censorship resistance across IPFS and Tor swarms.",
          tags: ["investigation", "cryptography"],
          author: "Investigative Desk"
        },
        response: {
          success: true,
          cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          gatewayUrl: "https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          timestamp: 1773520000000
        },
        curl: `curl -X POST https://api.pressprotocol.com/api/v1/publish/raw \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Global Investigative Dispatches 2026",
    "content": "# Sovereign Archival\\n\\nMathematical censorship resistance.",
    "tags": ["investigation", "cryptography"]
  }'`
      },
      {
        id: "publish-signed",
        method: "POST",
        path: "/api/v1/publish/signed",
        summary: "Ingest Air-Gapped Pre-Signed Payload",
        description: "Accepts an air-gapped Ed25519 signed envelope created locally in browser WebCrypto or cold-storage scripts. The node verifies the RFC 8032 signature over the canonical RFC 8785 JSON payload and announces it to the IPFS DHT and Tor v3 hidden service.",
        auth: "Ed25519 Signature",
        headers: { "Content-Type": "application/json" },
        requestBody: {
          payload: {
            cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
            timestamp: 1773520000000,
            title: "Whistleblower Dispatch #41"
          },
          signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855...",
          publicKey: "a1b2c3d4e5f6..."
        },
        response: {
          success: true,
          cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          verified: true,
          torOnion: "http://pressproto...onion/bafybei..."
        },
        curl: `curl -X POST https://api.pressprotocol.com/api/v1/publish/signed \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": { "cid": "bafy...", "title": "Whistleblower Dispatch" },
    "signature": "3a7b...",
    "publicKey": "9f8e..."
  }'`
      }
    ]
  },
  {
    category: "Resolution & Verification",
    items: [
      {
        id: "resolve-cid",
        method: "GET",
        path: "/api/v1/resolve/{cid}",
        summary: "Concurrent Multi-Gateway Race Resolver",
        description: "Resolves a published manifest or content chunk by racing Pinata, Cloudflare IPFS, local Helia DHT, and Tor onion mirrors concurrently. Returns content from the fastest responding transport rail.",
        auth: "None",
        params: [{ name: "cid", type: "string (path)", required: true, desc: "IPFS Content Identifier (CIDv0 or CIDv1)" }],
        response: {
          cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          title: "Global Investigative Dispatches 2026",
          content: "# Sovereign Archival...",
          resolvedVia: "cloudflare-ipfs (14ms)",
          verifiedSignature: true,
          authorPublicKey: "ed25519:a1b2c3d4e5f6..."
        },
        curl: `curl -s https://api.pressprotocol.com/api/v1/resolve/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi | jq`
      },
      {
        id: "verify-envelope",
        method: "POST",
        path: "/api/v1/verify",
        summary: "Verify Cryptographic Provenance",
        description: "Validates that a given Ed25519 signature matches the canonical RFC 8785 JSON representation of the article envelope and the declared author public key.",
        auth: "None",
        headers: { "Content-Type": "application/json" },
        requestBody: {
          payload: { cid: "bafy...", timestamp: 1773520000000 },
          signature: "e3b0c442...",
          publicKey: "a1b2c3d4..."
        },
        response: {
          valid: true,
          verificationTimeMs: 1.2,
          algorithm: "Ed25519 (RFC 8032)"
        },
        curl: `curl -X POST https://api.pressprotocol.com/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{ "payload": {...}, "signature": "...", "publicKey": "..." }'`
      }
    ]
  },
  {
    category: "Network Swarm & Node Telemetry",
    items: [
      {
        id: "manifest-stats",
        method: "GET",
        path: "/api/manifests/stats",
        summary: "Global Swarm Telemetry & DHT Status",
        description: "Returns network-wide telemetry including active Helia DHT peer count, total pinned manifests, and tag frequency index.",
        auth: "None",
        response: {
          status: "healthy",
          manifestCount: 4210,
          tagCount: 318,
          heliaNode: {
            peers: 32,
            uptimeSeconds: 849200
          }
        },
        curl: `curl -s https://api.pressprotocol.com/api/manifests/stats | jq`
      },
      {
        id: "node-status",
        method: "GET",
        path: "/api/node/status",
        summary: "Autonomous Daemon Status & Onion Address",
        description: "Returns operational metrics for the local node daemon, including connected libp2p peers, Tor hidden service hostname, and Kubo pinning latency.",
        auth: "None",
        response: {
          daemon: "@pressprotocol/node v1.0.6",
          status: "synced",
          torAddress: "pressproto5x6d7...onion",
          ipfsConnected: true
        },
        curl: `curl -s http://localhost:4000/api/node/status | jq`
      }
    ]
  }
];

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/developers">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-mono">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Developer Portal
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-[11px]">
              OpenAPI 3.0.3
            </Badge>
            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-cyan-300 transition-colors"
            >
              <span>Raw JSON Spec</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Protocol Specification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white">
            REST API Reference
          </h1>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Autonomous censorship-resistant publishing API. All dispatches are content-addressed via IPFS DAG-PB and cryptographically verifiable with RFC 8032 Ed25519 signatures. Zero custody, zero server dependencies.
          </p>
          <div className="pt-2 flex items-center gap-6 text-xs font-mono text-zinc-500">
            <div>Base URL: <code className="text-zinc-300 bg-white/5 px-2 py-0.5 rounded">https://api.pressprotocol.com</code></div>
            <div>Default Encoding: <code className="text-zinc-300 bg-white/5 px-2 py-0.5 rounded">UTF-8 / JSON</code></div>
          </div>
        </div>

        {/* Endpoint Sections */}
        <div className="space-y-12">
          {ENDPOINTS.map((section) => (
            <div key={section.category} className="space-y-6">
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {section.category}
              </h2>

              <div className="space-y-6">
                {section.items.map((ep) => (
                  <div
                    key={ep.id}
                    id={ep.id}
                    className="p-6 rounded-xl border border-white/10 bg-[#0B0D14] space-y-5 shadow-xl hover:border-cyan-500/30 transition-colors"
                  >
                    {/* Method & Path Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                          ep.method === "POST" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-white font-semibold">
                          {ep.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                        <span>Auth: <strong className="text-zinc-300">{ep.auth}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {ep.description}
                    </p>

                    {/* Request / cURL Preview */}
                    <div className="grid lg:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                          <span>Example Request (cURL)</span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                          <pre>{ep.curl}</pre>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                          <span>200 OK Response</span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-emerald-400 overflow-x-auto">
                          <pre>{JSON.stringify(ep.response, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
