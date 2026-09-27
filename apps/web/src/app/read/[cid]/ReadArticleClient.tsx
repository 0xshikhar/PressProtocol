"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { downloadPressProofFile, exportPressProof } from "@pressprotocol/proof"
import {
  Archive,
  ArrowRight,
  BookOpen,
  Coffee,
  Contrast,
  Download,
  ExternalLink,
  FileCheck,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from "lucide-react"
import { toast } from "sonner"

import { apiClient, type ResolveContentResponse } from "@/lib/api-client"
import {
  classifySourceRail,
  getOfflineArticle,
  saveArticleOffline,
} from "@/lib/offline-storage"
import { calculateReadingTime } from "@/lib/reading-time"
import {
  verifyArticleSignature,
  type VerificationResult,
} from "@/lib/signature-verifier"
import {
  copyOnionUrl,
  getCanonicalOnionUrl,
  isAccessingViaOnion,
} from "@/lib/tor-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CidChip } from "@/components/protocol/CidChip"
import { MirrorHealthDot } from "@/components/protocol/MirrorHealthDot"
import { SignatureBadge } from "@/components/protocol/SignatureBadge"
import { BookmarkButton } from "@/components/reader/BookmarkButton"
import { CryptographicProvenanceModal } from "@/components/reader/CryptographicProvenanceModal"
import { EmbedDialog } from "@/components/reader/EmbedDialog"
import { QuoteSharePill } from "@/components/reader/QuoteSharePill"
import {
  ReaderTypographyDrawer,
  useReaderSettings,
} from "@/components/reader/ReaderTypographyDrawer"
import { ReadingProgressBar } from "@/components/reader/ReadingProgressBar"
import { TableOfContents } from "@/components/reader/TableOfContents"
import { TorShareSection } from "@/components/tor/TorShareSection"

/**
 * Interactive client-side reader component for PressProtocol publications.
 * Handles cryptographic signature verification, offline caching, typography settings,
 * offline proof export, and contextual quote selection.
 *
 * @param props - Component properties containing an optional initial publication CID.
 * @returns Interactive article reader UI with sovereign verification status.
 */
export function ReadArticleClient({ cid: initialCid }: { cid?: string }) {
  const params = useParams()
  const cid = initialCid || (params?.cid as string)
  const [content, setContent] = useState<ResolveContentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false)
  const { settings: readerSettings, updateSettings: setReaderSettings } =
    useReaderSettings()
  const contentRef = useRef<HTMLDivElement>(null)

  const readingStats = content?.content
    ? calculateReadingTime(content.content)
    : calculateReadingTime("")

  const handleExportProof = () => {
    if (!content) return
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
      })

      downloadPressProofFile(proof)
      toast.success("Downloaded offline cryptographic proof (.pressproof.json)")
    } catch (err: any) {
      toast.error(err.message || "Failed to export proof")
    }
  }

  const handleArchiveWayback = async () => {
    if (!content) return
    setIsArchiving(true)
    try {
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid: content.cid }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          data.status === "saved"
            ? "Preserved on Wayback Machine!"
            : "Archival request queued on Wayback Machine!"
        )
        if (data.snapshotUrl) {
          window.open(data.snapshotUrl, "_blank", "noopener,noreferrer")
        }
      } else {
        throw new Error(data.error || "Archival request failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Could not preserve to Wayback Machine")
    } finally {
      setIsArchiving(false)
    }
  }

  useEffect(() => {
    if (cid) {
      loadContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid])

  // Synchronize distraction-free focus mode with document root and body
  useEffect(() => {
    if (typeof document === "undefined") return
    if (readerSettings.distractionFree) {
      document.documentElement.classList.add("focus-mode")
      document.body.classList.add("focus-mode")
    } else {
      document.documentElement.classList.remove("focus-mode")
      document.body.classList.remove("focus-mode")
    }
    return () => {
      document.documentElement.classList.remove("focus-mode")
      document.body.classList.remove("focus-mode")
    }
  }, [readerSettings.distractionFree])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getContent(cid)

      setContent(data)
      setIsOfflineMode(false)

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
        wordCount:
          (data.content || "").split(/\s+/).filter(Boolean).length || 50,
        readingTimeMinutes: Math.max(
          1,
          Math.ceil(
            ((data.content || "").split(/\s+/).filter(Boolean).length || 50) /
              200
          )
        ),
        sourceRail: classifySourceRail(data.tags || [], data.content),
        isVerified: !!(
          data.publisher?.pubkey &&
          data.publisher?.signature &&
          data.publisher?.signature !== "unsigned"
        ),
      }).catch(() => {})

      // Perform authentic in-browser Ed25519 signature verification
      setIsVerifying(true)
      verifyArticleSignature(data)
        .then((res) => {
          setVerificationResult(res)
        })
        .catch((vErr) => {
          console.error("Cryptographic verification failed:", vErr)
        })
        .finally(() => {
          setIsVerifying(false)
        })
    } catch (err) {
      console.warn(
        "Network fetch failed, checking local offline vault for CID:",
        cid
      )
      try {
        const offlineArticle = await getOfflineArticle(cid)
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
          } as any

          setContent(fallbackData)
          setIsOfflineMode(true)
          toast.info(
            "Offline mode active: Viewing locally cached article snapshot"
          )

          verifyArticleSignature(fallbackData)
            .then((res) => setVerificationResult(res))
            .catch(() => {})
          return
        }
      } catch (offlineErr) {
        console.error("Offline fallback check failed:", offlineErr)
      }

      console.error("Error loading content:", err)
      setError(
        "Failed to load content. The content may not exist or is temporarily unavailable."
      )
      toast.error("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card elevation="card">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Alert variant="destructive" className="rounded-[6px]">
          <AlertDescription>{error || "Content not found"}</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  // Section 2.1 & 3.1: Tone-tailored background and text
  const getThemeClass = () => {
    switch (readerSettings.theme) {
      case "eink":
        return "theme-eink bg-white text-black selection:bg-black selection:text-white !transition-none"
      case "sepia":
        return "bg-[#F7F3EB] text-[#2C2724] selection:bg-[#E2D5C3]"
      case "paper":
        return "bg-[#FAFAFA] text-[#1A1817] selection:bg-[#E5E0DA]"
      case "cyber":
        return "theme-cyber bg-[#030804] text-[#00FF66] selection:bg-[#00FF66]/30 selection:text-[#00FF66]"
      case "dark":
      default:
        return "bg-canvas text-primary selection:bg-[var(--accent-tint)] selection:text-primary"
    }
  }

  const getTypefaceClass = () => {
    switch (readerSettings.typeface) {
      case "dyslexic":
        return "font-dyslexic"
      case "sans":
        return "font-sans"
      case "editorial":
        return "font-hero"
      case "mono":
        return "font-mono"
      case "charter":
      case "serif":
      default:
        return "font-serif" // Source Serif 4 (Section 3.1 reading pane)
    }
  }

  const getLineHeightPx = () => {
    const size = readerSettings.fontSize
    switch (readerSettings.lineHeight) {
      case "compact":
        return Math.round(size * 1.45)
      case "loose":
        return Math.round(size * 2.05)
      case "normal":
      default:
        return Math.round(size * 1.72)
    }
  }

  const getContentWidthClass = () => {
    switch (readerSettings.contentWidth) {
      case "narrow":
        return "max-w-[620px]"
      case "wide":
        return "max-w-[860px]"
      case "normal":
      default:
        return "max-w-[720px]"
    }
  }

  const isEink = readerSettings.theme === "eink"
  const isSepia = readerSettings.theme === "sepia"
  const isPaper = readerSettings.theme === "paper"
  const isCyber = readerSettings.theme === "cyber"
  const isLight = isSepia || isPaper || isEink

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Table of Contents (hidden in focus mode) */}
      {!readerSettings.distractionFree && (
        <TableOfContents contentRef={contentRef} />
      )}

      {/* Floating Exit Pill for Distraction-Free Focus Mode */}
      {readerSettings.distractionFree && (
        <div className="fixed right-4 top-4 z-50 duration-200 animate-in fade-in">
          <button
            type="button"
            onClick={() =>
              setReaderSettings({ ...readerSettings, distractionFree: false })
            }
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs shadow-lg backdrop-blur-md transition-all ${
              isEink
                ? "border-2 border-black bg-white font-bold text-black"
                : isCyber
                  ? "border-[#00FF66]/40 bg-[#030804]/90 text-[#00FF66] hover:bg-[#061409]"
                  : "border-hairline bg-surface/90 text-primary hover:border-focus hover:bg-elevated"
            }`}
          >
            <Minimize2 className="h-3.5 w-3.5 text-accent" />
            <span>Exit Focus Mode (Esc)</span>
          </button>
        </div>
      )}

      {/* Quote-to-Share Contextual Selection Pill */}
      <QuoteSharePill
        cid={cid}
        articleTitle={content.title}
        authorName={
          content.publisher?.username ||
          (content.publisher?.pubkey
            ? `Anon-${content.publisher.pubkey.slice(0, 4)}`
            : undefined)
        }
        isVerified={verificationResult?.isValid === true}
        containerRef={contentRef}
      />

      <div
        className={`min-h-screen transition-colors duration-300 ${getThemeClass()}`}
      >
        {/* Intentional Reading Mode Switcher Bar (Hidden in Distraction-Free Focus Mode) */}
        {!readerSettings.distractionFree && (
          <div
            className={`sticky top-16 z-30 border-b backdrop-blur-xl transition-all duration-300 ${
              isEink
                ? "border-b-2 border-black bg-white text-black shadow-none !transition-none"
                : isCyber
                  ? "border-[#00FF66]/30 bg-[#030804]/90 text-[#00FF66] shadow-sm"
                  : readerSettings.theme === "sepia"
                    ? "border-amber-900/15 bg-[#F7F3EB]/90 text-[#2C2724] shadow-sm"
                    : readerSettings.theme === "paper"
                      ? "border-neutral-200 bg-[#FAFAFA]/95 text-[#1A1817] shadow-sm"
                      : "border-hairline bg-canvas/90 text-primary shadow-sm"
            }`}
          >
            <div className="container mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
              {/* Reading Mode Segmented Controls */}
              <div
                className={`flex items-center gap-1 rounded-[6px] border p-1 ${
                  isEink
                    ? "border-2 border-black bg-white"
                    : isCyber
                      ? "border-[#00FF66]/30 bg-[#061409]"
                      : "border-black/5 bg-black/5 dark:border-hairline dark:bg-overlay"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setReaderSettings({ ...readerSettings, theme: "dark" })
                  }
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-mono text-xs transition-all sm:px-3 ${
                    readerSettings.theme === "dark"
                      ? "border border-hairline bg-elevated font-semibold text-primary shadow-sm"
                      : "text-muted opacity-70 hover:text-primary hover:opacity-100"
                  }`}
                  title="Onyx Dark"
                >
                  <Moon className="h-3.5 w-3.5 text-secondary" />
                  <span>Onyx Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setReaderSettings({ ...readerSettings, theme: "sepia" })
                  }
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-mono text-xs transition-all sm:px-3 ${
                    readerSettings.theme === "sepia"
                      ? "border border-amber-700/30 bg-[#F7F3EB] font-semibold text-[#2C2724] shadow-sm"
                      : isLight && !isEink
                        ? "font-medium text-[#57534E] hover:text-[#1C1917]"
                        : "text-muted opacity-70 hover:text-primary hover:opacity-100"
                  }`}
                  title="Warm Sepia"
                >
                  <Coffee className="h-3.5 w-3.5 text-amber-700" />
                  <span>Warm Sepia</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setReaderSettings({ ...readerSettings, theme: "paper" })
                  }
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-mono text-xs transition-all sm:px-3 ${
                    readerSettings.theme === "paper"
                      ? "border border-neutral-300 bg-white font-semibold text-neutral-900 shadow-sm"
                      : isLight && !isEink
                        ? "font-medium text-neutral-600 hover:text-neutral-950"
                        : "text-muted opacity-70 hover:text-primary hover:opacity-100"
                  }`}
                  title="Clean Paper"
                >
                  <Sun className="h-3.5 w-3.5 text-amber-600" />
                  <span>Clean Paper</span>
                </button>

                {/* E-Ink Monochrome High Contrast Mode */}
                <button
                  type="button"
                  onClick={() =>
                    setReaderSettings({ ...readerSettings, theme: "eink" })
                  }
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-mono text-xs transition-all sm:px-3 ${
                    isEink
                      ? "border border-black bg-black font-bold text-white shadow-sm"
                      : "text-muted opacity-70 hover:text-primary hover:opacity-100"
                  }`}
                  title="Pure monochrome E-Ink mode (High contrast, sharp borders, zero flicker)"
                >
                  <Contrast className="h-3.5 w-3.5" />
                  <span>E-Ink</span>
                </button>
              </div>

              {/* Quick Font Size Controls, Focus Mode & Typeface Indicator */}
              <div className="flex items-center gap-2">
                {/* Distraction Free Toggle Button */}
                <button
                  type="button"
                  onClick={() =>
                    setReaderSettings({
                      ...readerSettings,
                      distractionFree: !readerSettings.distractionFree,
                    })
                  }
                  className={`flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5 font-mono text-xs transition-all ${
                    readerSettings.distractionFree
                      ? "border-accent bg-accent/20 font-bold text-primary shadow-sm"
                      : isEink
                        ? "border-black text-black hover:bg-neutral-100"
                        : isCyber
                          ? "border-[#00FF66]/30 bg-[#061409] text-[#00FF66]"
                          : "hover:bg-surface-raised border-hairline bg-surface text-secondary hover:text-primary"
                  }`}
                  title={
                    readerSettings.distractionFree
                      ? "Exit Distraction-Free Focus Mode (Esc)"
                      : "Enter Distraction-Free Focus Mode"
                  }
                >
                  {readerSettings.distractionFree ? (
                    <Minimize2 className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5 text-secondary" />
                  )}
                  <span className="hidden sm:inline">
                    {readerSettings.distractionFree ? "Exit Focus" : "Focus"}
                  </span>
                </button>

                <div
                  className={`flex items-center gap-1 rounded-[6px] border px-1.5 py-1 font-mono text-xs ${
                    isEink
                      ? "border-black bg-white text-black"
                      : isSepia
                        ? "border-amber-900/15 bg-amber-900/5 text-[#2C2724]"
                        : isPaper
                          ? "border-neutral-200 bg-neutral-100 text-[#1A1817]"
                          : isCyber
                            ? "border-[#00FF66]/30 bg-[#061409] text-[#00FF66]"
                            : "border-hairline bg-overlay text-primary"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setReaderSettings({
                        ...readerSettings,
                        fontSize: Math.max(15, readerSettings.fontSize - 1),
                      })
                    }
                    className="rounded px-2 py-0.5 transition-colors hover:bg-black/10 dark:hover:bg-overlay"
                    title="Decrease font size"
                  >
                    A-
                  </button>
                  <span className="px-1 text-[11px] font-semibold tabular-nums">
                    {readerSettings.fontSize}px
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setReaderSettings({
                        ...readerSettings,
                        fontSize: Math.min(26, readerSettings.fontSize + 1),
                      })
                    }
                    className="rounded px-2 py-0.5 font-bold transition-colors hover:bg-black/10 dark:hover:bg-overlay"
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
        )}

        {/* Extension Install Banner (Hidden in Distraction-Free Focus Mode) */}
        {!readerSettings.distractionFree && (
          <div
            className={`border-b transition-colors ${
              isEink
                ? "border-black bg-neutral-100 text-black"
                : isSepia
                  ? "border-amber-900/15 bg-[#F0E8DA] text-[#451A03]"
                  : isPaper
                    ? "border-neutral-200 bg-neutral-100 text-neutral-800"
                    : isCyber
                      ? "border-[#00FF66]/20 bg-[#061409] text-[#00FF66]/90"
                      : "border-hairline bg-surface/50 text-secondary"
            }`}
          >
            <div className="container mx-auto max-w-4xl px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Download
                  className={`h-4 w-4 shrink-0 ${isEink ? "text-black" : isSepia ? "text-amber-800" : isPaper ? "text-neutral-700" : isCyber ? "text-[#00FF66]" : "text-primary"}`}
                />
                <span
                  className={
                    isEink
                      ? "text-black"
                      : isSepia
                        ? "text-[#451A03]"
                        : isPaper
                          ? "text-neutral-800"
                          : isCyber
                            ? "text-[#00FF66]/90"
                            : "text-secondary"
                  }
                >
                  Install the PressProtocol browser extension for automatic
                  multi-network failover routing.
                </span>
                <Button
                  variant="link"
                  asChild
                  className={`ml-1 h-auto p-0 font-mono text-xs font-semibold underline underline-offset-2 ${
                    isEink
                      ? "font-bold text-black hover:text-black/80"
                      : isSepia
                        ? "text-[#78350F] hover:text-[#451A03]"
                        : isPaper
                          ? "text-blue-700 hover:text-blue-900"
                          : isCyber
                            ? "text-[#00FF66] hover:text-[#50FA7B]"
                            : "text-primary hover:text-primary/80"
                  }`}
                >
                  <Link href="/downloads">Install Extension</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Article Content - Isolated Reading Pane with configurable width */}
        <article
          className={`mx-auto ${getContentWidthClass()} dispatch-prose px-6 py-12 transition-all duration-200`}
        >
          {/* Offline Mode Banner */}
          {isOfflineMode && (
            <div
              className={`mb-8 flex items-center justify-between gap-4 rounded-[6px] border p-4 transition-all ${
                isSepia
                  ? "border-amber-700/30 bg-[#F4ECE1] text-[#451A03] shadow-sm"
                  : isPaper
                    ? "border-neutral-300 bg-neutral-100 text-neutral-900 shadow-sm"
                    : isCyber
                      ? "border-[#00FF66]/40 bg-[#061409] text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                      : "border-warning/30 bg-warning/10 text-warning"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-[4px] text-xs font-bold ${
                    isCyber
                      ? "bg-[#00FF66]/20 text-[#00FF66]"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  ⚡
                </span>
                <div>
                  <div className="font-mono text-xs font-semibold uppercase tracking-wide">
                    Offline Mode Active
                  </div>
                  <p className="mt-0.5 text-xs opacity-90">
                    Reading preserved snapshot directly from your browser&apos;s
                    local sovereign vault.
                  </p>
                </div>
              </div>
              <Badge
                variant={isCyber ? "outline" : "warning"}
                className={`px-2 py-0.5 font-mono text-[10px] uppercase ${
                  isCyber ? "border-[#00FF66]/40 text-[#00FF66]" : ""
                }`}
              >
                Local Cache
              </Badge>
            </div>
          )}

          {/* Section 3.2: Title in Instrument Serif per dispatch-prose rules */}
          <h1
            className={`mb-6 font-hero text-3xl font-normal leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl ${
              isEink
                ? "font-semibold !text-black"
                : isSepia
                  ? "text-[#1C1917]"
                  : isPaper
                    ? "text-neutral-950"
                    : "text-primary"
            }`}
          >
            {content.title}
          </h1>

          {/* Meta Information: Enforcing 2-Badge Budget (Section 3.3) */}
          <div
            className={`mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4 font-mono text-xs ${
              isEink ? "border-black !text-black" : "border-hairline text-muted"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              {readingStats && (
                <span
                  className={`flex items-center gap-1 tabular-nums ${isEink ? "font-semibold text-black" : ""}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {readingStats.formattedTime}
                </span>
              )}
              <span>&bull;</span>
              <time
                className={`tabular-nums ${isEink ? "font-semibold text-black" : ""}`}
              >
                {new Date(content.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setIsProvenanceOpen(true)}
                className="group flex cursor-pointer items-center gap-1 text-left transition-opacity hover:opacity-80"
                title="Click to inspect zero-trust cryptographic provenance"
              >
                {isVerifying ? (
                  <span
                    className={`flex items-center gap-1 text-xs ${isEink ? "font-semibold text-black" : "text-muted"} animate-pulse`}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                ) : verificationResult?.isValid ? (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isEink
                        ? "border border-black px-1.5 py-0.5 font-bold text-black"
                        : "text-verified"
                    }`}
                  >
                    <ShieldCheck
                      className={`h-3.5 w-3.5 ${isEink ? "text-black" : "text-verified"}`}
                    />
                    Ed25519 Verified ({verificationResult.latencyMs}ms)
                  </span>
                ) : verificationResult?.status === "unsigned" ? (
                  <span
                    className={`flex items-center gap-1 text-xs ${isEink ? "font-semibold text-black" : "text-muted"}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Unsigned
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isEink
                        ? "border border-black px-1.5 py-0.5 font-bold text-black"
                        : "text-warning"
                    }`}
                  >
                    <ShieldAlert
                      className={`h-3.5 w-3.5 ${isEink ? "text-black" : "text-warning"}`}
                    />
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
                className={`h-8 gap-1.5 rounded-[6px] font-mono text-xs ${
                  isEink
                    ? "!rounded-none !border-black !bg-white font-semibold !text-black hover:!bg-black hover:!text-white"
                    : "border-hairline text-secondary hover:bg-overlay hover:text-primary"
                }`}
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
                className={`h-8 gap-1.5 rounded-[6px] font-mono text-xs ${
                  isEink
                    ? "!rounded-none !border-black !bg-white font-semibold !text-black hover:!bg-black hover:!text-white"
                    : "border-hairline text-secondary hover:bg-overlay hover:text-primary"
                }`}
                title="Preserve snapshot on Internet Archive / Wayback Machine"
              >
                <Archive
                  className={`h-3.5 w-3.5 ${isArchiving ? (isCyber ? "animate-spin text-[#00FF66]" : "animate-spin text-primary") : ""}`}
                />
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
                className={
                  isEink ? "!rounded-none !border-black font-semibold" : ""
                }
              />
            </div>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`px-2.5 py-0.5 text-xs ${
                    isEink
                      ? "!rounded-none !border-black !bg-white font-mono font-bold !text-black"
                      : "rounded-[4px] border-hairline bg-overlay/50 text-secondary"
                  }`}
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
              lineHeight: `${getLineHeightPx()}px`,
            }}
            className={`article-content prose prose-lg max-w-none ${getTypefaceClass()} prose-headings:font-sans prose-headings:font-semibold prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:text-primary prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-12 prose-h2:text-primary prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-primary prose-p:mb-6 prose-p:text-primary/95 prose-a:text-[var(--accent-ribbon)] prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-primary prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--accent-primary)] prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-secondary prose-img:rounded-[6px] prose-img:my-8 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[4px] prose-code:text-xs prose-code:bg-elevated prose-code:text-primary prose-code:font-mono prose-pre:border prose-pre:border-hairline prose-pre:bg-surface prose-pre:rounded-[6px] prose-li:mb-2 ${
              readerSettings.theme === "cyber"
                ? "prose-invert prose-headings:text-[#00FF66] prose-headings:drop-shadow-[0_0_12px_rgba(0,255,102,0.3)] prose-p:text-[#00E65C] prose-strong:text-[#50FA7B] prose-a:text-[#50FA7B] prose-blockquote:text-[#00FF66]/80 prose-blockquote:border-[#00FF66] prose-code:text-[#00FF66] prose-code:bg-[#06190B] prose-code:border prose-code:border-[#00FF66]/30"
                : readerSettings.theme === "dark"
                  ? "prose-invert"
                  : isSepia
                    ? "prose-headings:text-[#1C1917] prose-p:text-[#2C2724] prose-strong:text-[#1C1917] prose-blockquote:text-[#57534E]"
                    : isEink
                      ? "prose-headings:text-black prose-p:text-black prose-strong:text-black prose-blockquote:text-black prose-blockquote:border-black"
                      : "prose-headings:text-neutral-950 prose-p:text-neutral-900 prose-strong:text-neutral-950 prose-blockquote:text-neutral-600"
            }`}
            dangerouslySetInnerHTML={{
              __html:
                content.content ||
                `<div class='p-8 rounded-[6px] border border-hairline bg-surface font-mono text-xs text-center text-secondary'><p class='font-medium'>Article body is synchronizing across decentralized IPFS swarm mirrors.</p><p class='mt-2 text-muted'>CID: ${content.cid}</p></div>`,
            }}
          />
        </article>

        {/* Unified Protocol Verification Block (Card Elevation, No Neon Glows) */}
        <div
          className={`mx-auto ${getContentWidthClass()} px-6 pb-16 transition-all duration-200`}
        >
          <div className="space-y-6 rounded-[6px] border border-hairline bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:p-7">
            {/* Header */}
            <div
              className={`flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center ${
                isCyber ? "border-[#00FF66]/20" : "border-hairline"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`rounded-[4px] p-1.5 ${
                    isCyber
                      ? "border border-[#00FF66]/30 bg-[#00FF66]/15 text-[#00FF66]"
                      : "border border-[rgba(124,39,51,0.2)] bg-[var(--accent-tint)] text-[var(--accent-ribbon)]"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-primary">
                    Protocol Verification &amp; Provenance
                  </h3>
                  <p className="text-[11px] text-muted">
                    Cryptographically anchored to decentralized storage
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleExportProof}
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 rounded-[4px] border-hairline bg-overlay/50 font-mono text-xs text-secondary hover:bg-overlay hover:text-primary"
                >
                  <Download className="h-3 w-3 text-secondary" />
                  <span>.pressproof.json</span>
                </Button>
                <Button
                  onClick={handleArchiveWayback}
                  disabled={isArchiving}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-[4px] border-hairline bg-overlay/50 font-mono text-xs text-secondary hover:bg-overlay hover:text-primary"
                >
                  <Archive
                    className={`h-3 w-3 ${isArchiving ? "animate-spin text-primary" : ""}`}
                  />
                  <span>Wayback</span>
                </Button>
                <Button
                  onClick={() => setIsProvenanceOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 rounded-[4px] border-hairline bg-overlay font-mono text-xs text-primary hover:bg-elevated"
                >
                  <span>Inspect CLI</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Core Provenance Row: Identity + CID */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Identity & Signature */}
              <div className="space-y-2 rounded-[6px] border border-hairline bg-canvas p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Signer Identity
                  </span>
                  {isVerifying ? (
                    <span className="flex animate-pulse items-center gap-1 font-mono text-[10px] text-muted">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />{" "}
                      Verifying...
                    </span>
                  ) : (
                    <SignatureBadge
                      publicKey={content.publisher?.pubkey}
                      verified={verificationResult?.isValid ?? false}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="truncate font-mono text-xs text-primary">
                    {content.publisher?.pubkey
                      ? `ed25519:${content.publisher.pubkey.slice(0, 10)}...${content.publisher.pubkey.slice(-8)}`
                      : "Unsigned dispatch"}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>Pseudonym:</span>
                    <span className="font-mono text-secondary">
                      {content.publisher?.pubkey
                        ? `Anon-${content.publisher.pubkey.slice(0, 4)}...${content.publisher.pubkey.slice(-4)}`
                        : "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Multihash */}
              <div className="space-y-2 rounded-[6px] border border-hairline bg-canvas p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Content Addressing
                  </span>
                  <Badge
                    variant="outline"
                    className="border-hairline py-0 font-mono text-[9px] text-muted"
                  >
                    CIDv1 SHA-256
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CidChip
                    cid={content.cid}
                    prefixLen={10}
                    suffixLen={8}
                    showExplorerLink
                  />
                </div>
                <div className="font-mono text-[11px] text-muted">
                  Multi-transport URI:{" "}
                  <code className="select-all text-secondary">
                    pressprotocol://{content.cid.slice(0, 16)}...
                  </code>
                </div>
              </div>
            </div>

            {/* Multi-Transport Availability Row */}
            <div className="space-y-3 border-t border-hairline pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Multi-Transport Swarm Health
                </span>
                <span className="font-mono text-[10px] text-muted">
                  Fastest Rail: {content.recommended || "Swarm Gateway"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-canvas p-2.5">
                  <div className="flex items-center gap-2">
                    <MirrorHealthDot
                      status={
                        content.mirrors?.ipfs?.available ? "healthy" : "syncing"
                      }
                      label="IPFS Swarm"
                    />
                  </div>
                  {content.mirrors?.ipfs?.available && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 font-mono text-[10px] text-muted hover:text-primary"
                      onClick={() =>
                        window.open(content.mirrors.ipfs.url, "_blank")
                      }
                    >
                      Open
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-canvas p-2.5">
                  <div className="flex items-center gap-2">
                    <MirrorHealthDot
                      status={
                        content.mirrors?.gateway?.available
                          ? "healthy"
                          : "syncing"
                      }
                      latencyMs={content.mirrors?.gateway?.latency}
                      label="Public Gateway"
                    />
                  </div>
                  {content.mirrors?.gateway?.available && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 font-mono text-[10px] text-muted hover:text-primary"
                      onClick={() =>
                        window.open(content.mirrors.gateway.url, "_blank")
                      }
                    >
                      Open
                    </Button>
                  )}
                </div>

                {/* 3. Tor v3 Onion Mirror */}
                {(() => {
                  const resolvedOnionUrl = getCanonicalOnionUrl(
                    content.cid,
                    content.mirrors?.tor?.url
                  )
                  const isTorActive = !!(
                    content.mirrors?.tor?.available ||
                    (typeof window !== "undefined" && isAccessingViaOnion())
                  )

                  return (
                    <div className="flex items-center justify-between rounded-[6px] border border-hairline bg-canvas p-2.5">
                      <div className="flex items-center gap-2">
                        <MirrorHealthDot
                          status={isTorActive ? "healthy" : "ready"}
                          label={
                            isTorActive
                              ? "Tor Circuit Active"
                              : "Tor Onion Mirror"
                          }
                        />
                      </div>
                      {resolvedOnionUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 font-mono text-[10px] text-anonymous hover:text-anonymous/80"
                          onClick={() => {
                            copyOnionUrl(resolvedOnionUrl)
                            toast.success(
                              "Tor .onion address copied! Paste in Tor Browser to read."
                            )
                          }}
                          title="Copy Tor .onion URL for Tor Browser"
                        >
                          Copy .onion
                        </Button>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Tor Share Section */}
            {(() => {
              const resolvedOnionUrl = getCanonicalOnionUrl(
                content.cid,
                content.mirrors?.tor?.url
              )
              return resolvedOnionUrl ? (
                <div className="border-t border-hairline pt-4">
                  <TorShareSection
                    onionUrl={resolvedOnionUrl}
                    contentTitle={content.title}
                  />
                </div>
              ) : null
            })()}

            {/* Embed CTA Link */}
            <div className="flex items-center justify-between border-t border-hairline pt-4 text-xs text-muted">
              <span>Want to syndicate this sovereign article?</span>
              <Link
                href={`/embed/builder?cid=${content.cid}`}
                className="group flex items-center gap-1 font-mono text-xs text-secondary hover:text-primary"
              >
                <span>Open Universal Embed Studio</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
  )
}
