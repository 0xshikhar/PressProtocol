"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  Home,
  PenLine,
  BookOpen,
  Search,
  Sparkles,
  Clipboard,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotFound() {
  const router = useRouter();
  const [cidInput, setCidInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResolve = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    let cleaned = (cidInput || "").trim();
    if (!cleaned) {
      setErrorMessage("Please enter a cryptographic Content Identifier (CID).");
      return;
    }

    // Gracefully sanitize common URI schemes, query params, and gateway prefixes
    try {
      cleaned = cleaned.replace(/^ipfs:\/\//i, "");
      cleaned = cleaned.replace(/^https?:\/\/[^/]+\/ipfs\//i, "");
      cleaned = cleaned.replace(/^https?:\/\/[^/]+\/read\//i, "");
      cleaned = cleaned.split("?")[0].split("#")[0].trim();

      // CID length validation heuristic (CIDv0 Qm... is 46 chars, CIDv1 baf... is 50+ chars)
      if (cleaned.length < 10) {
        setErrorMessage("Identifier appears too short to be a valid IPFS CID.");
        return;
      }

      router.push(`/read/${encodeURIComponent(cleaned)}`);
    } catch {
      setErrorMessage("Unable to parse CID format. Please check the entered value.");
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && typeof text === "string") {
          setCidInput(text.trim());
          setErrorMessage("");
        }
      }
    } catch {
      // Gracefully ignore clipboard permissions failure
    }
  };

  const sampleCid = "bafkreibuy3ugwwg6eo3arvxww2modmxsthtwdeb6donhdiezs4lt4d2za4";

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-text-primary selection:bg-accent/40 selection:text-text-primary overflow-hidden">
      {/* Ambient background glows - Editorial Press Burgundy */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[380px] bg-accent/15 blur-[120px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-verified/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl mx-auto text-center z-10">
        {/* Terminal Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-mono font-medium rounded-pill bg-error/10 text-error-bright border border-error/20 shadow-[0_0_20px_rgba(214,92,74,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-error-bright animate-pulse" />
          <span>404 // SOVEREIGN_ROUTE_NOT_FOUND</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-editorial font-normal text-text-primary tracking-tight leading-tight mb-4">
          Sovereign Route Not Found
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed mb-8">
          The requested route or dispatch could not be located across local peers or gateways.
          If you have a cryptographic Content Identifier (CID), resolve it directly below:
        </p>

        {/* Interactive CID Resolver Box */}
        <div className="w-full max-w-xl mx-auto mb-6 bg-surface/90 backdrop-blur-md border border-hairline rounded-raised p-3 sm:p-4 shadow-raised text-left">
          <form onSubmit={handleResolve} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                type="text"
                value={cidInput}
                onChange={(e) => {
                  setCidInput(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Paste article CID (bafy... or Qm...)"
                className="pl-9 pr-10 bg-canvas border-hairline text-sm font-mono text-text-primary placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-focus focus-visible:border-focus h-11 rounded-card"
              />
              <button
                type="button"
                onClick={handlePasteClipboard}
                title="Paste from clipboard"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button
              type="submit"
              className="h-11 px-5 bg-accent hover:bg-accent-hover text-text-primary font-medium transition-all shadow-[0_0_15px_rgba(124,39,51,0.3)] shrink-0 gap-2 rounded-card"
            >
              <span>Resolve</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {errorMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-error-bright">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Sample Trigger */}
          <div className="mt-3 pt-3 border-t border-hairline flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
            <span className="font-mono text-[11px]">Need an example?</span>
            <button
              type="button"
              onClick={() => {
                setCidInput(sampleCid);
                setErrorMessage("");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              <Sparkles className="w-3 h-3 text-accent-ribbon" />
              <span className="truncate max-w-[200px] sm:max-w-[260px]">{sampleCid.slice(0, 16)}...{sampleCid.slice(-8)}</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Rails */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/60 hover:bg-elevated text-text-primary hover:text-text-primary h-10 px-4 gap-2 rounded-card"
          >
            <Link href="/">
              <Home className="w-4 h-4 text-text-secondary" />
              <span>Gateway Home</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/60 hover:bg-elevated text-text-primary hover:text-text-primary h-10 px-4 gap-2 rounded-card"
          >
            <Link href="/explore">
              <Compass className="w-4 h-4 text-text-secondary" />
              <span>Explore Dispatches</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/60 hover:bg-elevated text-text-primary hover:text-text-primary h-10 px-4 gap-2 rounded-card"
          >
            <Link href="/write">
              <PenLine className="w-4 h-4 text-text-secondary" />
              <span>Publish Article</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-hairline bg-surface/60 hover:bg-elevated text-text-primary hover:text-text-primary h-10 px-4 gap-2 rounded-card"
          >
            <Link href="/docs">
              <BookOpen className="w-4 h-4 text-text-secondary" />
              <span>Protocol Specs</span>
            </Link>
          </Button>
        </div>

        {/* Protocol Invariant Note */}
        <p className="mt-12 text-xs font-mono text-text-muted tracking-wider uppercase">
          Autonomous • Cryptographically Verified • Censorship-Resistant
        </p>
      </div>
    </div>
  );
}
