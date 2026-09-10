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
    <div className="min-h-screen bg-canvas text-text-primary py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/developers">
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text-primary hover:bg-overlay text-xs font-mono">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Developer Portal
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-hairline bg-overlay text-text-secondary font-mono text-[11px]">
              OpenAPI 3.0.3
            </Badge>
            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
            >
              <span>Raw JSON Spec</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-3 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[6px] bg-[rgba(124,39,51,0.14)] border border-[rgba(124,39,51,0.28)] flex items-center justify-center text-accent-ribbon">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs text-accent-ribbon uppercase tracking-widest">Protocol Specification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-hero tracking-tight text-text-primary">
            REST API Reference
          </h1>
          <p className="text-sm text-text-muted max-w-3xl leading-relaxed font-sans">
            Autonomous censorship-resistant publishing API. All dispatches are content-addressed via IPFS DAG-PB and cryptographically verifiable with RFC 8032 Ed25519 signatures. Zero custody, zero server dependencies.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-text-muted">
            <div>Base URL: <code className="text-text-secondary bg-surface border border-hairline px-2 py-0.5 rounded-[4px]">https://api.pressprotocol.com</code></div>
            <div>Default Encoding: <code className="text-text-secondary bg-surface border border-hairline px-2 py-0.5 rounded-[4px]">UTF-8 / JSON</code></div>
          </div>
        </div>

        {/* Endpoint Sections */}
        <div className="space-y-12">
          {ENDPOINTS.map((section) => (
            <div key={section.category} className="space-y-6">
              <h2 className="text-sm font-mono font-medium uppercase tracking-wider text-text-secondary flex items-center gap-2 border-b border-hairline pb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-ribbon" />
                {section.category}
              </h2>

              <div className="space-y-6">
                {section.items.map((ep) => (
                  <div
                    key={ep.id}
                    id={ep.id}
                    className="p-6 rounded-[6px] border border-hairline bg-surface space-y-5 shadow-sm hover:bg-elevated transition-colors"
                  >
                    {/* Method & Path Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-[4px] text-xs font-mono font-medium border border-hairline ${
                          ep.method === "POST" ? "bg-overlay text-accent-ribbon" : "bg-overlay text-verified"
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-text-primary font-medium">
                          {ep.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                        <span>Auth: <strong className="text-text-secondary">{ep.auth}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed font-sans">
                      {ep.description}
                    </p>

                    {/* Request / cURL Preview */}
                    <div className="grid lg:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center justify-between">
                          <span>Example Request (cURL)</span>
                        </div>
                        <div className="rounded-[6px] border border-hairline bg-canvas p-3.5 font-mono text-xs text-text-secondary overflow-x-auto">
                          <pre>{ep.curl}</pre>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center justify-between">
                          <span>200 OK Response</span>
                        </div>
                        <div className="rounded-[6px] border border-hairline bg-canvas p-3.5 font-mono text-xs text-verified/90 overflow-x-auto">
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
