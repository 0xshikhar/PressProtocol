"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Download, Shield, BookOpen, ShieldCheck, ShieldAlert, Loader2, FileCheck, Archive, Moon, Sun, Coffee, ArrowRight } from "lucide-react";
import { apiClient, type ResolveContentResponse } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateReadingTime } from "@/lib/reading-time";
import { ReadingProgressBar } from "@/components/reader/ReadingProgressBar";
import { TableOfContents } from "@/components/reader/TableOfContents";
import { BookmarkButton } from "@/components/reader/BookmarkButton";
import { EmbedDialog } from "@/components/reader/EmbedDialog";
import { TorShareSection } from "@/components/tor/TorShareSection";
import { getCanonicalOnionUrl, isAccessingViaOnion, copyOnionUrl } from "@/lib/tor-utils";
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
          console.error("Cryptographic verification failed:", vErr);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } catch (err) {
      console.warn("Network fetch failed, checking local offline vault for CID:", cid);
      try {
        const offlineArticle = await getOfflineArticle(cid);
        if (offlineArticle) {
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

      console.error("Error loading content:", err);
      setError("Failed to load content. The content may not exist or is temporarily unavailable.");
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card elevation="card">
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
        <Alert variant="destructive" className="rounded-[6px]">
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

  // Section 2.1 & 3.1: Tone-tailored background and text
  const getThemeClass = () => {
    switch (readerSettings.theme) {
      case "sepia":
        return "bg-[#F7F3EB] text-[#2C2724] selection:bg-[#E2D5C3]";
      case "paper":
        return "bg-[#FAFAFA] text-[#1A1817] selection:bg-[#E5E0DA]";
      case "cyber":
        return "bg-canvas text-primary selection:bg-[var(--accent-tint)]";
      case "dark":
      default:
        return "bg-canvas text-primary selection:bg-[var(--accent-tint)] selection:text-primary";
    }
  };

  const getTypefaceClass = () => {
    switch (readerSettings.typeface) {
      case "sans":
        return "font-sans";
      case "editorial":
        return "font-hero";
      case "mono":
        return "font-mono";
      case "charter":
      case "serif":
      default:
        return "font-serif"; // Source Serif 4 (Section 3.1 reading pane)
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
        {/* Intentional Reading Mode Switcher Bar */}
        <div className={`sticky top-16 z-30 border-b backdrop-blur-xl transition-all duration-300 ${
          readerSettings.theme === 'sepia'
            ? 'bg-[#F7F3EB]/90 border-amber-900/15 text-[#2C2724] shadow-sm'
            : readerSettings.theme === 'paper'
            ? 'bg-[#FAFAFA]/95 border-neutral-200 text-[#1A1817] shadow-sm'
            : 'bg-canvas/90 border-hairline text-primary shadow-sm'
        }`}>
          <div className="container mx-auto max-w-4xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            {/* Reading Mode Segmented Controls */}
            <div className="flex items-center gap-1 p-1 rounded-[6px] bg-black/5 dark:bg-overlay border border-black/5 dark:border-hairline">
              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "dark" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all ${
                  readerSettings.theme === "dark"
                    ? "bg-elevated text-primary shadow-sm border border-hairline font-semibold"
                    : "text-muted hover:text-primary opacity-70 hover:opacity-100"
                }`}
                title="Onyx Dark"
              >
                <Moon className="h-3.5 w-3.5 text-secondary" />
                <span>Onyx Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "sepia" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all ${
                  readerSettings.theme === "sepia"
                    ? "bg-[#F7F3EB] text-[#2C2724] shadow-sm border border-amber-700/30 font-semibold"
                    : isLight
                    ? "text-[#57534E] hover:text-[#1C1917] font-medium"
                    : "text-muted hover:text-primary opacity-70 hover:opacity-100"
                }`}
                title="Warm Sepia"
              >
                <Coffee className="h-3.5 w-3.5 text-amber-700" />
                <span>Warm Sepia</span>
              </button>

              <button
                type="button"
                onClick={() => setReaderSettings({ ...readerSettings, theme: "paper" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all ${
                  readerSettings.theme === "paper"
                    ? "bg-white text-neutral-900 shadow-sm border border-neutral-300 font-semibold"
                    : isLight
                    ? "text-neutral-600 hover:text-neutral-950 font-medium"
                    : "text-muted hover:text-primary opacity-70 hover:opacity-100"
                }`}
                title="Clean Paper"
              >
                <Sun className="h-3.5 w-3.5 text-amber-600" />
                <span>Clean Paper</span>
              </button>
            </div>

            {/* Quick Font Size Controls & Typeface Indicator */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-1.5 py-1 rounded-[6px] border text-xs font-mono ${
                isSepia
                  ? 'border-amber-900/15 bg-amber-900/5 text-[#2C2724]'
                  : isPaper
                  ? 'border-neutral-200 bg-neutral-100 text-[#1A1817]'
                  : 'border-hairline bg-overlay text-primary'
              }`}>
                <button
                  type="button"
                  onClick={() => setReaderSettings({ ...readerSettings, fontSize: Math.max(15, readerSettings.fontSize - 1) })}
                  className="px-2 py-0.5 hover:bg-black/10 dark:hover:bg-overlay rounded transition-colors"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="text-[11px] font-semibold px-1 tabular-nums">{readerSettings.fontSize}px</span>
                <button
                  type="button"
                  onClick={() => setReaderSettings({ ...readerSettings, fontSize: Math.min(26, readerSettings.fontSize + 1) })}
                  className="px-2 py-0.5 hover:bg-black/10 dark:hover:bg-overlay rounded transition-colors font-bold"
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
            ? 'bg-[#F0E8DA] border-amber-900/15 text-[#451A03]'
            : isPaper
            ? 'bg-neutral-100 border-neutral-200 text-neutral-800'
            : 'bg-surface/50 border-hairline text-secondary'
        }`}>
          <div className="container mx-auto max-w-4xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Download className={`h-4 w-4 shrink-0 ${isSepia ? 'text-amber-800' : isPaper ? 'text-neutral-700' : 'text-primary'}`} />
              <span className={isSepia ? 'text-[#451A03]' : isPaper ? 'text-neutral-800' : 'text-secondary'}>
                Install the PressProtocol browser extension for automatic multi-network failover routing.
              </span>
              <Button
                variant="link"
                asChild
                className={`ml-1 h-auto p-0 text-xs font-mono font-semibold underline underline-offset-2 ${
                  isSepia ? 'text-[#78350F] hover:text-[#451A03]' : isPaper ? 'text-blue-700 hover:text-blue-900' : 'text-primary hover:text-primary/80'
                }`}
              >
                <Link href="/downloads">Install Extension</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content - Section 3.1 & 3.2: 65-75ch Isolated Reading Pane with Source Serif 4 */}
        <article className="mx-auto max-w-[720px] px-6 py-12 dispatch-prose">
          {/* Offline Mode Banner */}
          {isOfflineMode && (
            <div className={`mb-8 p-4 rounded-[6px] border flex items-center justify-between gap-4 transition-all ${
              isSepia
                ? 'border-amber-700/30 bg-[#F4ECE1] text-[#451A03] shadow-sm'
                : isPaper
                ? 'border-neutral-300 bg-neutral-100 text-neutral-900 shadow-sm'
                : 'border-warning/30 bg-warning/10 text-warning'
            }`}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-[4px] font-bold text-xs bg-warning/20 text-warning">
                  ⚡
                </span>
                <div>
                  <div className="font-semibold text-xs tracking-wide uppercase font-mono">
                    Offline Mode Active
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    Reading preserved snapshot directly from your browser&apos;s local sovereign vault.
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="text-[10px] uppercase font-mono px-2 py-0.5">
                Local Cache
              </Badge>
            </div>
          )}

          {/* Section 3.2: Title in Instrument Serif per dispatch-prose rules */}
          <h1 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-[1.15] mb-6 text-primary">
            {content.title}
          </h1>
          
          {/* Meta Information: Enforcing 2-Badge Budget (Section 3.3) */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3 border-b border-hairline pb-4 font-mono text-xs text-muted">
            <div className="flex items-center gap-3 flex-wrap">
              {readingStats && (
                <span className="flex items-center gap-1 tabular-nums">
                  <BookOpen className="h-3.5 w-3.5" />
                  {readingStats.formattedTime}
                </span>
              )}
              <span>&bull;</span>
              <time className="tabular-nums">{new Date(content.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</time>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setIsProvenanceOpen(true)}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer group text-left"
                title="Click to inspect zero-trust cryptographic provenance"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-1 text-xs text-muted animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                ) : verificationResult?.isValid ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-verified">
                    <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                    Ed25519 Verified ({verificationResult.latencyMs}ms)
                  </span>
                ) : verificationResult?.status === "unsigned" ? (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Shield className="h-3.5 w-3.5" />
                    Unsigned
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-warning">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Unverified
                  </span>
                )}
              </button>
            </div>
            
            {/* Actions: Typography Customizer, Embed, Bookmark, Proof Export & Wayback Archive */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProof}
                className="h-8 gap-1.5 text-xs font-mono border-hairline text-secondary hover:text-primary hover:bg-overlay rounded-[6px]"
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
                className="h-8 gap-1.5 text-xs font-mono border-hairline text-secondary hover:text-primary hover:bg-overlay rounded-[6px]"
                title="Preserve snapshot on Internet Archive / Wayback Machine"
              >
                <Archive className={`h-3.5 w-3.5 ${isArchiving ? "animate-spin text-primary" : ""}`} />
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
                  className="text-xs px-2.5 py-0.5 rounded-[4px] border-hairline bg-overlay/50 text-secondary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content - Source Serif 4 Reading Pane */}
          <div
            ref={contentRef}
            style={{
              fontSize: `${readerSettings.fontSize}px`,
              lineHeight: `${Math.round(readerSettings.fontSize * 1.65)}px`,
            }}
            className={`article-content
                       prose prose-lg max-w-none
                       ${getTypefaceClass()}
                       prose-headings:font-sans prose-headings:font-semibold
                       prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:text-primary
                       prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-12 prose-h2:text-primary
                       prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-primary
                       prose-p:mb-6 prose-p:text-primary/95
                       prose-a:text-[var(--accent-ribbon)] prose-a:no-underline hover:prose-a:underline
                       prose-strong:font-semibold prose-strong:text-primary
                       prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--accent-primary)]
                       prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-secondary
                       prose-img:rounded-[6px] prose-img:my-8
                       prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[4px] prose-code:text-xs prose-code:bg-elevated prose-code:text-primary prose-code:font-mono
                       prose-pre:border prose-pre:border-hairline prose-pre:bg-surface prose-pre:rounded-[6px]
                       prose-li:mb-2
                       ${
                         readerSettings.theme === 'dark' || readerSettings.theme === 'cyber'
                           ? 'prose-invert'
                           : isSepia
                           ? 'prose-headings:text-[#1C1917] prose-p:text-[#2C2724] prose-strong:text-[#1C1917] prose-blockquote:text-[#57534E]'
                           : 'prose-headings:text-neutral-950 prose-p:text-neutral-900 prose-strong:text-neutral-950 prose-blockquote:text-neutral-600'
                       }`}
            dangerouslySetInnerHTML={{
              __html:
                content.content ||
                `<div class='p-8 rounded-[6px] border border-hairline bg-surface font-mono text-xs text-center text-secondary'><p class='font-medium'>Article body is synchronizing across decentralized IPFS swarm mirrors.</p><p class='mt-2 text-muted'>CID: ${content.cid}</p></div>`,
            }}
          />
        </article>

        {/* Unified Protocol Verification Block (Card Elevation, No Neon Glows) */}
        <div className="mx-auto max-w-[720px] px-6 pb-16">
          <div className="rounded-[6px] border border-hairline bg-surface p-6 sm:p-7 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[4px] bg-[var(--accent-tint)] text-[var(--accent-ribbon)] border border-[rgba(124,39,51,0.2)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary tracking-tight">Protocol Verification &amp; Provenance</h3>
                  <p className="text-[11px] text-muted">Cryptographically anchored to decentralized storage</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleExportProof}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs font-mono gap-1.5 border-hairline bg-overlay/50 hover:bg-overlay text-secondary hover:text-primary rounded-[4px]"
                >
                  <Download className="h-3 w-3 text-secondary" />
                  <span>.pressproof.json</span>
                </Button>
                <Button
                  onClick={handleArchiveWayback}
                  disabled={isArchiving}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-mono gap-1.5 border-hairline bg-overlay/50 hover:bg-overlay text-secondary hover:text-primary rounded-[4px]"
                >
                  <Archive className={`h-3 w-3 ${isArchiving ? "animate-spin text-primary" : ""}`} />
                  <span>Wayback</span>
                </Button>
                <Button
                  onClick={() => setIsProvenanceOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs font-mono gap-1.5 border-hairline bg-overlay hover:bg-elevated text-primary rounded-[4px]"
                >
                  <span>Inspect CLI</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Core Provenance Row: Identity + CID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity & Signature */}
              <div className="p-3.5 rounded-[6px] border border-hairline bg-canvas space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Signer Identity</span>
                  {isVerifying ? (
                    <span className="text-[10px] font-mono text-muted animate-pulse flex items-center gap-1">
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
                  <div className="font-mono text-xs text-primary truncate">
                    {content.publisher?.pubkey ? `ed25519:${content.publisher.pubkey.slice(0, 10)}...${content.publisher.pubkey.slice(-8)}` : "Unsigned dispatch"}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-2">
                    <span>Pseudonym:</span>
                    <span className="text-secondary font-mono">
                      {content.publisher?.pubkey
                        ? `Anon-${content.publisher.pubkey.slice(0, 4)}...${content.publisher.pubkey.slice(-4)}`
                        : "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Multihash */}
              <div className="p-3.5 rounded-[6px] border border-hairline bg-canvas space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Content Addressing</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-hairline text-muted py-0">
                    CIDv1 SHA-256
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CidChip cid={content.cid} prefixLen={10} suffixLen={8} showExplorerLink />
                </div>
                <div className="text-[11px] text-muted font-mono">
                  Multi-transport URI: <code className="text-secondary select-all">pressprotocol://{content.cid.slice(0, 16)}...</code>
                </div>
              </div>
            </div>

            {/* Multi-Transport Availability Row */}
            <div className="border-t border-hairline pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Multi-Transport Swarm Health
                </span>
                <span className="text-[10px] font-mono text-muted">
                  Fastest Rail: {content.recommended || "Swarm Gateway"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-[6px] border border-hairline bg-canvas flex items-center justify-between">
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
                      className="h-6 px-2 text-[10px] font-mono text-muted hover:text-primary"
                      onClick={() => window.open(content.mirrors.ipfs.url, "_blank")}
                    >
                      Open
                    </Button>
                  )}
                </div>

                <div className="p-2.5 rounded-[6px] border border-hairline bg-canvas flex items-center justify-between">
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
                      className="h-6 px-2 text-[10px] font-mono text-muted hover:text-primary"
                      onClick={() => window.open(content.mirrors.gateway.url, "_blank")}
                    >
                      Open
                    </Button>
                  )}
                </div>

                {/* 3. Tor v3 Onion Mirror */}
                {(() => {
                  const resolvedOnionUrl = getCanonicalOnionUrl(content.cid, content.mirrors?.tor?.url);
                  const isTorActive = !!(content.mirrors?.tor?.available || (typeof window !== "undefined" && isAccessingViaOnion()));
                  
                  return (
                    <div className="p-2.5 rounded-[6px] border border-hairline bg-canvas flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MirrorHealthDot 
                          status={isTorActive ? "healthy" : "ready"} 
                          label={isTorActive ? "Tor Circuit Active" : "Tor Onion Mirror"}
                        />
                      </div>
                      {resolvedOnionUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] font-mono text-anonymous hover:text-anonymous/80"
                          onClick={() => {
                            copyOnionUrl(resolvedOnionUrl);
                            toast.success("Tor .onion address copied! Paste in Tor Browser to read.");
                          }}
                          title="Copy Tor .onion URL for Tor Browser"
                        >
                          Copy .onion
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tor Share Section */}
            {(() => {
              const resolvedOnionUrl = getCanonicalOnionUrl(content.cid, content.mirrors?.tor?.url);
              return resolvedOnionUrl ? (
                <div className="border-t border-hairline pt-4">
                  <TorShareSection
                    onionUrl={resolvedOnionUrl}
                    contentTitle={content.title}
                  />
                </div>
              ) : null;
            })()}

            {/* Embed CTA Link */}
            <div className="border-t border-hairline pt-4 flex items-center justify-between text-xs text-muted">
              <span>Want to syndicate this sovereign article?</span>
              <Link 
                href={`/embed/builder?cid=${content.cid}`}
                className="text-secondary hover:text-primary font-mono text-xs flex items-center gap-1 group"
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
