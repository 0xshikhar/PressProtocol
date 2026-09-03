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
        <div className="relative rounded-2xl border border-border/60 bg-gradient-to-b from-blue-50/40 via-white to-background p-6 sm:p-10 overflow-hidden shadow-sm">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-50 text-blue-700 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>NOTION BLOCK SOVEREIGN BRIDGE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
              Import Notion Documents to IPFS & Tor
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
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
