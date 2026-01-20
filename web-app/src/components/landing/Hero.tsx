"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Terminal, Radio, Lock, Zap, RefreshCw } from "lucide-react";

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

  const gradientColors = ["#06b6d4", "#3b82f6", "#10b981", "#38bdf8", "#06b6d4"];

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
              color: showGradient ? `rgb(${r},${g},${b})` : "#ffffff",
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

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center overflow-hidden bg-black pt-28 pb-16">
      {/* Background Hero Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-70"
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlays to guarantee text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      {/* Radial atmospheric glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-cyan-950/20 to-transparent blur-3xl pointer-events-none z-[1]" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 my-auto">
        <div className="max-w-4xl">
          {/* Status Pill Badge */}
          <div
            className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-xs text-white/70 tracking-wider uppercase">
              Multi-Transport Mainnet Active
            </span>
            <span className="text-white/20 text-xs">|</span>
            <span className="font-mono text-[11px] text-cyan-400">IPFS + Tor + Mirrors</span>
          </div>

          {/* Main Headline */}
          <h1
            className={`font-display text-5xl sm:text-7xl lg:text-[96px] tracking-tight leading-[0.92] text-white mb-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">Publish content that</span>
            <span className="block text-white/90">
              cannot be{" "}
              <span className="relative inline-block border-b-2 border-cyan-500/40 pb-1">
                <BlurWord word={cycleWords[wordIndex]} trigger={wordIndex} />
              </span>
              .
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl lg:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mb-12 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            An open publishing protocol combining{" "}
            <span className="text-white font-normal">IPFS content addressing</span>,{" "}
            <span className="text-white font-normal">Tor anonymity circuits</span>, and{" "}
            <span className="text-white font-normal">client-side Ed25519 cryptographic signatures</span>{" "}
            with automated multi-transport failover.
          </p>

          {/* Primary Action Buttons */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link href="/write">
              <Button
                size="lg"
                className="bg-white hover:bg-white/90 text-black font-medium h-14 px-8 rounded-xl text-base shadow-2xl hover:shadow-cyan-500/25 transition-all group"
              >
                Start Publishing Free
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#sandbox">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-7 rounded-xl text-base text-white border-white/15 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-md transition-all font-mono text-sm"
              >
                <Terminal className="w-4 h-4 mr-2 text-cyan-400" />
                Launch Protocol Sandbox
              </Button>
            </a>
          </div>
        </div>

        {/* Live Protocol Metric Bar */}
        <div
          className={`mt-20 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl lg:text-4xl text-white font-semibold">3</span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Distribution Transports
            </span>
            <span className="text-[11px] text-white/30">IPFS · Tor .onion · Gateways</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl lg:text-4xl text-white font-semibold">0</span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                KEYS ONLY
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Accounts Required
            </span>
            <span className="text-[11px] text-white/30">Client-side Ed25519 identity</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl lg:text-4xl text-white font-semibold">&lt;120ms</span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                P95
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Global Gateway Read Latency
            </span>
            <span className="text-[11px] text-white/30">Edge-cached CDN & DHT routing</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl lg:text-4xl text-white font-semibold">100%</span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                VERIFIABLE
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Tamper Resistance
            </span>
            <span className="text-[11px] text-white/30">SHA-256 hash verified payload</span>
          </div>
        </div>
      </div>
    </section>
  );
}
