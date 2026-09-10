"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  Radio,
  FileText,
  AlertTriangle,
  Download,
  Flame,
  Zap,
  RefreshCw,
  Eye,
  Key,
  Rss,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkRssImporter } from "@/components/import/BulkRssImporter";
import { NotionImporter } from "@/components/import/NotionImporter";
import { CidChip } from "@/components/protocol/CidChip";

interface PurgeTelemetry {
  scriptsPurged: number;
  trackingPixelsPurged: number;
  trackingParamsPurged: number;
  inlineHandlersPurged: number;
  surveillanceElementsPurged: number;
  totalPurged: number;
  originalByteSize: number;
  cleanedByteSize: number;
  reductionPercentage: number;
  wordCount: number;
  readingTimeMinutes: number;
  purgedTrackersList: string[];
}

interface ImportResult {
  success: boolean;
  published: boolean;
  cid?: string;
  shareUrl?: string;
  embedUrl?: string;
  embedCode?: string;
  article: {
    title: string;
    author?: string;
    excerpt?: string;
    canonicalUrl?: string;
    tags?: string[];
    cleanHtml: string;
  };
  telemetry: PurgeTelemetry;
}

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("syndicated, sovereign, privacy");
  const [privateKey, setPrivateKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  // Embed Customizer State
  const [embedTheme, setEmbedTheme] = useState<"cyber" | "dark" | "light">("cyber");
  const [embedCompact, setEmbedCompact] = useState(false);

  const samplePresets = [
    {
      label: "Substack Article",
      url: "https://vitalik.eth.limo/general/2021/12/06/endgame.html",
      tags: "ethereum, scalability, decentralization",
    },
    {
      label: "Privacy Manifesto (Feed)",
      url: "https://blog.torproject.org/feed.xml",
      tags: "tor, censorship, privacy",
    },
    {
      label: "Tech Sovereignty Post",
      url: "https://timdaub.github.io/index.xml",
      tags: "sovereignty, open-source, web3",
    },
  ];

  const handleImport = async (autoPublish: boolean) => {
    if (!url.trim()) {
      setError("Please enter a valid URL or RSS feed to import.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/import/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          tags: tagList,
          privateKey: privateKey.trim() || undefined,
          autoPublish,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process import");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while importing.");
    } finally {
      setLoading(false);
    }
  };

  const getCustomEmbedCode = (cid: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://pressprotocol.com";
    const compactParam = embedCompact ? "&compact=true" : "";
    return `<iframe src="${origin}/embed/${cid}?theme=${embedTheme}${compactParam}" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Banner */}
        <div className="relative rounded-[6px] border border-border/60 bg-surface p-6 sm:p-8 overflow-hidden shadow-sm">
          {/* Hairline Horizon Accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-primary/20 bg-primary/10 text-primary font-mono text-[11px] tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span>Surveillance-Free Syndication Engine</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-hero font-normal tracking-tight text-foreground">
              Import Substack, Medium & Ghost in 1-Click
            </h1>
            
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-2xl">
              Strip tracking pixels, surveillance scripts, and ad beacons. Canonicalize, sign with an Ed25519 sovereign key, and publish permanently across IPFS and Tor v3 onion services.
            </p>
          </div>
        </div>

        {/* Top-Level Mode Selector */}
        <Tabs defaultValue="bulk" className="space-y-8">
          <TabsList className="bg-surface-subtle border border-border/60 p-1.5 rounded-[6px] w-full sm:w-auto grid grid-cols-1 sm:grid-cols-3 gap-1.5 h-auto">
            <TabsTrigger
              value="bulk"
              className="rounded-[4px] py-2.5 px-3 text-xs font-medium text-muted-foreground data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border/70 gap-2 transition-all justify-center"
            >
              <Rss className="w-3.5 h-3.5 text-primary" /> Bulk RSS Archiver
            </TabsTrigger>
            <TabsTrigger
              value="notion"
              className="rounded-[4px] py-2.5 px-3 text-xs font-medium text-muted-foreground data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border/70 gap-2 transition-all justify-center"
            >
              <Layers className="w-3.5 h-3.5 text-primary" /> Notion Importer
            </TabsTrigger>
            <TabsTrigger
              value="single"
              className="rounded-[4px] py-2.5 px-3 text-xs font-medium text-muted-foreground data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border/70 gap-2 transition-all justify-center"
            >
              <Radio className="w-3.5 h-3.5 text-primary" /> Single Article Scrubber
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BULK PUBLICATION ARCHIVER */}
          <TabsContent value="bulk">
            <BulkRssImporter />
          </TabsContent>

          {/* TAB 2: NOTION IMPORTER */}
          <TabsContent value="notion">
            <NotionImporter />
          </TabsContent>

          {/* TAB 3: SINGLE ARTICLE / VISUAL SCRUBBER */}
          <TabsContent value="single" className="space-y-8">
            {/* Input Studio Card */}
            <Card elevation="card" className="border-border/60 bg-surface">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-sans font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-foreground">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-primary" /> Syndicate Single Article
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground font-normal">
                    Substack &bull; Medium &bull; Ghost &bull; RSS 2.0 &bull; Web
                  </span>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Provide any public post URL or RSS feed. The sovereign engine will purge spyware and preserve semantic typography.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Sample Presets */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-mono text-[11px]">Quick test presets:</span>
                  {samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUrl(preset.url);
                        setTags(preset.tags);
                      }}
                      className="px-2.5 py-1 rounded-[4px] border border-border/60 bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors font-mono text-[11px]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Article URL or RSS Feed
                  </label>
                  <div className="relative">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://author.substack.com/p/essay-title or https://blog.com/feed.xml"
                      className="bg-surface-subtle border-border/60 text-foreground placeholder:text-muted-foreground font-mono text-xs sm:text-sm h-12 pr-10 rounded-[6px] focus-visible:ring-primary/30 focus-visible:border-primary"
                    />
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Sovereign DHT Syndication Tags (comma-separated)
                  </label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="privacy, censorship-resistance, web3"
                    className="bg-surface-subtle border-border/60 text-foreground placeholder:text-muted-foreground text-sm h-10 rounded-[6px] focus-visible:ring-primary/30 focus-visible:border-primary"
                  />
                </div>

                {/* Advanced Sovereign Key Toggle */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-primary" />
                    <span>{showKeyInput ? "Hide" : "Use custom"} Ed25519 Sovereign Private Key (Optional)</span>
                  </button>

                  {showKeyInput && (
                    <div className="space-y-1.5 pt-2">
                      <Input
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        type="password"
                        placeholder="64-character hex Ed25519 private key (leave empty to generate an ephemeral sovereign key)"
                        className="bg-surface-subtle border-border/60 text-foreground font-mono text-xs h-10 rounded-[6px] focus-visible:ring-primary/30"
                      />
                      <p className="text-[11px] text-muted-foreground font-mono">
                        If left blank, an ephemeral burner keypair will be generated in-memory and signed cryptographically.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-[6px] bg-red-950/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5 text-red-200">Syndication Error</strong>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={() => handleImport(true)}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 h-11 gap-2 shadow-sm rounded-[6px] text-xs"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Purging Surveillance & Publishing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" /> Sanitize & Syndicate to Sovereign Web
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleImport(false)}
                    disabled={loading}
                    variant="outline"
                    className="h-11 gap-2 text-xs border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground rounded-[6px]"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" /> Dry-Run Surveillance Audit Only
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results & Telemetry View */}
            {result && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Live Tracker Purge Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px]">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-mono">TRACKERS PURGED</span>
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-red-400">
                        {result.telemetry.trackingPixelsPurged + result.telemetry.surveillanceElementsPurged}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Pixels & surveillance frames removed</p>
                    </CardContent>
                  </Card>

                  <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px]">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-mono">Scripts stripped</span>
                        <Terminal className="w-4 h-4 text-warning" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-warning">
                        {result.telemetry.scriptsPurged}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Zero executable JS left behind</p>
                    </CardContent>
                  </Card>

                  <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px]">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-mono">UTM params purged</span>
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-foreground">
                        {result.telemetry.trackingParamsPurged}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Sanitized hyperlinks & media</p>
                    </CardContent>
                  </Card>

                  <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px]">
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-mono">Data reduction</span>
                        <ShieldCheck className="w-4 h-4 text-verified" />
                      </div>
                      <div className="text-2xl font-bold font-mono text-verified">
                        {result.telemetry.reductionPercentage}%
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {Math.round((result.telemetry.originalByteSize - result.telemetry.cleanedByteSize) / 1024)} KB payload saved
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Specific Purged Surveillance Items Drawer */}
                {result.telemetry.purgedTrackersList && result.telemetry.purgedTrackersList.length > 0 && (
                  <div className="p-4 rounded-[6px] border border-error/30 bg-error/5 space-y-2">
                    <div className="text-xs font-mono text-error font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Purged surveillance vectors (audit log):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.telemetry.purgedTrackersList.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[4px] bg-error-tint border border-error/30 text-[11px] font-mono text-error"
                        >
                          ✕ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publication Success Details Banner */}
                {result.published && result.cid && (
                  <div className="p-6 rounded-[6px] border border-verified/30 bg-surface space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-xs font-mono bg-verified-tint text-verified border border-verified/30 font-semibold">
                          <Check className="w-3.5 h-3.5 text-verified" /> Syndication confirmed
                        </span>
                        <h3 className="text-lg font-sans font-bold text-foreground mt-1">
                          {result.article.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/read/${result.cid}`} target="_blank">
                          <Button size="sm" className="bg-accent-primary hover:bg-accent-hover text-primary text-xs font-semibold gap-1.5 rounded-[4px]">
                            <ExternalLink className="w-3.5 h-3.5" /> Open Reader View
                          </Button>
                        </Link>
                        <Link href={`/embed/${result.cid}?theme=dark`} target="_blank">
                          <Button size="sm" variant="outline" className="border-hairline bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs gap-1.5 rounded-[4px]">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Direct Embed
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                      <div className="flex items-center justify-between p-3 rounded-[6px] bg-surface-subtle border border-hairline">
                        <span className="text-muted-foreground text-xs">IPFS Content Identifier:</span>
                        <CidChip cid={result.cid} showExplorerLink />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-[6px] bg-surface-subtle border border-hairline">
                        <span className="text-muted-foreground text-xs">Share Gateway:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate max-w-[200px]">{result.shareUrl}</span>
                          <button
                            onClick={() => copyToClipboard(result.shareUrl!, setCopiedShare)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedShare ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Tabs: Cleaned Preview vs. Sovereign Embed Generator */}
                <Tabs defaultValue={result.published ? "embed" : "preview"} className="space-y-4">
                  <TabsList className="bg-surface-subtle border border-border/60 p-1 text-muted-foreground rounded-[6px]">
                    <TabsTrigger value="preview" className="text-xs gap-1.5 data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70 rounded-[4px]">
                      <FileText className="w-3.5 h-3.5" /> Cleaned Prose Preview
                    </TabsTrigger>
                    {result.cid && (
                      <TabsTrigger value="embed" className="text-xs gap-1.5 data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70 rounded-[4px]">
                        <Code2 className="w-3.5 h-3.5 text-primary" /> Sovereign Embed Generator
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* Cleaned Prose Tab */}
                  <TabsContent value="preview">
                    <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px] shadow-sm">
                      <CardHeader className="border-b border-border/60">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                          <span>Author: {result.article.author || "Sovereign Author"}</span>
                          <span>{result.telemetry.wordCount} words · ~{result.telemetry.readingTimeMinutes} min read</span>
                        </div>
                        <CardTitle className="text-2xl font-serif text-foreground pt-1">
                          {result.article.title}
                        </CardTitle>
                        {result.article.tags && result.article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {result.article.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] border-border/60 text-muted-foreground font-mono">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6 sm:p-10">
                        <div
                          className="prose prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-primary prose-code:text-foreground prose-img:rounded-[6px]"
                          dangerouslySetInnerHTML={{ __html: result.article.cleanHtml }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sovereign Embed Generator Tab */}
                  {result.cid && (
                    <TabsContent value="embed" className="space-y-6">
                      <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px] shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-sans font-semibold text-foreground flex items-center justify-between">
                            <span>Universal Iframe Embed Code</span>
                            <span className="text-xs font-mono text-verified">
                              CSP frame-ancestors * Compliant
                            </span>
                          </CardTitle>
                          <CardDescription className="text-muted-foreground text-xs">
                            Paste this lightweight iframe code into any WordPress, Ghost, Substack, Webflow, or static website.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Embed Customizers */}
                          <div className="flex flex-wrap items-center gap-6 p-4 rounded-[6px] bg-surface-subtle border border-hairline text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">Theme:</span>
                              <div className="flex rounded-[4px] border border-hairline p-0.5 bg-surface">
                                {(["light", "dark", "cyber"] as const).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setEmbedTheme(t)}
                                    className={`px-2.5 py-1 rounded-[4px] text-xs capitalize transition-colors ${
                                      embedTheme === t
                                        ? "bg-overlay text-primary border border-border-focus font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                                <input
                                  type="checkbox"
                                  checked={embedCompact}
                                  onChange={(e) => setEmbedCompact(e.target.checked)}
                                  className="rounded-[4px] border-border bg-surface accent-primary"
                                />
                                <span className="text-xs text-foreground/90">Compact Mode (?compact=true)</span>
                              </label>
                            </div>
                          </div>

                          {/* Embed Snippet Box */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                              <span>HTML Embed Code:</span>
                              <button
                                onClick={() => copyToClipboard(getCustomEmbedCode(result.cid!), setCopiedEmbed)}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                {copiedEmbed ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-verified" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" /> Copy Code
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="relative">
                              <textarea
                                readOnly
                                value={getCustomEmbedCode(result.cid!)}
                                rows={3}
                                className="w-full rounded-[6px] bg-surface-subtle border border-border/60 p-3 font-mono text-xs text-foreground select-all focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                          {/* Live Embed Preview */}
                          <div className="space-y-2">
                            <div className="text-xs font-mono text-muted-foreground">
                              Live Interactive Reader Preview:
                            </div>
                            <div className="rounded-[6px] border border-border/60 overflow-hidden bg-black shadow-sm">
                              <iframe
                                src={`/embed/${result.cid}?theme=${embedTheme}${embedCompact ? "&compact=true" : ""}`}
                                className="w-full h-[520px] border-0"
                                title="Sovereign Embed Live Preview"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CMS Integrations Bridge Grid (Ghost & WordPress) */}
        <div className="grid md:grid-cols-2 gap-6 pt-6">
          {/* Ghost CMS Automated Webhook Card */}
          <Card elevation="card" className="border-hairline bg-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-warning font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Automated syndication
                </span>
                <Badge variant="outline" className="border-warning/30 bg-warning-tint text-warning font-mono text-[10px]">
                  Ghost webhook
                </Badge>
              </div>
              <CardTitle className="text-lg font-sans font-semibold text-foreground">
                Ghost CMS Publication Webhook
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Connect your Ghost blog to automatically syndicate every published article to PressProtocol with HMAC-SHA256 verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-[6px] bg-surface-subtle border border-hairline space-y-2">
                <span className="text-muted-foreground block">Target URL:</span>
                <code className="text-primary break-all select-all font-semibold">
                  https://pressprotocol.com/api/webhooks/ghost
                </code>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <p>1. In Ghost Admin, go to <strong>Settings → Integrations → Add Custom Integration</strong>.</p>
                <p>2. Add Webhook for event <strong>&quot;Post published&quot;</strong>.</p>
                <p>3. Set Target URL to the endpoint above and set secret to your <code>GHOST_WEBHOOK_SECRET</code>.</p>
              </div>
            </CardContent>
          </Card>

          {/* WordPress Super-Plugin Card */}
          <Card elevation="card" className="border-hairline bg-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Native CMS plugin
                </span>
                <Badge variant="outline" className="border-hairline text-muted-foreground font-mono text-[10px]">
                  WP plugin v1.1
                </Badge>
              </div>
              <CardTitle className="text-lg font-sans font-semibold text-foreground">
                WordPress Sovereign Super-Plugin
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Publish directly from the WordPress editor. Automatically pins to IPFS, creates Tor v3 hidden services, and generates embed codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-hairline text-xs font-mono">
                <div>
                  <div className="text-foreground font-semibold">press-protocol-wordpress.zip</div>
                  <div className="text-[11px] text-muted-foreground">Official WordPress Super-Plugin Bundle</div>
                </div>
                <a href="/downloads/press-protocol-wordpress.zip" download>
                  <Button size="sm" variant="outline" className="border-hairline hover:bg-surface-elevated text-foreground text-xs font-semibold gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download ZIP
                  </Button>
                </a>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <p>• Built-in 1-click &quot;Publish to PressProtocol&quot; meta box in post editor.</p>
                <p>• Automatic sovereign verification badge appended to published single posts.</p>
                <p>• Live mirror health monitoring across IPFS, Tor, and public web gateways.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
