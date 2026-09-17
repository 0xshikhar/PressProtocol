"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Shield, Layers, Radio, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonItem {
  id: string;
  dimension: string;
  icon: typeof Shield;
  title: string;
  platformWeb: {
    summary: string;
    consequence: string;
  };
  pressProtocol: {
    summary: string;
    guarantee: string;
    techTag: string;
  };
}

const COMPARISONS: ComparisonItem[] = [
  {
    id: "identity",
    dimension: "Identity Control",
    icon: Shield,
    title: "Identity can become a dependency",
    platformWeb: {
      summary: "Tied to commercial platform accounts, phone numbers, or single-sign-on records.",
      consequence: "An automated terms-of-service flag or corporate policy change can delete your entire published archive.",
    },
    pressProtocol: {
      summary: "Choose how your publication is identified and keep the signing keys under your control.",
      guarantee: "Your publication is authenticated directly by you, independent of any account provider or platform profile.",
      techTag: "Client-side Ed25519 signing",
    },
  },
  {
    id: "archive",
    dimension: "Archive Custody",
    icon: HardDrive,
    title: "One platform shouldn't hold your archive",
    platformWeb: {
      summary: "Locked inside a single company's private database and proprietary cloud servers.",
      consequence: "When a platform changes hands, shifts monetization, or shuts down, decades of work vanish.",
    },
    pressProtocol: {
      summary: "Preserved independently of any single host, accessible to readers across decentralized networks.",
      guarantee: "Anyone can reference or replicate the archive without depending on the platform you originally used.",
      techTag: "Content-addressed storage (CIDv1)",
    },
  },
  {
    id: "distribution",
    dimension: "Reader Distribution",
    icon: Radio,
    title: "Distribution shouldn't depend on one algorithm",
    platformWeb: {
      summary: "Mediated by engagement-maximizing feed algorithms and corporate ranking systems.",
      consequence: "Platform algorithms decide reader reach; links and independent reporting are quietly downranked.",
    },
    pressProtocol: {
      summary: "Share direct, verifiable web links that resolve cleanly on any standard browser.",
      guarantee: "Readers access your publication directly. No algorithmic feeds, paywalls, or intermediate censorship.",
      techTag: "Direct peer resolution & standard URLs",
    },
  },
  {
    id: "preservation",
    dimension: "Long-Term Hosting",
    icon: Layers,
    title: "Your archive shouldn't depend on one host",
    platformWeb: {
      summary: "Host-bound URLs that break as soon as a hosting bill lapses or server setups change.",
      consequence: "Over a third of web links from 2013 no longer exist. Domain expiration turns archives into 404s.",
    },
    pressProtocol: {
      summary: "Preserve your work independently so readers and researchers can continue to find and verify it.",
      guarantee: "Deterministic multihashes ensure durable provenance with multi-transport failover across gateways.",
      techTag: "Multi-transport failover (IPFS + Tor)",
    },
  },
];

export function BrokenWebComparison() {
  const [selectedId, setSelectedId] = useState<string>("identity");

  return (
    <section className="py-20 sm:py-24 bg-canvas border-t border-hairline relative">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono tracking-widest text-secondary uppercase mb-3">
            Why PressProtocol Exists
          </div>
          <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight leading-[1.05] mb-4">
            The Broken Web vs. The Sovereign Web
          </h2>
          <p className="text-secondary text-base sm:text-lg font-light leading-relaxed measure-lead">
            The modern web made publishing easy. It also made our archives dependent on platforms, accounts, algorithms,
            and hosting infrastructure we don&apos;t control. PressProtocol restores durable permanence to independent writing.
          </p>
        </div>

        {/* Compact Interactive Comparison Matrix */}
        <div className="rounded-[8px] border border-hairline bg-surface overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {/* Table Column Headers */}
          <div className="hidden lg:grid lg:grid-cols-12 border-b border-hairline bg-canvas/80 px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-muted">
            <div className="col-span-4">Architectural Dimension</div>
            <div className="col-span-4 flex items-center gap-1.5 text-warning/90">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span>Traditional Publishing</span>
            </div>
            <div className="col-span-4 flex items-center gap-1.5 text-verified">
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              <span>PressProtocol (Independent)</span>
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="divide-y divide-hairline">
            {COMPARISONS.map((item, idx) => {
              const isSelected = selectedId === item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-12 px-6 py-5 gap-4 lg:gap-6 transition-colors cursor-pointer group",
                    isSelected ? "bg-overlay/40" : "hover:bg-overlay/20"
                  )}
                >
                  {/* Left Column: Dimension & Title */}
                  <div className="lg:col-span-4 flex items-start gap-3">
                    <span className="text-[11px] font-mono text-muted mt-0.5 shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-secondary mb-1">
                        <Icon className="w-3 h-3 text-muted" />
                        <span>{item.dimension}</span>
                      </div>
                      <h3 className="font-sans text-sm sm:text-base font-semibold text-primary leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Middle Column: Traditional Publishing */}
                  <div className="lg:col-span-4 rounded-[4px] p-3.5 bg-canvas/60 border border-hairline/60 lg:border-transparent lg:bg-transparent lg:p-0">
                    <div className="lg:hidden text-[10px] font-mono uppercase text-warning mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Traditional Publishing</span>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary font-light leading-relaxed">
                      <span className="text-primary/90 font-normal">{item.platformWeb.summary}</span>{" "}
                      <span className="text-muted">{item.platformWeb.consequence}</span>
                    </p>
                  </div>

                  {/* Right Column: PressProtocol */}
                  <div className="lg:col-span-4 rounded-[4px] p-3.5 bg-overlay/30 border border-hairline/60 lg:border-transparent lg:bg-transparent lg:p-0">
                    <div className="lg:hidden text-[10px] font-mono uppercase text-verified mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PressProtocol</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs sm:text-sm text-primary font-normal leading-relaxed">
                        {item.pressProtocol.summary}
                      </p>
                      <p className="text-xs text-secondary font-light leading-relaxed">
                        {item.pressProtocol.guarantee}
                      </p>
                      <span className="inline-block text-[10px] font-mono text-verified px-1.5 py-0.5 rounded-[4px] bg-canvas border border-hairline">
                        {item.pressProtocol.techTag}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
