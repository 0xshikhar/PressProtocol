"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Download, Shield, Clock, BookOpen, ShieldCheck, ShieldAlert, Loader2, FileCheck, Archive, Moon, Sun, Coffee, ArrowRight } from "lucide-react";
import { apiClient, type ResolveContentResponse } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateReadingTime } from "@/lib/reading-time";
import { ReadingProgressBar } from "@/components/reader/ReadingProgressBar";
import { TableOfContents } from "@/components/reader/TableOfContents";
import { BookmarkButton } from "@/components/reader/BookmarkButton";
import { EmbedDialog } from "@/components/reader/EmbedDialog";
import { TorShareSection } from "@/components/tor/TorShareSection";
import { Separator } from "@/components/ui/separator";
import { verifyArticleSignature, type VerificationResult } from "@/lib/signature-verifier";
import { exportPressProof, downloadPressProofFile } from "@pressprotocol/proof";
import { CidChip } from "@/components/protocol/CidChip";
import { SignatureBadge } from "@/components/protocol/SignatureBadge";
import { MirrorHealthDot } from "@/components/protocol/MirrorHealthDot";
import {
  getOfflineArticle,
  saveArticleOffline,
  classifySourceRail,
} from "@/lib/offline-storage";
import {
  ReaderTypographyDrawer,
  useReaderSettings,
} from "@/components/reader/ReaderTypographyDrawer";
import { CryptographicProvenanceModal } from "@/components/reader/CryptographicProvenanceModal";
import { QuoteSharePill } from "@/components/reader/QuoteSharePill";

export default function ReadPage() {
  const params = useParams();
  const cid = params.cid as string;
  const [content, setContent] = useState<ResolveContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const { settings: readerSettings, updateSettings: setReaderSettings } = useReaderSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const readingStats = content?.content ? calculateReadingTime(content.content) : calculateReadingTime("");

  const handleExportProof = () => {
    if (!content) return;
    try {
      const proof = exportPressProof({
        cid: content.cid,
        title: content.title,
        content: content.content,
        tags: content.tags,
        timestamp: content.createdAt,
        publisher: {
          publicKey: content.publisher?.pubkey || "",
          signature: content.publisher?.signature || "unsigned",
          walletAddress: content.publisher?.walletAddress,
          username: content.publisher?.username,
        },
        mirrors: {
          ipfs: content.mirrors?.ipfs?.url || `ipfs://${content.cid}`,
          tor: content.mirrors?.tor?.url,
          gateway: content.mirrors?.gateway?.url,
        },
      });

      downloadPressProofFile(proof);
      toast.success("Downloaded offline cryptographic proof (.pressproof.json)");
    } catch (err: any) {
      toast.error(err.message || "Failed to export proof");
    }
  };

  const handleArchiveWayback = async () => {
    if (!content) return;
    setIsArchiving(true);
    try {
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid: content.cid }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.status === "saved"
            ? "Preserved on Wayback Machine!"
            : "Archival request queued on Wayback Machine!"
        );
        if (data.snapshotUrl) {
          window.open(data.snapshotUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        throw new Error(data.error || "Archival request failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not preserve to Wayback Machine");
    } finally {
      setIsArchiving(false);
    }
  };

  useEffect(() => {
    if (cid) {
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getContent(cid);
      
      setContent(data);
      setIsOfflineMode(false);

      // Cache article payload for zero-telemetry offline reading
      saveArticleOffline({
        cid: data.cid,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        author: data.publisher?.username || "Sovereign Author",
        publicKey: data.publisher?.pubkey,
        signature: data.publisher?.signature,
        walletAddress: data.publisher?.walletAddress,
        createdAt: data.createdAt,
        savedAt: Date.now(),
        mirrors: data.mirrors,
        wordCount: (data.content || "").split(/\s+/).filter(Boolean).length || 50,
        readingTimeMinutes: Math.max(1, Math.ceil(((data.content || "").split(/\s+/).filter(Boolean).length || 50) / 200)),
        sourceRail: classifySourceRail(data.tags || [], data.content),
        isVerified: !!(data.publisher?.pubkey && data.publisher?.signature && data.publisher?.signature !== "unsigned"),
      }).catch(() => {});

      // Perform authentic in-browser Ed25519 signature verification
      setIsVerifying(true);
      verifyArticleSignature(data)
        .then((res) => {
          setVerificationResult(res);
        })
        .catch((vErr) => {
          console.error("❌ [READ PAGE] Cryptographic verification failed:", vErr);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } catch (err) {
      console.warn("⚠️ Network fetch failed, checking local offline vault for CID:", cid);
      try {
        const offlineArticle = await getOfflineArticle(cid);
        if (offlineArticle) {
          console.log("⚡ [READ PAGE] Restored article from local offline storage:", cid);
          const fallbackData = {
            cid: offlineArticle.cid,
            title: offlineArticle.title,
            content: offlineArticle.content,
            tags: offlineArticle.tags,
            createdAt: offlineArticle.createdAt,
            publisher: {
              pubkey: offlineArticle.publicKey || "",
              signature: offlineArticle.signature || "",
              walletAddress: offlineArticle.walletAddress,
              username: offlineArticle.author,
            },
            mirrors: offlineArticle.mirrors || {
              ipfs: { url: `ipfs://${offlineArticle.cid}`, available: true },
            },
            recommended: "ipfs",
            views: 0,
            readingStats: {
              words: offlineArticle.wordCount,
              minutes: offlineArticle.readingTimeMinutes,
            },
          } as any;

          setContent(fallbackData);
          setIsOfflineMode(true);
          toast.info("Offline mode active: Viewing locally cached article snapshot");

          verifyArticleSignature(fallbackData)
            .then((res) => setVerificationResult(res))
            .catch(() => {});
          return;
        }
      } catch (offlineErr) {
        console.error("Offline fallback check failed:", offlineErr);
      }

      console.error("❌ [READ PAGE] Error loading content:", err);
      setError("Failed to load content. The content may not exist or is temporarily unavailable.");
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Content not found"}</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const getMirrorStatusColor = (available: boolean) => {
    return available ? "bg-green-500" : "bg-red-500";
  };

  const getThemeClass = () => {
    switch (readerSettings.theme) {
      case "sepia":
        return "bg-[#fbf7ee] text-[#2d2b28] selection:bg-[#ecdcc5]";
      case "paper":
        return "bg-[#ffffff] text-[#111827] selection:bg-neutral-200";
      case "cyber":
        return "bg-[#050d0a] text-[#a7f3d0] selection:bg-emerald-950";
      case "dark":
      default:
        return "bg-[#050508] text-[#f8fafc] selection:bg-cyan-500/30 selection:text-cyan-200";
    }
  };

  const getTypefaceClass = () => {
    switch (readerSettings.typeface) {
      case "sans":
        return "font-sans";
      case "editorial":
        return "font-editorial";
      case "mono":
        return "font-mono";
      case "charter":
      case "serif":
      default:
        return "font-charter";
    }
  };

  const isSepia = readerSettings.theme === "sepia";
  const isPaper = readerSettings.theme === "paper";
  const isLight = isSepia || isPaper;

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      {/* Table of Contents */}
      <TableOfContents contentRef={contentRef} />

      {/* Quote-to-Share Contextual Selection Pill */}
      <QuoteSharePill
        cid={cid}
        articleTitle={content.title}
        authorName={content.publisher?.username || (content.publisher?.pubkey ? `Anon-${content.publisher.pubkey.slice(0, 4)}` : undefined)}
        containerRef={contentRef}
      />
      
      <div className={`min-h-screen transition-colors duration-300 ${getThemeClass()}`}>
        {/* Intentional Reading Mode Switcher Bar (Kindle, Apple Books & Readwise Gold Standard) */}
        <div className={`sticky top-16 z-30 border-b backdrop-blur-xl transition-all duration-300 ${
          readerSettings.theme === 'sepia'
            ? 'bg-[#f4ece1]/90 border-amber-900/15 text-[#2d2b28] shadow-sm'
            : readerSettings.theme === 'paper'
            ? 'bg-white/95 border-neutral-200 text-neutral-900 shadow-sm'
            : readerSettings.theme === 'cyber'
            ? 'bg-[#051109]/90 border-emerald-900/30 text-emerald-300 shadow-lg'
            : 'bg-[#050508]/85 border-white/10 text-white shadow-lg'
        }`}>
          <div className="container mx-auto max-w-4xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            {/* Reading Mode Segmented Controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "dark" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  readerSettings.theme === "dark"
                    ? "bg-[#0b0d14] text-white shadow-sm border border-cyan-500/40 ring-1 ring-cyan-500/30 font-semibold"
                    : "text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100"
                }`}
                title="Onyx Dark (Sovereign Obsidian)"
              >
                <Moon className="h-3.5 w-3.5 text-cyan-400" />
                <span>Onyx Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "sepia" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  readerSettings.theme === "sepia"
                    ? "bg-[#f4ece1] text-[#2d2b28] shadow-sm border border-amber-700/40 ring-1 ring-amber-700/30 font-semibold"
                    : isLight
                    ? "text-[#57534e] hover:text-[#1c1917] font-medium"
                    : "text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100"
                }`}
                title="Warm Sepia (Low Eyestrain)"
              >
                <Coffee className="h-3.5 w-3.5 text-amber-700" />
                <span>Warm Sepia</span>
              </button>

              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "paper" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  readerSettings.theme === "paper"
                    ? "bg-white text-neutral-900 shadow-sm border border-neutral-400 ring-1 ring-neutral-400/30 font-semibold"
                    : isLight
                    ? "text-neutral-600 hover:text-neutral-950 font-medium"
                    : "text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100"
                }`}
                title="Clean Paper (Daylight Editorial)"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Clean Paper</span>
              </button>
            </div>

            {/* Quick Font Size Controls & Typeface Indicator */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border text-xs font-mono ${
                isSepia
                  ? 'border-amber-900/15 bg-amber-900/5 text-[#2d2b28]'
                  : isPaper
                  ? 'border-neutral-200 bg-neutral-100 text-neutral-900'
                  : 'border-white/10 bg-white/5 text-white'
              }`}>
                <button
                  type="button"
                  onClick={() => setReaderSettings({ ...readerSettings, fontSize: Math.max(15, readerSettings.fontSize - 1) })}
                  className="px-2 py-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="text-[11px] font-semibold px-1">{readerSettings.fontSize}px</span>
                <button
                  type="button"
                  onClick={() => setReaderSettings({ ...readerSettings, fontSize: Math.min(26, readerSettings.fontSize + 1) })}
                  className="px-2 py-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors font-bold"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>

              <ReaderTypographyDrawer
                settings={readerSettings}
                onSettingsChange={setReaderSettings}
              />
            </div>
          </div>
        </div>

        {/* Extension Install Banner */}
        <div className={`border-b transition-colors ${
          isSepia
            ? 'bg-[#f5ecdd] border-amber-900/15 text-[#451a03]'
            : isPaper
            ? 'bg-neutral-100 border-neutral-200 text-neutral-800'
            : readerSettings.theme === 'cyber'
            ? 'bg-[#051109]/90 border-emerald-900/30 text-emerald-300'
            : 'bg-white/[0.02] border-white/10 text-white/70'
        }`}>
          <div className="container mx-auto max-w-4xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Download className={`h-4 w-4 shrink-0 ${isSepia ? 'text-amber-800' : isPaper ? 'text-neutral-700' : 'text-cyan-400'}`} />
              <span className={isSepia ? 'text-[#451a03]' : isPaper ? 'text-neutral-800' : 'text-white/80'}>
                Install the PressProtocol browser extension for automatic multi-network failover routing.
              </span>
              <Button
                variant="link"
                asChild
                className={`ml-1 h-auto p-0 text-xs font-mono font-semibold underline underline-offset-2 ${
                  isSepia ? 'text-[#78350f] hover:text-[#451a03]' : isPaper ? 'text-blue-700 hover:text-blue-900' : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                <Link href="/downloads">Install Extension</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content - Sublime Editorial Reading Canvas */}
        <article className={`mx-auto max-w-[760px] px-6 py-12 ${
          isSepia ? 'reader-sepia' : isPaper ? 'reader-paper' : 'reader-onyx'
        }`}>
          {/* Offline Mode Banner */}
          {isOfflineMode && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
              isSepia
                ? 'border-amber-700/30 bg-[#f4ece1] text-[#451a03] shadow-sm'
                : isPaper
                ? 'border-neutral-300 bg-neutral-100 text-neutral-900 shadow-sm'
                : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs ${
                  isSepia
                    ? 'bg-amber-700/20 text-amber-900'
                    : isPaper
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  ⚡
                </span>
                <div>
                  <div className={`font-semibold text-xs tracking-wide uppercase font-mono ${
                    isSepia ? 'text-[#5a2e0e]' : isPaper ? 'text-neutral-900' : 'text-amber-300'
                  }`}>
                    Offline Mode Active
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    isSepia ? 'text-[#78350f]' : isPaper ? 'text-neutral-600' : 'text-amber-300/80'
                  }`}>
                    Reading preserved snapshot directly from your browser&apos;s local sovereign vault.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                isSepia
                  ? 'border-amber-700/40 text-amber-900 bg-amber-200/50 font-semibold'
                  : isPaper
                  ? 'border-neutral-400 text-neutral-800 bg-neutral-200/50 font-semibold'
                  : 'border-amber-500/40 text-amber-300'
              }`}>
                Local Cache
              </Badge>
            </div>
          )}

          {/* Title - Clean Bold Sans-Serif (Medium Headline Standard) */}
          <h1 className={`font-sans text-4xl sm:text-5xl font-bold tracking-tight leading-[1.18] mb-6 ${
            isSepia ? 'text-[#1c1917]' : isPaper ? 'text-neutral-950' : ''
          }`}>
            {content.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className={`flex items-center gap-4 text-sm flex-wrap ${
              isSepia ? 'text-[#57534e]' : isPaper ? 'text-neutral-600' : 'text-muted-foreground'
            }`}>
              {readingStats && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {readingStats.formattedTime}
                </span>
              )}
              <span>•</span>
              <time>{new Date(content.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</time>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsProvenanceOpen(true)}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer group text-left"
                title="Click to inspect zero-trust cryptographic provenance"
              >
                {isVerifying ? (
                  <span className={`flex items-center gap-1 text-xs animate-pulse ${
                    isSepia ? 'text-[#78716c]' : isPaper ? 'text-neutral-500' : 'text-muted-foreground'
                  }`}>
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                ) : verificationResult?.isValid ? (
                  <span className={`flex items-center gap-1 text-xs font-medium group-hover:underline ${
                    isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'
                  }`}>
                    <ShieldCheck className={`h-3.5 w-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-500'}`} />
                    Ed25519 Verified ({verificationResult.latencyMs}ms)
                  </span>
                ) : verificationResult?.status === "unsigned" ? (
                  <span className={`flex items-center gap-1 text-xs group-hover:underline ${
                    isSepia ? 'text-[#78716c]' : isPaper ? 'text-neutral-500' : 'text-muted-foreground'
                  }`}>
                    <Shield className="h-3.5 w-3.5" />
                    Unsigned
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 text-xs font-medium group-hover:underline ${
                    isLight ? 'text-amber-800 font-semibold' : 'text-amber-500'
                  }`}>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Unverified
                  </span>
                )}
              </button>
            </div>
            
            {/* Actions: Typography Customizer, Embed, Bookmark, Proof Export & Wayback Archive */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ReaderTypographyDrawer
                settings={readerSettings}
                onSettingsChange={setReaderSettings}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProof}
                className="h-8 gap-1.5 text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
                title="Export offline cryptographic proof (.pressproof.json)"
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export Proof</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveWayback}
                disabled={isArchiving}
                className={`h-8 gap-1.5 text-xs ${
                  isSepia
                    ? 'border-amber-900/15 text-[#57534e] hover:text-[#1c1917] hover:bg-amber-900/5'
                    : isPaper
                    ? 'border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Preserve snapshot on Internet Archive / Wayback Machine"
              >
                <Archive className={`h-3.5 w-3.5 ${isArchiving ? "animate-spin text-cyan-500" : ""}`} />
                <span className="hidden sm:inline">Wayback</span>
              </Button>

              <EmbedDialog cid={cid} title={content.title} />
              <BookmarkButton 
                cid={cid} 
                title={content.title}
                tags={content.tags || []}
                content={content.content}
                author={content.publisher?.username}
                signature={content.publisher?.signature}
                publicKey={content.publisher?.pubkey}
                mirrors={content.mirrors}
              />
            </div>
          </div>
          
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {content.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs px-2.5 py-1 transition-colors ${
                    isSepia
                      ? 'border-amber-900/15 bg-[#efe5d5] text-[#451a03] hover:bg-[#e4d7c3]'
                      : isPaper
                      ? 'border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content - Fluid Editorial Typography */}
          <div
            ref={contentRef}
            style={{
              fontSize: `${readerSettings.fontSize}px`,
              lineHeight: `${Math.round(readerSettings.fontSize * 1.62)}px`,
            }}
            className={`article-content
                       prose prose-lg max-w-none
                       ${getTypefaceClass()}
                       prose-headings:font-sans prose-headings:font-bold
                       prose-h1:text-4xl sm:prose-h1:text-5xl prose-h1:mb-6 prose-h1:mt-16
                       prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-16
                       prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-12
                       prose-p:mb-7
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:font-semibold
                       prose-blockquote:border-l-4 prose-blockquote:border-primary
                       prose-blockquote:pl-6 prose-blockquote:italic
                       prose-img:rounded-lg prose-img:my-8
                       prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                       prose-pre:border
                       prose-li:mb-2
                       ${
                         readerSettings.theme === 'dark' || readerSettings.theme === 'cyber'
                           ? 'prose-invert prose-blockquote:text-muted-foreground prose-code:bg-muted prose-pre:bg-muted'
                           : isSepia
                           ? 'prose-headings:text-[#1c1917] prose-p:text-[#2d2b28] prose-strong:text-[#1c1917] prose-blockquote:text-[#57534e] prose-blockquote:border-amber-700/60 prose-code:text-[#1c1917] prose-code:bg-[#ede3d2] prose-pre:bg-[#ede3d2] prose-pre:text-[#1c1917]'
                           : 'prose-headings:text-neutral-950 prose-p:text-neutral-900 prose-strong:text-neutral-950 prose-blockquote:text-neutral-600 prose-blockquote:border-neutral-400 prose-code:text-neutral-900 prose-code:bg-neutral-100 prose-pre:bg-neutral-100 prose-pre:text-neutral-900'
                       }`}
            dangerouslySetInnerHTML={{
              __html:
                content.content ||
                `<div class='p-8 rounded-xl border font-mono text-xs text-center ${
                  isSepia
                    ? 'border-amber-800/20 bg-[#f4ece1] text-[#451a03]'
                    : isPaper
                    ? 'border-neutral-300 bg-neutral-100 text-neutral-800'
                    : 'border-white/10 bg-white/5 text-zinc-400'
                }'><p class='font-medium'>Article body is synchronizing across decentralized IPFS swarm mirrors.</p><p class='mt-2 ${
                  isSepia ? 'text-[#78350f]' : isPaper ? 'text-neutral-500' : 'text-zinc-500'
                }'>CID: ${content.cid}</p></div>`,
            }}
          />
        </article>

        {/* Unified Protocol Verification Block */}
        <div className="mx-auto max-w-[760px] px-6 pb-16">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl p-6 sm:p-7 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Protocol Verification &amp; Provenance</h3>
                  <p className="text-[11px] text-zinc-400">Cryptographically anchored to decentralized storage</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleExportProof}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs font-mono gap-1.5 border-white/10 bg-black/40 hover:bg-white/[0.08] text-zinc-300"
                >
                  <Download className="h-3 w-3 text-cyan-400" />
                  <span>.pressproof.json</span>
                </Button>
                <Button
                  onClick={handleArchiveWayback}
                  disabled={isArchiving}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-mono gap-1.5 border-white/10 bg-black/40 hover:bg-white/[0.08] text-zinc-300"
                >
                  <Archive className={`h-3 w-3 ${isArchiving ? "animate-spin text-cyan-400" : ""}`} />
                  <span>Wayback</span>
                </Button>
                <Button
                  onClick={() => setIsProvenanceOpen(true)}
                  size="sm"
                  className="h-7 text-xs font-mono gap-1.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25"
                >
                  <span>Inspect CLI</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Core Provenance Row: Identity + CID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity & Signature */}
              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Signer Identity</span>
                  {isVerifying ? (
                    <span className="text-[10px] font-mono text-zinc-400 animate-pulse flex items-center gap-1">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    <SignatureBadge
                      publicKey={content.publisher?.pubkey}
                      verified={verificationResult?.isValid ?? false}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-xs text-white truncate">
                    {content.publisher?.pubkey ? `ed25519:${content.publisher.pubkey.slice(0, 10)}...${content.publisher.pubkey.slice(-8)}` : "Unsigned dispatch"}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>Pseudonym:</span>
                    <span className="text-zinc-300 font-mono">
                      {content.publisher?.pubkey
                        ? `Anon-${content.publisher.pubkey.slice(0, 4)}...${content.publisher.pubkey.slice(-4)}`
                        : "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Multihash */}
              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Content Addressing</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-zinc-400 py-0">
                    CIDv1 SHA-256
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CidChip cid={content.cid} prefixLen={10} suffixLen={8} showExplorerLink />
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Multi-transport URI: <code className="text-zinc-400 select-all">pressprotocol://{content.cid.slice(0, 16)}...</code>
                </div>
              </div>
            </div>

            {/* Multi-Transport Availability Row */}
            <div className="border-t border-white/[0.06] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Multi-Transport Swarm Health
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Fastest Rail: {content.recommended || "Swarm Gateway"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl border border-white/[0.06] bg-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MirrorHealthDot 
                      status={content.mirrors?.ipfs?.available ? "healthy" : "syncing"} 
                      label="IPFS Swarm"
                    />
                  </div>
                  {content.mirrors?.ipfs?.available && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] font-mono text-zinc-400 hover:text-white"
                      onClick={() => window.open(content.mirrors.ipfs.url, "_blank")}
                    >
                      Open
                    </Button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl border border-white/[0.06] bg-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MirrorHealthDot 
                      status={content.mirrors?.gateway?.available ? "healthy" : "syncing"} 
                      latencyMs={content.mirrors?.gateway?.latency}
                      label="Public Gateway"
                    />
                  </div>
                  {content.mirrors?.gateway?.available && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] font-mono text-zinc-400 hover:text-white"
                      onClick={() => window.open(content.mirrors.gateway.url, "_blank")}
                    >
                      Open
                    </Button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl border border-white/[0.06] bg-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MirrorHealthDot 
                      status={content.mirrors?.tor?.available ? "healthy" : "down"} 
                      label="Tor v3 Onion"
                    />
                  </div>
                  {content.mirrors?.tor?.available && content.mirrors?.tor?.url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] font-mono text-purple-400 hover:text-purple-300"
                      onClick={() => window.open(content.mirrors.tor.url, "_blank")}
                    >
                      .onion
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tor Share Section if available */}
            {content.mirrors?.tor?.available && content.mirrors?.tor?.url && (
              <div className="border-t border-white/[0.06] pt-4">
                <TorShareSection
                  onionUrl={content.mirrors.tor.url}
                  contentTitle={content.title}
                />
              </div>
            )}

            {/* Embed CTA Link */}
            <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between text-xs text-zinc-400">
              <span>Want to syndicate this sovereign article?</span>
              <Link 
                href={`/embed/builder?cid=${content.cid}`}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 group"
              >
                <span>Open Universal Embed Studio</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Zero-Trust Cryptographic Provenance Inspector Modal */}
      {content && (
        <CryptographicProvenanceModal
          open={isProvenanceOpen}
          onOpenChange={setIsProvenanceOpen}
          content={content}
          verificationResult={verificationResult}
          cid={cid}
        />
      )}
    </>
  );
}
