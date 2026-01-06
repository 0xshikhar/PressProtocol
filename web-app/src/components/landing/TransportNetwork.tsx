"use client";

import { useState, useEffect } from "react";
import { Network, ShieldAlert, CheckCircle2, Radio, Server, Globe, Cpu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NodeStatus {
  name: string;
  type: string;
  status: "active" | "blocked" | "fallback";
  latency: string;
  description: string;
  circuit: string;
}

export function TransportNetwork() {
  const [simulateBlock, setSimulateBlock] = useState(false);
  const [activeRoute, setActiveRoute] = useState<"gateway" | "tor">("gateway");

  useEffect(() => {
    if (simulateBlock) {
      const timer = setTimeout(() => {
        setActiveRoute("tor");
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setActiveRoute("gateway");
    }
  }, [simulateBlock]);

  return (
    <section id="network" className="relative py-28 lg:py-36 bg-black text-white overflow-hidden border-t border-white/10">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-emerald-950/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-950/20 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-emerald-400 mb-6">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>FAILOVER INFRASTRUCTURE</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white">
              Multi-Transport.
              <br />
              <span className="text-white/40">Zero single point of blackout.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-base text-white/60 font-light leading-relaxed">
            Content addressing means URLs are not bound to any IP address, cloud host, or domain registrar. If an authoritarian ISP censors DNS or clearnet mirrors, clients fail over to Tor in milliseconds.
          </p>
        </div>

        {/* Interactive Failover Sandbox Diagram */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Main Visual Terminal / Network Diagram */}
          <div className="lg:col-span-8 p-6 lg:p-10 rounded-2xl border border-white/10 bg-[#050811] relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                  Active In-Flight Packet Route:
                </span>
                <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {activeRoute === "gateway" ? "CLEANNET IPFS GATEWAY (FASTEST)" : "TOR ONION HIDDEN CIRCUIT (FAILOVER ACTIVE)"}
                </span>
              </div>

              {/* Simulation Toggle Button */}
              <Button
                size="sm"
                onClick={() => setSimulateBlock(!simulateBlock)}
                className={`font-mono text-xs h-9 px-4 transition-all ${
                  simulateBlock
                    ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                {simulateBlock ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Restore Clearnet Gateway
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    Simulate ISP Gateway Block
                  </>
                )}
              </Button>
            </div>

            {/* Interactive SVG Diagram Canvas */}
            <div className="my-8 relative min-h-[260px] flex items-center justify-between px-4 sm:px-12">
              {/* Client Reader Node */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-16 h-16 rounded-2xl border border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center shadow-lg shadow-cyan-900/30">
                  <Globe className="w-7 h-7 text-cyan-400" />
                </div>
                <span className="font-mono text-xs text-white/90">Reader Client</span>
                <span className="font-mono text-[10px] text-white/40">Browser / MV3</span>
              </div>

              {/* Connecting Wave SVG */}
              <div className="absolute inset-0 flex items-center pointer-events-none px-20">
                <svg className="w-full h-40" viewBox="0 0 500 160" fill="none">
                  {/* Clearnet Route Path */}
                  <path
                    d="M 20 80 C 140 20, 260 20, 480 80"
                    stroke={simulateBlock ? "rgba(239, 68, 68, 0.4)" : "rgba(6, 182, 212, 0.6)"}
                    strokeWidth={simulateBlock ? "1.5" : "2.5"}
                    strokeDasharray={simulateBlock ? "4 4" : "none"}
                  />

                  {/* Tor Onion Fallback Route Path */}
                  <path
                    d="M 20 80 C 140 140, 260 140, 480 80"
                    stroke={activeRoute === "tor" ? "rgba(16, 185, 129, 0.8)" : "rgba(255, 255, 255, 0.1)"}
                    strokeWidth={activeRoute === "tor" ? "2.5" : "1"}
                  />
                </svg>
              </div>

              {/* Central Dynamic Switch Indicator */}
              <div className="hidden sm:flex flex-col items-center gap-2 z-10">
                <div
                  className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-500 ${
                    simulateBlock
                      ? "border-red-500/50 bg-red-950/40 text-red-300"
                      : "border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                  }`}
                >
                  <div className="font-mono text-xs font-semibold flex items-center gap-2">
                    {simulateBlock ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span>ISP BLOCKED · REROUTED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>CLEARNET ACTIVE</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  Automatic Client Failover: &lt;35ms
                </span>
              </div>

              {/* Immutable IPFS Content Storage */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-16 h-16 rounded-2xl border border-emerald-400/40 bg-emerald-950/40 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                  <Server className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="font-mono text-xs text-white/90">Decentralized DHT</span>
                <span className="font-mono text-[10px] text-white/40">IPFS Pinning + Tor</span>
              </div>
            </div>

            {/* Bottom Real-time Telemetry Bar */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">STATUS:</span>
                <span>
                  {simulateBlock
                    ? "HTTP 451 / DNS Poisoning detected on Primary CDN -> Switched to Tor Onion Service (press7fk2...onion)"
                    : "Primary Cloudflare/Pinata Gateway healthy · Direct IPFS p2p peer discovery online"}
                </span>
              </div>
              <div className="text-white/40 text-[11px]">Failover Latency: 28ms</div>
            </div>
          </div>

          {/* Right Status Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Gateway 1: Pinata IPFS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xl text-white">IPFS Gateway (Pinata)</span>
                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                    simulateBlock
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {simulateBlock ? "BLOCKED / DNS POISONED" : "● OPERATIONAL"}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Clearnet CDN edge gateway caching immutable content CIDs for sub-100ms global read latencies.
              </p>
              <div className="flex items-center justify-between font-mono text-xs text-white/40 border-t border-white/5 pt-3">
                <span>Latency: {simulateBlock ? "TIMEOUT" : "88ms"}</span>
                <span>Mirror: gateway.pinata.cloud</span>
              </div>
            </div>

            {/* Gateway 2: Tor Hidden Service */}
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/20 transition-all flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xl text-white">Tor Onion Service</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● 100% UNBLOCKABLE
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                End-to-end encrypted .onion rendezvous circuit immune to DNS seizures, BGP hijacking, and ISP blocking.
              </p>
              <div className="flex items-center justify-between font-mono text-xs text-white/40 border-t border-white/5 pt-3">
                <span>Latency: 420ms (Tor hop)</span>
                <span>Circuit: 3-Hop Onion Guard</span>
              </div>
            </div>

            {/* Gateway 3: Secondary Mirrors */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xl text-white">IPFS.io & Cloudflare</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  ● FALLBACK STANDBY
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Secondary public gateways distributed across North America, Europe, and Asia-Pacific.
              </p>
              <div className="flex items-center justify-between font-mono text-xs text-white/40 border-t border-white/5 pt-3">
                <span>Latency: 124ms</span>
                <span>Mirrors: 14 Active Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
