"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface Dispatch {
  id: string;
  category: string;
  title: string;
  authorName: string;
  authorKey: string;
  date: string;
  readTime: string;
  excerpt: string;
  cid: string;
  href: string;
  isExample?: boolean;
}

const FEATURED_DISPATCHES: Dispatch[] = [
  {
    id: "durable-essay",
    category: "Long-Form Essay",
    title: "The Case for the Durable Essay: Why Independent Writing Must Leave Rented Land",
    authorName: "Maya Lindqvist",
    authorKey: "ed25519:7a4c9b...82f1",
    date: "Sept 16, 2026",
    readTime: "7 min read",
    excerpt:
      "When independent writers rely exclusively on commercial platforms, their life's work remains hostage to corporate acquisitions, algorithmic shifts, and unappealable account flags. By cryptographically signing and distributing over peer networks, essays become durable and resilient.",
    cid: "bafybeic52i4f7626vkyz244q56w7g632d4w754z56o2yvshj6c2k7n5wbe",
    href: "/explorer",
    isExample: true,
  },
  {
    id: "surveillance-architecture",
    category: "Investigative Brief",
    title: "Surveillance Architecture Memo & BGP Chokepoints",
    authorName: "Elena Vance",
    authorKey: "ed25519:8f9a2e...09e8",
    date: "Sept 12, 2026",
    readTime: "6 min read",
    excerpt:
      "An analysis of critical transit choke points across undersea cables and commercial CDN concentration. Details how national boundary firewalls execute silent BGP route poisoning against non-custodial journalism.",
    cid: "bafkreib645g7x5u6x7p3a8v4r5z2d4w754z56o2yvshj6c2k7n5wbe7yza",
    href: "/explorer?cid=bafkreib645g7x5u6x7p3a8v4r5z2d4w754z56o2yvshj6c2k7n5wbe7yza",
    isExample: true,
  },
  {
    id: "academic-citation-permanence",
    category: "Research Archive",
    title: "Decentralized Archival Integrity & Citation Permanence",
    authorName: "Dr. Aris Thorne",
    authorKey: "ed25519:a19f4d...821c",
    date: "Aug 29, 2026",
    readTime: "9 min read",
    excerpt:
      "A study examining the rate of link rot across scholarly journals and public legal proceedings. Proposes content-addressed multihashes as an unalterable benchmark for durable, verifiable public citations.",
    cid: "bafkreif4x2y6z8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
    href: "/about",
    isExample: true,
  },
];

export function FeaturedDispatches() {
  return (
    <section className="relative py-20 sm:py-24 border-t border-hairline bg-canvas">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Published With PressProtocol
            </div>
            <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl text-primary font-normal tracking-tight">
              The work is the point.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-secondary font-light max-w-2xl measure-lead">
              Investigative reporting, independent essays, and public research archives preserved across distributed
              infrastructure &mdash; verifiable by anyone without reliance on a centralized gatekeeper.
            </p>
          </div>

          <Link
            href="/explorer"
            className="inline-flex items-center gap-2 text-xs font-mono text-secondary hover:text-primary transition-colors group shrink-0"
          >
            <span>Explore network archive</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURED_DISPATCHES.map((dispatch) => (
            <article
              key={dispatch.id}
              className="rounded-[6px] border border-hairline bg-surface p-6 flex flex-col justify-between hover:border-focus transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-4 pb-3 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary uppercase tracking-wider font-medium">{dispatch.category}</span>
                    {dispatch.isExample && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-hairline text-muted bg-canvas font-mono">
                        Example publication
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums">{dispatch.readTime}</span>
                </div>

                {/* Card Title */}
                <h3 className="font-sans text-xl font-semibold text-primary leading-snug tracking-tight group-hover:text-primary/90 transition-colors mb-3">
                  <Link href={dispatch.href} className="block">
                    {dispatch.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="font-sans text-sm text-secondary leading-relaxed mb-6 line-clamp-4 font-light">
                  {dispatch.excerpt}
                </p>
              </div>

              {/* Card Footer: Cryptographic Signature & Attestation */}
              <div className="pt-4 border-t border-hairline space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                  <span className="flex items-center gap-1.5 truncate max-w-[190px]" title={`${dispatch.authorName} (${dispatch.authorKey})`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-verified shrink-0" />
                    <span className="font-medium text-primary">{dispatch.authorName}</span>
                  </span>
                  <span className="text-muted tabular-nums">{dispatch.date}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-hairline/60">
                  <span className="inline-flex items-center gap-1 text-verified text-[10px]">
                    <span>✓</span> Signed &bull; Preserved
                  </span>
                  <Link
                    href={`/verify?cid=${dispatch.cid}`}
                    className="text-secondary hover:text-primary transition-colors text-[10px] font-medium"
                  >
                    Verify publication &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
