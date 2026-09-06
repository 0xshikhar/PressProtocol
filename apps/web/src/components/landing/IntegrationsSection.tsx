"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Copy, Check, ArrowRight, Globe, Layers, Cpu, Terminal, FileCode } from "lucide-react";

const integrations = [
  {
    name: "WordPress Plugin",
    category: "CMS",
    description: "One-click decentralized publishing alongside your standard WordPress loop.",
    action: "download",
    target: "/downloads/PressProtocol_Wordpress_Plugin.zip",
    badge: "v1.2.0",
  },
  {
    name: "Chromium Extension",
    category: "Extension",
    description: "In-browser Ed25519 signing key management & IPFS reader sidebar.",
    action: "download",
    target: "/downloads/PressProtocol_Browser_Extension.zip",
    badge: "MV3 Ready",
  },
  {
    name: "TypeScript SDK",
    category: "Dev SDK",
    description: "Publish and verify manifests programmatically via @pressprotocol/sdk.",
    action: "copy",
    snippet: "pnpm add @pressprotocol/sdk",
    badge: "Type-Safe",
  },
  {
    name: "Ghost CMS Webhooks",
    category: "Publishing",
    description: "Automatically dual-pin to IPFS and Tor when publishing a post in Ghost.",
    action: "link",
    badge: "Automated",
  },
  {
    name: "Substack Importer",
    category: "Migration",
    description: "Export existing newsletter archives into immutable, permanent IPFS CIDs.",
    action: "link",
    badge: "1-Click Sync",
  },
  {
    name: "Obsidian Local Sync",
    category: "Markdown",
    description: "Publish cryptographic manifests straight from local Obsidian vaults.",
    action: "link",
    badge: "Community",
  },
];

export function IntegrationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [copiedSdk, setCopiedSdk] = useState(false);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const handleDownload = (targetPath: string, filename: string) => {
    const a = document.createElement("a");
    a.href = targetPath || `/downloads/${filename}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="integrations" ref={sectionRef} className="relative overflow-hidden bg-black text-white">
      {/* Header - Centered over connection image */}
      <div className="relative z-10 pt-28 lg:pt-36 text-center max-w-[1400px] mx-auto px-6 lg:px-12">
        <span
          className={`inline-flex items-center gap-4 text-sm font-mono text-cyan-400 mb-8 transition-all duration-700 justify-center ${isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          <span className="w-12 h-px bg-cyan-500/40" />
          Universal Distribution & Ecosystem
          <span className="w-12 h-px bg-cyan-500/40" />
        </span>

        <h2
          className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          Publish to
          <br />
          <span className="text-white/40">everything.</span>
        </h2>

        <p
          className={`mt-8 text-xl text-white/60 leading-relaxed max-w-xl mx-auto transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          Connect PressProtocol to your existing writing and publishing pipelines.
          Dual-publish to IPFS, Tor, and decentralized gateways without changing your CMS.
        </p>
      </div>

      {/* Full-width Neural Connection Image */}
      <div
        className={`relative left-1/2 -translate-x-1/2 w-screen -mt-12 transition-all duration-1000 delay-200 pointer-events-none ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/connection-KeJwWPQvn6l0a7C48tCARYtNEdC92H.png"
          alt="Neural network connection landscape"
          aria-hidden="true"
          className="w-full h-auto object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
      </div>

      {/* Integration Grid - Overlaps bottom of image */}
      <div className="relative z-10 -mt-16 lg:-mt-28 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className={`group relative overflow-hidden p-8 border bg-zinc-950/80 backdrop-blur-md transition-all duration-500 cursor-default ${hoveredIndex === index
                  ? "border-cyan-400/80 bg-zinc-900/90 scale-[1.02] shadow-xl shadow-cyan-950/30"
                  : "border-white/10 hover:border-white/25"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 50 + 250}ms` }}
              onMouseEnter={(e) => {
                setHoveredIndex(index);
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setMousePos(null);
              }}
            >
              {/* Cursor-following halo */}
              {hoveredIndex === index && mousePos && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6,182,212,0.15) 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Header tags */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <span className="font-mono text-xs text-white/50">{integration.category}</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {integration.badge}
                </span>
              </div>

              <h3 className="text-2xl font-display text-white mb-2 relative z-10">{integration.name}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8 relative z-10">{integration.description}</p>

              {/* Action Button */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                {integration.action === "download" && (
                  <button
                    onClick={() => handleDownload(integration.target || "", (integration.target ?? "package.zip").split("/").pop() || "package.zip")}
                    className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .zip</span>
                  </button>
                )}

                {integration.action === "copy" && (
                  <button
                    onClick={() => handleCopy(integration.snippet || "")}
                    className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedSdk ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Command</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Install Command</span>
                      </>
                    )}
                  </button>
                )}

                {integration.action === "link" && (
                  <a
                    href="https://github.com/0xshikhar/PressProtocol"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors"
                  >
                    <span>View Integration Docs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Animated underline */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                <div
                  className={`h-full bg-cyan-400 transition-all duration-500 ${hoveredIndex === index ? "w-full" : "w-0"
                    }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Row */}
        <div
          className={`flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-white/10 transition-all duration-1000 delay-500 pb-28 lg:pb-36 ${isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="flex flex-wrap gap-12">
            {[
              { value: "100%", label: "Open Source Software" },
              { value: "RFC 8032", label: "Ed25519 Cryptography" },
              { value: "Zero-Custody", label: "Client Key Sovereignty" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-3">
                <span className="text-3xl font-display text-white">{stat.value}</span>
                <span className="text-sm text-white/50 font-mono">{stat.label}</span>
              </div>
            ))}
          </div>

          <a
            href="https://github.com/0xshikhar/PressProtocol"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Explore Developer Documentation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
