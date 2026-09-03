"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Radio,
  Lock,
  Zap,
  RefreshCw,
  Check,
  Copy,
  Activity,
  Globe,
  Server,
  Network,
  AlertTriangle,
  CheckCircle2,
  Cpu,
} from "lucide-react";

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
  const [copiedCid, setCopiedCid] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isCensored, setIsCensored] = useState(false);
  const [activeTab, setActiveTab] = useState<"telemetry" | "crypto">("telemetry");
  const [pingLatency, setPingLatency] = useState({
    pinata: 38,
    cloudflare: 16,
    tor: 360,
  });

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCid = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  const triggerPingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency({
        pinata: Math.floor(34 + Math.random() * 14),
        cloudflare: Math.floor(14 + Math.random() * 8),
        tor: Math.floor(320 + Math.random() * 60),
      });
      setIsPinging(false);
    }, 600);
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center overflow-hidden bg-black pt-28 pb-16">
      {/* Precision Architectural Hairline Grid */}
      <div className="absolute inset-0 z-0 hairline-grid opacity-25 pointer-events-none" />

      {/* Volumetric Atmospheric Glows */}
      <div className="absolute top-1/4 -left-48 w-[550px] h-[550px] rounded-full bg-cyan-500/[0.08] blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-[550px] h-[550px] rounded-full bg-emerald-500/[0.06] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-t from-cyan-950/25 via-cyan-950/10 to-transparent blur-3xl pointer-events-none" />

      {/* Structural Horizon & Vertical Guide Lines */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="hidden lg:block absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="hidden lg:block absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 my-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-14 items-center">
          {/* Left Column: Editorial Typography & Protocol Actions */}
          <div className="lg:col-span-7">
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
              <span className="font-mono text-xs text-white/75 tracking-wider uppercase">
                Mainnet Live
              </span>
              <span className="text-white/20 text-xs">|</span>
              <span className="font-mono text-[11px] text-cyan-400">IPFS + Tor + Clearnet</span>
            </div>

            {/* Main Headline */}
            <h1
              className={`font-display text-5xl sm:text-6xl lg:text-[76px] xl:text-[88px] tracking-tight leading-[0.93] text-white mb-8 transition-all duration-1000 ${
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

            {/* Subheadline: Reader-centric mechanism */}
            <p
              className={`text-lg sm:text-xl text-white/70 font-light leading-relaxed max-w-xl mb-10 transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Every article is content-addressed on IPFS, mirrored to a Tor hidden service, and signed with a key that never leaves your browser. If one path is blocked, readers are rerouted automatically — no VPN, no account, no company that can pull the plug.
            </p>

            {/* Primary Action Buttons */}
            <div
              className={`flex flex-wrap items-center gap-4 mb-6 transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Link href="/write">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-black font-semibold h-14 px-8 rounded-xl text-base shadow-2xl hover:shadow-cyan-500/25 transition-all group"
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
                  Launch Protocol Sandbox →
                </Button>
              </a>
            </div>

            {/* Trust Markers */}
            <div
              className={`flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-white/50 font-mono transition-all duration-1000 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Zero cloud key custody
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                No accounts or emails
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                Automatic Tor failover
              </span>
            </div>
          </div>

          {/* Right Column: Live Protocol Enclave & Interactive Defense Console */}
          <div
            className={`lg:col-span-5 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative rounded-2xl border border-white/15 bg-zinc-950/85 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 group overflow-hidden">
              {/* Top ambient highlight */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Terminal Window Chrome */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  <span className="text-white/60 ml-2 font-medium">pressprotocol-kernel.live</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-400 text-[11px] font-semibold tracking-wider">
                    {isCensored ? "FAILOVER ENGAGED" : "MAINNET v1.4"}
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/5 mb-4 text-xs font-mono">
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === "telemetry"
                      ? "bg-white/10 text-white font-medium shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Multi-Transport
                </button>
                <button
                  onClick={() => setActiveTab("crypto")}
                  className={`py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === "crypto"
                      ? "bg-white/10 text-white font-medium shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Crypto Enclave
                </button>
              </div>

              {activeTab === "telemetry" ? (
                <>
                  {/* Root Verified Manifest CID Pill */}
                  <div className="mb-3.5 p-3 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between">
                    <div className="overflow-hidden mr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                          Active Root CIDv1
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          IMMUTABLE
                        </span>
                      </div>
                      <span className="font-mono text-xs text-white/90 truncate block" title="bafybeic52i4f7626vkyz244q56w7g632d4w754z56o2yvshj6c2k7n5wbe">
                        bafybeic52i4f...n5wbe
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCid("bafybeic52i4f7626vkyz244q56w7g632d4w754z56o2yvshj6c2k7n5wbe")}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 flex-shrink-0"
                      title="Copy CIDv1"
                    >
                      {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 3 Transports Display with Dynamic Censor State */}
                  <div className="space-y-2 mb-3.5 font-mono text-xs">
                    {/* Pinata IPFS Gateway */}
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                        isCensored
                          ? "bg-red-950/20 border-red-500/30 text-red-300"
                          : "bg-black/40 border-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCensored ? "bg-red-400" : "bg-emerald-400 animate-pulse"
                          }`}
                        />
                        <span className="text-white/90">IPFS Gateway (Pinata Edge)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {isCensored ? (
                          <span className="text-[10px] text-red-400 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">
                            BLOCKED (HTTP 451)
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              200 OK
                            </span>
                            <span className="text-cyan-400 font-semibold">{pingLatency.pinata}ms</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cloudflare Anycast Web3 */}
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                        isCensored
                          ? "bg-red-950/20 border-red-500/30 text-red-300"
                          : "bg-black/40 border-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCensored ? "bg-red-400" : "bg-cyan-400 animate-pulse"
                          }`}
                        />
                        <span className="text-white/90">Cloudflare Anycast</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {isCensored ? (
                          <span className="text-[10px] text-red-400 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">
                            DNS HIJACKED
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              200 OK
                            </span>
                            <span className="text-cyan-400 font-semibold">{pingLatency.cloudflare}ms</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tor v3 Hidden Service */}
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                        isCensored
                          ? "bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/40"
                          : "bg-black/40 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-white/90">Tor v3 Onion Network</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {isCensored ? (
                          <span className="text-[10px] text-purple-300 bg-purple-500/25 border border-purple-400/40 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-purple-300" />
                            PRIMARY ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            STANDBY
                          </span>
                        )}
                        <span className="text-purple-300 font-semibold">{pingLatency.tor}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Censorship State Alert Notification */}
                  {isCensored && (
                    <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-start gap-2 animate-in fade-in zoom-in-95 duration-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-emerald-200">
                          Automated Failover Succeeded (12ms)
                        </span>
                        Zero packet loss. Content served seamlessly over Tor circuit.
                      </div>
                    </div>
                  )}

                  {/* Interactive Dual Actions */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      onClick={() => setIsCensored((prev) => !prev)}
                      className={`py-2 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isCensored
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                          : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {isCensored ? (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Restore Clean Network
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          Simulate ISP Censorship
                        </>
                      )}
                    </button>

                    <button
                      onClick={triggerPingTest}
                      disabled={isPinging}
                      className="py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 text-cyan-400 ${isPinging ? "animate-spin" : ""}`} />
                      <span>{isPinging ? "Probing..." : "Ping Latency"}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Crypto Enclave Tab Content */
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-cyan-400">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        Ed25519 PureEdDSA
                      </span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                        VERIFIED ✓
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50 space-y-1">
                      <div className="flex justify-between">
                        <span>Curve:</span>
                        <span className="text-white/80">Curve25519 (RFC 8032)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Author ID:</span>
                        <span className="text-white/80 truncate max-w-[180px]">
                          ed25519:8f9a2e4c1b7d5f3a09e8
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>SHA-256 Digest:</span>
                        <span className="text-white/80 truncate max-w-[180px]">
                          7f83b1657ff1fc53b92dc18148a
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Server Key Persistence</span>
                      <span className="text-emerald-400 font-bold">0 BYTES (NEVER)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Signature Generation</span>
                      <span className="text-cyan-400 font-medium">In-Browser Web Crypto API</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Decentralized Pinning</span>
                      <span className="text-white/80">IPFS Cluster + Kubo Pinners</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Private keys never leave memory. No account database exists.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Protocol Metric Bar */}
        <div
          className={`mt-16 lg:mt-20 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 transition-all duration-1000 delay-500 ${
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
                P95*
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Global Gateway Read Latency
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              *15s synthetic probe cycle across 6 edge mirrors
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl lg:text-4xl text-white font-semibold">100%</span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                VERIFIABLE*
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Tamper Resistance
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              *SHA-256 digest + RFC 8032 client verification
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

