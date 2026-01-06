"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Shield, CheckCircle2 } from "lucide-react";

export function CallToAction() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section className="relative py-28 lg:py-36 bg-black text-white overflow-hidden border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          onMouseMove={handleMouseMove}
          className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent p-10 lg:p-20 overflow-hidden shadow-2xl group"
        >
          {/* Dynamic Spotlight Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-20"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6, 182, 212, 0.25), transparent 45%)`,
            }}
          />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-8">
              <span>●</span>
              <span>UNGOVERNABLE PUBLISHING</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white mb-6">
              Ready to publish
              <br />
              <span className="text-white/40">without permission?</span>
            </h2>

            <p className="text-base sm:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-2xl">
              Zero accounts to register. Zero credit cards to link. Volatile Ed25519 signing directly in your browser, automatically mirrored across IPFS clusters and Tor hidden services.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/write">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-black font-medium h-14 px-8 rounded-xl text-base shadow-2xl hover:shadow-cyan-500/25 transition-all group"
                >
                  Start Publishing Now
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-7 rounded-xl text-base text-white border-white/20 hover:bg-white/10 font-mono text-sm"
                >
                  Explore Decentralized Feed
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 font-mono text-xs text-white/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero IP Logging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Open Source MIT</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Transport Failover</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
