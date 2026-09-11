"use client";

import { useState, useEffect } from "react";
import { Globe, Server, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TransportNetwork() {
  const [simulateBlock, setSimulateBlock] = useState(false);
  const [activeRoute, setActiveRoute] = useState<"gateway" | "tor">("gateway");

  useEffect(() => {
    if (simulateBlock) {
      const timer = setTimeout(() => {
        setActiveRoute("tor");
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setActiveRoute("gateway");
    }
  }, [simulateBlock]);

  return (
    <section id="network" className="relative py-24 sm:py-32 bg-canvas text-primary overflow-hidden border-t border-hairline">
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Header: 1-Eyebrow Rule */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Routing Topology &bull; Autonomous Failover
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-primary">
              Multi-Transport.
              <br />
              <span className="text-secondary font-light">Zero single point of blackout.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-secondary font-light leading-relaxed measure-lead">
            Content addressing means URLs are not bound to any IP address, cloud host, or domain registrar. If an authoritarian ISP censors DNS or clearnet mirrors, clients fail over to Tor in milliseconds.
          </p>
        </div>

        {/* Interactive Failover Topology Diagram */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-8">
          {/* Main Network Canvas */}
          <div className="lg:col-span-8 p-6 lg:p-8 rounded-[6px] border border-hairline bg-surface relative overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    activeRoute === "gateway" ? "bg-verified" : "bg-anonymous"
                  )}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  Packet Routing:
                </span>
                <span className="font-mono text-xs text-primary font-medium">
                  {activeRoute === "gateway" ? "Clearnet Edge Gateway" : "Tor Onion Circuit (Failover Active)"}
                </span>
              </div>

              {/* Simulation Toggle Button: Section 10 Calm Neutral (Never alarm-red) */}
              <Button
                size="sm"
                variant="simulation"
                onClick={() => setSimulateBlock(!simulateBlock)}
                className="font-mono text-xs h-8 px-3.5"
              >
                {simulateBlock ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-muted" />
                    Restore Clearnet Route
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 mr-1.5 text-muted" />
                    Simulate ISP Gateway Block
                  </>
                )}
              </Button>
            </div>

            {/* SVG Diagram Canvas */}
            <div className="my-10 relative min-h-[220px] flex items-center justify-between px-4 sm:px-10">
              {/* Client Reader Node */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-[6px] border border-hairline bg-overlay flex items-center justify-center shadow-sm">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <span className="font-mono text-xs text-primary font-medium">Reader Client</span>
                <span className="font-mono text-[10px] text-muted">Browser / Agent</span>
              </div>

              {/* Connecting Wave SVG with 3 Parallel Transports */}
              <div className="absolute inset-0 flex items-center pointer-events-none px-16">
                <svg className="w-full h-40" viewBox="0 0 500 180" fill="none">
                  {/* Route 1: Clearnet CDN Edge */}
                  <path
                    d="M 20 90 C 140 20, 260 20, 480 90"
                    stroke={simulateBlock ? "rgba(214, 92, 74, 0.45)" : "rgba(238, 231, 225, 0.5)"}
                    strokeWidth={simulateBlock ? "1" : "2"}
                    strokeDasharray={simulateBlock ? "4 4" : "none"}
                  />

                  {/* Route 2: Decentralized IPFS DHT */}
                  <path
                    d="M 20 90 C 140 90, 260 90, 480 90"
                    stroke="rgba(240, 232, 232, 0.18)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Route 3: Tor Onion Circuit (#8770C4) */}
                  <path
                    d="M 20 90 C 140 160, 260 160, 480 90"
                    stroke={activeRoute === "tor" ? "rgba(135, 112, 196, 0.95)" : "rgba(240, 232, 232, 0.15)"}
                    strokeWidth={activeRoute === "tor" ? "2" : "1"}
                  />
                </svg>
              </div>

              {/* Central Dynamic Switch Indicator */}
              <div className="hidden sm:flex flex-col items-center gap-1.5 z-10">
                <div
                  className={cn(
                    "px-3.5 py-1.5 rounded-[6px] border text-xs font-mono transition-colors",
                    simulateBlock
                      ? "border-anonymous/30 bg-anonymous/10 text-anonymous"
                      : "border-hairline bg-overlay text-secondary"
                  )}
                >
                  {simulateBlock ? "Tor Onion Active &bull; 280ms" : "Clearnet Edge Active &bull; 38ms"}
                </div>
                <span className="font-mono text-[10px] text-muted">
                  {simulateBlock ? "Automatic Reroute <25ms" : "Parallel Racing"}
                </span>
              </div>

              {/* Decentralized Storage Node */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-[6px] border border-hairline bg-overlay flex items-center justify-center shadow-sm">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <span className="font-mono text-xs text-primary font-medium">Decentralized DHT</span>
                <span className="font-mono text-[10px] text-muted">IPFS + Tor</span>
              </div>
            </div>

            {/* Bottom Real-time Telemetry Bar */}
            <div className="p-3.5 rounded-[6px] bg-canvas border border-hairline font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-secondary">
              <div className="flex items-center gap-2">
                <span className="text-muted">STATE:</span>
                <span className="text-primary font-sans text-xs">
                  {simulateBlock
                    ? "HTTP 451 / DNS Poisoning detected on Primary Edge — Traffic shifted to Tor Onion Circuit"
                    : "Clearnet gateway reachable — IPFS peer discovery running concurrently"}
                </span>
              </div>
              <div className="text-muted text-[11px] tabular-nums">Failover Latency: 22ms</div>
            </div>
          </div>

          {/* Right Status Cards (Section 4.1 Card Elevation) */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            {/* Gateway 1: IPFS Gateway */}
            <div className="p-5 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between flex-1 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-sm font-semibold text-primary">Edge Mirror (Clearnet)</span>
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded-[4px]",
                      simulateBlock
                        ? "text-error bg-error/10 border border-error/20"
                        : "text-verified bg-verified/10 border border-verified/20"
                    )}
                  >
                    {simulateBlock ? "BLOCKED" : "OPERATIONAL"}
                  </span>
                </div>
                <p className="text-xs text-secondary font-light leading-relaxed mb-3">
                  Anycast edge gateway caching immutable CIDs for sub-100ms global read latencies.
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted pt-2 border-t border-hairline">
                <span className="tabular-nums">Latency: {simulateBlock ? "TIMEOUT" : "38ms"}</span>
                <span>gateway.pinata.cloud</span>
              </div>
            </div>

            {/* Gateway 2: Tor Onion Service */}
            <div className="p-5 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between flex-1 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-sm font-semibold text-primary">Tor Onion Service</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] text-anonymous bg-anonymous/10 border border-anonymous/20">
                    ANTI-CENSORSHIP
                  </span>
                </div>
                <p className="text-xs text-secondary font-light leading-relaxed mb-3">
                  End-to-end encrypted .onion rendezvous circuit immune to domain seizures and BGP hijacking.
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted pt-2 border-t border-hairline">
                <span className="tabular-nums">Latency: 280ms</span>
                <span>3-Hop Guard Circuit</span>
              </div>
            </div>

            {/* Gateway 3: Secondary Swarm */}
            <div className="p-5 rounded-[6px] border border-hairline bg-surface flex flex-col justify-between flex-1 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-sm font-semibold text-primary">Public P2P Swarm</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] text-secondary bg-overlay border border-hairline">
                    DHT BACKUP
                  </span>
                </div>
                <p className="text-xs text-secondary font-light leading-relaxed mb-3">
                  Secondary public nodes distributed across global independent edge providers.
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-muted pt-2 border-t border-hairline">
                <span className="tabular-nums">Latency: 142ms</span>
                <span>320 Active Peers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
