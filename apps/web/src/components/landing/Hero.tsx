"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  Lock,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cycleWords = ["silenced", "censored", "tampered", "seized", "altered"];

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split("");
  const STAGGER = 40;
  const DURATION = 450;
  const GRADIENT_HOLD = STAGGER * letters.length + DURATION + 150;

  const [letterStates, setLetterStates] = useState<{ opacity: number; blur: number }[]>(
    letters.map(() => ({ opacity: 0, blur: 16 }))
  );
  const [showGradient, setShowGradient] = useState(true);
  const framesRef = useRef<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    framesRef.current.forEach(cancelAnimationFrame);
    timersRef.current.forEach(clearTimeout);
    framesRef.current = [];
    timersRef.current = [];

    setLetterStates(letters.map(() => ({ opacity: 0, blur: 16 })));
    setShowGradient(true);

    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setLetterStates((prev) => {
            const next = [...prev];
            next[i] = { opacity: eased, blur: 16 * (1 - eased) };
            return next;
          });
          if (progress < 1) {
            const id = requestAnimationFrame(tick);
            framesRef.current.push(id);
          }
        };
        const id = requestAnimationFrame(tick);
        framesRef.current.push(id);
      }, i * STAGGER);
      timersRef.current.push(t);
    });

    const gt = setTimeout(() => setShowGradient(false), GRADIENT_HOLD);
    timersRef.current.push(gt);

    return () => {
      framesRef.current.forEach(cancelAnimationFrame);
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const gradientColors = ["#EEE7E1", "#D6CBC1", "#A79E96", "#EEE7E1"];

  return (
    <span className="inline-block">
      {letters.map((char, i) => {
        const colorIndex = (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1);
        const lower = Math.floor(colorIndex);
        const upper = Math.min(lower + 1, gradientColors.length - 1);
        const t = colorIndex - lower;

        const hex2rgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return [r, g, b];
        };
        const [r1, g1, b1] = hex2rgb(gradientColors[lower]);
        const [r2, g2, b2] = hex2rgb(gradientColors[upper]);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: letterStates[i]?.opacity ?? 0,
              filter: `blur(${letterStates[i]?.blur ?? 16}px)`,
              color: showGradient ? `rgb(${r},${g},${b})` : "#EEE7E1",
              transition: "color 0.4s ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isCensored, setIsCensored] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[88vh] lg:min-h-screen flex flex-col justify-center overflow-hidden bg-canvas pt-24 pb-16">
      {/* Subtle Architectural Hairline Grid */}
      <div className="absolute inset-0 z-0 hairline-grid opacity-10 pointer-events-none" />

      {/* Atmospheric Subtle Burgundy Vignette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_top,_rgba(124,39,51,0.09),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-6 lg:px-12 my-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-14 items-center">
          {/* Left Column: Editorial Manifesto & Action */}
          <div className="lg:col-span-7">
            {/* Single Restrained Eyebrow: Category Descriptor */}
            <div
              className={cn(
                "flex items-center gap-2 mb-6 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="text-[11px] font-mono tracking-widest text-secondary uppercase font-medium">
                SOVEREIGN PUBLISHING INFRASTRUCTURE
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className={cn(
                "font-hero text-hero tracking-tight leading-[1.0] sm:leading-[0.98] text-primary mb-4 transition-all duration-1000",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <span className="block">Publish once.</span>
              <span className="block text-primary/95">Keep your work accessible.</span>
            </h1>

            {/* Supporting Brand Thesis Line */}
            <div
              className={cn(
                "text-sm sm:text-base font-sans font-medium text-primary/90 mb-4 transition-all duration-1000 delay-100",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              Independent publishing, built to endure.
            </div>

            {/* Subhead with Strict Reading Measure */}
            <p
              className={cn(
                "text-base sm:text-lg text-secondary font-light leading-relaxed max-w-xl mb-8 measure-lead transition-all duration-1000 delay-150",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              PressProtocol gives writers and publishers a private, verifiable way to publish and preserve their work - without depending on a single platform, host, or identity provider.
            </p>

            {/* Dual Clean CTAs */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8 transition-all duration-1000 delay-200",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <Link href="/write" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium h-12 px-7 rounded-[6px] text-sm shadow-sm transition-all flex items-center justify-center gap-2 group border border-[rgba(240,232,232,0.12)]"
                >
                  <span>Start Writing &rarr;</span>
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-6 rounded-[6px] text-sm text-secondary hover:text-primary border-hairline bg-transparent hover:bg-overlay transition-all font-mono group"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Hero Integration Proof (Clickable Workflow Buttons) */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono text-muted mb-7 pt-1 transition-all duration-1000 delay-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="text-secondary font-medium mr-1 text-[11px] shrink-0">
                Bring your existing workflow with you:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href="/downloads"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  WordPress
                </Link>
                <Link
                  href="/import"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  Medium
                </Link>
                <Link
                  href="/import"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  Ghost
                </Link>
                <Link
                  href="/import/notion"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  Notion
                </Link>
                <Link
                  href="/downloads"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  Obsidian
                </Link>
                <Link
                  href="/write"
                  className="px-2.5 py-1 rounded-full border border-hairline bg-surface/80 hover:bg-surface-raised hover:border-focus text-secondary hover:text-primary transition-all text-[11px] font-mono shadow-xs"
                >
                  Markdown
                </Link>
              </div>
            </div>

            {/* Quiet Trust Markers */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secondary font-mono transition-all duration-1000 delay-350",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted" />
                No account required to read
              </span>
              <span className="text-muted/40">&bull;</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-muted" />
                Client-side signing
              </span>
              <span className="text-muted/40">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-muted" />
                Standard web access
              </span>
            </div>
          </div>

          {/* Right Column: User- & Writer-Focused Living Dispatch Reader Preview */}
          <div
            className={cn(
              "lg:col-span-5 transition-all duration-1000 delay-250",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="relative rounded-[8px] border border-[rgba(240,232,232,0.12)] bg-elevated p-6 shadow-[0_12px_28px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Card Header: Quiet Verification Label & Explicit Example Badge */}
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-verified" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-medium">
                    Verified Publication Preview
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded-[4px] border border-hairline bg-surface text-muted">
                    Example publication
                  </span>
                  <span className="text-muted">Standard Web</span>
                </div>
              </div>

              {/* Mode Toggle: Reader View vs. Cryptographic Proof */}
              <div className="flex items-center gap-2 mb-4 p-1 rounded-[6px] bg-canvas/80 border border-hairline">
                <button
                  onClick={() => setIsCensored(false)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-mono rounded-[4px] transition-all",
                    !isCensored
                      ? "bg-surface text-primary font-medium shadow-xs border border-focus"
                      : "text-muted hover:text-secondary"
                  )}
                >
                  Reader Experience
                </button>
                <button
                  onClick={() => setIsCensored(true)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-mono rounded-[4px] transition-all",
                    isCensored
                      ? "bg-surface text-primary font-medium shadow-xs border border-focus"
                      : "text-muted hover:text-secondary"
                  )}
                >
                  Verifiable Proof
                </button>
              </div>

              {/* Verified Dispatch Article Preview */}
              {!isCensored ? (
                <div className="space-y-3 mb-5">
                  {/* Human Journalist Byline */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-verified" />
                      <span className="font-medium">Maya Lindqvist (@maya_archive)</span>
                    </span>
                    <span className="text-muted">Essayist &bull; 7 min read</span>
                  </div>

                  {/* Editorial Card Title */}
                  <h3 className="font-sans text-xl sm:text-2xl text-primary font-semibold leading-snug tracking-tight">
                    The Case for the Durable Essay
                  </h3>

                  {/* Excerpt */}
                  <p className="font-sans text-sm text-secondary leading-relaxed font-light line-clamp-3">
                    When independent writers rely exclusively on centralized algorithms, their life&apos;s work remains hostage to corporate acquisitions, sudden terms of service changes, and unappealable account flags. By cryptographically signing and distributing over sovereign peer networks, an essay remains durable and accessible - published directly to readers without intermediary permission.
                  </p>

                  {/* Clean Reader Assurances */}
                  <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted">
                    <span className="text-secondary">&bull; Direct link shareable anywhere</span>
                    <span className="text-secondary">&bull; Zero tracking cookies</span>
                    <span className="text-secondary">&bull; Free from paywalls</span>
                  </div>
                </div>
              ) : (
                /* Cryptographic Proof Inspector View */
                <div className="space-y-3 mb-5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-hairline">
                    <span className="text-muted">Attestation Standard</span>
                    <span className="text-primary font-medium">RFC 8032 Ed25519 WebCrypto</span>
                  </div>

                  <div className="space-y-2 py-1 text-[11px]">
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Publisher Key</span>
                      <span className="text-primary truncate block">ed25519:8f9a2e7c41b09e8f...92d1 (Signed in Browser)</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Immutable Content Address</span>
                      <span className="text-verified truncate block">bafybeic52i4f7626vkyz244q56w7g63... (CIDv1)</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Preservation Swarm</span>
                      <span className="text-secondary block">Pinned across 3 independent edge daemons</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[4px] bg-canvas border border-hairline text-[10px] text-muted leading-relaxed">
                    Readers verify this signature locally in their browser. No server can alter a single sentence without invalidating the mathematical proof.
                  </div>
                </div>
              )}

              {/* Bottom Card Action Link */}
              <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Public Network Swarm</span>
                <Link
                  href="/explorer"
                  className="text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <span>Explore Network Archive</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
