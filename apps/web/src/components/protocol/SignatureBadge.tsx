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
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px]",
          "bg-amber-500/10 border border-amber-500/20 text-amber-300",
          className
        )}
      >
        <ShieldAlert className="h-3 w-3 text-amber-400" />
        <span>Unverified</span>
      </div>
    );
  }

  return (
    <div
      onClick={publicKey ? handleCopy : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px]",
        "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300",
        "shadow-sm select-none transition-all",
        publicKey ? "cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/15" : "",
        className
      )}
      title={publicKey ? `Public Key: ${publicKey} (Click to copy)` : "Cryptographically Signed"}
    >
      <ShieldCheck className="h-3 w-3 text-emerald-400" />
      <span className="font-semibold uppercase text-[10px] tracking-wider text-emerald-400/90">
        {algorithm}
      </span>
      <span className="text-emerald-200">✓ Verified</span>

      {!compact && displayKey && (
        <span className="text-emerald-400/70 border-l border-emerald-500/30 pl-1.5 ml-0.5 text-[10px]">
          {displayKey}
        </span>
      )}

      {publicKey && !compact && (
        <span className="text-emerald-400/60 ml-0.5">
          {copied ? <Check className="h-2.5 w-2.5 text-emerald-300" /> : <Copy className="h-2.5 w-2.5" />}
        </span>
      )}
    </div>
  );
}
