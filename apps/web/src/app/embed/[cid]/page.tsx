"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  FileText, 
  Key, 
  Cpu, 
  Globe, 
  Sparkles,
  Loader2
} from "lucide-react";
import { apiClient, type ResolveContentResponse } from "@/lib/api-client";
import { verifyArticleSignature, type VerificationResult } from "@/lib/signature-verifier";
import { calculateReadingTime } from "@/lib/reading-time";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ThemeMode = "dark" | "light" | "cyber";

function EmbedReaderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cid = params.cid as string;

  const themeParam = searchParams.get("theme") as ThemeMode | null;
  const theme: ThemeMode = themeParam === "light" || themeParam === "cyber" ? themeParam : "dark";
  const isCompact = searchParams.get("compact") === "true";

  const [content, setContent] = useState<ResolveContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

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

      // Perform authentic client-side Ed25519 signature verification
      setIsVerifying(true);
      verifyArticleSignature(data)
        .then((res) => setVerificationResult(res))
        .catch((err) => console.error("Signature verification error:", err))
        .finally(() => setIsVerifying(false));
    } catch (err: any) {
      console.error("Embed content loading error:", err);
      setError("Failed to resolve article from decentralized transports.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "cid" | "key") => {
    navigator.clipboard.writeText(text);
    if (type === "cid") {
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
      toast.success("Multihash CID copied to clipboard");
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success("Ed25519 Public Key copied to clipboard");
    }
  };

  const plainExcerpt = useMemo(() => {
    if (!content?.content) return "";
    const stripped = content.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return stripped.length > 220 ? `${stripped.slice(0, 220)}...` : stripped;
  }, [content?.content]);

  const readingStats = useMemo(() => {
    return content?.content ? calculateReadingTime(content.content) : null;
  }, [content?.content]);

  const authorPubkey = content?.publisher?.pubkey || (content?.publisher as any)?.publicKey || "";
  const pubkeySnippet = authorPubkey
    ? `${authorPubkey.slice(0, 6)}...${authorPubkey.slice(-6)}`
    : "Anonymous";

  // Dynamic Theme Palette Definitions
  const themeStyles = useMemo(() => {
    switch (theme) {
      case "light":
        return {
          wrapper: "bg-white text-slate-900 border-slate-200",
          headerBg: "bg-slate-50/90 border-slate-200",
          brandText: "text-slate-900",
          prose: "prose-slate",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
          verifiedBadge: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
          unsignedBadge: "bg-slate-100 text-slate-600 border-slate-200",
          invalidBadge: "bg-rose-50 text-rose-700 border-rose-200",
          pillBg: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200",
          accentButton: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
          cardBorder: "border-slate-200 shadow-sm",
          mutedText: "text-slate-500",
          footerBorder: "border-slate-200 text-slate-500",
        };
      case "cyber":
        return {
          wrapper: "bg-[#04070e] text-[#e2f8ee] border-[#00ff9d]/30 font-sans",
          headerBg: "bg-[#070d18]/90 border-[#00ff9d]/20 backdrop-blur-md",
          brandText: "text-[#00ff9d] tracking-wider",
          prose: "prose-invert prose-emerald",
          badgeBg: "bg-[#061814] text-[#00ff9d] border-[#00ff9d]/30 font-mono",
          verifiedBadge: "bg-[#06241a] text-[#00ff9d] border-[#00ff9d]/50 shadow-[0_0_12px_rgba(0,255,157,0.2)] hover:bg-[#083527]",
          unsignedBadge: "bg-[#131b26] text-slate-400 border-slate-700 font-mono",
          invalidBadge: "bg-[#280c12] text-[#ff3366] border-[#ff3366]/40 shadow-[0_0_12px_rgba(255,51,102,0.2)]",
          pillBg: "bg-[#081322] hover:bg-[#0d1d33] text-[#7ee787] border-[#00ff9d]/30 font-mono",
          accentButton: "bg-[#00ff9d] hover:bg-[#2bfda7] text-[#04070e] font-semibold tracking-wide shadow-[0_0_15px_rgba(0,255,157,0.3)]",
          cardBorder: "border-[#00ff9d]/25 shadow-[0_0_20px_rgba(0,255,157,0.08)]",
          mutedText: "text-[#6ee7b7]/70",
          footerBorder: "border-[#00ff9d]/20 text-[#6ee7b7]/60",
        };
      case "dark":
      default:
        return {
          wrapper: "bg-[#0B0A0C] text-[#EEE7E1] border-[rgba(240,232,232,0.07)]",
          headerBg: "bg-[#141216]/90 border-[rgba(240,232,232,0.07)] backdrop-blur-md",
          brandText: "text-[#EEE7E1]",
          prose: "prose-invert",
          badgeBg: "bg-[#1C181D] text-[#A79E96] border-[rgba(240,232,232,0.07)]",
          verifiedBadge: "bg-[rgba(62,156,114,0.14)] text-[#3E9C72] border-[rgba(62,156,114,0.3)] hover:bg-[rgba(62,156,114,0.2)]",
          unsignedBadge: "bg-[#1C181D] text-[#A79E96] border-[rgba(240,232,232,0.07)]",
          invalidBadge: "bg-[rgba(214,92,74,0.14)] text-[#D65C4A] border-[rgba(214,92,74,0.3)]",
          pillBg: "bg-[#1C181D] hover:bg-[#262024] text-[#EEE7E1] border-[rgba(240,232,232,0.07)]",
          accentButton: "bg-[#7C2733] hover:bg-[#98333F] text-[#EEE7E1] shadow-sm",
          cardBorder: "border-[rgba(240,232,232,0.07)] shadow-sm",
          mutedText: "text-[#6F675F]",
          footerBorder: "border-[rgba(240,232,232,0.07)] text-[#A79E96]",
        };
    }
  }, [theme]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`w-full min-h-[320px] p-6 flex flex-col justify-center items-center ${themeStyles.wrapper}`}>
        <Loader2 className="w-8 h-8 animate-spin text-verified mb-3" />
        <p className={`text-sm ${themeStyles.mutedText} font-mono tracking-wide`}>
          Resolving CID from decentralized swarm...
        </p>
      </div>
    );
  }

  // Error fallback
  if (error || !content) {
    return (
      <div className={`w-full min-h-[260px] p-6 flex flex-col justify-center items-center text-center ${themeStyles.wrapper}`}>
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="font-semibold text-base mb-1">Failed to Load Article</h3>
        <p className={`text-xs max-w-md mb-4 ${themeStyles.mutedText}`}>{error || "Content unreachable."}</p>
        <button
          onClick={() => loadContent()}
          className={`px-4 py-1.5 text-xs rounded-md transition-colors ${themeStyles.accentButton}`}
        >
          Retry Resolve
        </button>
      </div>
    );
  }

  // Verification Badge Component
  const renderVerificationBadge = () => {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium cursor-pointer transition-all duration-200 select-none ${
                isVerifying
                  ? themeStyles.badgeBg
                  : verificationResult?.isValid
                  ? themeStyles.verifiedBadge
                  : verificationResult?.status === "unsigned"
                  ? themeStyles.unsignedBadge
                  : themeStyles.invalidBadge
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-verified" />
                  <span className="font-mono text-[11px]">Verifying...</span>
                </>
              ) : verificationResult?.isValid ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-verified shrink-0" />
                  <span className="font-mono text-[11px] font-semibold">Ed25519 Verified</span>
                  {verificationResult.latencyMs !== undefined && (
                    <span className="text-[10px] opacity-75 font-mono">
                      ({verificationResult.latencyMs}ms)
                    </span>
                  )}
                </>
              ) : verificationResult?.status === "unsigned" ? (
                <>
                  <Shield className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <span className="font-mono text-[11px]">Unsigned</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-error shrink-0" />
                  <span className="font-mono text-[11px]">Invalid Signature</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-[340px] p-3 text-xs bg-surface-elevated border-hairline text-primary shadow-2xl rounded-lg font-sans"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-hairline pb-1.5">
                <span className="font-semibold text-verified flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Client-Side In-Browser Proof
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {verificationResult?.latencyMs}ms
                </span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Cryptographically authenticated directly within your browser sandbox via WebCrypto. Zero trust in central servers.
              </p>
              {authorPubkey && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Ed25519 Sovereign Author Key:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(authorPubkey, "key");
                      }}
                      className="text-verified hover:opacity-80 flex items-center gap-1 font-mono"
                    >
                      {copiedKey ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      {copiedKey ? "Copied" : "Copy Key"}
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-primary bg-surface p-1.5 rounded border border-hairline break-all select-all">
                    {authorPubkey}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render Compact Card View
  if (isCompact) {
    return (
      <div className={`w-full p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${themeStyles.wrapper} ${themeStyles.cardBorder}`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-verified/10 border border-verified/30 text-verified">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-semibold ${themeStyles.brandText}`}>PressProtocol</span>
          </div>
          <div className="flex items-center gap-2">
            {renderVerificationBadge()}
          </div>
        </div>

        {/* Title & Excerpt */}
        <div className="space-y-1.5 mb-4">
          <h2 className="text-lg font-bold leading-snug line-clamp-2 tracking-tight">
            {content.title}
          </h2>
          {plainExcerpt && (
            <p className={`text-xs line-clamp-2 leading-relaxed ${themeStyles.mutedText}`}>
              {plainExcerpt}
            </p>
          )}
        </div>

        {/* Meta & Actions Bar */}
        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 border-inherit">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            {/* Copyable CID Button */}
            <button
              onClick={() => copyToClipboard(cid, "cid")}
              title="Copy Multihash CID"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors ${themeStyles.pillBg}`}
            >
              {copiedCid ? <Check className="w-3 h-3 text-verified" /> : <Copy className="w-3 h-3 opacity-60" />}
              <span>{cid.slice(0, 6)}...{cid.slice(-4)}</span>
            </button>

            {readingStats && (
              <span className={`hidden sm:inline-flex items-center gap-1 ${themeStyles.mutedText}`}>
                <Clock className="w-3 h-3" />
                {readingStats.formattedTime}
              </span>
            )}
          </div>

          {/* Deep link button */}
          <a
            href={`/read/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${themeStyles.accentButton}`}
          >
            <span>Read Sovereign Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Full Minimal Reader View
  return (
    <div className={`w-full min-h-screen flex flex-col justify-between ${themeStyles.wrapper}`}>
      {/* Zero-Chrome Header Bar */}
      <header className={`sticky top-0 z-30 w-full px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-3 ${themeStyles.headerBg}`}>
        {/* Brand & Author */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href={`/read/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-verified/10 border border-verified/30 flex items-center justify-center text-verified group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className={`text-sm font-bold tracking-tight hidden sm:inline ${themeStyles.brandText}`}>
              PressProtocol
            </span>
          </a>

          {/* Sovereign Author Pill */}
          <div className="flex items-center gap-1.5 text-xs truncate">
            <span className={themeStyles.mutedText}>by</span>
            <span className="font-mono text-xs font-medium truncate" title={authorPubkey}>
              {pubkeySnippet}
            </span>
          </div>
        </div>

        {/* Verification & CID Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {renderVerificationBadge()}

          {/* Copyable CID Pill */}
          <button
            onClick={() => copyToClipboard(cid, "cid")}
            title="Copy Multihash CID"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-colors ${themeStyles.pillBg}`}
          >
            {copiedCid ? <Check className="w-3 h-3 text-verified" /> : <Copy className="w-3 h-3 opacity-60" />}
            <span className="hidden md:inline">CID:</span>
            <span>{cid.slice(0, 5)}...{cid.slice(-4)}</span>
          </button>

          {/* Open full reader */}
          <a
            href={`/read/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Full Sovereign Reader"
            className={`p-1.5 rounded-md border text-xs transition-colors ${themeStyles.pillBg}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {content.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {readingStats && (
              <span className={`flex items-center gap-1 ${themeStyles.mutedText}`}>
                <Clock className="w-3.5 h-3.5" />
                {readingStats.formattedTime}
              </span>
            )}
            <span className={themeStyles.mutedText}>•</span>
            <time className={themeStyles.mutedText}>
              {new Date(content.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>

            {content.tags && content.tags.length > 0 && (
              <>
                <span className={themeStyles.mutedText}>•</span>
                <div className="flex flex-wrap gap-1.5">
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border ${themeStyles.badgeBg}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Formatted Article HTML Content */}
        <article
          className={`article-content prose max-w-none leading-relaxed ${themeStyles.prose}
                     prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-a:text-[#EEE7E1] hover:prose-a:text-[#98333F] hover:prose-a:underline
                     prose-img:rounded-xl prose-img:border prose-img:border-inherit
                     prose-code:font-mono prose-code:text-xs prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                     prose-pre:p-4 prose-pre:rounded-xl prose-pre:border prose-pre:border-inherit`}
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </main>

      {/* Sovereign Protocol Footer Attribution */}
      <footer className={`w-full py-4 px-6 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${themeStyles.footerBorder}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-verified" />
          <span className="font-mono">Decentralized Content // IPFS Multihash</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/read/${cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 font-medium"
          >
            <span>Read on PressProtocol</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-[#0B0A0C]" />}>
      <EmbedReaderContent />
    </Suspense>
  );
}
