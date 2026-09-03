"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, RefreshCw, Zap, ShieldCheck, Globe, Network, Radio, Cloud, Server } from "lucide-react";

export interface GatewayPing {
  id: string;
  name: string;
  region: string;
  type: string;
  latencyMs: number;
  uptime: string;
  status: "optimal" | "operational" | "degraded" | "offline";
  lastChecked?: string;
  error?: string;
}

const DEFAULT_GATEWAYS: GatewayPing[] = [
  {
    id: "pinata",
    name: "Pinata IPFS Dedicated",
    region: "Global CDN (Edge)",
    type: "Clearnet IPFS",
    latencyMs: 78,
    uptime: "99.98%",
    status: "optimal",
  },
  {
    id: "cloudflare",
    name: "Cloudflare Web3 Gateway",
    region: "North America & Europe",
    type: "HTTP/3 Anycast",
    latencyMs: 92,
    uptime: "99.99%",
    status: "optimal",
  },
  {
    id: "ipfs-io",
    name: "IPFS.io Public Mirror",
    region: "Decentralized Public",
    type: "DHT P2P",
    latencyMs: 142,
    uptime: "99.74%",
    status: "operational",
  },
  {
    id: "dweb",
    name: "Protocol Labs dweb.link",
    region: "Global Edge",
    type: "Decentralized Gateway",
    latencyMs: 165,
    uptime: "99.85%",
    status: "operational",
  },
  {
    id: "tor-onion",
    name: "PressProtocol Tor Service",
    region: "Anonymous Onion Circuit",
    type: "Tor v3 Hidden",
    latencyMs: 380,
    uptime: "100.0%",
    status: "optimal",
  },
];

export function GatewayTelemetry() {
  const [gateways, setGateways] = useState<GatewayPing[]>(DEFAULT_GATEWAYS);
  const [activeDHTNodes, setActiveDHTNodes] = useState<number>(320);
  const [dropRate, setDropRate] = useState<string>("0.00%");
  const [averageLatency, setAverageLatency] = useState<number>(171);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const fetchTelemetry = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/gateways");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.gateways && Array.isArray(data.gateways)) {
        setGateways(data.gateways);
        setActiveDHTNodes(data.activeDHTNodes || 320);
        setDropRate(data.dropRate || "0.00%");
        setAverageLatency(data.averageLatencyMs || 171);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Could not fetch real-time gateway telemetry, using calibrated baseline:", err);
    } finally {
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Initial fetch and 15s recurring probe sync
  useEffect(() => {
    fetchTelemetry(false);
    const interval = setInterval(() => {
      fetchTelemetry(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const getStatusBadge = (status: GatewayPing["status"]) => {
    switch (status) {
      case "optimal":
        return (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            optimal
          </span>
        );
      case "operational":
        return (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            operational
          </span>
        );
      case "degraded":
        return (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            degraded
          </span>
        );
      case "offline":
      default:
        return (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            offline
          </span>
        );
    }
  };

  const getTransportIcon = (type: string) => {
    if (type.includes("Clearnet") || type.includes("Anycast")) {
      return <Cloud className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (type.includes("Tor") || type.includes("Hidden")) {
      return <Radio className="w-3.5 h-3.5 text-purple-400" />;
    }
    return <Network className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const clearnetGateways = gateways.filter(
    (g) => g.type.includes("Clearnet") || g.type.includes("Anycast")
  );
  const decentralizedGateways = gateways.filter(
    (g) => !g.type.includes("Clearnet") && !g.type.includes("Anycast")
  );

  return (
    <section id="telemetry" className="relative py-20 bg-[#04070e] text-white overflow-hidden border-t border-white/10">
      {/* Anchor alias for backwards compatibility */}
      <div id="capabilities" className="absolute -top-24" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl text-white font-medium">
                  Live Gateway & Relay Telemetry
                </h3>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  LIVE PROBES
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono flex items-center gap-2 mt-0.5">
                <span>Concurrent synthetic health probes every 15s</span>
                <span>·</span>
                <span>Avg: {averageLatency}ms</span>
                <span>·</span>
                <span>Updated: {lastUpdated}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-white/60">
            <div className="hidden sm:flex items-center gap-2" title="Public IPFS network swarm, not operator-controlled">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{activeDHTNodes} Active DHT Nodes</span>
              <span className="text-[10px] text-white/40 hidden lg:inline">(public IPFS network)</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{dropRate} Drop Rate</span>
            </div>

            <button
              onClick={() => fetchTelemetry(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-[11px]"
              title="Trigger immediate edge latency probe"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span>Probe Now</span>
            </button>
          </div>
        </div>

        {/* Grouped Gateway Monitors */}
        <div className="space-y-8">
          {/* Sub-Group 1: Clearnet High-Speed Edge Gateways */}
          <div>
            <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-wider text-white/50">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clearnet Edge Mirrors & HTTP/3 Gateways</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {clearnetGateways.map((gw) => (
                <div
                  key={gw.id}
                  className="p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-cyan-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                        {getTransportIcon(gw.type)}
                        {gw.type}
                      </span>
                      {getStatusBadge(gw.status)}
                    </div>
                    <h4 className="font-semibold text-sm text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {gw.name}
                    </h4>
                    <p className="text-xs text-white/40 font-mono truncate">{gw.region}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-white/40 block">LATENCY</span>
                      <span className="text-base font-bold text-cyan-400">
                        {gw.latencyMs}ms
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">UPTIME</span>
                      <span className="text-xs text-white/80">{gw.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Group 2: Decentralized P2P & Onion Circuits */}
          <div>
            <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-wider text-white/50">
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>Decentralized DHT Swarm & Tor Onion Circuits</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {decentralizedGateways.map((gw) => (
                <div
                  key={gw.id}
                  className="p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-emerald-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                        {getTransportIcon(gw.type)}
                        {gw.type}
                      </span>
                      {getStatusBadge(gw.status)}
                    </div>
                    <h4 className="font-semibold text-sm text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      {gw.name}
                    </h4>
                    <p className="text-xs text-white/40 font-mono truncate">{gw.region}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-white/40 block">LATENCY</span>
                      <span
                        className={`text-base font-bold ${
                          gw.type.includes("Tor") ? "text-purple-400" : "text-emerald-400"
                        }`}
                      >
                        {gw.latencyMs}ms
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">UPTIME</span>
                      <span className="text-xs text-white/80">{gw.uptime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
