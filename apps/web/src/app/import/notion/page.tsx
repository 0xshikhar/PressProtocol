"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotionImporter } from "@/components/import/NotionImporter";

export default function NotionImportPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                <span className="text-cyan-400 font-mono text-xs font-bold">¶</span>
              </div>
              <span className="font-serif tracking-tight text-lg text-white font-bold">
                PressProtocol
              </span>
            </Link>
            <span className="text-white/20">/</span>
            <Link href="/import" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
              Import
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Notion Importer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/import">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
                All Importers
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-white/10 text-zinc-300 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Exit to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NOTION BLOCK SOVEREIGN BRIDGE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Import Notion Documents to IPFS & Tor
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Preserve research notes, DAO proposals, and security disclosures drafted in Notion.
              Notion Callouts, Quotes, Headings, and Code blocks are transformed into pure semantic HTML5,
              signed with your Ed25519 sovereign burner key, and mirrored globally across decentralized transports.
            </p>
          </div>
        </div>

        {/* Notion Importer Studio */}
        <NotionImporter />
      </main>
    </div>
  );
}
