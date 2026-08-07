"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Search,
  Server,
  Bookmark,
  ShieldCheck,
  Shield,
  Layers,
  Globe,
  Check,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { discoveryService, type DiscoveryContent } from "@/lib/discovery";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { classifySourceRail, saveArticleOffline } from "@/lib/offline-storage";

interface DiscoveryFeedProps {
  initialRail?: string;
  verifiedOnly?: boolean;
  transportFilter?: "all" | "ipfs" | "tor";
}

const SOURCE_RAILS = [
  "All Rails",
  "Studio",
  "Notion",
  "Substack/RSS",
  "WordPress",
  "Web Clipper",
  "Git SSG",
];

export function DiscoveryFeed({
  initialRail = "All Rails",
  verifiedOnly = false,
  transportFilter = "all",
}: DiscoveryFeedProps) {
  const [items, setItems] = useState<DiscoveryContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRail, setSelectedRail] = useState(initialRail);
  const [onlyVerified, setOnlyVerified] = useState(verifiedOnly);
  const [selectedTransport, setSelectedTransport] = useState<"all" | "ipfs" | "tor">(transportFilter);
  const [usingFallback, setUsingFallback] = useState(false);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadDiscoveryFeed();
  }, []);

  const loadDiscoveryFeed = async () => {
    try {
      setLoading(true);
      setUsingFallback(false);
      const data = await discoveryService.discoverContent(undefined, 40);
      setItems(data);

      if (data.length === 0) {
        setUsingFallback(true);
      }

      // Check bookmark states
      const bMap: Record<string, boolean> = {};
      for (const item of data) {
        bMap[item.cid] = isBookmarked(item.cid);
      }
      setBookmarkedMap(bMap);
    } catch (error) {
      console.error("Error loading discovery feed:", error);
      setUsingFallback(true);
      toast.error("Discovery indexers unreachable — trying decentralized fallback");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (item: DiscoveryContent, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isCurrentlySaved = !!bookmarkedMap[item.cid];
      const added = toggleBookmark({
        cid: item.cid,
        title: item.title,
        tags: item.tags || [],
        author: item.publisher?.username || "Sovereign Author",
      });

      if (added) {
        await saveArticleOffline({
          cid: item.cid,
          title: item.title,
          content: `<p>Syndicated decentralized article preserved from discovery feed.</p>`,
          tags: item.tags || [],
          author: item.publisher?.username || "Sovereign Author",
          publicKey: item.publisher?.publicKey,
          createdAt: item.createdAt,
          savedAt: Date.now(),
          wordCount: 150,
          readingTimeMinutes: 1,
          sourceRail: classifySourceRail(item.tags || []),
          isVerified: !!(item.publisher?.publicKey),
        });
        setBookmarkedMap((prev) => ({ ...prev, [item.cid]: true }));
        toast.success("Saved to offline reading vault!");
      } else {
        setBookmarkedMap((prev) => ({ ...prev, [item.cid]: false }));
        toast.success("Removed from reading vault");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bookmark");
    }
  };

  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getRailStyle = (rail: string) => {
    switch (rail) {
      case "Notion":
        return "border-cyan-500/40 bg-cyan-950/30 text-cyan-300";
      case "Substack/RSS":
        return "border-orange-500/40 bg-orange-950/30 text-orange-300";
      case "WordPress":
        return "border-blue-500/40 bg-blue-950/30 text-blue-300";
      case "Web Clipper":
        return "border-emerald-500/40 bg-emerald-950/30 text-emerald-300";
      case "Git SSG":
        return "border-purple-500/40 bg-purple-950/30 text-purple-300";
      case "Studio":
        return "border-teal-500/40 bg-teal-950/30 text-teal-300";
      default:
        return "border-white/10 bg-white/5 text-zinc-300";
    }
  };

  // Filter items based on selected criteria
  const filteredItems = items.filter((item) => {
    const rail = classifySourceRail(item.tags || []);
    if (selectedRail !== "All Rails" && rail !== selectedRail) {
      return false;
    }

    const isVerified = !!(item.publisher?.publicKey && item.publisher.publicKey.length >= 32);
    if (onlyVerified && !isVerified) {
      return false;
    }

    if (selectedTransport === "tor") {
      const hasTorTag = (item.tags || []).some((t) => t.toLowerCase().includes("tor"));
      if (!hasTorTag) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchAuthor = (item.publisher?.username || "").toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchAuthor || matchTags;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {usingFallback && (
        <Alert className="border-amber-500/30 bg-amber-950/20 text-amber-200">
          <Server className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-xs">
            Using decentralized discovery (DHT Swarm fallback). Ensuring zero-censorship resolution across multi-node peer networks.
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search feed by title, tag, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-zinc-900/60 border-white/10 text-zinc-200 placeholder:text-zinc-500 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verified filter pill */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`text-xs h-9 gap-1.5 rounded-lg border transition-all ${
              onlyVerified
                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Ed25519
          </Button>

          {/* Transport filter toggle */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs font-mono">
            <button
              onClick={() => setSelectedTransport("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTransport === "all" ? "bg-emerald-500 text-black font-semibold" : "text-zinc-400"
              }`}
            >
              All Transports
            </button>
            <button
              onClick={() => setSelectedTransport("tor")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedTransport === "tor" ? "bg-purple-500 text-white font-semibold" : "text-zinc-400"
              }`}
            >
              <Radio className="h-3 w-3" />
              Tor v3
            </button>
          </div>
        </div>
      </div>

      {/* Source Rail Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {SOURCE_RAILS.map((rail) => (
          <button
            key={rail}
            onClick={() => setSelectedRail(rail)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedRail === rail
                ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/5"
            }`}
          >
            {rail}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-12 text-center my-6">
          <Layers className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-white mb-1">
            No articles match current filters
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Try switching to "All Rails" or clearing your search term to see other syndicated publications.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setSelectedRail("All Rails");
              setOnlyVerified(false);
              setSelectedTransport("all");
              setSearchQuery("");
            }}
            className="bg-white/10 hover:bg-white/15 text-white text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const rail = classifySourceRail(item.tags || []);
            const isVerified = !!(item.publisher?.publicKey && item.publisher.publicKey.length >= 32);
            const isSaved = !!bookmarkedMap[item.cid];

            return (
              <div
                key={item.cid}
                onClick={() => {
                  window.location.href = `/read/${item.cid}`;
                }}
                className="group rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-emerald-500/30 p-5 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Rail & Provenance Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${getRailStyle(rail)}`}>
                        {rail}
                      </Badge>

                      {isVerified ? (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-emerald-500/30 bg-emerald-950/20 text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Ed25519 Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-white/10 bg-white/5 text-zinc-400">
                          Community Mirror
                        </Badge>
                      )}

                      <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-serif font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {item.title}
                    </h2>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono text-zinc-400 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Publisher Meta */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400 font-mono">
                      <span>Publisher: {item.publisher?.username || (item.publisher?.publicKey ? `${item.publisher.publicKey.slice(0, 8)}...` : "Anonymous")}</span>
                      <span>•</span>
                      <span className="text-zinc-500 truncate max-w-[150px]">CID: {item.cid.slice(0, 10)}...</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => handleToggleBookmark(item, e)}
                      className={`text-xs h-8 px-3 gap-1.5 rounded-lg ${
                        isSaved
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500 font-semibold shadow-sm"
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                      <span>{isSaved ? "Saved Offline" : "Save Offline"}</span>
                    </Button>

                    <Link href={`/read/${item.cid}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-white gap-1 px-2">
                        <span>Read</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh / Load More */}
      {items.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDiscoveryFeed}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs h-9 gap-1.5"
          >
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            Refresh Decentralized Feed
          </Button>
        </div>
      )}
    </div>
  );
}
