"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Home,
  Compass,
  AlertTriangle,
  Terminal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    // Safely log exception to client telemetry
    try {
      console.error("PressProtocol Client Error Boundary caught:", error);
    } catch {
      // Safe fallback
    }
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";
  const errorMessage = error?.message || "An unexpected circuit anomaly interrupted the operation.";

  const handleRetry = () => {
    try {
      reset();
    } catch (err) {
      console.error("Failed to execute error reset:", err);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-text-primary selection:bg-accent/40 selection:text-text-primary overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[380px] bg-error/15 blur-[130px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-accent/15 blur-[150px] rounded-full"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl mx-auto text-center z-10">
        {/* Terminal Error Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-mono font-medium rounded-pill bg-error/10 text-error-bright border border-error/20 shadow-[0_0_20px_rgba(214,92,74,0.15)]">
          <AlertTriangle className="w-3.5 h-3.5 text-error-bright" />
          <span>500 // CIRCUIT_EXECUTION_FAULT</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial font-normal text-text-primary tracking-tight leading-tight mb-4">
          Decentralized Pipeline Disrupted
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed mb-8">
          A client-side execution anomaly occurred while communicating with sovereign nodes or rendering assets.
          Cryptographic guarantees remain intact and no publisher private keys were compromised.
        </p>

        {/* Incident Digest Card (Non-Leaking) */}
        {error?.digest && (
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-card bg-surface border border-hairline text-xs font-mono text-text-muted">
            <Terminal className="w-3.5 h-3.5 text-text-secondary" />
            <span>Incident Digest:</span>
            <span className="text-text-primary">{error.digest}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Button
            onClick={handleRetry}
            className="h-11 px-6 bg-accent hover:bg-accent-hover text-text-primary font-medium transition-all shadow-[0_0_20px_rgba(124,39,51,0.3)] gap-2 rounded-card"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Transmission</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/80 hover:bg-elevated text-text-primary hover:text-text-primary h-11 px-5 gap-2 rounded-card"
          >
            <Link href="/">
              <Home className="w-4 h-4 text-text-secondary" />
              <span>Gateway Home</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/80 hover:bg-elevated text-text-primary hover:text-text-primary h-11 px-5 gap-2 rounded-card"
          >
            <Link href="/explore">
              <Compass className="w-4 h-4 text-text-secondary" />
              <span>Explore Dispatches</span>
            </Link>
          </Button>
        </div>

        {/* Technical Diagnostics (Development Mode or Expandable) */}
        {(isDev || Boolean(error?.message)) && (
          <div className="w-full text-left bg-surface/90 border border-hairline rounded-raised overflow-hidden mb-8">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-error-bright" />
                <span>Diagnostic Information</span>
              </span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="px-4 pb-4 pt-1 border-t border-hairline text-xs font-mono">
                <div className="p-3 bg-canvas rounded-card text-error-bright break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {errorMessage}
                </div>
                {error?.stack && isDev && (
                  <div className="mt-2 p-3 bg-canvas/50 rounded-card text-text-muted text-[11px] break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {error.stack}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Direct Link to Help & GitHub Issues */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-text-muted">
          <Link
            href="/docs"
            className="hover:text-text-primary transition-colors underline-offset-4 hover:underline"
          >
            System Documentation
          </Link>
          <span>•</span>
          <a
            href="https://github.com/0xshikhar/PressProtocol/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-text-primary transition-colors underline-offset-4 hover:underline"
          >
            <span>Report Issue</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
