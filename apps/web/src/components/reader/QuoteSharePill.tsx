"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Twitter, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteSharePillProps {
  cid: string;
  articleTitle: string;
  authorName?: string;
  isVerified?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Floating contextual action pill that appears when a user selects text within an article.
 * Enables 1-click citation copying, cryptographic quote card previews, and social sharing
 * to X/Twitter and Warpcast with verified attribution links.
 *
 * @param props - Component properties including article CID, title, author, verification status, and container ref.
 * @returns Floating action pill positioned above the highlighted selection, or null if nothing is selected.
 */
export function QuoteSharePill({
  cid,
  articleTitle,
  authorName,
  isVerified = false,
  containerRef,
}: QuoteSharePillProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectedText("");
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setSelectedText("");
        setPosition(null);
        return;
      }

      // Ensure selection is inside article container if specified
      if (containerRef?.current) {
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        if (
          (anchorNode && !containerRef.current.contains(anchorNode)) ||
          (focusNode && !containerRef.current.contains(focusNode))
        ) {
          setSelectedText("");
          setPosition(null);
          return;
        }
      }

      try {
        if (selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        setSelectedText(text);
        // Fixed positioning relative to the viewport (not document coordinates)
        const top = rect.top < 60 ? rect.bottom + 10 : rect.top - 46;
        const left = Math.max(160, Math.min(window.innerWidth - 160, rect.left + rect.width / 2));
        setPosition({ top, left });
      } catch {
        // Ignore selection bounds error
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleSelectionChange, { passive: true });
    window.addEventListener("resize", handleSelectionChange, { passive: true });
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleSelectionChange);
      window.removeEventListener("resize", handleSelectionChange);
    };
  }, [containerRef]);

  if (!selectedText || !position) return null;

  const rawOrigin = typeof window !== "undefined" ? window.location.origin : "https://pressprotocol.com";
  const appOrigin = rawOrigin.includes("localhost") ? "https://pressprotocol.com" : rawOrigin;
  const cleanQuote = selectedText.trim();
  
  // Normalize smart quotes and whitespace for clean, compact URL parameter
  const sanitizedForUrl = cleanQuote
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/\s+/g, " ");

  // Retain compact quote parameter so metadata generates the dynamic quote card image on social previews
  const urlSnippet =
    sanitizedForUrl.length > 120
      ? `${sanitizedForUrl.slice(0, 117).trim()}...`
      : sanitizedForUrl;
  const quoteParam = encodeURIComponent(urlSnippet).replace(/%20/g, "+");
  const quoteShareUrl = `${appOrigin}/read/${cid}?q=${quoteParam}`;

  // Twitter shortens all URLs to 23 chars via t.co.
  // Overhead: quotes (2) + "\n\nVerified on @pressprotocol:\n" (30) + URL (23) = 55 chars.
  // Out of 280 chars, this leaves 225 chars. 215 chars allows 3-4 full lines of quote with safety buffer.
  const tweetQuote =
    cleanQuote.length > 215
      ? cleanQuote.slice(0, 212).replace(/\s+\S*$/, "") + "..."
      : cleanQuote;

  const citationLabel = isVerified ? "Verified on PressProtocol" : "Preserved on PressProtocol";
  const tweetLabel = isVerified ? "Verified on @pressprotocol" : "Preserved on @pressprotocol";
  const castLabel = isVerified ? "Verified on PressProtocol:" : "Preserved on PressProtocol:";

  const citation = `"${cleanQuote}"\n\n— From "${articleTitle}"${authorName ? ` by ${authorName}` : ""}\n${citationLabel}: ${quoteShareUrl}`;

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.success(
      isVerified
        ? "Quote & verification citation copied to clipboard"
        : "Quote & citation copied to clipboard"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const tweetText = `"${tweetQuote}"\n\n${tweetLabel}:\n${quoteShareUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWarpcast = () => {
    const castQuote =
      cleanQuote.length > 230
        ? cleanQuote.slice(0, 227).replace(/\s+\S*$/, "") + "..."
        : cleanQuote;
    const castText = `"${castQuote}"\n\n${castLabel}`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(quoteShareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenCard = () => {
    window.open(`${appOrigin}/api/og/${cid}?q=${quoteParam}`, "_blank");
  };

  return (
    <div
      ref={pillRef}
      onMouseDown={(e) => {
        // Prevent clicking inside the pill from clearing the user's active text selection
        e.preventDefault();
      }}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="fixed z-50 flex items-center gap-1 p-1 bg-surface-elevated/95 text-primary backdrop-blur-xl border border-hairline rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* 1. Copy Quote */}
      <button
        type="button"
        onClick={handleCopyQuote}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full hover:bg-overlay text-primary transition-colors"
        title="Copy Quote with cryptographic verification link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-verified" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-primary" />
        )}
        <span>{copied ? "Copied!" : "Copy Quote"}</span>
      </button>

      <div className="h-3.5 w-px bg-white/10" />

      {/* 2. Tweet */}
      <button
        type="button"
        onClick={handleShareTwitter}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full hover:bg-overlay text-secondary hover:text-primary transition-colors"
        title="Share quote card to X / Twitter"
      >
        <Twitter className="h-3.5 w-3.5" />
        <span>Tweet</span>
      </button>

      {/* 3. Warpcast */}
      <button
        type="button"
        onClick={handleShareWarpcast}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full hover:bg-overlay text-anonymous hover:opacity-80 transition-colors"
        title="Share quote to Warpcast / Farcaster"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Cast</span>
      </button>

      <div className="h-3.5 w-px bg-white/10" />

      {/* 4. Quote Card */}
      <button
        type="button"
        onClick={handleOpenCard}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full hover:bg-overlay text-muted hover:text-primary transition-colors font-mono"
        title="Open cryptographic quote card image in new tab"
      >
        <span>Card</span>
      </button>
    </div>
  );
}
