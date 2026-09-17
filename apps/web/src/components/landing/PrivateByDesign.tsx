"use client";

import { KeyRound, Cpu, Share2, Code2 } from "lucide-react";

const PRIVACY_PILLARS = [
  {
    icon: KeyRound,
    title: "Identity control",
    desc: "Publish under your cryptographic key, a pseudonym, or an editorial masthead without tying your archive to an account provider or phone number.",
  },
  {
    icon: Cpu,
    title: "Client-side keys",
    desc: "Private keys are generated and kept exclusively in local browser RAM via RFC 8032 WebCrypto. Keys never touch a server.",
  },
  {
    icon: Share2,
    title: "Independent distribution",
    desc: "Content is addressed by immutable multihashes (CIDv1) and preserved across peer swarms without centralized single points of failure.",
  },
  {
    icon: Code2,
    title: "Open source & auditable",
    desc: "All schemas, SDKs, companion plugins, and reader panes are MIT licensed. Verifiable and reproducible by any researcher.",
  },
];

export function PrivateByDesign() {
  return (
    <section className="py-16 sm:py-20 bg-canvas border-t border-hairline">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div className="rounded-[8px] border border-hairline bg-surface/50 p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-5 gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted block mb-1">
                Foundational Invariants
              </span>
              <h3 className="text-lg sm:text-xl font-hero text-primary font-normal tracking-tight">
                Private by design. Open by default.
              </h3>
            </div>
            <span className="text-xs font-mono text-muted">
              Client-Side Key Custody &bull; Zero Central Logs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIVACY_PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-4 rounded-[6px] border border-hairline bg-canvas/70 flex flex-col justify-between hover:border-focus transition-all"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary font-sans mb-1.5">
                      <PIcon className="w-3.5 h-3.5 text-secondary" />
                      <span>{pillar.title}</span>
                    </div>
                    <p className="text-xs text-secondary font-light leading-relaxed">
                      {pillar.desc}
                    </p>
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
