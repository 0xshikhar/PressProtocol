"use client";

import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle2, XCircle } from "lucide-react";

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
      "Content is addressed by immutable SHA-256 CID, not DNS names. If pressprotocol.com is blocked or revoked by a government registrar, articles remain reachable via IPFS gateways, Tor .onion, or the browser extension.",
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
    pressprotocol: "Decentralized replication across IPFS & Tor",
  },
  {
    feature: "Identity Requirement",
    centralized: "Credit card, phone number, or verified email",
    pressprotocol: "Zero accounts; ephemeral or persistent Ed25519 keys",
  },
  {
    feature: "Domain Seizure Resistance",
    centralized: "Domain seizure removes 100% of publications",
    pressprotocol: "Survives via CID, Tor hidden service, & browser extension",
  },
  {
    feature: "Content Integrity Assurance",
    centralized: "Trust the database admin not to alter text",
    pressprotocol: "Cryptographically verified SHA-256 Ed25519 signature",
  },
];

export function PrivacyThreatModel() {
  return (
    <section id="security" className="relative py-24 sm:py-32 bg-canvas text-primary overflow-hidden border-t border-hairline">
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Header: 1-Eyebrow Rule */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Security Specification &bull; Adversarial Threat Model
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-primary">
              Institutional assurance.
              <br />
              <span className="text-secondary font-light">Mathematical guarantees.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-secondary font-light leading-relaxed measure-lead">
            Designed to withstand state-level network blocks, BGP route hijacking, and rogue intermediary gateways.
          </p>
        </div>

        {/* 4 Threat Model Cards (Elevation: Card, Inter Typography) */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {threatGuarantees.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-7 rounded-[6px] border border-hairline bg-surface hover:border-focus transition-all flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-10 h-10 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-[10px] text-muted uppercase block">
                        Threat Vector
                      </span>
                      <span className="text-secondary">{item.vector}</span>
                    </div>
                  </div>

                  {/* Section 3.1 & 10: Inter ONLY for card titles */}
                  <h3 className="font-sans text-xl font-semibold text-primary mb-1.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs text-muted mb-3">{item.subtitle}</p>
                  <p className="text-secondary text-sm leading-relaxed font-light mb-6 measure-reading">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between font-mono text-xs">
                  <span className="text-muted uppercase text-[10px]">Primary Defense:</span>
                  <span className="text-verified flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.mitigation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Threat Matrix Comparison Table */}
        <div className="rounded-[6px] border border-hairline bg-surface overflow-hidden p-6 lg:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          <h3 className="font-sans text-xl font-semibold text-primary mb-5 tracking-tight">
            Architecture Comparison: Centralized Cloud vs. PressProtocol
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline text-muted text-[11px] uppercase tracking-wider">
                  <th className="pb-3.5 font-medium">Threat Dimension</th>
                  <th className="pb-3.5 font-medium">Traditional Centralized Publishing</th>
                  <th className="pb-3.5 font-medium text-primary">PressProtocol Multi-Transport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {comparisonMatrix.map((row) => (
                  <tr key={row.feature} className="hover:bg-overlay/20 transition-colors">
                    <td className="py-3.5 font-medium text-primary pr-4">{row.feature}</td>
                    <td className="py-3.5 text-secondary pr-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-error shrink-0" />
                        <span>{row.centralized}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-verified">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-verified shrink-0" />
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
