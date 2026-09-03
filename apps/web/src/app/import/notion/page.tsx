"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotionImporter } from "@/components/import/NotionImporter";

export default function NotionImportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/import" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Importers
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Notion Importer</span>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#0E111A] to-[#07080C] p-6 sm:p-8 overflow-hidden shadow-2xl">
          {/* Hairline Horizon Accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          
          {/* Controlled Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 font-mono text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Notion Block Sovereign Bridge</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight text-white">
              Import Notion Documents to IPFS & Tor
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
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
