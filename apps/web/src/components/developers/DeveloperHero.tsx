import React from "react";
import Link from "next/link";
import { Play, Sparkles, FileCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DeveloperHero() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className="gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs"
        >
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          RFC-PP-009 Active Gateway
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">
          OpenAPI 3.1.0
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">
          &lt; 45ms Latency SLA
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">
          Zero-Custody Ready
        </Badge>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
          Developer Portal &amp; Open Infrastructure API
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
          The <em>Stripe for Sovereign Publishing</em>. Programmatically publish, verify, resolve, and distribute uncensorable content across IPFS, Tor v3, and decentralized swarms with clean HTTP REST and multi-language SDKs.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="#api-explorer">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
            <Play className="h-4 w-4" /> Open API Explorer
          </Button>
        </Link>
        <Link href="#widget-playground">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" /> Web Component Playground
          </Button>
        </Link>
        <Link href="/api/v1/openapi.json" target="_blank">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <FileCode className="h-4 w-4" /> Raw OpenAPI Spec <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
