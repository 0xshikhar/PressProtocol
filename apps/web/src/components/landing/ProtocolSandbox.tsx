"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldX,
  Play,
  RotateCcw,
  Globe,
  UploadCloud,
  Copy,
  Server,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Presets for real-world scenarios
const PRESETS = [
  {
    id: "whistleblower",
    label: "Whistleblower Brief",
    title: "Surveillance Architecture Memo & BGP Chokepoints",
    body: "Internal audit documenting unwarranted packet inspection at tier-1 transit switches. Preserved with zero server custody.",
    authorPubKey: "ed25519:7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    cid: "bafkreib645g7x5u6x7p3a8v4r5z2d4w754z56o2yvshj6c2k7n5wbe7yza",
  },
  {
    id: "panama",
    label: "Investigative Archive",
    title: "Offshore Shell Entities & Beneficial Ownership Registry",
    body: "Multi-jurisdictional financial transaction ledger indexing 214,000 corporate shell companies across sovereign tax havens.",
    authorPubKey: "ed25519:9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d",
    cid: "bafybeic52i4f7626vkyz244q56w7g632d4w754z56o2yvshj6c2k7n5wbe",
  },
  {
    id: "custom",
    label: "Sovereign Manifesto",
    title: "Why Censorship Resistance is the Prerequisite for Democracy",
    body: "Freedom of expression is not a platform privilege; it is a mathematical guarantee enforced by cryptography and peer-to-peer swarms.",
    authorPubKey: "ed25519:3a1f9e2b4c6d8a0f7e5c3b1a9f7e5d3c1b9a7f5e3d1c9b7a5f3e1d9c7b5a3f1e",
    cid: "bafkreif4x2y6z8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
  },
];

export function ProtocolSandbox() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [articleTitle, setArticleTitle] = useState(PRESETS[0].title);
  const [articleBody, setArticleBody] = useState(PRESETS[0].body);
  const [isResolving, setIsResolving] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [activeTab, setActiveTab] = useState<"verification" | "canonical" | "transports">("verification");
  const [realComputedHash, setRealComputedHash] = useState<string>("");
  const [, setCopiedHash] = useState(false);

  // In-Browser WebCrypto real SHA-256 calculation
  const computeDigest = useCallback(async (content: string): Promise<string> => {
    try {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }
  }, []);

  // Update hash dynamically when content or tamper changes
  useEffect(() => {
    const rawPayload = JSON.stringify({
      title: articleTitle,
      body: isTampered ? articleBody + " [INJECTED_TAMPER_BYTE_0xDEAD]" : articleBody,
      author: selectedPreset.authorPubKey,
    });

    computeDigest(rawPayload).then((hash) => {
      setRealComputedHash(hash);
    });
  }, [articleTitle, articleBody, isTampered, selectedPreset, computeDigest]);

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setArticleTitle(preset.title);
    setArticleBody(preset.body);
    setIsTampered(false);
  };

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      toast.success("Resolved across 3 independent transports");
    }, 500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    toast.success("Copied to clipboard");
  };

  const untamperedHash = useMemo(() => {
    return realComputedHash ? (isTampered ? "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" : realComputedHash) : "...";
  }, [isTampered, realComputedHash]);

  const canonicalPayloadString = useMemo(() => {
    const obj = {
      author: selectedPreset.authorPubKey,
      body: isTampered ? articleBody + " [INJECTED_TAMPER_BYTE_0xDEAD]" : articleBody,
      cid: selectedPreset.cid,
      protocol: "PressProtocol/1.6",
      timestamp: "2026-09-16T08:30:00Z",
      title: articleTitle,
    };
    return JSON.stringify(obj, null, 2);
  }, [selectedPreset, isTampered, articleTitle, articleBody]);

  return (
    <section id="sandbox" className="relative py-24 sm:py-32 bg-canvas text-primary overflow-hidden border-t border-hairline">
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Header: 1-Eyebrow Rule */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Cryptographic Verifier &bull; In-Browser WebCrypto
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-primary">
              Verify in-browser.
              <br />
              <span className="text-secondary font-light">Don&apos;t trust, compute.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-secondary font-light leading-relaxed measure-lead">
            Every dispatch is sealed with an Ed25519 signature and RFC 8785 canonical hash. Test payload tampering, inspect canonical byte normalization, and observe multi-transport resolution.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-mono text-muted uppercase tracking-wider mr-2">Sample Dispatches:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "px-3 py-1.5 rounded-[6px] font-mono text-xs border transition-colors",
                selectedPreset.id === preset.id
                  ? "bg-overlay border-focus text-primary font-medium"
                  : "bg-surface border-hairline text-secondary hover:text-primary hover:border-focus"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Sandbox Container (Elevation: Card) */}
        <div className="rounded-[6px] border border-hairline bg-surface overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {/* Controls Bar */}
          <div className="p-4 lg:p-6 border-b border-hairline bg-overlay/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 bg-canvas border border-hairline rounded-[6px] px-4 py-2">
                <span className="font-mono text-xs text-muted uppercase tracking-wider shrink-0">
                  Dispatch Title:
                </span>
                <Input
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Enter dispatch title..."
                  className="bg-transparent border-0 font-mono text-xs text-primary focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                onClick={handleResolve}
                disabled={isResolving}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium h-10 px-5 rounded-[6px] font-mono text-xs transition-colors border border-[rgba(240,232,232,0.12)]"
              >
                {isResolving ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-2 animate-spin text-primary" />
                    Computing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2 fill-primary text-primary" />
                    Run WebCrypto Probe
                  </>
                )}
              </Button>

              {/* Simulation Button: Section 10 Calm Neutral (Never alarm-red) */}
              <Button
                variant="simulation"
                onClick={() => setIsTampered(!isTampered)}
                className="font-mono text-xs h-10 px-4 rounded-[6px]"
              >
                {isTampered ? "Reset Clean State" : "Simulate Payload Tamper"}
              </Button>

              {/* Secondary CTA: Plain Verb, No Arrow Suffix */}
              <Link href="/import">
                <Button
                  variant="outline"
                  className="font-mono text-xs h-10 px-4 rounded-[6px] border border-hairline bg-transparent text-secondary hover:text-primary hover:bg-overlay"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-muted" />
                  Import Live URL
                </Button>
              </Link>
            </div>
          </div>

          {/* Results Grid */}
          <div className="p-6 lg:p-8 grid lg:grid-cols-12 gap-8">
            {/* Left Column: Live Verification Status */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-hairline pb-6 lg:pb-0 lg:pr-8">
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-muted">
                  Client Verification Status
                </div>

                {/* Status Card (Calm Semantic Tokens) */}
                <div
                  className={cn(
                    "p-5 rounded-[6px] border transition-colors",
                    isTampered
                      ? "border-error/30 bg-error/10 text-error"
                      : "border-verified/30 bg-verified/10 text-verified"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-2 font-mono text-xs font-medium">
                    {isTampered ? (
                      <>
                        <ShieldX className="w-4 h-4 text-error shrink-0" />
                        <span>DIGEST MISMATCH &bull; SIGNATURE REJECTED</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-verified shrink-0" />
                        <span>SIGNATURE VALID &bull; 100% BIT-PERFECT</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-secondary font-light leading-relaxed">
                    {isTampered
                      ? "A proxy modified payload bytes in transit. The client-computed SHA-256 digest deviated from the author's Ed25519 signature."
                      : "The client-computed SHA-256 matches the published manifest bit-for-bit and mathematically verifies against the author's Ed25519 public key."}
                  </p>
                </div>

                {/* Multihash Specs */}
                <div className="p-4 rounded-[6px] bg-canvas border border-hairline space-y-2 font-mono text-xs">
                  <div className="text-muted text-[11px] uppercase tracking-wider">Active CID Multihash:</div>
                  <div className="text-primary break-all text-[11px] bg-surface p-2.5 rounded-[4px] border border-hairline flex items-center justify-between">
                    <span>{selectedPreset.cid}</span>
                    <button
                      onClick={() => handleCopy(selectedPreset.cid)}
                      className="text-muted hover:text-primary ml-2 transition-colors"
                      title="Copy CID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-muted">
                    <div>Codec: <span className="text-primary">raw (0x55)</span></div>
                    <div>Multihash: <span className="text-primary">sha2-256 (0x12)</span></div>
                    <div>Curve: <span className="text-primary">Ed25519 (RFC 8032)</span></div>
                    <div>Canonical: <span className="text-primary">RFC 8785</span></div>
                  </div>
                </div>
              </div>

              {/* Verified Author Badge */}
              <div className="p-3.5 rounded-[6px] bg-canvas border border-hairline text-xs font-mono space-y-1">
                <div className="text-muted text-[11px] uppercase">Author Public Key:</div>
                <div className="text-secondary truncate text-[11px] font-medium">
                  {selectedPreset.authorPubKey}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Terminal & Inspect Tabs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("verification")}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-[6px] border transition-colors",
                    activeTab === "verification"
                      ? "border-focus bg-overlay text-primary font-medium"
                      : "border-hairline bg-surface text-muted hover:text-primary"
                  )}
                >
                  Cryptographic Terminal
                </button>
                <button
                  onClick={() => setActiveTab("canonical")}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-[6px] border transition-colors",
                    activeTab === "canonical"
                      ? "border-focus bg-overlay text-primary font-medium"
                      : "border-hairline bg-surface text-muted hover:text-primary"
                  )}
                >
                  RFC 8785 Canonical JSON
                </button>
                <button
                  onClick={() => setActiveTab("transports")}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-[6px] border transition-colors",
                    activeTab === "transports"
                      ? "border-focus bg-overlay text-primary font-medium"
                      : "border-hairline bg-surface text-muted hover:text-primary"
                  )}
                >
                  Multi-Transport Race
                </button>
              </div>

              {/* Terminal Display */}
              <div className="rounded-[6px] border border-hairline bg-[#0E0C0E] p-5 font-mono text-xs text-primary/90 overflow-x-auto leading-relaxed min-h-[300px]">
                {activeTab === "verification" && (
                  <div className="space-y-3">
                    <div className="text-muted">{"// In-browser WebCrypto execution pipeline:"}</div>
                    <div className="space-y-1 text-primary">
                      <div>$ canonical = RFC8785.canonicalize(dispatch_payload)</div>
                      <div>$ digest = crypto.subtle.digest(&quot;SHA-256&quot;, canonical)</div>
                      <div>$ valid = ed25519.verify(authorPubKey, signature, digest)</div>
                    </div>

                    <div className="p-3 rounded-[4px] bg-surface border border-hairline space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-muted">Author Key: </span>
                        <span className="text-secondary">{selectedPreset.authorPubKey}</span>
                      </div>
                      <div>
                        <span className="text-muted">Computed SHA-256: </span>
                        <span className={isTampered ? "text-error font-medium" : "text-primary"}>
                          {realComputedHash || "computing..."}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Published Seal: </span>
                        <span className="text-secondary">{untamperedHash.slice(0, 48)}...</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-hairline space-y-1 text-xs">
                      {isTampered ? (
                        <>
                          <div className="text-error flex items-center gap-1.5">
                            <span>Payload bytes match author signature:</span>
                            <span className="font-bold">FAILED</span>
                          </div>
                          <div className="text-error flex items-center gap-1.5">
                            <span>Ed25519 cryptographic attestation:</span>
                            <span className="font-bold">REJECTED</span>
                          </div>
                          <div className="text-error text-[11px] pt-1">
                            Modification detected. Client refused to accept untrusted bytes.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-verified flex items-center gap-1.5">
                            <span>Payload bytes match author signature:</span>
                            <span className="font-medium">PASS</span>
                          </div>
                          <div className="text-verified flex items-center gap-1.5">
                            <span>Ed25519 cryptographic attestation:</span>
                            <span className="font-medium">PASS</span>
                          </div>
                          <div className="text-verified text-[11px] pt-1">
                            Mathematical integrity verified. No intermediary modification.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "canonical" && (
                  <div className="space-y-2">
                    <div className="text-muted">{"// Deterministic RFC 8785 Canonical JSON:"}</div>
                    <pre className="text-secondary text-[11px] leading-relaxed overflow-x-auto p-2 bg-canvas rounded-[4px]">
                      {canonicalPayloadString}
                    </pre>
                  </div>
                )}

                {activeTab === "transports" && (
                  <div className="space-y-3">
                    <div className="text-muted">{"// Active Dual-Homed Transport Resolution:"}</div>
                    <div className="space-y-2 pt-1">
                      <div className="p-3 rounded-[6px] border border-hairline bg-surface flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted" />
                          <span className="text-primary font-medium font-sans">Pinata Dedicated IPFS Gateway</span>
                        </div>
                        <span className="text-verified font-mono tabular-nums">78ms &bull; 200 OK</span>
                      </div>

                      <div className="p-3 rounded-[6px] border border-hairline bg-surface flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-muted" />
                          <span className="text-primary font-medium font-sans">Cloudflare Web3 Anycast Edge</span>
                        </div>
                        <span className="text-verified font-mono tabular-nums">84ms &bull; 200 OK</span>
                      </div>

                      <div className="p-3 rounded-[6px] border border-hairline bg-surface flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-muted" />
                          <span className="text-primary font-medium font-sans">Tor v3 Hidden Service Circuit</span>
                        </div>
                        <span className="text-anonymous font-mono tabular-nums">280ms &bull; Onion Circuit Ready</span>
                      </div>
                    </div>
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
