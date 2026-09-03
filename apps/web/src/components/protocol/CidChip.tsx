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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs",
        "bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/30 text-cyan-300/90 hover:text-cyan-200",
        "shadow-sm transition-all select-none cursor-pointer group",
        className
      )}
      title={`IPFS CID: ${cid} (Click to copy)`}
    >
      <span className="text-zinc-500 text-[10px] font-sans uppercase tracking-wider">CID</span>
      <span className="tracking-wide font-medium">{displayCid}</span>

      {showCopy && (
        <span className="text-zinc-500 group-hover:text-cyan-300 transition-colors ml-0.5">
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
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
          className="text-zinc-500 hover:text-cyan-300 ml-0.5"
          title="Open in IPFS Gateway"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
