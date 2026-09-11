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
import { CidChip } from "@/components/protocol/CidChip";

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
      <Card elevation="card" className="border-border/60 bg-surface">
        <CardHeader>
          <CardTitle className="text-lg font-sans font-semibold flex items-center justify-between text-foreground">
            <span className="flex items-center gap-2">
              <Rss className="w-4 h-4 text-primary" /> Bulk Publication Archive Importer
            </span>
            <span className="text-xs font-mono text-muted-foreground font-normal">
              Substack · Medium · Ghost · WordPress · Custom RSS
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Archive entire blogs or newsroom archives in a single batch. All articles are scrubbed of tracking pixels, signed with your Ed25519 sovereign key, and mirrored across IPFS & Tor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono">Sample publication feeds:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFeedUrl(preset.url);
                  setTags(preset.tags);
                }}
                className="px-2.5 py-1 rounded-[4px] border border-border/60 bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors font-mono text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Feed URL input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Publication RSS / Atom Feed URL
            </label>
            <div className="flex gap-2">
              <Input
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://myname.substack.com/feed or https://medium.com/feed/@username"
                className="bg-surface-subtle border-border/60 text-foreground font-mono text-sm h-12 focus:border-primary"
                disabled={loadingFeed || isBatching}
              />
              <Button
                onClick={handleFetchFeed}
                disabled={loadingFeed || isBatching || !feedUrl.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 gap-2"
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
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Sovereign Batch Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="archive, publication, sovereign"
              className="bg-background border-input text-foreground text-sm h-10"
              disabled={isBatching}
            />
          </div>

          {/* Sovereign Identity Badge & Custom Key */}
          <div className="pt-2 border-t space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">Signing Identity:</span>
                <span className="px-2 py-0.5 rounded-[4px] bg-verified-tint border border-verified/30 text-verified font-semibold">
                  {burnerWallet?.pseudonym || "Anon-Burner..."}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-1.5 font-mono text-muted-foreground hover:text-foreground transition-colors"
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
                  className="bg-background border-input text-foreground font-mono text-xs h-9"
                  disabled={isBatching}
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {feedError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
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
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 font-bold">
                      FEED READY
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {feedData.totalItems} Articles Found
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-foreground">
                    {feedData.title}
                  </h2>
                  {feedData.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feedData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                    <a
                      href={feedData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 gap-2 shadow-sm"
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

                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="hover:text-foreground transition-colors"
                      disabled={isBatching}
                    >
                      Select All ({articles.length})
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="hover:text-foreground transition-colors"
                      disabled={isBatching}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Progress Bar */}
          {isBatching && (
            <div className="p-4 rounded-[6px] border border-border/60 bg-surface-subtle space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-primary font-semibold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SCRUBBING & SIGNING FEED ARCHIVE...
                </span>
                <span className="text-muted-foreground font-mono">
                  {processedCount} of {selectedArticles.length} ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-surface" />
            </div>
          )}

          {/* Batch Completion & Manifest Download Card */}
          {batchCompleted && archivedArticles.length > 0 && (
            <Card elevation="card" className="border-verified/30 bg-surface">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-xs font-mono bg-verified/10 text-verified border border-verified/30 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Publication archive preserved
                    </span>
                    <h3 className="text-lg font-sans font-bold text-foreground">
                      {archivedArticles.length} Articles Successfully Published to PressProtocol
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Surveillance trackers permanently purged. Pinned to IPFS swarm and registered with Tor onion mirrors.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleDownloadMasterManifest}
                      variant="outline"
                      size="sm"
                      className="border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs font-mono gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-muted-foreground" /> Export JSON Manifest
                    </Button>
                    <Button
                      onClick={handleCopyAllLinks}
                      variant="outline"
                      size="sm"
                      className="border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs font-mono gap-1.5"
                    >
                      {copiedLinks ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      {copiedLinks ? "Copied Links" : "Copy Markdown Links"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article items list */}
          {articles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
                <span>Select articles to mirror ({selectedArticles.length} selected)</span>
                <span>{articles.length} total in feed</span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {articles.map((article, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-[6px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      article.selected
                        ? "border-primary/40 bg-surface-subtle"
                        : "border-border/50 bg-surface opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Left: Checkbox and info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelectArticle(article.id)}
                        disabled={isBatching}
                        className="mt-1 flex-shrink-0"
                      >
                        {article.selected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-sans font-bold text-foreground truncate max-w-lg">
                            {article.title}
                          </h4>
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
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
                              <span className="text-warning">
                                {article.telemetry.totalPurged} trackers flagged
                              </span>
                            </>
                          )}
                        </div>

                        {article.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Pill & Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                      {article.status === "ready" && (
                        <span className="px-2.5 py-1 rounded-[4px] bg-surface-subtle text-muted-foreground text-[11px] border border-border/60">
                          Ready
                        </span>
                      )}

                      {article.status === "scrubbing" && (
                        <span className="px-2.5 py-1 rounded-[4px] bg-warning/10 text-warning border border-warning/20 flex items-center gap-1.5 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin text-warning" /> Scrubbing & Signing...
                        </span>
                      )}

                      {article.status === "publishing" && (
                        <span className="px-2.5 py-1 rounded-[4px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin text-primary" /> Pinning to IPFS...
                        </span>
                      )}

                      {article.status === "archived" && article.cid && (
                        <div className="flex items-center gap-2">
                          <CidChip cid={article.cid} truncate />
                          <Link
                            href={`/read/${article.cid}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-[4px] bg-surface-subtle hover:bg-surface-elevated border border-border/60 text-foreground text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Reader
                          </Link>
                        </div>
                      )}

                      {article.status === "error" && (
                        <span className="px-2.5 py-1 rounded-[4px] bg-red-500/10 text-red-300 border border-red-500/20 text-[11px]">
                          Failed: {article.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
