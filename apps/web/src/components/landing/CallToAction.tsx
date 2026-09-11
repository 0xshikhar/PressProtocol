"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export function CallToAction() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden bg-canvas text-primary border-t border-hairline">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-hairline bg-surface rounded-[6px] overflow-hidden transition-all duration-1000 shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="flex-1">
                <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-4">
                  Sovereign Publishing &bull; Zero Cloud Custody
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-hero tracking-tight mb-5 leading-[0.98] text-primary">
                  Ready to publish
                  <br />
                  <span className="text-secondary font-light">without permission?</span>
                </h2>

                <p className="text-base sm:text-lg text-secondary mb-8 leading-relaxed max-w-xl font-light measure-lead">
                  Join whistleblowers, investigative journalists, and independent researchers publishing on permanent decentralized infrastructure.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/write" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium px-7 h-12 text-sm rounded-[6px] transition-colors flex items-center justify-center gap-2 group border border-[rgba(240,232,232,0.12)]"
                    >
                      <span>Start Writing Free</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a
                    href="https://github.com/0xshikhar/PressProtocol"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-6 text-sm rounded-[6px] border-hairline bg-transparent hover:bg-overlay text-secondary hover:text-primary font-mono"
                    >
                      <Github className="w-4 h-4 mr-2 text-muted" />
                      View Source on GitHub
                    </Button>
                  </a>
                </div>

                <p className="text-xs text-muted mt-6 font-mono">
                  100% Free &amp; Open Source &bull; No Accounts &bull; In-Browser Ed25519 Keys
                </p>
              </div>

              {/* Right: Cryptographic Manifest Signer Card */}
              <div className="hidden lg:flex flex-col justify-between p-6 rounded-[6px] border border-hairline bg-canvas w-[380px] shrink-0 font-mono shadow-sm relative overflow-hidden">
                <div className="w-full pb-3.5 border-b border-hairline flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-verified" />
                    <span className="text-primary font-medium text-[11px] uppercase">Protocol Verification</span>
                  </div>
                  <span className="text-muted text-[11px]">v1.6 Swarm</span>
                </div>

                <div className="w-full py-4 text-xs space-y-3 text-secondary">
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Cryptography</span>
                    <span className="text-primary text-xs">Ed25519-SHA256 (RFC 8032 in-browser)</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Distribution</span>
                    <span className="text-primary text-xs">Multi-Transport Failover (IPFS + Tor Onion)</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider mb-0.5">Key Custody</span>
                    <span className="text-verified text-xs font-medium">100% Volatile Client RAM (Zero Server Storage)</span>
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-hairline flex items-center justify-between text-[11px] text-muted">
                  <span>Tamper Resistance</span>
                  <span className="text-secondary">Deterministic CIDv1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
