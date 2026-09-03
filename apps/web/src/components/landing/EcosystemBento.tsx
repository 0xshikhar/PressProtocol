"use client";

import { useState } from "react";
import { Download, Copy, Check, ExternalLink, Code2, Globe, FileText, Share2, Shield, ArrowUpRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EcosystemBento() {
  const [copiedSdk, setCopiedSdk] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText("npm install @pressprotocol/sdk");
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  return (
    <section id="ecosystem" className="relative py-28 lg:py-36 bg-black text-white overflow-hidden border-t border-white/10">
      {/* Glow accent */}
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-950/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6">
              <span>●</span>
              <span>UNIVERSAL INTEGRATIONS</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white">
              Write where you work.
              <br />
              <span className="text-white/40">Publish everywhere.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-base text-white/60 font-light leading-relaxed">
            PressProtocol is an open substrate, not a walled garden. Integrate seamlessly into existing newsroom CMSs, note-taking apps, and developer toolchains.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: WordPress Plugin (Featured Large Bento Card) */}
          <div className="lg:col-span-2 p-8 lg:p-10 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-white/25 transition-all shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe className="w-36 h-36 text-white" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    CMS INTEGRATION
                  </span>
                  <span className="font-mono text-xs text-white/50">43% of the Web</span>
                </div>
                <span className="font-mono text-xs text-emerald-400">v1.2.0 RELEASE</span>
              </div>

              <h3 className="font-display text-3xl lg:text-4xl text-white mb-3">
                Official WordPress Plugin
              </h3>
              <p className="text-white/70 text-sm lg:text-base max-w-xl leading-relaxed mb-6 font-light">
                Turn any self-hosted WordPress site into a censorship-resistant publishing node. Automatically pin every published post to IPFS and Tor with background Ed25519 signing without modifying your editorial workflow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <a href="/downloads/PressProtocol_Wordpress_Plugin.zip" download="PressProtocol_Wordpress_Plugin.zip">
                <Button className="bg-white hover:bg-white/90 text-black h-11 px-6 rounded-xl font-medium text-xs font-mono shadow-lg hover:shadow-cyan-500/20 group">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download Plugin .zip
                </Button>
              </a>
              <a
                href="https://github.com/0xshikhar/PressProtocol/tree/main/integrations/wordpress-plugin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>View Source on GitHub</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Chromium Browser Extension */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  BROWSER EXTENSION
                </span>
                <span className="font-mono text-xs text-white/40">Manifest V3</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-3">
                Chromium Reader & Router
              </h3>
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed mb-6 font-light">
                Resolves `pressprotocol://` deep links natively with instant multi-transport fallback. Automatically probes fastest available IPFS mirrors and Tor relays.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <a href="/downloads/PressProtocol_Browser_Extension.zip" download="PressProtocol_Browser_Extension.zip">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 text-xs font-mono h-9">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download MV3 .zip
                </Button>
              </a>
              <span className="font-mono text-[11px] text-emerald-400">Chrome · Brave · Edge</span>
            </div>
          </div>

          {/* Card 3: TypeScript SDK */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  DEVELOPERS
                </span>
                <span className="font-mono text-xs text-white/40">NPM Package</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-3">
                TypeScript / Node SDK
              </h3>
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed mb-6 font-light">
                Programmatically sign, pin, verify, and resolve content envelopes in any JavaScript or TypeScript application with 3 lines of code.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs">
                <span className="text-cyan-300">pnpm add @pressprotocol/sdk</span>
                <button
                  onClick={copySnippet}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Copy install command"
                >
                  {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href="/developers"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50 hover:text-cyan-400 transition-colors"
              >
                <span>Also available: Python · Go · Rust SDKs</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 4: Ghost CMS & Newsrooms */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  NEWSROOM ADAPTER
                </span>
                <span className="font-mono text-xs text-white/40">Webhooks</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-3">
                Ghost CMS Webhooks
              </h3>
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed font-light">
                Native publishing hook for independent journalism newsrooms. Mirror full newsletter archives and investigative reporting to IPFS automatically.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 font-mono text-xs text-white/40">
              Zero-setup webhook listener
            </div>
          </div>

          {/* Card 5: Substack & Medium Importer */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  MIGRATION
                </span>
                <span className="font-mono text-xs text-white/40">1-Click URL</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-3">
                Substack & Medium Importer
              </h3>
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed font-light">
                Paste any article URL to instantly import, strip tracking telemetry, extract canonical markdown, and pin an immutable IPFS backup archive.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 font-mono text-xs text-white/40">
              Self-sovereign article backup
            </div>
          </div>

          {/* Card 6: Local-First Notes (Obsidian / Logseq) */}
          <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  LOCAL-FIRST
                </span>
                <span className="font-mono text-xs text-white/40">Markdown Vaults</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-3">
                Obsidian & Logseq Sync
              </h3>
              <p className="text-xs lg:text-sm text-white/60 leading-relaxed font-light">
                Publish directly from your local vault. Your notes remain on your hard drive, cryptographically signed and permanently mirrored to the decentralized web.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 font-mono text-xs text-white/40">
              Offline-first publishing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
