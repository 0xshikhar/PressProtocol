"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CidChipProps {
  cid: string;
  truncate?: boolean;
  prefixLen?: number;
  suffixLen?: number;
  showCopy?: boolean;
  showExplorerLink?: boolean;
  className?: string;
}

export function CidChip({
  cid,
  truncate = true,
  prefixLen = 8,
  suffixLen = 6,
  showCopy = true,
  showExplorerLink = false,
  className,
}: CidChipProps) {
  const [copied, setCopied] = useState(false);

  if (!cid) return null;

  const displayCid =
    truncate && cid.length > prefixLen + suffixLen + 3
      ? `${cid.slice(0, prefixLen)}...${cid.slice(-suffixLen)}`
      : cid;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={showCopy ? handleCopy : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] font-mono text-xs",
        "bg-[var(--bg-overlay)] border border-[var(--border-hairline)] hover:border-[var(--border-focus)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        "shadow-sm transition-all select-none cursor-pointer group",
        className
      )}
      title={`IPFS CID: ${cid} (Click to copy)`}
    >
      <span className="text-[var(--text-muted)] text-[10px] font-sans uppercase tracking-wider">CID</span>
      <span className="tracking-wide font-medium">{displayCid}</span>

      {showCopy && (
        <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors ml-0.5">
          {copied ? (
            <Check className="h-3 w-3 text-[var(--verified-bright)]" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </span>
      )}

      {showExplorerLink && (
        <a
          href={`https://ipfs.io/ipfs/${cid}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-0.5"
          title="Open in IPFS Gateway"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
