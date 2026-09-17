"use client";

import { Newspaper, ShieldCheck, Archive, AlertCircle } from "lucide-react";

interface PersonaCard {
  role: string;
  tag: string;
  scenario: string;
  description: string;
  icon: typeof Newspaper;
  guarantee: string;
}

const PERSONAS: PersonaCard[] = [
  {
    role: "Independent writers & essayists",
    tag: "Archive Ownership",
    scenario: "Publishing on Medium, Substack, or CMS blogs",
    description:
      "You spend years building a body of work. Then an automated account flag, Terms of Service shift, or corporate acquisition deletes your archive without human appeal.",
    guarantee:
      "Client-side signing keeps your work under your cryptographic control. Your archive remains readable, completely independent of any account provider.",
    icon: Newspaper,
  },
  {
    role: "Investigative journalists",
    tag: "Editorial Independence",
    scenario: "Accountability reporting & leaked records",
    description:
      "Reporting that challenges power faces DMCA takedown abuse, host subpoenas, and domain registrar seizures that take newsrooms offline.",
    guarantee:
      "Content is dual-pinned across peer-to-peer storage and accessible via Tor onion circuits. No single server or corporate host can unilaterally pull your story down.",
    icon: ShieldCheck,
  },
  {
    role: "Researchers & archivists",
    tag: "Durable Citation",
    scenario: "Academic papers & primary documentation",
    description:
      "Over a third of all web links from 2013 are already dead. When hosting bills lapse or domains expire, vital public interest citations turn into 404 errors.",
    guarantee:
      "Deterministic CIDv1 multihashes guarantee mathematical bit-level provenance. Citations remain verifiable, durable, and resolvable across decades.",
    icon: Archive,
  },
];

export function FrontlinePersonas() {
  return (
    <section className="py-20 sm:py-24 bg-canvas border-t border-hairline relative">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="text-[11px] font-mono tracking-widest text-secondary uppercase mb-3">
            Who It&apos;s For
          </div>
          <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight leading-[1.05] mb-4">
            Built for work that needs to endure.
          </h2>
          <p className="text-secondary text-base sm:text-lg font-light leading-relaxed measure-lead">
            Designed for writers whose essays, reporting, and research cannot afford to disappear when a platform
            changes hands, an account is flagged, or a hosting bill lapses.
          </p>
        </div>

        {/* High-Impact Hook Callout: Archive Problem + For Everyone Until It Happens */}
        <div className="mb-10 rounded-[6px] border border-hairline bg-surface p-5 sm:p-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-sans text-sm font-semibold text-primary">
              Eventually, every publisher has an archive problem.
            </h4>
            <p className="font-sans text-xs sm:text-sm text-secondary font-light leading-relaxed">
              Most writers assume their publishing archive is safe on commercial platforms until an algorithm updates,
              a hosting bill lapses, or an unappealable account suspension screen appears. In a way, PressProtocol is
              for everyone - until a platform changes and you need it.
            </p>
          </div>
        </div>

        {/* 3 Tightened Grounded Personas */}
        <div className="grid md:grid-cols-3 gap-6">
          {PERSONAS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-[6px] border border-hairline bg-surface p-6 sm:p-7 flex flex-col justify-between transition-colors hover:border-focus group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-hairline">
                    <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                      {p.tag}
                    </span>
                    <Icon className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                  </div>

                  <h3 className="font-sans font-semibold text-lg text-primary mb-1">
                    {p.role}
                  </h3>
                  <div className="text-[11px] font-mono text-muted mb-3.5">
                    {p.scenario}
                  </div>

                  <p className="text-xs sm:text-sm text-secondary font-light leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-hairline/80">
                  <div className="text-[10px] font-mono text-verified uppercase tracking-wider mb-1">
                    PressProtocol Assurance
                  </div>
                  <p className="text-xs text-primary/95 font-normal leading-relaxed">
                    {p.guarantee}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
