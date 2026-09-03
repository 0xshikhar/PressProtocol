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
  showPulse = true,
  className,
}: MirrorHealthDotProps) {
  const statusColors = {
    healthy: {
      dot: "bg-emerald-400",
      ping: "bg-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
    },
    degraded: {
      dot: "bg-amber-400",
      ping: "bg-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
    },
    down: {
      dot: "bg-red-400",
      ping: "bg-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-300",
    },
    syncing: {
      dot: "bg-cyan-400",
      ping: "bg-cyan-400",
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/10",
      text: "text-cyan-300",
    },
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md font-mono text-xs border select-none",
        statusColors.bg,
        statusColors.border,
        statusColors.text,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && status === "healthy" && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              statusColors.ping
            )}
          />
        )}
        <span
          className={cn("relative inline-flex rounded-full h-2 w-2", statusColors.dot)}
        />
      </span>

      {label && <span className="text-zinc-300 font-sans text-xs">{label}</span>}

      {latencyMs !== undefined && (
        <span className="text-zinc-400 text-[11px] font-mono">
          {latencyMs}ms
        </span>
      )}
    </div>
  );
}
