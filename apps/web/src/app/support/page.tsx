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
  Github,
  Globe,
  ArrowLeft,
  Sparkles,
  QrCode,
  Code2,
  CreditCard,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Database,
  KeyRound,
  Network,
  HelpCircle,
  Clock,
  Mail,
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

// Transparent Treasury Allocation Model
const TREASURY_ALLOCATION = [
  {
    category: "Permanent IPFS & Decentralized Storage",
    purpose: "Scaling from bootstrap tiers to dedicated multi-region IPFS pinning clusters, Helia node seeders, and permanent CID permanence as publication volume grows.",
    share: "35%",
    priority: "Core Infrastructure",
    status: "Active Swarm",
  },
  {
    category: "Tor v3 Onion Relays & Anycast Gateways",
    purpose: "Dedicated offshore Tor v3 hidden services, SOCKS5 relays, and anti-censorship bridges guaranteeing unblockable reader access through national firewalls.",
    share: "25%",
    priority: "Censorship Resistance",
    status: "Active (Dual-Homed)",
  },
  {
    category: "Open-Source Contributor & Maintainer Stipends",
    purpose: "Direct community grants to onboard 2–3 active co-maintainers, review pull requests, and permanently eliminate single-developer bus factor.",
    share: "25%",
    priority: "Governance & Longevity",
    status: "Expanding",
  },
  {
    category: "Independent Cryptographic Security Audit",
    purpose: "Earmarked milestone reserve for independent third-party audits of WebCrypto Ed25519 signing, RFC 8785 canonicalizer, and QR air-gap codecs.",
    share: "15%",
    priority: "Security Assurance",
    status: "Milestone Target",
  },
];

// 4 Sovereign Invariants
const SOVEREIGN_INVARIANTS = [
  {
    id: "keys",
    title: "1. Zero Server Key Custody",
    subtitle: "Browser-Native Ed25519 WebCrypto",
    icon: KeyRound,
    description:
      "Your private key is generated strictly inside browser RAM via high-entropy CSPRNG. It never touches our server, a cloud database, or third-party OAuth provider. Even under national subpoena, there are zero server keys to seize.",
    guarantee: "100% mathematical client autonomy",
  },
  {
    id: "canonical",
    title: "2. Deterministic Canonical Integrity",
    subtitle: "RFC 8785 JSON Immutability",
    icon: Database,
    description:
      "All dispatches are serialized via RFC 8785 canonical JSON before hashing. If a cloud intermediary, CDN, or malicious ISP modifies a single whitespace byte or character, the cryptographic verification signature fails instantly.",
    guarantee: "Zero silent tampering or revisionism",
  },
  {
    id: "transport",
    title: "3. Dual-Transport Swarm Failover",
    subtitle: "Clearnet IPFS + Tor v3 Onion Circuit",
    icon: Network,
    description:
      "Dispatches are dual-pinned to both decentralized IPFS gateways and persistent Tor v3 onion services. If state-level ISPs censor clearnet DNS or block IPFS gateway IPs, readers seamlessly fail over to anonymous onion routing.",
    guarantee: "Bypass national firewalls & DNS seizures",
  },
  {
    id: "airgap",
    title: "4. Zero-Database Vault & Air-Gap QR",
    subtitle: "IndexedDB + Optical Mesh Codec",
    icon: QrCode,
    description:
      "Your entire publication archive lives locally in your device's browser vault. When networks are cut, articles can be encoded into high-density animated QR codes for offline, optical device-to-device verification.",
    guarantee: "Preservation even when the power grid fails",
  },
];

// Governance Roadmap
const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    status: "Completed",
    badgeColor: "bg-verified/10 text-verified border-verified/30",
    title: "Monorepo Architecture & Subsystem Verification",
    points: [
      "14 automated subsystem verification suites running 100% green",
      "4 multi-language SDKs (TypeScript, Python, Go, Rust)",
      "Native Chromium MV3 sovereign web clipper extension",
      "WordPress & Obsidian plugins for universal ingestion",
    ],
  },
  {
    phase: "Phase 2",
    status: "In Progress",
    badgeColor: "bg-warning/10 text-warning border-warning/30",
    title: "Independent Security Audit & Hardware Hardening",
    points: [
      "Securing funding for third-party cryptographic review of Ed25519 & RFC 8785",
      "Decentralized IPFS clustering across 3 geographic jurisdictions",
      "Hardened Tor v3 bridge relays with active uptime monitoring",
      "Reproducible build pipeline across all client packages",
    ],
  },
  {
    phase: "Phase 3",
    status: "Upcoming",
    badgeColor: "bg-anonymous/10 text-anonymous border-anonymous/30",
    title: "Open Stewardship & Multi-Maintainer Council",
    points: [
      "Onboarding 2–3 vetted open-source co-maintainers to eliminate bus factor",
      "Transitioning protocol grants to community multi-sig treasury",
      "P2P community node federation with zero central coordinator",
      "Grants & integrations with investigative journalism consortiums",
    ],
  },
];

// Deep FAQ
const SUSTAINABILITY_FAQS = [
  {
    q: "Why is PressProtocol built as a 100% solo-developed public good?",
    a: "Venture-backed publishing platforms inevitably face pressure: shareholders demand user monetization, advertisers demand content moderation, and corporate boards comply with state censorship requests. By building as an independent public good, PressProtocol has zero shareholders, zero trackers, and zero platform incentives to compromise user sovereignty.",
  },
  {
    q: "How do you address the 'bus factor' if you are a solo builder?",
    a: "Every line of code is open-source under the MIT license, backed by 14 end-to-end automated verification test suites and strict architectural documentation. Contributions and public good grants directly fund onboarding 2–3 active co-maintainers and establishing a multi-sig treasury so the protocol survives permanently regardless of any single individual.",
  },
  {
    q: "Why not just use Substack, Medium, or self-hosted Ghost?",
    a: "Substack and Medium are centralized platforms that log your IP, control your DNS, and can freeze your publication overnight. Even self-hosted Ghost on AWS or DigitalOcean is vulnerable to server subpoenas, domain registrar seizures, and 404 content decay. PressProtocol stores signed dispatches directly on the immutable IPFS swarm and Tor network, making deletion mathematically impossible.",
  },
  {
    q: "Where does 100% of my financial support go?",
    a: "Zero funds go toward executive salaries, marketing blitzes, or paid promotions. Every dollar directly sustains dedicated IPFS pinning clusters, Tor hidden service relays, edge compute, an independent third-party cryptographic audit, and contributor stipends for open-source maintainers.",
  },
];

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState<"crypto" | "traditional">("crypto");
  const [selectedChain, setSelectedChain] = useState<DonationChain>(DONATION_CHAINS[0]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleCopy = (text: string, isChain = true) => {
    navigator.clipboard.writeText(text);
    if (isChain) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2200);
    } else {
      setCopiedIdentifier(text);
      setTimeout(() => setCopiedIdentifier(null), 2200);
    }
    toast.success("Copied to clipboard");
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    selectedChain.address
  )}&color=0B0A0C&bgcolor=EEE7E1&margin=10`;

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent-tint selection:text-primary font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-5xl space-y-16 relative z-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted hover:text-primary hover:bg-surface text-xs font-mono rounded-[6px]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Section 1: Hero & Real-World Censorship Threat Model */}
        <div className="space-y-6 border-b border-hairline pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-overlay border border-hairline text-secondary font-mono text-xs">
            <Heart className="h-3.5 w-3.5 text-secondary" />
            <span>Independent public good &bull; Zero corporate custody &bull; Zero trackers</span>
          </div>

          <h1 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight text-primary font-normal leading-[1.05]">
            Sustain Sovereign Infrastructure
          </h1>

          <p className="text-base sm:text-lg text-secondary font-light leading-relaxed max-w-3xl">
            Built with conviction as an independent digital public good. Zero venture capital, zero telemetry trackers, zero corporate administrative backdoors.
          </p>

          {/* Deep Narrative: The Reality of Modern Publishing Chokepoints */}
          <div className="p-6 sm:p-8 rounded-[6px] border border-hairline bg-surface relative overflow-hidden">
            <div className="flex items-center gap-2 font-mono text-xs text-secondary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Founder&apos;s Dispatch &bull; The Cost of Corporate Fragility</span>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed font-sans font-light">
              <p>
                PressProtocol was not built by a venture-backed startup, an advertising agency, or an incubator. It was architected, written, and deployed from first principles as an independent cypherpunk digital public good: <strong className="text-primary font-normal">publishing truth, investigative journalism, and historical records must never depend on corporate permission or administrative benevolence.</strong>
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-[6px] bg-surface-raised border border-hairline space-y-1.5">
                  <div className="flex items-center gap-1.5 text-secondary font-mono text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                    <span>The Cloud Chokepoint</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Substack, Medium, and Ghost hosted on AWS log IP addresses, enforce terms-of-service bans under legal coercion, and centralize the world&apos;s investigative record into single points of failure.
                  </p>
                </div>

                <div className="p-4 rounded-[6px] bg-surface-raised border border-hairline space-y-1.5">
                  <div className="flex items-center gap-1.5 text-secondary font-mono text-xs font-semibold">
                    <Globe className="w-3.5 h-3.5 text-muted" />
                    <span>The 38% Web Rot Epidemic</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Pew Research documented that over 38% of all web pages published in 2013 are now completely broken 404s. Without deterministic content-addressed storage, human knowledge decays constantly.
                  </p>
                </div>
              </div>

              <p className="text-muted text-sm leading-relaxed pt-1">
                By staying independent, there are no shareholders to appease, no user data to monetize, and no administrative backdoors to negotiate. Through open public goods grants and community support, we are expanding from our sovereign core into a resilient, multi-maintainer open collective that permanently belongs to the public domain.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: The 4 Non-Negotiable Sovereign Invariants */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border border-hairline text-xs font-mono text-muted mb-3">
              <Shield className="w-3.5 h-3.5 text-muted" />
              <span>Architectural core</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-hero font-normal text-primary">
              The 4 Sovereign Invariants
            </h2>
            <p className="text-xs sm:text-sm text-muted font-mono mt-1">
              Guarantees enforced by mathematics, cryptography, and decentralized networks—not corporate promises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SOVEREIGN_INVARIANTS.map((inv) => {
              const Icon = inv.icon;
              return (
                <div
                  key={inv.id}
                  className="p-6 rounded-[6px] border border-hairline bg-surface hover:border-focus transition-colors space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-[6px] bg-surface-raised border border-hairline flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono text-muted px-2.5 py-0.5 rounded-[6px] bg-surface-raised border border-hairline">
                      Invariant
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary text-base transition-colors">
                      {inv.title}
                    </h3>
                    <div className="text-xs font-mono text-muted mt-0.5">{inv.subtitle}</div>
                  </div>

                  <p className="text-xs sm:text-sm text-secondary leading-relaxed font-sans font-light">
                    {inv.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-mono text-verified">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{inv.guarantee}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Contribution Channels (Crypto & Traditional) */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-hero font-normal text-primary">
                Infrastructure Contribution Channels
              </h2>
              <p className="text-xs sm:text-sm text-muted font-mono mt-1">
                Choose between on-chain crypto addresses or direct payment methods.
              </p>
            </div>

            {/* Category Switcher */}
            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center p-1 rounded-[6px] bg-surface border border-hairline font-mono text-xs shrink-0">
              <button
                onClick={() => setActiveCategory("crypto")}
                className={`px-3 sm:px-4 py-2 rounded-[6px] flex items-center justify-center gap-2 transition-all text-xs ${
                  activeCategory === "crypto"
                    ? "bg-overlay text-primary font-medium shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                <Coins className="h-3.5 w-3.5 shrink-0" />
                <span>Crypto Networks</span>
              </button>
              <button
                onClick={() => setActiveCategory("traditional")}
                className={`px-3 sm:px-4 py-2 rounded-[6px] flex items-center justify-center gap-2 transition-all text-xs ${
                  activeCategory === "traditional"
                    ? "bg-overlay text-primary font-medium shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                <span>Traditional &amp; Card</span>
              </button>
            </div>
          </div>

          {/* VIEW A: Crypto Networks */}
          {activeCategory === "crypto" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Chain Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {DONATION_CHAINS.map((chain) => {
                  const isSelected = selectedChain.id === chain.id;
                  return (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSelectedChain(chain);
                        setCopiedAddress(false);
                      }}
                      className={`p-3 sm:p-4 rounded-[6px] border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? "border-focus bg-surface-raised text-primary shadow-sm"
                          : "border-hairline bg-surface text-muted hover:text-primary hover:bg-surface-raised"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-medium uppercase tracking-wider text-secondary">
                          {chain.symbol}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-verified" />}
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-primary">{chain.name}</div>
                      <div className="text-[11px] font-mono text-muted mt-1 truncate">{chain.badge}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Crypto Address Card */}
              <div className="p-4 sm:p-8 rounded-[6px] border border-hairline bg-surface relative overflow-hidden space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-hairline bg-overlay text-secondary font-mono text-xs rounded-[6px]">
                        {selectedChain.name}
                      </Badge>
                      <span className="text-xs font-mono text-muted">{selectedChain.badge}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary mt-2 font-sans">{selectedChain.description}</p>
                  </div>

                  {/* Supported Assets */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-muted mr-1">Accepted Assets:</span>
                    {selectedChain.supportedTokens.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-[6px] bg-surface-raised border border-hairline text-[11px] font-mono text-secondary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Address Box */}
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between">
                    <span>Direct Destination Address</span>
                    <span className="text-[11px] text-muted">Click address or button to copy</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div
                      onClick={() => handleCopy(selectedChain.address, true)}
                      className="flex-1 p-3.5 rounded-[6px] bg-background border border-hairline font-mono text-xs sm:text-sm text-primary break-all cursor-pointer hover:border-focus transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedChain.address}</span>
                      <Copy className="h-4 w-4 text-muted group-hover:text-primary shrink-0 ml-3 transition-colors" />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Single Primary CTA: Accent fill for copy action */}
                      <Button
                        onClick={() => handleCopy(selectedChain.address, true)}
                        className="h-11 px-5 rounded-[6px] font-mono text-xs font-medium bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary transition-all flex items-center gap-2 flex-1 sm:flex-initial justify-center shadow-sm"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="h-4 w-4 text-primary" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => setShowQrModal(true)}
                        variant="outline"
                        className="h-11 px-4 rounded-[6px] border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary font-mono text-xs flex items-center gap-2"
                      >
                        <QrCode className="h-4 w-4 text-muted" />
                        <span>QR</span>
                      </Button>

                      <a
                        href={selectedChain.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="outline"
                          className="h-11 px-4 rounded-[6px] border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary font-mono text-xs flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4 text-muted" />
                          <span>Explorer</span>
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Multi-Chain EVM Compatibility Notice */}
                  {(selectedChain.id === "evm" || selectedChain.id === "bsc") && (
                    <div className="p-3 rounded-[6px] bg-surface-raised border border-hairline flex items-center gap-2 text-xs font-mono text-muted">
                      <span className="text-secondary font-semibold">Universal EVM Support:</span>
                      <span>
                        This address accepts all native tokens &amp; tokens on Ethereum, BSC, Arbitrum, Optimism, Base, Polygon, Avalanche, and other EVM L2s.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Modal */}
              {showQrModal && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setShowQrModal(false)}
                >
                  <div
                    className="p-6 sm:p-8 rounded-[6px] border border-hairline bg-surface max-w-sm w-full space-y-4 text-center shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-hairline">
                      <span className="font-mono text-xs text-secondary font-medium">{selectedChain.name} QR Code</span>
                      <button
                        onClick={() => setShowQrModal(false)}
                        className="text-muted hover:text-primary font-mono text-xs"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="p-4 bg-primary rounded-[6px] mx-auto w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt={`${selectedChain.name} QR`} className="w-52 h-52 sm:w-56 sm:h-56 mx-auto" />
                    </div>

                    <p className="font-mono text-[11px] text-muted break-all px-2">{selectedChain.address}</p>

                    <Button
                      onClick={() => handleCopy(selectedChain.address, true)}
                      className="w-full h-10 font-mono text-xs bg-overlay hover:bg-surface-raised border border-hairline text-primary font-medium rounded-[6px]"
                    >
                      {copiedAddress ? "Copied" : "Copy Address"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: Traditional Methods */}
          {activeCategory === "traditional" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Verification in Progress Alert */}
              <div className="p-4 rounded-[6px] bg-surface border border-hairline flex items-start gap-3">
                <div className="h-8 w-8 rounded-[4px] bg-warning/10 border border-warning/30 flex items-center justify-center text-warning shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-sans text-xs font-semibold text-primary">
                    Payment Gateway &amp; Entity Setup In Progress
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Institutional merchant accounts and payment gateway verification are currently underway for <span className="text-secondary font-mono">pressprotocol.com</span>. We are adding PayPal, card processors, and Payoneer soon. GitHub Sponsors and all on-chain crypto networks are fully live.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {TRADITIONAL_METHODS.map((method: TraditionalMethod) => {
                  const isCopied = copiedIdentifier === method.identifier;
                  const isComingSoon = method.status === "coming_soon";
                  return (
                    <div
                      key={method.id}
                      className={`p-5 sm:p-6 rounded-[6px] border bg-surface transition-all flex flex-col justify-between space-y-4 group ${
                        isComingSoon
                          ? "border-hairline opacity-80"
                          : "border-hairline hover:border-focus"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-wider text-secondary font-medium">
                            {method.name}
                          </span>
                          <span
                            className={`text-[11px] font-mono px-2.5 py-0.5 rounded-[6px] border ${
                              isComingSoon
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-surface-raised border-hairline text-muted"
                            }`}
                          >
                            {method.badge}
                          </span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed font-sans">{method.description}</p>

                        {isComingSoon && method.statusNotice && (
                          <div className="p-2.5 rounded-[4px] bg-surface-raised border border-hairline text-[11px] font-mono text-muted flex items-start gap-1.5 mt-2">
                            <Clock className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                            <span>{method.statusNotice}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        {isComingSoon ? (
                          <Button
                            disabled
                            className="w-full h-10 rounded-[6px] font-mono text-xs font-medium bg-overlay text-muted border border-hairline cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Adding Soon</span>
                          </Button>
                        ) : method.link ? (
                          <a
                            href={method.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full h-10 rounded-[6px] font-mono text-xs font-medium bg-surface-raised hover:bg-overlay border border-hairline text-primary flex items-center justify-center gap-2">
                              <span>Open {method.name}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <Button
                            onClick={() => handleCopy(method.identifier, false)}
                            className="flex-1 h-10 rounded-[6px] font-mono text-xs font-semibold bg-surface-raised hover:bg-surface border border-border/70 text-primary flex items-center justify-center gap-2"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-verified" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Identifier</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Inquiries Box */}
              <div className="p-5 sm:p-6 rounded-[6px] border border-hairline bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-sans text-sm font-semibold text-primary">Need an institutional wire, invoice, or foundation grant route?</h4>
                  <p className="text-xs text-muted font-sans max-w-xl">
                    Reach out confidentially via Proton Mail (<span className="text-secondary font-mono">pressprotocol@proton.me</span>) or open an inquiry on GitHub for foundation grants, donor-advised funds (DAFs), or institutional wire instructions.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a href="mailto:pressprotocol@proton.me">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-xs h-9 px-3.5 rounded-[6px] border-hairline bg-surface hover:bg-overlay text-primary flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-muted" />
                      <span>pressprotocol@proton.me</span>
                    </Button>
                  </a>
                  <a
                    href="https://github.com/0xshikhar/PressProtocol/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="font-mono text-xs h-9 px-3.5 rounded-[6px] border-hairline bg-surface hover:bg-overlay text-primary flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-muted" />
                      <span>Open GitHub Inquiry</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Transparent Infrastructure Ledger & Treasury Allocation */}
        <div className="space-y-6 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border border-hairline text-xs font-mono text-muted mb-3">
              <Server className="w-3.5 h-3.5 text-muted" />
              <span>Treasury transparency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-hero font-normal text-primary">
              Where 100% of Community Support Goes
            </h2>
            <p className="text-xs sm:text-sm text-muted font-mono mt-1">
              Zero executive overhead or marketing burn. All community contributions and grant awards are programmatically budgeted across decentralized infrastructure, cryptographic audits, and maintainer stipends.
            </p>
          </div>

          <div className="rounded-[6px] border border-hairline bg-surface overflow-hidden">
            {/* Desktop Table View (sm and up) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-hairline bg-overlay/30 text-muted">
                    <th className="p-4 uppercase tracking-wider font-semibold">Allocation Focus</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Operational Scope</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Treasury Share</th>
                    <th className="p-4 uppercase tracking-wider font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {TREASURY_ALLOCATION.map((item, idx) => (
                    <tr key={idx} className="hover:bg-overlay/20 transition-colors">
                      <td className="p-4">
                        <div className="font-sans font-semibold text-primary text-sm">{item.category}</div>
                        <div className="text-[10px] text-muted uppercase font-mono mt-0.5">{item.priority}</div>
                      </td>
                      <td className="p-4 font-sans text-secondary text-xs leading-relaxed max-w-xs">
                        {item.purpose}
                      </td>
                      <td className="p-4 font-mono whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-primary text-base">{item.share}</span>
                          <span className="text-[10px] text-muted uppercase">of incoming pool</span>
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-mono ${
                            item.status.includes("Active")
                              ? "bg-verified/10 text-verified border border-verified/30"
                              : "bg-warning/10 text-warning border border-warning/30"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< sm) */}
            <div className="sm:hidden divide-y divide-hairline p-2">
              {TREASURY_ALLOCATION.map((item, idx) => (
                <div key={idx} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-sans font-bold text-sm text-primary">{item.category}</div>
                      <div className="text-[10px] text-muted uppercase font-mono">{item.priority}</div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[10px] font-mono shrink-0 ${
                        item.status.includes("Active")
                          ? "bg-verified/10 text-verified border border-verified/30"
                          : "bg-warning/10 text-warning border border-warning/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-sans leading-relaxed">{item.purpose}</p>
                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-muted uppercase text-[10px]">Treasury Allocation:</span>
                    <span className="text-primary font-bold">{item.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Maintainer Stewardship & Bus-Factor Elimination Roadmap */}
        <div className="space-y-6 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border border-hairline text-xs font-mono text-muted mb-3">
              <Code2 className="w-3.5 h-3.5 text-muted" />
              <span>Stewardship roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-hero font-normal text-primary">
              Open Maintainer Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-muted font-mono mt-1">
              How we evolve from single-developer agility to permanent, decentralized institutional stewardship.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {ROADMAP_PHASES.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-muted">{p.phase}</span>
                    <span className={`px-2 py-0.5 rounded-[6px] border text-[10px] font-mono font-semibold ${p.badgeColor}`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-sans font-semibold text-primary text-base leading-snug">{p.title}</h3>
                  <ul className="space-y-2 pt-2 text-xs text-muted font-sans leading-relaxed">
                    {p.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted mt-0.5">&bull;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Sustainability FAQs */}
        <div className="space-y-6 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border border-hairline text-xs font-mono text-muted mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-muted" />
              <span>Frequently asked questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-hero font-normal text-primary">
              Sovereignty &amp; Sustainability FAQ
            </h2>
          </div>

          <div className="divide-y divide-hairline border border-hairline bg-surface rounded-[6px] overflow-hidden">
            {SUSTAINABILITY_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-overlay/30"
                  >
                    <span className="font-sans text-sm sm:text-base font-semibold text-primary">
                      {faq.q}
                    </span>
                    <span className="font-mono text-xs text-muted shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-secondary font-sans leading-relaxed font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 7: Non-Financial Support Channels */}
        <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-sans text-xl font-bold text-primary flex items-center justify-center sm:justify-start gap-2">
              <Github className="h-5 w-5 text-secondary" />
              <span>Can&apos;t support financially? Help grow the network.</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted font-sans">
              Star our repository on GitHub, run a local IPFS bridge relay, or integrate our SDKs into your investigative newsroom.
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
                className="gap-2 border-hairline bg-surface hover:bg-overlay text-primary font-mono text-xs rounded-[6px] h-11 px-5"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
              </Button>
            </a>

            <Link href="/write">
              <Button variant="outline" className="gap-2 border-hairline bg-overlay hover:bg-surface-raised text-primary font-mono text-xs font-medium rounded-[6px] h-11 px-5">
                <span>Try Sovereign Studio</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-verified" />
            <span>MIT Licensed Open Source &bull; Sovereign Digital Public Good &bull; Zero Custody</span>
          </div>
          <div>
            <span>PressProtocol &bull; Built with defiance and conviction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
