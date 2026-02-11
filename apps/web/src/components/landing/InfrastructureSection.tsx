"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldAlert, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

const transports = [
  { name: "Pinata IPFS Gateway", protocol: "IPFS Gateway", nodes: 12, status: "operational", latency: "42ms" },
  { name: "Cloudflare Web3 CDN", protocol: "Edge Cache", nodes: 8, status: "operational", latency: "18ms" },
  { name: "IPFS.io Public DHT", protocol: "libp2p DHT", nodes: 24, status: "operational", latency: "115ms" },
  { name: "Tor v3 Hidden Service", protocol: "Onion Circuit", nodes: 6, status: "operational", latency: "380ms" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTransport, setActiveTransport] = useState(0);
  const [isIspBlocked, setIsIspBlocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTransport((prev) => (prev + 1) % transports.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="infra" ref={sectionRef} className="relative py-28 lg:py-36 overflow-hidden bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20">
          <span
            className={`inline-flex items-center gap-4 text-sm font-mono text-cyan-400 mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="w-12 h-px bg-cyan-500/40" />
            Multi-Transport Network Infrastructure
          </span>

          <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-stretch">
            {/* 3D Network Globe Sphere */}
            <div
              className={`w-48 lg:w-72 xl:w-80 shrink-0 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/world-3i68QNWJwmO7W19ztZWbevAwJQHzYL.png"
                alt="Global network sphere"
                className="w-full h-full object-contain object-center"
              />
            </div>

            {/* Title + Description */}
            <div className="flex flex-col justify-center">
              <h2
                className={`text-6xl md:text-7xl lg:text-[112px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Decentralized by
                <br />
                <span className="text-white/40">default.</span>
              </h2>

              <p
                className={`mt-8 text-xl text-white/60 leading-relaxed max-w-xl transition-all duration-1000 delay-100 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                Your articles replicate across distributed IPFS nodes and Tor onion circuits worldwide.
                Sub-120ms read latency with zero single points of failure.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Large Stat Card with Animated Connecting Lines and Circuit Simulation */}
          <div
            className={`lg:col-span-2 relative p-8 lg:p-12 border border-white/10 bg-zinc-950/80 overflow-hidden transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Connecting Lines SVG animation */}
            <div className="absolute inset-0 opacity-70 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <style>{`
                    @keyframes drawLine {
                      0%   { stroke-dashoffset: 1000; opacity: 0; }
                      15%  { opacity: 1; }
                      70%  { opacity: 0.8; }
                      100% { stroke-dashoffset: 0; opacity: 0; }
                    }
                    .connecting-line {
                      stroke: ${isIspBlocked ? "#a855f7" : "#06b6d4"};
                      stroke-width: 1.5;
                      fill: none;
                      stroke-dasharray: 1000;
                      animation: drawLine 3s ease-in-out infinite;
                    }
                  `}</style>
                </defs>
                {[...Array(19)].map((_, i) => {
                  const x1 = 10 + (i % 5) * 20;
                  const y1 = 10 + Math.floor(i / 5) * 25;
                  const x2 = 10 + ((i + 1) % 5) * 20;
                  const y2 = 10 + Math.floor((i + 1) / 5) * 25;
                  return (
                    <line
                      key={`line-${i}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      className="connecting-line"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  );
                })}
              </svg>

              {/* Pulsing Node Dots */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${
                    isIspBlocked ? "bg-purple-400" : "bg-cyan-400"
                  }`}
                  style={{
                    left: `${10 + (i % 5) * 20}%`,
                    top: `${10 + Math.floor(i / 5) * 25}%`,
                    animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-7xl lg:text-[9rem] font-display leading-none text-white">3</span>
                <span className="text-2xl text-cyan-400 font-display">independent transports</span>
              </div>
              <p className="text-white/60 max-w-md mb-8">
                Every manifest is addressed by cryptographic hash. If clearnet gateways are blocked by state firewalls, clients automatically resolve over Tor onion circuits.
              </p>

              {/* Interactive Failover Simulator Action */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsIspBlocked(!isIspBlocked)}
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs flex items-center gap-2 border transition-all ${
                    isIspBlocked
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-950/40"
                      : "bg-white/[0.04] text-white/80 border-white/15 hover:bg-white/[0.08]"
                  }`}
                >
                  <ShieldAlert className={`w-4 h-4 ${isIspBlocked ? "text-purple-400 animate-pulse" : "text-amber-400"}`} />
                  {isIspBlocked ? "ISP Block Active (Rerouted to Tor)" : "Simulate ISP Gateway Block"}
                </button>

                <div className="text-xs font-mono text-white/50 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isIspBlocked ? "bg-purple-400 animate-ping" : "bg-emerald-400"}`} />
                  Route: {isIspBlocked ? "tor://anonpress...onion (Failover active)" : "https://gateway.pinata.cloud/ipfs/ (Direct)"}
                </div>
              </div>
            </div>
          </div>

          {/* Stacked Stat Cards */}
          <div className="flex flex-col gap-6">
            <div
              className={`p-8 border border-white/10 bg-zinc-950/80 transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="text-5xl lg:text-6xl font-display text-white">99.99%</span>
              <span className="block text-sm text-cyan-400 font-mono mt-2 uppercase tracking-wider">Multi-Transport Uptime</span>
              <span className="block text-xs text-white/40 mt-1">Zero single point of DNS or host failure</span>
            </div>

            <div
              className={`p-8 border border-white/10 bg-zinc-950/80 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="text-5xl lg:text-6xl font-display text-white">&lt;120ms</span>
              <span className="block text-sm text-emerald-400 font-mono mt-2 uppercase tracking-wider">Global Gateway Latency</span>
              <span className="block text-xs text-white/40 mt-1">Edge distributed across 300+ CDN points of presence</span>
            </div>
          </div>
        </div>

        {/* Transport List */}
        <div
          className={`mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {transports.map((transport, index) => {
            const isBlocked = isIspBlocked && transport.protocol.includes("Gateway");
            const isTorFailover = isIspBlocked && transport.protocol.includes("Onion");

            return (
              <div
                key={transport.name}
                className={`p-6 border transition-all duration-300 ${
                  isBlocked
                    ? "border-red-500/40 bg-red-950/20"
                    : isTorFailover
                    ? "border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-950/30"
                    : activeTransport === index
                    ? "border-cyan-500/40 bg-zinc-900"
                    : "border-white/10 bg-zinc-950/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isBlocked
                          ? "bg-red-500"
                          : isTorFailover
                          ? "bg-purple-400 animate-ping"
                          : activeTransport === index
                          ? "bg-cyan-400"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-white/50">
                      {isBlocked ? "BLOCKED (ISP)" : isTorFailover ? "PRIMARY CIRCUIT" : transport.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">{transport.latency}</span>
                </div>
                <span className="font-medium text-white block mb-1">{transport.name}</span>
                <span className="text-sm text-white/40 font-mono">{transport.protocol} · {transport.nodes} nodes</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
