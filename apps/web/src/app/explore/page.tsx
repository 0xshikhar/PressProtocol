"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Globe, Sparkles, BookMarked, Radio, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import { BACKEND_URL } from "@/config/backend";

interface CategoryStats {
  category: string;
  count: number;
}

export default function ExplorePage() {
  const [selectedRail, setSelectedRail] = useState("All Rails");
  const [categories, setCategories] = useState<{ value: string; label: string; count: number }[]>([
    { value: "all", label: "All Content", count: 0 },
  ]);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/discovery/stats`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const categoryList = [
          { value: "all", label: "All Content", count: result.data.totalContent },
          ...result.data.categories.map((cat: CategoryStats) => ({
            value: cat.category,
            label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
            count: cat.count,
          })),
        ];
        setCategories(categoryList);
      }
    } catch (error) {
      // ignore
    }
  };

  const trendingTags = [
    "cryptography",
    "tor",
    "ipfs",
    "privacy",
    "whistleblower",
    "notion",
    "git-publish",
    "sovereignty",
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
                  <Globe className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Decentralized Network Feed
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-sans font-bold text-white tracking-tight">
                Discover Sovereign Publications
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Real-time peer-to-peer index of censorship-resistant articles syndicated across IPFS swarms, Tor hidden services, and developer git rails.
              </p>
            </div>

            {/* Quick link to Offline Vault */}
            <Link href="/bookmarks">
              <Button
                variant="outline"
                className="gap-2 border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-cyan-200 text-xs h-10 px-4 rounded-xl shadow-lg transition-all"
              >
                <BookMarked className="h-4 w-4 text-cyan-400" />
                <span>My Offline Reading Vault</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </Link>
          </div>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Trending Topics:
            </span>
            {trendingTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[11px] font-mono border-white/10 bg-white/[0.04] text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/40 cursor-pointer transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Area */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <DiscoveryFeed />
      </div>
    </div>
  );
}
