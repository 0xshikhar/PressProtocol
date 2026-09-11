"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Copy, Check, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EcosystemBento() {
  const [copiedSdk, setCopiedSdk] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText("pnpm add @pressprotocol/sdk");
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  return (
    <section id="ecosystem" className="relative py-24 sm:py-32 bg-canvas text-primary overflow-hidden border-t border-hairline">
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Header: 1-Eyebrow Rule */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Universal Substrate &bull; Ecosystem Rails
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-primary">
              Write where you work.
              <br />
              <span className="text-secondary font-light">Publish everywhere.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-secondary font-light leading-relaxed measure-lead">
            PressProtocol is an open protocol, not a walled platform. Integrate into newsroom CMSs, local markdown vaults, and developer automation pipelines.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: WordPress Plugin (Featured Large Bento Card) */}
          <div className="lg:col-span-2 p-8 rounded-[6px] border border-hairline bg-surface relative overflow-hidden flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Globe className="w-36 h-36 text-primary" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">WordPress CMS Integration</span>
                <span className="text-muted tabular-nums">v1.2.0 Release</span>
              </div>

              {/* Section 3.1 & 10: Inter ONLY for card title */}
              <h3 className="font-sans text-2xl font-semibold text-primary mb-3 tracking-tight">
                Official WordPress Plugin
              </h3>
              <p className="text-secondary text-sm lg:text-base max-w-xl leading-relaxed mb-6 font-light measure-reading">
                Turn any self-hosted WordPress site into a censorship-resistant publishing node. Automatically pin every published post to IPFS and Tor with background Ed25519 signing without modifying your editorial workflow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-hairline">
              <a href="/downloads/PressProtocol_Wordpress_Plugin.zip" download="PressProtocol_Wordpress_Plugin.zip">
                <Button variant="outline" className="border-hairline bg-overlay hover:bg-surface-raised text-primary h-10 px-5 rounded-[6px] font-medium text-xs font-mono transition-colors">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download Plugin .zip
                </Button>
              </a>
              <a
                href="https://github.com/0xshikhar/PressProtocol/tree/main/integrations/wordpress-plugin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <span>Source Code on GitHub</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Chromium Browser Extension */}
          <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">Browser Extension</span>
                <span className="text-muted">Manifest V3</span>
              </div>
              <h3 className="font-sans text-xl font-semibold text-primary mb-2 tracking-tight">
                Chromium Reader &amp; Router
              </h3>
              <p className="text-xs lg:text-sm text-secondary leading-relaxed mb-6 font-light measure-reading">
                Resolves pressprotocol:// links natively with instant multi-transport fallback. Probes fastest IPFS mirrors and Tor onion relays client-side.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <a href="/downloads/PressProtocol_Browser_Extension.zip" download="PressProtocol_Browser_Extension.zip">
                <Button variant="outline" size="sm" className="border-hairline text-secondary hover:text-primary hover:bg-overlay text-xs font-mono h-9 rounded-[6px]">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download MV3 .zip
                </Button>
              </a>
              <span className="font-mono text-[11px] text-muted">Chrome &bull; Brave</span>
            </div>
          </div>

          {/* Card 3: TypeScript SDK */}
          <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">Client Library</span>
                <span className="text-muted">Node / Web</span>
              </div>
              <h3 className="font-sans text-xl font-semibold text-primary mb-2 tracking-tight">
                TypeScript / Node SDK
              </h3>
              <p className="text-xs lg:text-sm text-secondary leading-relaxed mb-6 font-light measure-reading">
                Programmatically sign, pin, verify, and resolve content envelopes in any JavaScript or TypeScript application with minimal overhead.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-canvas border border-hairline font-mono text-xs">
                <span className="text-primary">pnpm add @pressprotocol/sdk</span>
                <button
                  onClick={copySnippet}
                  className="p-1 rounded hover:bg-overlay text-muted hover:text-primary transition-colors"
                  aria-label="Copy install command"
                >
                  {copiedSdk ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Link
                href="/developers"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted hover:text-secondary transition-colors"
              >
                <span>Also available: Python &bull; Go SDKs</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Ghost CMS & Newsrooms */}
          <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">Newsroom Bridge</span>
                <span className="text-muted">Webhooks</span>
              </div>
              <h3 className="font-sans text-xl font-semibold text-primary mb-2 tracking-tight">
                Ghost CMS Webhooks
              </h3>
              <p className="text-xs lg:text-sm text-secondary leading-relaxed font-light measure-reading">
                Native publishing hook for independent journalism newsrooms. Mirror full newsletter archives and investigative reporting to IPFS automatically.
              </p>
            </div>
            <div className="pt-4 border-t border-hairline font-mono text-xs text-muted">
              Zero-setup webhook listener
            </div>
          </div>

          {/* Card 5: Substack & Medium Importer */}
          <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">Ingestion</span>
                <span className="text-muted">1-Click Scrub</span>
              </div>
              <h3 className="font-sans text-xl font-semibold text-primary mb-2 tracking-tight">
                Substack &amp; Ghost Importer
              </h3>
              <p className="text-xs lg:text-sm text-secondary leading-relaxed font-light measure-reading">
                Paste any article URL to instantly import, strip tracking telemetry, extract canonical markdown, and pin an immutable IPFS backup archive.
              </p>
            </div>
            <div className="pt-4 border-t border-hairline font-mono text-xs text-muted">
              <Link href="/import" className="text-secondary hover:text-primary transition-colors font-medium">
                Open Importer
              </Link>
            </div>
          </div>

          {/* Card 6: Local-First Notes (Obsidian) */}
          <div className="p-8 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between hover:border-focus transition-all shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono text-muted">
                <span className="text-secondary font-medium">Local-First</span>
                <span className="text-muted">Markdown</span>
              </div>
              <h3 className="font-sans text-xl font-semibold text-primary mb-2 tracking-tight">
                Obsidian &amp; Logseq Sync
              </h3>
              <p className="text-xs lg:text-sm text-secondary leading-relaxed font-light measure-reading">
                Publish directly from your local vault. Your notes remain on your hard drive, cryptographically signed and permanently mirrored to the decentralized web.
              </p>
            </div>
            <div className="pt-4 border-t border-hairline font-mono text-xs text-muted">
              <Link href="/downloads" className="text-secondary hover:text-primary transition-colors font-medium">
                Get Obsidian Plugin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
