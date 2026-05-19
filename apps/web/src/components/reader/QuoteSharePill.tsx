"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Twitter, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteSharePillProps {
  cid: string;
  articleTitle: string;
  authorName?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

export function QuoteSharePill({
  cid,
  articleTitle,
  authorName,
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
      if (text.length < 5) {
        setSelectedText("");
        setPosition(null);
        return;
      }

      // Ensure selection is inside article container
      const anchorNode = selection.anchorNode;
      if (containerRef?.current && anchorNode && !containerRef.current.contains(anchorNode)) {
        setSelectedText("");
        setPosition(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        setSelectedText(text);
        setPosition({
          top: rect.top + window.scrollY - 44, // Position 44px above selection
          left: rect.left + window.scrollX + rect.width / 2, // Centered horizontally
        });
      } catch {
        // Ignore selection bounds error
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [containerRef]);

  if (!selectedText || !position) return null;

  const articleUrl = typeof window !== "undefined" ? window.location.href : `https://pressprotocol.com/read/${cid}`;
  const citation = `"${selectedText}"\n\n— From "${articleTitle}"${authorName ? ` by ${authorName}` : ""}\nVerified via PressProtocol (${cid.slice(0, 8)}...)\n${articleUrl}`;

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.success("Quote & verification citation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const tweetText = `"${selectedText.slice(0, 180)}${selectedText.length > 180 ? "..." : ""}"\n\nVerified on @pressprotocol: ${articleUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWarpcast = () => {
    const castText = `"${selectedText.slice(0, 220)}${selectedText.length > 220 ? "..." : ""}"\n\nVerified cryptographic publication:`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(articleUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={pillRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="fixed z-50 flex items-center gap-1 p-1 bg-zinc-950/95 text-zinc-100 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        onClick={handleCopyQuote}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full hover:bg-zinc-800 text-zinc-200 transition-colors"
        title="Copy Quote with Cryptographic Verification Link"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400" />
        ) : (
          <Copy className="h-3 w-3 text-primary" />
        )}
        <span>{copied ? "Copied!" : "Quote & Verify"}</span>
      </button>

      <div className="h-3.5 w-px bg-zinc-800" />

      <button
        onClick={handleShareTwitter}
        className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
        title="Share quote to X / Twitter"
      >
        <Twitter className="h-3 w-3" />
      </button>

      <button
        onClick={handleShareWarpcast}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full hover:bg-zinc-800 text-purple-300 hover:text-purple-200 transition-colors"
        title="Share quote to Warpcast / Farcaster"
      >
        <Share2 className="h-3 w-3" />
        <span className="text-[10px]">Cast</span>
      </button>
    </div>
  );
}
