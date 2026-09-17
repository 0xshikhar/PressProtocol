"use client";

import Link from "next/link";
import { ArrowRight, Terminal, KeyRound, FileCode, Network, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIMITIVE_CHIPS = [
  {
    icon: KeyRound,
    name: "Identity Control & Client Keys",
    tag: "Client Custody",
    desc: "Generate Ed25519 signing keys directly in your browser. Keys never touch a server, and publications are never tied to phone numbers or platform accounts.",
  },
  {
    icon: FileCode,
    name: "Tamper-Proof Multihashes",
    tag: "Content Addressing",
    desc: "Every dispatch receives an immutable cryptographic multihash (CIDv1). Readers verify locally that not a single word was altered after publication.",
  },
  {
    icon: Network,
    name: "Private Onion Transport",
    tag: "Privacy Routing",
    desc: "Built-in Tor v3 onion transport allows readers and publishers to connect without exposing IP addresses or geographic location.",
  },
  {
    icon: Share2,
    name: "Independent Distribution",
    tag: "Decentralized Swarm",
    desc: "Preserved across peer swarms and standard web gateways with zero central points of failure and full MIT-licensed open source auditing.",
  },
];

export function ProtocolBridge() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-hairline bg-surface">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div className="rounded-[8px] border border-hairline bg-canvas p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle top indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-4 border-b border-hairline">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
                Foundational Invariants &amp; Open Spec
              </span>
            </div>
            <span className="text-xs font-mono text-muted">
              Client-Side Key Custody &bull; Zero Central Logs
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Thesis & Call to Action */}
            <div className="lg:col-span-6 space-y-5">
              <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl text-primary font-normal tracking-tight leading-[1.08]">
                Simple on the surface.
                <br />
                <span className="text-secondary font-light">Open underneath.</span>
              </h2>
              <p className="text-base sm:text-lg text-secondary font-light leading-relaxed measure-lead">
                PressProtocol is built entirely on open standards, local cryptographic signing, and distributed preservation - without corporate cloud lock-in, tracking logs, or platform custody.
              </p>
              <p className="text-sm text-muted font-light leading-relaxed">
                For developers, researchers, and publishers who want to verify the system: inspect our formal RFC specifications, run in-browser cryptographic verifiers, or integrate the protocol directly into your workflow.
              </p>

              <div className="pt-2">
                <Link href="/spec">
                  <Button
                    size="lg"
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium px-6 h-11 text-xs font-mono rounded-[6px] transition-colors inline-flex items-center gap-2 group border border-[rgba(240,232,232,0.12)]"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Explore Protocol Architecture &amp; Spec</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: 4 Merged Architecture Primitives */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRIMITIVE_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.name}
                    className="p-5 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-3">
                        <span className="text-secondary uppercase tracking-wider">{chip.tag}</span>
                        <Icon className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div className="text-sm font-semibold text-primary font-sans mb-1.5">
                        {chip.name}
                      </div>
                      <p className="text-xs text-secondary leading-relaxed font-light font-sans">
                        {chip.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
