"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Rss,
  Sparkles,
  Zap,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  Shield,
  ShieldCheck,
  Flame,
  FileText,
  Clock,
  Key,
  Globe,
  Database,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getOrCreateBurnerWallet, type BurnerWallet } from "@/lib/burner-wallet";
import type { ParsedRssFeed, RssFeedItem } from "@/lib/scrubber";

type ArticleStatus = "ready" | "scrubbing" | "signing" | "publishing" | "archived" | "error";

interface ProcessedArticleItem extends RssFeedItem {
  status: ArticleStatus;
  cid?: string;
  shareUrl?: string;
  error?: string;
  selected: boolean;
}

export function BulkRssImporter() {
  const [feedUrl, setFeedUrl] = useState("");
  const [tags, setTags] = useState("publication-archive, sovereign, syndicated");
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Feed state
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<ParsedRssFeed | null>(null);
  const [articles, setArticles] = useState<ProcessedArticleItem[]>([]);

  // Batch process state
  const [isBatching, setIsBatching] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [batchCompleted, setBatchCompleted] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  useEffect(() => {
    getOrCreateBurnerWallet().then(setBurnerWallet).catch(console.error);
  }, []);

  const samplePresets = [
    {
      label: "Substack Feed",
      url: "https://vitalik.eth.limo/feed.xml",
      tags: "vitalik, ethereum, decentralization",
    },
    {
      label: "Tor Project News",
      url: "https://blog.torproject.org/feed.xml",
      tags: "tor, privacy, security",
    },
    {
      label: "Web3 Research Blog",
      url: "https://timdaub.github.io/index.xml",
      tags: "sovereignty, open-source, protocols",
    },
  ];

  // Fetch full feed
  const handleFetchFeed = async () => {
    if (!feedUrl.trim()) {
      setFeedError("Please enter a valid RSS or Atom publication feed URL.");
      return;
    }

    setLoadingFeed(true);
    setFeedError(null);
    setBatchCompleted(false);

    try {
      const res = await fetch("/api/import/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedUrl: feedUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse publication feed.");
      }

      setFeedData(data.feed);
      setArticles(
        data.feed.items.map((item: RssFeedItem) => ({
          ...item,
          status: "ready",
          selected: true,
        }))
      );
    } catch (err: any) {
      setFeedError(err.message || "Failed to load publication feed.");
    } finally {
      setLoadingFeed(false);
    }
  };

  // Selection helpers
  const toggleSelectAll = (select: boolean) => {
    setArticles((prev) => prev.map((a) => ({ ...a, selected: select })));
  };

  const toggleSelectArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const selectedArticles = articles.filter((a) => a.selected);
  const archivedArticles = articles.filter((a) => a.status === "archived" && a.cid);

  // Batch publishing engine
  const handleStartBatchSyndication = async () => {
    if (selectedArticles.length === 0) return;

    setIsBatching(true);
    setBatchCompleted(false);
    setProcessedCount(0);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const signingKey = customKey.trim() || burnerWallet?.privateKey || undefined;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      if (!article.selected || article.status === "archived") {
        continue;
      }

      setCurrentProcessingIndex(i);

      // Update state: Scrubbing & Signing
      setArticles((prev) =>
        prev.map((a, idx) => (idx === i ? { ...a, status: "scrubbing" } : a))
      );

      try {
        await new Promise((r) => setTimeout(r, 200)); // UI pacing
        setArticles((prev) =>
          prev.map((a, idx) => (idx === i ? { ...a, status: "publishing" } : a))
        );

        // Dispatch to content publishing API
        const response = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            content: article.cleanHtml,
            tags: Array.from(new Set([...tagList, ...article.tags])),
            privateKey: signingKey,
            publicKey: burnerWallet?.publicKey,
            timestamp: article.publishedAt,
          }),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || `HTTP ${response.status}`);
        }

        const cid = resData.data?.cid || resData.cid;
        const shareUrl = `${window.location.origin}/read/${cid}`;

        setArticles((prev) =>
          prev.map((a, idx) =>
            idx === i
              ? {
                  ...a,
                  status: "archived",
                  cid,
                  shareUrl,
                }
              : a
          )
        );
      } catch (err: any) {
        console.error(`Error syndicating ${article.title}:`, err);
        setArticles((prev) =>
          prev.map((a, idx) =>
            idx === i
              ? {
                  ...a,
                  status: "error",
                  error: err.message || "Failed to publish",
                }
              : a
          )
        );
      }

      setProcessedCount((prev) => prev + 1);
    }

    setIsBatching(false);
    setCurrentProcessingIndex(null);
    setBatchCompleted(true);
  };

  // Download Master Archive .pressproof.json
  const handleDownloadMasterManifest = () => {
    if (!feedData) return;

    const manifest = {
      version: "1.0.0",
      type: "PressProtocol_Bulk_Publication_Archive",
      archivedAt: new Date().toISOString(),
      publication: {
        title: feedData.title,
        description: feedData.description,
        feedUrl: feedData.feedUrl,
        homeUrl: feedData.link,
        authorPseudonym: burnerWallet?.pseudonym || "Anonymous Sovereign",
        authorPublicKey: burnerWallet?.publicKey || "",
      },
      stats: {
        totalArticlesArchived: archivedArticles.length,
        totalWordsArchived: archivedArticles.reduce((acc, a) => acc + a.wordCount, 0),
        totalTrackersPurged: archivedArticles.reduce((acc, a) => acc + a.telemetry.totalPurged, 0),
      },
      articles: archivedArticles.map((a) => ({
        cid: a.cid,
        title: a.title,
        canonicalUrl: a.link,
        publishedAt: a.publishedAt,
        wordCount: a.wordCount,
        tags: a.tags,
        readerUrl: a.shareUrl,
        telemetry: a.telemetry,
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const sanitizedName = feedData.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    a.href = url;
    a.download = `${sanitizedName}_pressprotocol_archive.pressproof.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy All Reader Links
  const handleCopyAllLinks = () => {
    const lines = archivedArticles
      .map((a) => `- [${a.title}](${a.shareUrl}) (CID: ${a.cid})`)
      .join("\n");
    navigator.clipboard.writeText(lines);
    setCopiedLinks(true);
    setTimeout(() => setCopiedLinks(false), 2000);
  };

  const progressPercent = selectedArticles.length
    ? Math.round((processedCount / selectedArticles.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search and Configuration Card */}
      <Card className="border-white/10 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Rss className="w-4 h-4 text-cyan-400" /> Bulk Publication Archive Importer
            </span>
            <span className="text-xs font-mono text-zinc-500 font-normal">
              Substack · Medium · Ghost · WordPress · Custom RSS
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Archive entire blogs or newsroom archives in a single batch. All articles are scrubbed of tracking pixels, signed with your Ed25519 sovereign key, and mirrored across IPFS & Tor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono">Sample publication feeds:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFeedUrl(preset.url);
                  setTags(preset.tags);
                }}
                className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 text-zinc-300 transition-colors font-mono text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Feed URL input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Publication RSS / Atom Feed URL
            </label>
            <div className="flex gap-2">
              <Input
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://myname.substack.com/feed or https://medium.com/feed/@username"
                className="bg-black/60 border-white/15 text-white placeholder:text-zinc-600 font-mono text-sm h-12 focus-visible:ring-cyan-500"
                disabled={loadingFeed || isBatching}
              />
              <Button
                onClick={handleFetchFeed}
                disabled={loadingFeed || isBatching || !feedUrl.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold h-12 px-6 gap-2"
              >
                {loadingFeed ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" /> Load Feed
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Syndication Tags */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Sovereign Batch Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="archive, publication, sovereign"
              className="bg-black/60 border-white/15 text-white placeholder:text-zinc-600 text-sm h-10 focus-visible:ring-cyan-500"
              disabled={isBatching}
            />
          </div>

          {/* Sovereign Identity Badge & Custom Key */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-zinc-500">Signing Identity:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  {burnerWallet?.pseudonym || "Anon-Burner..."}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-1.5 font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showKeyInput ? "Hide" : "Use custom"} Ed25519 Private Key</span>
              </button>
            </div>

            {showKeyInput && (
              <div className="space-y-1.5 pt-1">
                <Input
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  type="password"
                  placeholder="64-character hex Ed25519 private key (optional)"
                  className="bg-black/60 border-white/15 text-white font-mono text-xs h-9 focus-visible:ring-cyan-500"
                  disabled={isBatching}
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {feedError && (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Feed Parsing Error</strong>
                <span>{feedError}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed Loaded View */}
      {feedData && (
        <div className="space-y-6">
          {/* Publication Overview Banner */}
          <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-zinc-950 to-zinc-950">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      FEED READY
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      {feedData.totalItems} Articles Found
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {feedData.title}
                  </h2>
                  {feedData.description && (
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {feedData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                    <a
                      href={feedData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> {feedData.link}
                    </a>
                  </div>
                </div>

                {/* Batch Action Widget */}
                <div className="flex flex-col sm:items-end gap-3">
                  <Button
                    onClick={handleStartBatchSyndication}
                    disabled={isBatching || selectedArticles.length === 0}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11 px-6 gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isBatching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Batch Archiving...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" /> Batch Syndicate {selectedArticles.length} Articles
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="hover:text-white transition-colors"
                      disabled={isBatching}
                    >
                      Select All ({articles.length})
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="hover:text-white transition-colors"
                      disabled={isBatching}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-Time Progress Bar */}
              {isBatching && (
                <div className="mt-6 space-y-2 p-4 rounded-xl bg-black/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Archiving Article {processedCount + 1} of {selectedArticles.length}...
                    </span>
                    <span className="text-zinc-400">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-zinc-800" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Completion & Manifest Download Card */}
          {batchCompleted && archivedArticles.length > 0 && (
            <Card className="border-emerald-500/40 bg-emerald-950/20 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      <Check className="w-3.5 h-3.5" /> PUBLICATION ARCHIVE PRESERVED
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {archivedArticles.length} Articles Successfully Published to PressProtocol
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Surveillance trackers permanently purged. Pinned to IPFS swarm and registered with Tor onion mirrors.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleDownloadMasterManifest}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs gap-1.5 h-10"
                    >
                      <Download className="w-4 h-4" /> Download Archive Manifest (.pressproof.json)
                    </Button>

                    <Button
                      onClick={handleCopyAllLinks}
                      variant="outline"
                      className="border-white/20 text-xs text-zinc-300 hover:text-white h-10 gap-1.5"
                    >
                      {copiedLinks ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedLinks ? "Copied All Links!" : "Copy All Permalinks"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article Checklist Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
              <span>ARTICLE CATALOG ({articles.length} ENTRIES)</span>
              <span>{selectedArticles.length} SELECTED FOR ARCHIVAL</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 overflow-hidden divide-y divide-white/5">
              {articles.map((article, index) => {
                const isCurrent = currentProcessingIndex === index;
                return (
                  <div
                    key={article.id}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                      isCurrent
                        ? "bg-emerald-500/10"
                        : article.selected
                        ? "hover:bg-white/[0.02]"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    {/* Left: Checkbox & Article Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelectArticle(article.id)}
                        disabled={isBatching}
                        className="mt-1 text-zinc-400 hover:text-white focus:outline-none"
                      >
                        {article.selected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-serif font-bold text-white truncate max-w-lg">
                            {article.title}
                          </h4>
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-cyan-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500">
                          <span>By {article.author}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ~{article.readingTimeMinutes} min ({article.wordCount} words)
                          </span>
                          {article.telemetry.totalPurged > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/80">
                                {article.telemetry.totalPurged} trackers flagged
                              </span>
                            </>
                          )}
                        </div>

                        {article.excerpt && (
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Pill & Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                      {article.status === "ready" && (
                        <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 text-[11px]">
                          Ready
                        </span>
                      )}

                      {article.status === "scrubbing" && (
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Scrubbing & Signing...
                        </span>
                      )}

                      {article.status === "publishing" && (
                        <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Pining to IPFS Swarm...
                        </span>
                      )}

                      {article.status === "archived" && article.cid && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-semibold">
                            <Check className="w-3 h-3" /> Archived
                          </span>
                          <Link
                            href={`/read/${article.cid}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 text-[11px] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Reader View
                          </Link>
                        </div>
                      )}

                      {article.status === "error" && (
                        <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[11px]">
                          Failed: {article.error}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
