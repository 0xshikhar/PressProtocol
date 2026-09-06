"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  Zap,
  Github,
  Globe,
  ArrowLeft,
  Sparkles,
  QrCode,
  Layers,
  Code2,
  Terminal,
  CreditCard,
  Coins,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DONATION_CHAINS,
  TRADITIONAL_METHODS,
  type DonationChain,
  type TraditionalMethod,
} from "@/config/donation-chains";

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState<"crypto" | "traditional">("crypto");
  const [selectedChain, setSelectedChain] = useState<DonationChain>(DONATION_CHAINS[0]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopy = (text: string, isChain = true) => {
    navigator.clipboard.writeText(text);
    if (isChain) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2200);
    } else {
      setCopiedIdentifier(text);
      setTimeout(() => setCopiedIdentifier(null), 2200);
    }
    toast.success("Copied to clipboard!");
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    selectedChain.address
  )}&color=050508&bgcolor=ffffff&margin=10`;

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-rose-500/30 selection:text-rose-200 font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Volumetric ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-rose-500/[0.08] via-cyan-500/[0.05] to-transparent blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[450px] h-[450px] bg-rose-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl space-y-12 relative z-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs font-mono"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="space-y-6 border-b border-white/10 pb-12">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 font-mono text-xs shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400 animate-pulse" />
            <span>100% SOLO-BUILT PUBLIC GOOD &bull; ZERO VC &bull; ZERO TRACKERS</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.02]">
            Sustain Sovereign{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-cyan-300">
              Infrastructure.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 font-light leading-relaxed max-w-3xl">
            Built with conviction as a 100% solo-developed public good. Zero VC, zero trackers, zero censorship.
          </p>

          {/* Dedicated Founder's Note Box */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 via-zinc-950/80 to-zinc-950/90 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 font-mono text-xs text-rose-400 uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>The Founder&apos;s Note &bull; Ethos &amp; Maintainer Roadmap</span>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans font-light">
              <p>
                PressProtocol was not built by a venture-backed startup, an agency, or an incubator. It was architected, written, and deployed end-to-end by a single independent developer with a singular conviction: <span className="text-white font-normal">publishing truth, history, and journalism must never depend on corporate permission, centralized cloud servers, or algorithmic curation.</span>
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                By staying 100% independent, there are no shareholders to appease, no user data to monetize, and no backdoors to negotiate. The protocol belongs entirely to the public domain—powered by browser-native Ed25519 WebCrypto keys, multi-gateway IPFS pinning, decentralized Tor v3 onion routing, and open-source client SDKs.
              </p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-zinc-200 font-mono space-y-2">
                <div className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-rose-400" />
                  <span>Where 100% of community support &amp; grants go:</span>
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                  Every contribution directly funds sovereign infrastructure upkeep (redundant global IPFS pinning nodes, Tor v3 hidden service relays, high-availability edge compute), a third-party cryptographic security audit, and expanding the maintainer team by onboarding 2–3 core open-source contributors so the protocol remains resilient, decentralized, and sustainable long-term.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Category Tabs (Crypto vs Traditional) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-sans text-white flex items-center gap-2.5">
                <span>Infrastructure Contribution Channels</span>
                <Sparkles className="h-5 w-5 text-amber-400" />
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Choose between on-chain crypto addresses or direct payment methods.
              </p>
            </div>

            {/* Category Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs shrink-0">
              <button
                onClick={() => setActiveCategory("crypto")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeCategory === "crypto"
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Coins className="h-3.5 w-3.5 text-rose-400" />
                <span>Crypto Networks</span>
              </button>
              <button
                onClick={() => setActiveCategory("traditional")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeCategory === "traditional"
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
                <span>PayPal & Traditional</span>
              </button>
            </div>
          </div>

          {/* VIEW A: Crypto Networks */}
          {activeCategory === "crypto" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Chain Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DONATION_CHAINS.map((chain) => {
                  const isSelected = selectedChain.id === chain.id;
                  return (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChain(chain);
                        setCopiedAddress(false);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? "border-rose-500/50 bg-rose-500/[0.08] shadow-[0_0_25px_rgba(244,63,94,0.15)] text-white"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] hover:border-white/20"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                          {chain.symbol}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-rose-400" />}
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-white">{chain.name}</div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate">{chain.badge}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Crypto Address Card */}
              <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-xs">
                        {selectedChain.name}
                      </Badge>
                      <span className="text-xs font-mono text-zinc-400">{selectedChain.badge}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-sans">{selectedChain.description}</p>
                  </div>

                  {/* Supported Assets */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 mr-1">Accepted Assets:</span>
                    {selectedChain.supportedTokens.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono text-cyan-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Address Box */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Direct Destination Address</span>
                    <span className="text-[11px] text-zinc-400">Click string or button to copy</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div
                      onClick={() => handleCopy(selectedChain.address, true)}
                      className="flex-1 p-3.5 rounded-xl bg-black/80 border border-white/10 font-mono text-xs sm:text-sm text-cyan-400 break-all cursor-pointer hover:border-cyan-500/40 hover:bg-black/90 transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedChain.address}</span>
                      <Copy className="h-4 w-4 text-zinc-500 group-hover:text-cyan-300 shrink-0 ml-3 transition-colors" />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => handleCopy(selectedChain.address, true)}
                        className="h-12 px-6 rounded-xl font-mono text-xs font-semibold bg-white hover:bg-white/90 text-black shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 shrink-0"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setShowQrModal(!showQrModal)}
                        className="h-12 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-2 shrink-0"
                      >
                        <QrCode className="h-4 w-4 text-rose-400" />
                        <span>QR Code</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
                        asChild
                      >
                        <a
                          href={selectedChain.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* QR Code Reveal Panel */}
                {showQrModal && (
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-white rounded-xl shadow-xl shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt={`${selectedChain.name} QR Code`}
                        width={180}
                        height={180}
                        className="rounded-lg object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="font-semibold text-white text-sm font-sans flex items-center justify-center sm:justify-start gap-2">
                        <QrCode className="h-4 w-4 text-rose-400" />
                        <span>Scan with any Mobile Crypto Wallet</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans max-w-md">
                        Open your wallet app (MetaMask, Rainbow, Phantom, Tonkeeper, Trust Wallet, etc.) and scan to send assets directly to the sovereign node.
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 break-all">
                        Network: {selectedChain.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW B: Traditional Payment Methods */}
          {activeCategory === "traditional" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid sm:grid-cols-3 gap-5">
                {TRADITIONAL_METHODS.map((method) => {
                  const isCopied = copiedIdentifier === method.identifier;
                  return (
                    <div
                      key={method.id}
                      className="p-6 rounded-2xl border border-white/15 bg-zinc-950/90 backdrop-blur-2xl flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                            {method.badge}
                          </span>
                          {method.type === "paypal" && <CreditCard className="h-4 w-4 text-cyan-400" />}
                          {method.type === "github" && <Github className="h-4 w-4 text-zinc-300" />}
                          {method.type === "nano" && <Zap className="h-4 w-4 text-amber-400" />}
                        </div>

                        <h3 className="font-bold text-lg text-white font-sans">{method.name}</h3>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">{method.description}</p>

                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-zinc-400 break-all">
                          {method.identifier}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {method.link ? (
                          <a
                            href={method.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full h-10 rounded-xl font-mono text-xs font-semibold bg-white hover:bg-white/90 text-black flex items-center justify-center gap-2">
                              <span>Open {method.name}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <Button
                            onClick={() => handleCopy(method.identifier, false)}
                            className="flex-1 h-10 rounded-xl font-mono text-xs font-semibold bg-white hover:bg-white/90 text-black flex items-center justify-center gap-2"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Address</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom / Direct Inquiries Box */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-sans text-sm font-semibold text-white">Need a custom payment method or bank wire?</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    Reach out directly on GitHub or Twitter/X if you want to support infrastructure operations via wire transfer, Payoneer, or corporate public goods grants.
                  </p>
                </div>
                <a
                  href="https://github.com/0xshikhar/PressProtocol/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="font-mono text-xs h-9 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white shrink-0">
                    Contact on GitHub &rarr;
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Transparent Allocation Breakdown (100% Goes into Infrastructure) */}
        <div className="space-y-6 pt-4">
          <div>
            <h2 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-400" />
              <span>Where 100% of Your Support Goes</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              Zero executive salaries or marketing burn. Pure infrastructure survival.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0D14] space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-base">Tor & Edge Relays</h3>
                <span className="font-mono text-xs text-cyan-400 font-bold">45% Allocation</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Dedicated unmetered servers hosting Tor v3 hidden services, SOCKS5 bridges, and Cloudflare Worker edge compute that ensure dispatches remain reachable even under nation-state ISP blocks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0D14] space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-base">Permanent Swarm Pinning</h3>
                <span className="font-mono text-xs text-emerald-400 font-bold">35% Allocation</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                High-availability IPFS cluster storage (Pinata dedicated gateways, Helia blockstores, and Filecoin storage deals) guaranteeing published manifests never decay.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0D14] space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-base">Developer Tools & SDKs</h3>
                <span className="font-mono text-xs text-purple-400 font-bold">20% Allocation</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Maintains our open-source toolchain: 4 official SDKs (TypeScript, Go, Python, Rust), the WordPress and Obsidian publishing plugins, and zero-fee access for journalists worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Non-Financial Support Methods */}
        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-sans text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Github className="h-5 w-5 text-zinc-300" />
              <span>Can&apos;t support financially? Help us grow the network.</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans">
              Star our GitHub repository, host a Tor onion mirror, or share sovereign dispatches with investigative newsrooms.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/0xshikhar/PressProtocol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-xl h-11 px-5"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
              </Button>
            </a>

            <Link href="/write">
              <Button className="gap-2 bg-rose-500 hover:bg-rose-400 text-white font-mono text-xs font-semibold rounded-xl h-11 px-5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <span>Try Sovereign Studio</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>MIT Licensed Open Source &bull; 100% Solo-Built Public Good &bull; Zero Custody</span>
          </div>
          <div>
            <span>PressProtocol &bull; Built with defiance and conviction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
