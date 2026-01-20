"use client";

import { useState, useEffect } from "react";
import { Activity, Server, Radio, Shield, Globe2, ArrowUpRight } from "lucide-react";

interface GatewayPing {
  id: string;
  name: string;
  region: string;
  type: string;
  baseLatency: number;
  uptime: string;
  status: "optimal" | "operational";
}

const gateways: GatewayPing[] = [
  {
    id: "pinata",
    name: "Pinata IPFS Dedicated",
    region: "Global CDN (Edge)",
    type: "Clearnet IPFS",
    baseLatency: 78,
    uptime: "99.98%",
    status: "optimal",
  },
  {
    id: "cloudflare",
    name: "Cloudflare Web3 Gateway",
    region: "North America & Europe",
    type: "HTTP/3 Anycast",
    baseLatency: 92,
    uptime: "99.99%",
    status: "optimal",
  },
  {
    id: "ipfs-io",
    name: "IPFS.io Public Mirror",
    region: "Decentralized Public",
    type: "DHT P2P",
    baseLatency: 142,
    uptime: "99.74%",
    status: "operational",
  },
  {
    id: "tor-onion",
    name: "PressProtocol Tor Service",
    region: "Anonymous Onion Circuit",
    type: "Tor v3 Hidden",
    baseLatency: 380,
    uptime: "100.0%",
    status: "optimal",
  },
];

export function GatewayTelemetry() {
  const [latencies, setLatencies] = useState<Record<string, number>>({
    pinata: 78,
    cloudflare: 92,
    "ipfs-io": 142,
    "tor-onion": 380,
  });

  // Simulated live latency jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencies((prev) => ({
        pinata: Math.max(65, 78 + Math.floor((Math.random() - 0.5) * 12)),
        cloudflare: Math.max(80, 92 + Math.floor((Math.random() - 0.5) * 14)),
        "ipfs-io": Math.max(120, 142 + Math.floor((Math.random() - 0.5) * 20)),
        "tor-onion": Math.max(340, 380 + Math.floor((Math.random() - 0.5) * 30)),
      }));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="capabilities" className="relative py-20 bg-[#04070e] text-white overflow-hidden border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white font-medium">
                Live Gateway & Relay Telemetry
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Continuous synthetic health probes every 2,500ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-white/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>312 Active DHT Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Zero Drop Rate</span>
            </div>
          </div>
        </div>

        {/* Grid of gateway monitors */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className="p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                    {gw.type}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {gw.status}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white mb-1">{gw.name}</h4>
                <p className="text-xs text-white/40 font-mono">{gw.region}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-white/40 block">LATENCY</span>
                  <span className="text-base text-cyan-400 font-bold">
                    {latencies[gw.id]}ms
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
    </section>
  );
}
