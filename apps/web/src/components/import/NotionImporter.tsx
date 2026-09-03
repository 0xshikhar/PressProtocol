"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Zap,
  Check,
  ExternalLink,
  Code2,
  Copy,
  AlertTriangle,
  RefreshCw,
  Eye,
  Key,
  Layers,
  Terminal,
  Shield,
  ShieldCheck,
  Flame,
  Globe,
  Quote,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrCreateBurnerWallet, type BurnerWallet } from "@/lib/burner-wallet";
import type { ConvertedNotionArticle, NotionBlockStats } from "@/lib/notion";

export function NotionImporter() {
  const [inputMode, setInputMode] = useState<"url" | "markdown">("url");
  const [notionUrl, setNotionUrl] = useState("");
  const [pastedMarkdown, setPastedMarkdown] = useState("");
  const [tags, setTags] = useState("notion, research, sovereign-doc");
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [convertedArticle, setConvertedArticle] = useState<ConvertedNotionArticle | null>(null);
  const [publishedCid, setPublishedCid] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string | null>(null);

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    getOrCreateBurnerWallet().then(setBurnerWallet).catch(console.error);
  }, []);

  const samplePresets = [
    {
      label: "DAO Research Proposal",
      markdown: `# Decentralized Capital Allocation Protocol
A quantitative framework for autonomous treasury syndication and quad-curve voting.

> 💡 This specification details the cryptographic verification pipeline and off-chain storage topology.

## Executive Summary
Decentralized autonomous organizations require verifiable publication rails that cannot be censored by centralized domain registrars.

> "A protocol that relies on DNS has an existential architectural single point of failure."
> — Protocol Security Council

### Key Architecture Components
- **Volatile Ed25519 Signing**: In-memory ephemeral key derivation
- **Content-Addressed Storage**: SHA-256 multihashes and IPFS CIDv1
- **Multi-Transport Routing**: Tor v3 onion failovers

\`\`\`typescript
interface SovereignProposal {
  id: string;
  cid: string;
  authorPublicKey: string;
  signature: string;
}
\`\`\`

> ⚠️ All proposals must be signed prior to IPFS broadcast.`,
    },
    {
      label: "Security Threat Model",
      markdown: `# Zero-Trust Threat Model for Anonymous Whistleblowers
Threat vector analysis for distributed intelligence dissemination under hostile state surveillance.

> 🚨 Critical Disclosure: Ensure this document is archived via Tor gateway to prevent IP traffic analysis.

## Adversary Capabilities
State actors and corporate cartels command deep-packet inspection (DPI) and subpoena powers over commercial hosting providers.

- [x] Ephemeral client-side Ed25519 key derivation
- [x] Zero-knowledge credential verification
- [ ] Multi-hop garlic routing integration

### Cryptographic Invariants
\`\`\`bash
# Independent local verification without web dependencies
curl -s https://pressprotocol.com/api/content/$CID | pressprotocol resolve --verify
\`\`\`

---
*Published autonomously on PressProtocol.*`,
    },
  ];

  // Process Notion conversion (Dry run preview)
  const handleConvert = async (autoPublish: boolean = false) => {
    setError(null);
    if (inputMode === "url" && !notionUrl.trim()) {
      setError("Please enter a public Notion page URL.");
      return;
    }
    if (inputMode === "markdown" && !pastedMarkdown.trim()) {
      setError("Please paste Notion Markdown or exported text.");
      return;
    }

    if (autoPublish) {
      setPublishing(true);
    } else {
      setLoading(true);
    }

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: any = {
        tags: tagList,
        autoPublish,
        privateKey: customKey.trim() || burnerWallet?.privateKey || undefined,
      };

      if (inputMode === "url") {
        payload.url = notionUrl.trim();
      } else {
        payload.rawMarkdown = pastedMarkdown.trim();
      }

      const res = await fetch("/api/import/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process Notion document.");
      }

      setConvertedArticle(data.article);

      if (data.published) {
        setPublishedCid(data.cid);
        setShareUrl(data.shareUrl);
        setEmbedCode(data.embedCode);
      }
    } catch (err: any) {
      setError(err.message || "Failed to convert Notion page.");
    } finally {
      setLoading(false);
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Importer Config Card */}
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center justify-between text-card-foreground">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Notion 1-Click Sovereign Importer
            </span>
            <span className="text-xs font-mono text-muted-foreground font-normal">
              Zero-Token · Callout Preservation · Ed25519 Signed
            </span>
          </CardTitle>
          <CardDescription>
            Convert any public Notion page or pasted Markdown export into a censorship-resistant sovereign publication. Notion Callouts, Quotes, Headings, and Code blocks are transformed into semantic HTML5 and mirrored across IPFS & Tor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex rounded-lg border p-1 bg-muted w-full sm:w-auto self-start inline-flex">
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                inputMode === "url"
                  ? "bg-background text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Public Notion Page URL
            </button>
            <button
              type="button"
              onClick={() => setInputMode("markdown")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                inputMode === "markdown"
                  ? "bg-background text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Paste Notion Markdown / Export
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono">Sample Notion templates:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMode("markdown");
                  setPastedMarkdown(preset.markdown);
                }}
                className="px-2.5 py-1 rounded border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-mono text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Input field based on mode */}
          {inputMode === "url" ? (
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Public Notion Page Link</span>
                <span className="text-muted-foreground/70 font-normal">Page must have &quot;Share to Web&quot; enabled</span>
              </label>
              <Input
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                placeholder="https://workspace.notion.site/My-Essay-3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d"
                className="bg-background border-input text-foreground font-mono text-sm h-12"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Paste Notion Markdown or Exported Text
              </label>
              <textarea
                value={pastedMarkdown}
                onChange={(e) => setPastedMarkdown(e.target.value)}
                rows={8}
                placeholder="# Notion Page Title&#10;&#10;> 💡 Callout paragraph...&#10;&#10;Regular paragraphs and research content..."
                className="w-full rounded-lg bg-background border border-input p-3.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Syndication Tags */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Sovereign DHT Syndication Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="notion, research, sovereign-doc"
              className="bg-background border-input text-foreground text-sm h-10"
            />
          </div>

          {/* Sovereign Identity Badge & Custom Key */}
          <div className="pt-2 border-t space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-muted-foreground">Signing Identity:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
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
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Notion Import Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => handleConvert(true)}
              disabled={loading || publishing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 h-11 gap-2 shadow-sm"
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Signing & Broadcasting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" /> 1-Click Convert & Syndicate to IPFS
                </>
              )}
            </Button>

            <Button
              onClick={() => handleConvert(false)}
              disabled={loading || publishing}
              variant="outline"
              className="h-11 gap-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Parsing Notion Blocks...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Preview Converted Article
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publication Confirmed Card */}
      {publishedCid && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  <Check className="w-3.5 h-3.5" /> NOTION PAGE SYNDICATED PERMANENTLY
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mt-1">
                  {convertedArticle?.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/read/${publishedCid}`} target="_blank">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Open Sovereign Reader
                  </Button>
                </Link>
                <Link href={`/embed/${publishedCid}?theme=light`} target="_blank">
                  <Button size="sm" variant="outline" className="text-xs gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> View Embed
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-background border">
                <span className="text-muted-foreground">IPFS CID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary truncate max-w-[200px]">{publishedCid}</span>
                  <button
                    onClick={() => copyToClipboard(publishedCid!, setCopiedCid)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-background border">
                <span className="text-muted-foreground">Reader Link:</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate max-w-[200px]">{shareUrl}</span>
                  <button
                    onClick={() => copyToClipboard(shareUrl!, setCopiedShare)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Converted Article Preview */}
      {convertedArticle && (
        <div className="space-y-6">
          {/* Block Conversion Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs space-y-1">
              <span className="text-muted-foreground block text-[10px]">CALLOUTS CONVERTED</span>
              <span className="text-lg font-bold text-primary">{convertedArticle.stats.calloutsConverted}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs space-y-1">
              <span className="text-muted-foreground block text-[10px]">HEADINGS MAPPED</span>
              <span className="text-lg font-bold text-emerald-600">{convertedArticle.stats.headingsConverted}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs space-y-1">
              <span className="text-muted-foreground block text-[10px]">QUOTES CONVERTED</span>
              <span className="text-lg font-bold text-amber-600">{convertedArticle.stats.quotesConverted}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs space-y-1">
              <span className="text-muted-foreground block text-[10px]">CODE BLOCKS</span>
              <span className="text-lg font-bold text-purple-600">{convertedArticle.stats.codeBlocksConverted}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs space-y-1">
              <span className="text-muted-foreground block text-[10px]">TOTAL WORDS</span>
              <span className="text-lg font-bold text-foreground">{convertedArticle.wordCount}</span>
            </div>
          </div>

          {/* Prose Preview Card */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Notion Source: {convertedArticle.title}</span>
                <span>~{convertedArticle.readingTimeMinutes} min read</span>
              </div>
              <CardTitle className="text-2xl font-serif text-card-foreground pt-2 flex items-center gap-2">
                {convertedArticle.icon && <span>{convertedArticle.icon}</span>}
                <span>{convertedArticle.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10">
              <div
                className="prose prose-neutral max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-a:text-primary prose-code:text-primary"
                dangerouslySetInnerHTML={{ __html: convertedArticle.cleanHtml }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
