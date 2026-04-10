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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                <span className="text-cyan-400 font-mono text-xs font-bold">¶</span>
              </div>
              <span className="font-serif tracking-tight text-lg text-white font-bold">
                PressProtocol
              </span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Universal CMS Importer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/read/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
                Explorer
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-white/10 text-zinc-300 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Exit to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SURVEILLANCE-FREE SYNDICATION</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Import Substack, Medium & Ghost in 1-Click
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Strip tracking pixels, Facebook/Google ad beacons, and surveillance tags from any article.
              Canonicalize, sign with an Ed25519 sovereign key, and publish permanently across IPFS and Tor v3 onion services.
            </p>
          </div>
        </div>

        {/* Input Studio Card */}
        <Card className="border-white/10 bg-zinc-950/80 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Syndicate Publication
              </span>
              <span className="text-xs font-mono text-zinc-500 font-normal">
                Supports Substack · Medium · Ghost · RSS 2.0 · Atom · Web
              </span>
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Provide any public post URL or RSS feed. The sovereign engine will purge spyware and preserve semantic typography.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 font-mono">Quick test presets:</span>
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(preset.url);
                    setTags(preset.tags);
                  }}
                  className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 text-zinc-300 transition-colors font-mono text-[11px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Article URL or RSS Feed
              </label>
              <div className="relative">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://author.substack.com/p/essay-title or https://blog.com/feed.xml"
                  className="bg-black/60 border-white/15 text-white placeholder:text-zinc-600 font-mono text-sm h-12 pr-10 focus-visible:ring-cyan-500"
                />
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Sovereign DHT Syndication Tags (comma-separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="privacy, censorship-resistance, web3"
                className="bg-black/60 border-white/15 text-white placeholder:text-zinc-600 text-sm h-10 focus-visible:ring-cyan-500"
              />
            </div>

            {/* Advanced Sovereign Key Toggle */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showKeyInput ? "Hide" : "Use custom"} Ed25519 Sovereign Private Key (Optional)</span>
              </button>

              {showKeyInput && (
                <div className="space-y-1.5 pt-2">
                  <Input
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    type="password"
                    placeholder="64-character hex Ed25519 private key (leave empty to generate an ephemeral sovereign key)"
                    className="bg-black/60 border-white/15 text-white font-mono text-xs h-10 focus-visible:ring-cyan-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    If left blank, an ephemeral burner keypair will be generated in-memory and signed cryptographically.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Syndication Error</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => handleImport(true)}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 h-11 gap-2 shadow-lg shadow-cyan-500/20"
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
                className="border-white/15 hover:bg-white/5 text-zinc-300 h-11 gap-2 text-xs"
              >
                <Eye className="w-4 h-4" /> Dry-Run Surveillance Audit Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results & Telemetry View */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Live Tracker Purge Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-red-500/20 bg-red-950/10 backdrop-blur-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-mono">TRACKERS PURGED</span>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-red-400">
                    {result.telemetry.trackingPixelsPurged + result.telemetry.surveillanceElementsPurged}
                  </div>
                  <p className="text-[11px] text-zinc-500">Pixels & surveillance frames removed</p>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-amber-950/10 backdrop-blur-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-mono">SCRIPTS STRIPPED</span>
                    <Terminal className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {result.telemetry.scriptsPurged}
                  </div>
                  <p className="text-[11px] text-zinc-500">Zero executable JS left behind</p>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-cyan-950/10 backdrop-blur-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-mono">UTM PARAMS PURGED</span>
                    <Flame className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {result.telemetry.trackingParamsPurged}
                  </div>
                  <p className="text-[11px] text-zinc-500">Sanitized hyperlinks & media</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 bg-emerald-950/10 backdrop-blur-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-mono">DATA REDUCTION</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {result.telemetry.reductionPercentage}%
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {Math.round((result.telemetry.originalByteSize - result.telemetry.cleanedByteSize) / 1024)} KB payload saved
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Specific Purged Surveillance Items Drawer */}
            {result.telemetry.purgedTrackersList && result.telemetry.purgedTrackersList.length > 0 && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 space-y-2">
                <div className="text-xs font-mono text-red-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> PURGED SURVEILLANCE VECTORS (AUDIT LOG):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.telemetry.purgedTrackersList.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-300"
                    >
                      ✕ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publication Success Details Banner */}
            {result.published && result.cid && (
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> DECENTRALIZED SYNDICATION CONFIRMED
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white mt-1">
                      {result.article.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/read/${result.cid}`} target="_blank">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Open Reader View
                      </Button>
                    </Link>
                    <Link href={`/embed/${result.cid}?theme=cyber`} target="_blank">
                      <Button size="sm" variant="outline" className="border-white/20 text-xs text-zinc-300 gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Direct Embed
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded bg-black/50 border border-white/5">
                    <span className="text-zinc-500">IPFS CID:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 truncate max-w-[200px]">{result.cid}</span>
                      <button
                        onClick={() => copyToClipboard(result.cid!, setCopiedCid)}
                        className="text-zinc-400 hover:text-white"
                      >
                        {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-black/50 border border-white/5">
                    <span className="text-zinc-500">Share URL:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300 truncate max-w-[200px]">{result.shareUrl}</span>
                      <button
                        onClick={() => copyToClipboard(result.shareUrl!, setCopiedShare)}
                        className="text-zinc-400 hover:text-white"
                      >
                        {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Tabs: Cleaned Preview vs. Sovereign Embed Generator */}
            <Tabs defaultValue={result.published ? "embed" : "preview"} className="space-y-4">
              <TabsList className="bg-zinc-900 border border-white/10 p-1">
                <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-800 text-xs gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Cleaned Prose Preview
                </TabsTrigger>
                {result.cid && (
                  <TabsTrigger value="embed" className="data-[state=active]:bg-zinc-800 text-xs gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Sovereign Embed Generator
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Cleaned Prose Tab */}
              <TabsContent value="preview">
                <Card className="border-white/10 bg-zinc-950">
                  <CardHeader className="border-b border-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-500">
                      <span>Author: {result.article.author || "Sovereign Author"}</span>
                      <span>{result.telemetry.wordCount} words · ~{result.telemetry.readingTimeMinutes} min read</span>
                    </div>
                    <CardTitle className="text-2xl font-serif text-white pt-1">
                      {result.article.title}
                    </CardTitle>
                    {result.article.tags && result.article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {result.article.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 sm:p-10">
                    <div
                      className="prose prose-invert max-w-none prose-headings:font-serif prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-cyan-400 prose-blockquote:border-cyan-500 prose-blockquote:text-zinc-400 prose-code:text-cyan-300 prose-img:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: result.article.cleanHtml }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sovereign Embed Generator Tab */}
              {result.cid && (
                <TabsContent value="embed" className="space-y-6">
                  <Card className="border-white/10 bg-zinc-950">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-white flex items-center justify-between">
                        <span>Universal Iframe Embed Code</span>
                        <span className="text-xs font-mono text-emerald-400">
                          CSP frame-ancestors * Compliant
                        </span>
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Paste this lightweight iframe code into any WordPress, Ghost, Substack, Webflow, or static website.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Embed Customizers */}
                      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-black/50 border border-white/5 text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400">Theme:</span>
                          <div className="flex rounded-lg border border-white/10 p-0.5 bg-black">
                            {(["cyber", "dark", "light"] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setEmbedTheme(t)}
                                className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                                  embedTheme === t
                                    ? "bg-cyan-500 text-black font-semibold"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                            <input
                              type="checkbox"
                              checked={embedCompact}
                              onChange={(e) => setEmbedCompact(e.target.checked)}
                              className="rounded border-white/20 bg-black text-cyan-500 focus:ring-cyan-500"
                            />
                            <span>Compact Mode (?compact=true)</span>
                          </label>
                        </div>
                      </div>

                      {/* Embed Snippet Box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                          <span>HTML Embed Code:</span>
                          <button
                            onClick={() => copyToClipboard(getCustomEmbedCode(result.cid!), setCopiedEmbed)}
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            {copiedEmbed ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
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
                            className="w-full rounded-lg bg-black border border-white/10 p-3 font-mono text-xs text-zinc-300 select-all focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Live Embed Preview */}
                      <div className="space-y-2">
                        <div className="text-xs font-mono text-zinc-400">
                          Live Interactive Reader Preview:
                        </div>
                        <div className="rounded-xl border border-white/10 overflow-hidden bg-black shadow-2xl">
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

        {/* CMS Integrations Bridge Grid (Ghost & WordPress) */}
        <div className="grid md:grid-cols-2 gap-6 pt-6">
          {/* Ghost CMS Automated Webhook Card */}
          <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> AUTOMATED SYNDICATION
                </span>
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 font-mono text-[10px]">
                  GHOST WEBHOOK
                </Badge>
              </div>
              <CardTitle className="text-lg font-serif text-white">
                Ghost CMS Publication Webhook
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs leading-relaxed">
                Connect your Ghost blog to automatically syndicate every published article to PressProtocol with HMAC-SHA256 verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-2">
                <span className="text-zinc-500 block">Target URL:</span>
                <code className="text-cyan-400 break-all select-all">
                  https://pressprotocol.com/api/webhooks/ghost
                </code>
              </div>

              <div className="space-y-1.5 text-zinc-400 text-[11px] leading-relaxed">
                <p>1. In Ghost Admin, go to <strong>Settings → Integrations → Add Custom Integration</strong>.</p>
                <p>2. Add Webhook for event <strong>&quot;Post published&quot;</strong>.</p>
                <p>3. Set Target URL to the endpoint above and set secret to your <code>GHOST_WEBHOOK_SECRET</code>.</p>
              </div>
            </CardContent>
          </Card>

          {/* WordPress Super-Plugin Card */}
          <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> NATIVE CMS PLUGIN
                </span>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                  WP PLUGIN v1.1
                </Badge>
              </div>
              <CardTitle className="text-lg font-serif text-white">
                WordPress Sovereign Super-Plugin
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs leading-relaxed">
                Publish directly from the WordPress editor. Automatically pins to IPFS, creates Tor v3 hidden services, and generates embed codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/60 border border-white/5 text-xs font-mono">
                <div>
                  <div className="text-white font-semibold">press-protocol-wordpress.zip</div>
                  <div className="text-[11px] text-zinc-500">Official WordPress Super-Plugin Bundle</div>
                </div>
                <a href="/downloads/press-protocol-wordpress.zip" download>
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download ZIP
                  </Button>
                </a>
              </div>

              <div className="space-y-1.5 text-zinc-400 text-[11px] leading-relaxed">
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
