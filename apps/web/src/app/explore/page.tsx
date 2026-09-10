"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Sparkles, BookMarked, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header Banner */}
      <div className="border-b border-border/60 bg-surface/50 relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary/10 border border-primary/20 text-primary">
                  <Globe className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  Decentralized Network Feed
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-hero font-normal text-foreground tracking-tight">
                Discover Sovereign Publications
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                Real-time peer-to-peer index of censorship-resistant articles syndicated across IPFS swarms, Tor hidden services, and developer git rails.
              </p>
            </div>

            {/* Quick link to Offline Vault */}
            <Link href="/bookmarks">
              <Button
                variant="outline"
                className="gap-2 border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs h-10 px-4 rounded-[6px] shadow-sm transition-colors"
              >
                <BookMarked className="h-4 w-4 text-primary" />
                <span>My Offline Reading Vault</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-warning" />
              Trending Topics:
            </span>
            {trendingTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[11px] font-mono border-border/60 bg-surface-subtle text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer transition-colors rounded-[4px]"
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
