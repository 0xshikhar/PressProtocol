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
  Layers,
  Radio,
  LayoutGrid,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { discoveryService, type DiscoveryContent } from "@/lib/discovery";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { classifySourceRail, saveArticleOffline } from "@/lib/offline-storage";
import { CidChip, SignatureBadge } from "@/components/protocol";

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
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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
      toast.error("Discovery indexers unreachable - trying decentralized fallback");
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

  const getRailBadgeVariant = (rail: string) => {
    switch (rail) {
      case "Studio":
        return "default";
      case "Notion":
      case "Substack/RSS":
      case "WordPress":
      case "Web Clipper":
      case "Git SSG":
      default:
        return "outline";
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
    <div className="space-y-6 text-primary">
      {usingFallback && (
        <Alert className="border-warning/30 bg-warning/10 text-warning rounded-[6px]">
          <Server className="h-4 w-4 text-warning" />
          <AlertDescription className="text-xs">
            Using decentralized discovery (DHT Swarm fallback). Ensuring zero-censorship resolution across multi-node peer networks.
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search feed by title, tag, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-surface border-hairline text-primary placeholder:text-muted rounded-[6px] focus-visible:ring-0 focus-visible:border-focus"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verified filter pill */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`text-xs h-9 gap-1.5 rounded-[6px] border transition-all ${
              onlyVerified
                ? "border-verified/30 bg-verified/15 text-verified font-medium"
                : "border-hairline bg-surface text-secondary hover:text-primary hover:bg-overlay"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Ed25519
          </Button>

          {/* Transport filter toggle */}
          <div className="flex items-center rounded-[6px] border border-hairline bg-surface p-0.5 text-xs font-mono">
            <button
              onClick={() => setSelectedTransport("all")}
              className={`px-2.5 py-1 rounded-[4px] transition-all ${
                selectedTransport === "all"
                  ? "bg-overlay text-primary border border-focus font-medium"
                  : "text-muted hover:text-primary"
              }`}
            >
              All Transports
            </button>
            <button
              onClick={() => setSelectedTransport("tor")}
              className={`px-2.5 py-1 rounded-[4px] transition-all flex items-center gap-1 ${
                selectedTransport === "tor"
                  ? "bg-anonymous/15 text-anonymous border border-anonymous/30 font-medium"
                  : "text-muted hover:text-primary"
              }`}
            >
              <Radio className="h-3 w-3" />
              Tor v3
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-[6px] border border-hairline bg-surface p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-[4px] transition-all ${
                viewMode === "cards"
                  ? "bg-overlay text-primary border border-focus"
                  : "text-muted hover:text-primary"
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-[4px] transition-all ${
                viewMode === "table"
                  ? "bg-overlay text-primary border border-focus"
                  : "text-muted hover:text-primary"
              }`}
              title="High-Density Ledger Table"
            >
              <List className="h-3.5 w-3.5" />
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
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-all ${
              selectedRail === rail
                ? "bg-overlay text-primary border border-focus font-semibold"
                : "bg-surface hover:bg-overlay text-secondary hover:text-primary border border-hairline"
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
            <div key={i} className="h-28 rounded-[6px] bg-surface animate-pulse border border-hairline" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[6px] border border-hairline bg-surface p-12 text-center my-6 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          <Layers className="h-10 w-10 text-muted mx-auto mb-3" />
          <h3 className="text-base font-sans font-semibold text-primary mb-1">
            No articles match current filters
          </h3>
          <p className="text-xs text-secondary max-w-sm mx-auto mb-4">
            Try switching to &quot;All Rails&quot; or clearing your search term to see other syndicated publications.
          </p>

          <Button
            size="sm"
            onClick={() => {
              setSelectedRail("All Rails");
              setOnlyVerified(false);
              setSelectedTransport("all");
              setSearchQuery("");
            }}
            variant="outline"
            className="text-xs border-hairline bg-overlay hover:bg-elevated text-primary rounded-[6px]"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "table" ? (
        /* High-Density Ledger Table View */
        <div className="rounded-[6px] border border-hairline bg-surface overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-hairline bg-overlay/30 text-muted uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 font-medium">Rail &amp; Status</th>
                  <th className="py-3 px-4 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium">Content CID</th>
                  <th className="py-3 px-4 font-medium">Signer</th>
                  <th className="py-3 px-4 font-medium">Age</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredItems.map((item) => {
                  const rail = classifySourceRail(item.tags || []);
                  const isVerified = !!(item.publisher?.publicKey && item.publisher.publicKey.length >= 32);
                  const isSaved = !!bookmarkedMap[item.cid];

                  return (
                    <tr
                      key={item.cid}
                      onClick={() => { window.location.href = `/read/${item.cid}`; }}
                      className="hover:bg-overlay/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${isVerified ? "bg-verified" : "bg-muted"}`} />
                          <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] border border-hairline bg-overlay text-secondary">
                            {rail}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-primary group-hover:text-primary/80 transition-colors max-w-[280px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <CidChip cid={item.cid} prefixLen={6} suffixLen={4} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {item.publisher?.publicKey ? (
                          <SignatureBadge publicKey={item.publisher.publicKey} compact />
                        ) : (
                          <span className="text-muted text-[10px]">Unsigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted text-[11px] whitespace-nowrap tabular-nums">
                        {formatTimestamp(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleToggleBookmark(item, e)}
                            className="h-7 w-7 p-0 text-muted hover:text-primary"
                            title={isSaved ? "Saved" : "Save Offline"}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-verified text-verified" : ""}`} />
                          </Button>
                          <Link href={`/read/${item.cid}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-secondary hover:text-primary font-medium">
                              Read
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View (Section 3.3: Badge budget max 2, Inter titles) */
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
                className="group rounded-[6px] border border-hairline bg-surface hover:border-focus p-5 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3)] text-primary"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Section 3.3: Badge budget <= 2 per preview */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={getRailBadgeVariant(rail)} className="text-[10px] px-2 py-0.5 rounded-[4px] font-mono">
                        {rail}
                      </Badge>

                      {isVerified ? (
                        <Badge variant="verified" className="text-[10px] px-2 py-0.5 rounded-[4px] font-mono flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Ed25519 Verified
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="text-[10px] px-2 py-0.5 rounded-[4px] font-mono">
                          Community Mirror
                        </Badge>
                      )}

                      <span className="text-[11px] font-mono text-muted flex items-center gap-1 tabular-nums ml-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>

                    {/* Section 3.1 & 10: Inter ONLY for preview titles */}
                    <h2 className="text-lg font-sans font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-1 tracking-tight">
                      {item.title}
                    </h2>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono text-muted bg-overlay border border-hairline px-2 py-0.5 rounded-[4px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Publisher Meta */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
                      <CidChip cid={item.cid} truncate prefixLen={6} suffixLen={4} />
                      {item.publisher?.publicKey && (
                        <SignatureBadge publicKey={item.publisher.publicKey} compact />
                      )}
                      {item.publisher?.username && (
                        <span className="text-muted font-mono text-[11px]">
                          by @{item.publisher.username}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => handleToggleBookmark(item, e)}
                      className={`text-xs h-8 px-3 gap-1.5 rounded-[6px] ${
                        isSaved
                          ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium shadow-sm"
                          : "border-hairline bg-overlay/50 hover:bg-overlay text-secondary hover:text-primary"
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                      <span>{isSaved ? "Saved Offline" : "Save Offline"}</span>
                    </Button>

                    <Link href={`/read/${item.cid}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted hover:text-primary gap-1 px-2 font-medium">
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
            className="text-xs h-9 gap-1.5 border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary rounded-[6px]"
          >
            <Server className="h-3.5 w-3.5 text-muted" />
            Refresh Decentralized Feed
          </Button>
        </div>
      )}
    </div>
  );
}
