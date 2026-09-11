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
            {/* Single Restrained Eyebrow */}
            <div
              className={cn(
                "flex items-center gap-2 mb-6 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="text-[11px] font-mono tracking-widest text-muted uppercase">
                Sovereign Publishing Infrastructure
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className={cn(
                "font-hero text-hero tracking-tight leading-[0.98] sm:leading-[0.95] text-primary mb-6 transition-all duration-1000",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <span className="block">Publish content that</span>
              <span className="block text-primary/95">
                cannot be{" "}
                <span className="relative inline-block font-hero text-primary">
                  <BlurWord word={cycleWords[wordIndex]} trigger={wordIndex} />
                </span>
                .
              </span>
            </h1>

            {/* Subhead: "Infrastructure" per user instruction with Strict Reading Measure */}
            <p
              className={cn(
                "text-base sm:text-lg text-secondary font-light leading-relaxed max-w-xl mb-8 measure-lead transition-all duration-1000 delay-150",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              The open, censorship-resistant infrastructure for investigative journalists, whistleblowers, and independent writers. Ingest from Substack, Ghost, or RSS in one click. Attest with in-browser digital signatures and distribute across IPFS and Tor.
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
                  <span>Start Writing Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/import" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-6 rounded-[6px] text-sm text-secondary hover:text-primary border-hairline bg-transparent hover:bg-overlay transition-all font-mono group"
                >
                  <UploadCloud className="w-4 h-4 mr-2 text-muted group-hover:text-primary transition-colors" />
                  Import article
                </Button>
              </Link>
            </div>

            {/* Clean Single-Row Ecosystem Strip */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 text-xs font-mono text-muted mb-8 pt-1 transition-all duration-1000 delay-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="text-secondary uppercase tracking-wider text-[11px] font-medium mr-1">
                Publish from:
              </span>
              <Link href="/import" className="text-secondary hover:text-primary transition-colors">Substack</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/import" className="text-secondary hover:text-primary transition-colors">Ghost</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/import" className="text-secondary hover:text-primary transition-colors">Medium</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/import/notion" className="text-secondary hover:text-primary transition-colors">Notion</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/import" className="text-secondary hover:text-primary transition-colors">RSS</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/downloads" className="text-secondary hover:text-primary transition-colors">WordPress Plugin</Link>
              <span className="text-muted/40">&bull;</span>
              <Link href="/downloads" className="text-secondary hover:text-primary transition-colors">Obsidian Plugin</Link>
            </div>

            {/* Quiet Trust Markers: Distinct non-repetitive guarantees */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secondary font-mono transition-all duration-1000 delay-350",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted" />
                No accounts or emails required
              </span>
              <span className="text-muted/40">&bull;</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-muted" />
                Private keys never leave memory
              </span>
              <span className="text-muted/40">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-muted" />
                Autonomous Tor v3 failover
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Living Dispatch Card (Section 4.2: The Sole Raised Card) */}
          <div
            className={cn(
              "lg:col-span-5 transition-all duration-1000 delay-250",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="relative rounded-[8px] border border-[rgba(240,232,232,0.12)] bg-elevated p-6 shadow-[0_12px_28px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Card Header: Quiet Label */}
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-verified" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-secondary font-medium">
                    Live Resilience Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted">
                  Multi-Transport Routing
                </span>
              </div>

              {/* Verified Dispatch Article Preview */}
              <div className="space-y-3 mb-5">
                {/* Human Journalist Byline (No Bare Hex Key or Fake Block #) */}
                <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified" />
                    <span className="font-medium">Elena Vance (@vance_archive)</span>
                  </span>
                  <span className="text-muted">Verified Contributor &bull; 6 min</span>
                </div>

                {/* Section 3.1 & 10: Inter ONLY for card title (never Instrument Serif) */}
                <h3 className="font-sans text-xl sm:text-2xl text-primary font-semibold leading-snug tracking-tight">
                  Surveillance Architecture Memo &amp; BGP Chokepoints
                </h3>

                {/* Section 3.1 & 10: Inter ONLY for excerpt */}
                <p className="font-sans text-sm text-secondary leading-relaxed line-clamp-3">
                  When public transit conduits face state-level IP tampering or BGP route hijacking, traditional newsrooms go dark in minutes. By decoupling content from cloud servers and publishing over independent peer networks, this dispatch remains readable anywhere.
                </p>
              </div>

              {/* Collapsed Clean Failover Demonstration */}
              <div className="p-3.5 rounded-[6px] border border-hairline bg-overlay/60 space-y-2 mb-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted">Active Delivery Route</span>
                  {isCensored ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-anonymous font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-anonymous" />
                      Tor v3 Onion Circuit (280ms)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-verified font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-verified" />
                      Clearnet Anycast Edge (38ms)
                    </span>
                  )}
                </div>

                {isCensored ? (
                  <div className="text-[11px] text-secondary font-sans leading-relaxed pt-1.5 border-t border-hairline">
                    <span className="text-anonymous font-mono font-medium">BGP route blocked by ISP firewall.</span> Reader seamlessly rerouted through the Tor onion rendezvous network. Zero lost bytes.
                  </div>
                ) : (
                  <div className="text-[11px] text-muted font-sans leading-relaxed pt-1.5 border-t border-hairline">
                    All edge mirrors reachable. Secondary Tor onion standby circuit verified and hot.
                  </div>
                )}
              </div>

              {/* Quiet, Calm Neutral Failover Toggle (Section 10: Never alarm-red) */}
              <div className="pt-1">
                <button
                  onClick={() => setIsCensored((prev) => !prev)}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-[6px] border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors",
                    isCensored
                      ? "bg-overlay border-focus text-primary hover:bg-surface"
                      : "bg-overlay/50 border-hairline text-secondary hover:text-primary hover:bg-overlay"
                  )}
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-muted", isCensored && "rotate-180 transition-transform")} />
                  <span>{isCensored ? "Restore Direct Edge Route" : "Simulate Regional Network Block"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Editorial Metrics Bar (Section 3.1: JetBrains Mono with tnum) */}
        <div
          className={cn(
            "mt-16 lg:mt-20 pt-8 border-t border-hairline grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 transition-all duration-1000 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex flex-col gap-1">
            <div className="font-mono text-3xl lg:text-4xl text-primary font-medium tabular-nums">
              3
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-secondary">
              Distribution Transports
            </span>
            <span className="text-[11px] text-muted">IPFS DHT &bull; Tor Onion &bull; Edge Anycast</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-mono text-3xl lg:text-4xl text-primary font-medium tabular-nums">
              0
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-secondary">
              Centralized Servers
            </span>
            <span className="text-[11px] text-muted">No database tracking or central logs</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-mono text-3xl lg:text-4xl text-primary font-medium tabular-nums">
              &lt;120ms
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-secondary">
              P95 Edge Read Latency
            </span>
            <span className="text-[11px] text-muted">Distributed anycast edge mirrors</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-mono text-3xl lg:text-4xl text-primary font-medium tabular-nums">
              100%
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-secondary">
              Bit-Level Integrity
            </span>
            <span className="text-[11px] text-muted">RFC 8785 canonical hash verification</span>
          </div>
        </div>
      </div>
    </section>
  );
}
