"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MirrorHealthDotProps {
  label?: string;
  status?: "healthy" | "degraded" | "down" | "syncing";
  latencyMs?: number;
  showPulse?: boolean;
  className?: string;
}

export function MirrorHealthDot({
  label,
  status = "healthy",
  latencyMs,
  className,
}: MirrorHealthDotProps) {
  const statusColors = {
    healthy: {
      dot: "bg-[var(--verified-bright)]",
      border: "border-[var(--verified)]/30",
      bg: "bg-[var(--verified-tint)]",
      text: "text-[var(--verified-bright)]",
    },
    degraded: {
      dot: "bg-[var(--warning-bright)]",
      border: "border-[var(--warning)]/30",
      bg: "bg-[var(--warning-tint)]",
      text: "text-[var(--warning-bright)]",
    },
    down: {
      dot: "bg-[var(--error-bright)]",
      border: "border-[var(--error)]/30",
      bg: "bg-[var(--error-tint)]",
      text: "text-[var(--error-bright)]",
    },
    syncing: {
      dot: "bg-[var(--anonymous-bright)]",
      border: "border-[var(--anonymous)]/30",
      bg: "bg-[var(--anonymous-tint)]",
      text: "text-[var(--anonymous-bright)]",
    },
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] font-mono text-xs border select-none",
        statusColors.bg,
        statusColors.border,
        statusColors.text,
        className
      )}
    >
      <span className="flex h-2 w-2 items-center justify-center">
        <span
          className={cn("inline-flex rounded-full h-2 w-2", statusColors.dot)}
        />
      </span>

      {label && <span className="text-[var(--text-primary)] font-sans text-xs">{label}</span>}

      {latencyMs !== undefined && (
        <span className="text-[var(--text-muted)] text-[11px] font-mono">
          {latencyMs}ms
        </span>
      )}
    </div>
  );
}
