"use client";

import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const threatGuarantees = [
  {
    icon: Lock,
    title: "Client-Side Volatile Key Sovereignty",
    subtitle: "Private keys never touch server disks",
    description:
      "Ed25519 signing keys are generated inside browser memory using Web Crypto APIs. Even if our web servers are seized or subpoenaed, zero private keys or user credentials exist to be compromised.",
    vector: "Hostile Server Seizure",
    mitigation: "Zero Server-Side Key Storage",
  },
  {
    icon: EyeOff,
    title: "Zero Metadata & Telemetry",
    subtitle: "No tracking pixels, cookies, or IP logging",
    description:
      "The reader and writer clients do not load third-party analytics, fonts from tracking CDNs, or marketing beacons. Anonymous publishers remain anonymous without requiring VPNs or burner emails.",
    vector: "Traffic Analysis & De-anonymization",
    mitigation: "Strict Clean-Room Client Stack",
  },
  {
    icon: ServerOff,
    title: "ISP & DNS Poisoning Resilience",
    subtitle: "Domain seizures cannot kill articles",
    description:
      "Content is addressed by immutable SHA-256 CID, not DNS names. If `pressprotocol.com` is blocked or revoked by a government registrar, articles remain reachable via IPFS gateways, Tor `.onion`, or the browser extension.",
    vector: "DNS Hijacking & Domain Revocation",
    mitigation: "Content-Addressed Routing",
  },
  {
    icon: ShieldCheck,
    title: "Cryptographic MITM Tamper Resistance",
    subtitle: "Public gateways cannot alter content",
    description:
      "Every reader client independently computes the SHA-256 digest of the article body and verifies the author's Ed25519 signature before rendering. A malicious gateway altering even 1 bit causes instant signature invalidation.",
    vector: "Rogue Gateway Content Injection",
    mitigation: "In-Browser Signature Verification",
  },
];

const comparisonMatrix = [
  {
    feature: "Single Point of Take-Down",
    centralized: "Single database query deletes article globally",
    pressprotocol: "Impossible; decentralized across IPFS & Tor",
    winner: true,
  },
  {
    feature: "Identity Requirement",
    centralized: "Credit card, phone number, or KYC email",
    pressprotocol: "0 accounts; ephemeral or persistent Ed25519 keys",
    winner: true,
  },
  {
    feature: "Domain Seizure Resistance",
    centralized: "Domain seizure removes 100% of publications",
    pressprotocol: "Survives via CID, Tor hidden service, & browser extension",
    winner: true,
  },
  {
    feature: "Content Integrity Assurance",
    centralized: "Trust the database admin not to alter text",
    pressprotocol: "Cryptographically verified SHA-256 Ed25519 signature",
    winner: true,
  },
];

export function PrivacyThreatModel() {
  return (
    <section id="security" className="relative py-28 lg:py-36 bg-[#02050a] text-white overflow-hidden border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-950/15 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>FORMAL THREAT MODEL & VERIFIABLE SPECIFICATION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white">
              Institutional assurance.
              <br />
              <span className="text-white/40">Mathematical guarantees.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-base text-white/60 font-light leading-relaxed">
            Designed to withstand aggressive nation-state censorship, BGP route hijacking, and rogue intermediary gateways.
          </p>
        </div>

        {/* 4 Threat Model Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {threatGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/40 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-white/40 uppercase block">
                        Threat Vector
                      </span>
                      <span className="font-mono text-xs text-amber-400/90">{item.vector}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl lg:text-3xl text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs text-cyan-400/80 mb-4">{item.subtitle}</p>
                  <p className="text-white/70 text-sm leading-relaxed font-light mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-white/50 uppercase tracking-wider text-[10px] font-semibold">Primary Defense:</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.mitigation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Institutional Threat Matrix Comparison Table */}
        <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl overflow-hidden p-6 lg:p-10 shadow-2xl">
          <h3 className="font-display text-2xl lg:text-3xl text-white mb-6">
            Architecture Comparison: Centralized CMS vs. PressProtocol
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                  <th className="pb-4 font-normal">Threat Dimension</th>
                  <th className="pb-4 font-normal">Traditional Centralized Publishing (hosted CMS, blog platforms)</th>
                  <th className="pb-4 font-normal text-cyan-400">PressProtocol Multi-Transport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonMatrix.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-semibold text-white/90">{row.feature}</td>
                    <td className="py-4 text-white/50 pr-4 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400/70 shrink-0" />
                      <span>{row.centralized}</span>
                    </td>
                    <td className="py-4 text-emerald-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{row.pressprotocol}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
