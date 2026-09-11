"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Key, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignatureBadgeProps {
  publicKey?: string;
  verified?: boolean;
  algorithm?: "ed25519" | "secp256k1" | "anon";
  compact?: boolean;
  className?: string;
}

export function SignatureBadge({
  publicKey,
  verified = true,
  algorithm = "ed25519",
  compact = false,
  className,
}: SignatureBadgeProps) {
  const [copied, setCopied] = useState(false);

  const displayKey = publicKey
    ? publicKey.length > 16
      ? `${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`
      : publicKey
    : null;

  const handleCopy = (e: React.MouseEvent) => {
    if (!publicKey) return;
    e.stopPropagation();
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!verified) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-mono text-[11px]",
          "bg-[var(--warning-tint)] border border-[var(--warning)]/30 text-[var(--warning-bright)]",
          className
        )}
      >
        <ShieldAlert className="h-3 w-3 text-[var(--warning-bright)]" />
        <span>Unverified</span>
      </div>
    );
  }

  return (
    <div
      onClick={publicKey ? handleCopy : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-mono text-[11px]",
        "bg-[var(--verified-tint)] border border-[var(--verified)]/30 text-[var(--verified-bright)]",
        "shadow-sm select-none transition-all",
        publicKey ? "cursor-pointer hover:border-[var(--verified)]/50 hover:bg-[var(--verified-tint)]/80" : "",
        className
      )}
      title={publicKey ? `Public Key: ${publicKey} (Click to copy)` : "Cryptographically Signed"}
    >
      <ShieldCheck className="h-3 w-3 text-[var(--verified-bright)]" />
      <span className="font-medium uppercase text-[10px] tracking-wider text-[var(--verified-bright)]">
        {algorithm}
      </span>
      <span className="text-[var(--text-primary)]">Verified</span>

      {!compact && displayKey && (
        <span className="text-[var(--text-secondary)] border-l border-[var(--verified)]/30 pl-1.5 ml-0.5 text-[10px]">
          {displayKey}
        </span>
      )}

      {publicKey && !compact && (
        <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-0.5">
          {copied ? <Check className="h-2.5 w-2.5 text-[var(--verified-bright)]" /> : <Copy className="h-2.5 w-2.5" />}
        </span>
      )}
    </div>
  );
}
