"use client";

import { useState } from "react";
import { Terminal, ShieldCheck, ShieldX, Play, RotateCcw, Check, Sparkles, Server, Zap, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProtocolSandbox() {
  const [cidInput, setCidInput] = useState("bafybeic52i4f7626vkyz244q56w7g632d4w754z56o2yvshj6c2k7n5wbe");
  const [isResolving, setIsResolving] = useState(false);
  const [hasResolved, setHasResolved] = useState(true);
  const [isTampered, setIsTampered] = useState(false);
  const [activeTab, setActiveTab] = useState<"payload" | "verification">("verification");

  // Simulated article payload data
  const canonicalData = {
    title: "Why Censorship Resistance is the Prerequisite for Democracy",
    authorPubKey: "ed25519:8f9a2e4c1b7d5f3a09e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6",
    timestamp: "2026-09-11T14:32:00Z",
    cid: cidInput,
    canonicalHash: isTampered
      ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (TAMPERED)"
      : "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    signature: "3a4f89d2c1e8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2109876543210abcdef",
    mirrors: [
      { name: "Cloudflare IPFS Edge", time: "84ms", status: "200 OK", verified: !isTampered },
      { name: "Pinata Decentralized Gateway", time: "112ms", status: "200 OK", verified: !isTampered },
      { name: "Tor Hidden Onion Service", time: "380ms", status: "200 OK", verified: !isTampered },
    ],
  };

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      setHasResolved(true);
    }, 850);
  };

  return (
    <section id="sandbox" className="relative py-28 lg:py-36 bg-[#03060c] text-white overflow-hidden border-t border-white/10">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-cyan-950/15 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6">
              <Terminal className="w-3.5 h-3.5" />
              <span>INTERACTIVE PROTOCOL SANDBOX</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white">
              Verify in-browser.
              <br />
              <span className="text-white/40">Don&apos;t trust, compute.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-base text-white/60 font-light leading-relaxed">
            Test any content CID. Watch the multi-transport race resolve across IPFS and Tor, and verify the author&apos;s Ed25519 signature directly inside your client memory.
          </p>
        </div>

        {/* Sandbox Main Container */}
        <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Input & Control Bar */}
          <div className="p-4 lg:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl px-4 py-2">
                <span className="font-mono text-xs text-white/40 uppercase tracking-widest shrink-0">
                  IPFS CID:
                </span>
                <Input
                  value={cidInput}
                  onChange={(e) => setCidInput(e.target.value)}
                  placeholder="bafybei... or Qm..."
                  className="bg-transparent border-0 font-mono text-xs text-cyan-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7"
                />
              </div>
              <p className="text-[11px] font-mono text-white/40 mt-1.5 ml-1">
                Try tampering with the demo, or paste your own CID.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={handleResolve}
                disabled={isResolving}
                className="bg-white hover:bg-white/90 text-black font-semibold h-11 px-6 rounded-xl font-mono text-xs transition-all shadow-lg hover:shadow-cyan-500/20"
              >
                {isResolving ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-2 animate-spin text-cyan-600" />
                    Computing Verification...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2 fill-black" />
                    Resolve Across Transports
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsTampered(!isTampered)}
                className={`font-mono text-xs h-11 px-4 rounded-xl border transition-colors ${
                  isTampered
                    ? "border-red-500/50 bg-red-950/20 text-red-400 hover:bg-red-950/40"
                    : "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {isTampered ? "Reset Tamper State" : "Simulate Rogue MITM Tamper"}
              </Button>
            </div>
          </div>

          {/* Race Results & Verification Display */}
          <div className="p-6 lg:p-10 grid lg:grid-cols-12 gap-8">
            {/* Left Column: Transport Multi-Path Race Results */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Multi-Transport Race Telemetry
                </div>
                <div className="space-y-3">
                  {canonicalData.mirrors.map((mirror) => (
                    <div
                      key={mirror.name}
                      className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-white">{mirror.name}</span>
                        <span className="font-mono text-[11px] text-white/40">
                          Route: HTTP/3 QUIC · Transport verified
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-emerald-400 font-semibold">
                          {mirror.time}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {mirror.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrity Indicator */}
              <div
                className={`p-5 rounded-xl border transition-all ${
                  isTampered
                    ? "border-red-500/50 bg-red-950/20 text-red-300"
                    : "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2 font-mono text-xs font-bold">
                  {isTampered ? (
                    <>
                      <ShieldX className="w-5 h-5 text-red-400" />
                      <span>✗ DIGEST MISMATCH · SIGNATURE INVALID</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>✓ SIGNATURE VALID · ZERO TAMPERING DETECTED</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  {isTampered
                    ? "A rogue CDN gateway altered article payload bytes. Client-side recomputed SHA-256 digest failed to match the author's Ed25519 signature."
                    : "The client-computed SHA-256 digest matches the published manifest and verifies against the author's Ed25519 public key. Integrity 100% intact."}
                </p>
              </div>
            </div>

            {/* Right Column: Code & Cryptographic Envelope Inspector */}
            <div className="lg:col-span-7">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    activeTab === "verification"
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  Cryptographic Verification Terminal
                </button>
                <button
                  onClick={() => setActiveTab("payload")}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    activeTab === "payload"
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  Decoded Article Envelope
                </button>
              </div>

              {/* Terminal View */}
              <div className="rounded-xl border border-white/10 bg-[#02050a] p-5 font-mono text-xs text-white/80 overflow-x-auto leading-relaxed shadow-inner min-h-[260px]">
                {activeTab === "verification" ? (
                  <div className="space-y-3">
                    <div className="text-white/40">{"// In-browser verification pipeline:"}</div>
                    <div className="space-y-1 text-cyan-300">
                      <div>$ digest = sha256(article_body)</div>
                      <div>$ ed25519.verify(signature, digest, authorPublicKey)</div>
                    </div>

                    <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-white/50">Author Public Key: </span>
                        <span className="text-emerald-400">{canonicalData.authorPubKey}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Computed SHA-256: </span>
                        <span className={isTampered ? "text-red-400 font-bold" : "text-cyan-300"}>
                          {canonicalData.canonicalHash}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50">Attached Ed25519 Sig: </span>
                        <span className="text-white/70">{canonicalData.signature.slice(0, 44)}...</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                      {isTampered ? (
                        <>
                          <div className="text-red-400 flex items-center gap-1.5">
                            <span>→ digest matches published record:</span>
                            <span className="font-bold">❌ (payload altered)</span>
                          </div>
                          <div className="text-red-400 flex items-center gap-1.5">
                            <span>→ signature valid for author public key:</span>
                            <span className="font-bold">❌ (verification failed)</span>
                          </div>
                          <div className="text-red-400 font-bold pt-1">
                            [FAIL] Cryptographic integrity violation. Content rejected.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <span>→ digest matches published record:</span>
                            <span className="font-bold">✅</span>
                          </div>
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <span>→ signature valid for author public key:</span>
                            <span className="font-bold">✅</span>
                          </div>
                          <div className="text-emerald-400 font-bold pt-1">
                            [SUCCESS] Content is verifiably unmodified since publication.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-white/40">{"// Canonical decoded article envelope:"}</div>
                    <pre className="text-white/90 text-[11px] leading-relaxed">
                      {JSON.stringify(
                        {
                          version: "1.0",
                          cid: canonicalData.cid,
                          title: canonicalData.title,
                          body: "Freedom of the press is not merely the freedom of journalists to write; it is the fundamental mathematical guarantee that no intermediary can alter or delete the historical record...",
                          author: {
                            pubKey: canonicalData.authorPubKey,
                            algorithm: "Ed25519 (RFC 8032)",
                          },
                          integrity: {
                            sha256: canonicalData.canonicalHash,
                            signature: canonicalData.signature,
                          },
                          transports: ["ipfs", "tor", "clearnet"],
                          timestamp: canonicalData.timestamp,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
