"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Code2, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeveloperHeroProps {
  onSelectEndpoint?: (endpoint: string) => void;
}

export default function DeveloperHero({ onSelectEndpoint }: DeveloperHeroProps) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const heroJsonSnippet = `{
  "protocol": "pressprotocol/v1",
  "cid": "bafybeig...4gf6q",
  "title": "Investigative Transparency Report",
  "publisher": {
    "algorithm": "Ed25519",
    "publicKey": "ed25519_3e5c9b...8a473",
    "signature": "7a8b9c...f12e"
  },
  "transports": ["ipfs", "tor", "clearnet"],
  "timestamp": 1620000000
}`;

  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/publish/raw",
      description: "Server-signed 1-line autonomous ingest",
      code: `curl -X POST https://node.pressprotocol.com/api/v1/publish/raw \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pp_test_sandbox" \\
  -d '{"title": "Sovereign Dispatch", "content": "Cryptographic proof on IPFS."}'`,
      explorerKey: "publish_raw",
    },
    {
      method: "POST",
      path: "/api/v1/publish/signed",
      description: "Client-signed zero-custody relay",
      code: `curl -X POST https://node.pressprotocol.com/api/v1/publish/signed \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Signed", "publicKey": "...", "signature": "..."}'`,
      explorerKey: "publish_signed",
    },
    {
      method: "GET",
      path: "/api/v1/resolve/{cid}",
      description: "Multi-transport IPFS & Tor resolution",
      code: `curl https://node.pressprotocol.com/api/v1/resolve/bafybeig...4gf6q`,
      explorerKey: "resolve",
    },
    {
      method: "POST",
      path: "/api/v1/verify",
      description: "Cryptographic proof audit",
      code: `curl -X POST https://node.pressprotocol.com/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{"content": "...", "publicKey": "...", "signature": "..."}'`,
      explorerKey: "verify",
    },
    {
      method: "GET",
      path: "/api/v1/health",
      description: "Gateway & IPFS Swarm health telemetry",
      code: `curl https://node.pressprotocol.com/api/v1/health`,
      explorerKey: "resolve",
    },
    {
      method: "GET",
      path: "/api/v1/metrics",
      description: "Node throughput and latency telemetry",
      code: `curl https://node.pressprotocol.com/api/v1/metrics`,
      explorerKey: "resolve",
    },
  ];

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(heroJsonSnippet);
    setCopiedSnippet(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyEndpointCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success("cURL command copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="space-y-12">
      {/* Top Status Bar Pill */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center gap-4 sm:gap-8 px-5 py-2 rounded-full border border-white/[0.08] bg-[#0A0B14]/80 backdrop-blur-xl shadow-xl text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Clearnet REST <span className="text-emerald-400 font-semibold">42ms</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span>
              Tor v3 Onion <span className="text-purple-300 font-semibold">Active</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>
              IPFS Swarm <span className="text-cyan-300 font-semibold">318 Peers</span>
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-600 hidden md:block" />
        </div>
      </div>

      {/* Hero 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] font-mono tracking-[0.25em] text-neutral-400 uppercase font-semibold">
              PRESSPROTOCOL
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-white leading-[1.08]">
              Infrastructure for <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                sovereign publishing
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed font-sans pt-1">
              PressProtocol is a decentralized infrastructure protocol for censorship-resistant, sovereign
              publishing. Build, publish, and fetch content without trusted third parties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="#api-explorer">
              <Button className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-6 py-2.5 text-xs sm:text-sm shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all h-11">
                <Play className="h-4 w-4 fill-current" /> Open API Explorer
              </Button>
            </Link>
            <Link href="#widget-playground">
              <Button
                variant="outline"
                className="gap-2 border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium transition-all h-11"
              >
                <Code2 className="h-4 w-4 text-cyan-400" /> Web Component Playground
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Code Snippet Card */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-xl opacity-60 pointer-events-none" />
          <div className="relative rounded-2xl border border-indigo-500/30 bg-[#0A0C16]/95 backdrop-blur-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Code Snippet</span>
              </div>
              <button
                onClick={handleCopySnippet}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors"
                title="Copy JSON snippet"
              >
                {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-300 overflow-x-auto selection:bg-cyan-500/30">
              <code>
                <span className="text-white">{"{"}</span>
                {"\n"}  <span className="text-cyan-300">&quot;sovereign_publishing&quot;</span>
                <span className="text-white">: </span>
                <span className="text-emerald-400">true</span>
                <span className="text-white">,</span>
                {"\n"}  <span className="text-cyan-300">&quot;publication_id&quot;</span>
                <span className="text-white">: </span>
                <span className="text-indigo-300">&quot;bafyeih...4gf6q&quot;</span>
                <span className="text-white">,</span>
                {"\n"}  <span className="text-cyan-300">&quot;content_hash&quot;</span>
                <span className="text-white">: </span>
                <span className="text-indigo-300">&quot;QmT78zXy...f2j4k&quot;</span>
                <span className="text-white">,</span>
                {"\n"}  <span className="text-cyan-300">&quot;timestamp&quot;</span>
                <span className="text-white">: </span>
                <span className="text-purple-300">1620000000</span>
                {"\n"}
                <span className="text-white">{"}"}</span>
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* 6-Card Quickstart Endpoint Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {endpoints.map((ep, idx) => {
            const isPost = ep.method === "POST";
            return (
              <div
                key={ep.path}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#0A0B14]/90 hover:bg-[#0E0F1B] hover:border-cyan-500/40 p-5 transition-all shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wide ${
                        isPost
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      <span className="opacity-70">&lt;/&gt;</span> {ep.method}
                    </span>

                    <button
                      onClick={() => handleCopyEndpointCode(ep.code, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white"
                      title="Copy cURL command"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      {ep.path}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-sans">{ep.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500 font-semibold tracking-wider">
                    <span>Code</span>
                    {onSelectEndpoint && (
                      <button
                        onClick={() => {
                          onSelectEndpoint(ep.explorerKey);
                          const el = document.getElementById("api-explorer");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-cyan-400 hover:text-cyan-300 lowercase text-[10px] tracking-normal font-normal"
                      >
                        try in explorer →
                      </button>
                    )}
                  </div>
                  <div className="rounded-xl bg-black/60 border border-white/[0.04] p-3 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto selection:bg-cyan-500/30">
                    <code>{ep.code}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Connecting / Swarm Status Indicator */}
        <div className="pt-2 flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected to Global Swarm (Helia IPFS · Tor v3 · 42ms latency)</span>
        </div>
      </div>
    </section>
  );
}
