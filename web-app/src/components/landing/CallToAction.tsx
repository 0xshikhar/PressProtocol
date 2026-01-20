"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Shield } from "lucide-react";

export function CallToAction() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-36 overflow-hidden bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-white/20 bg-zinc-950/80 overflow-hidden transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight Effect */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(700px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.25), transparent 50%)`,
            }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-8">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Uncensorable Sovereign Publishing</span>
                </div>

                <h2 className="text-5xl md:text-6xl lg:text-[76px] font-display tracking-tight mb-6 leading-[0.95] text-white">
                  Ready to publish
                  <br />
                  <span className="text-cyan-400">without permission?</span>
                </h2>

                <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-xl">
                  Join whistleblowers, investigative journalists, and independent researchers publishing on permanent decentralized infrastructure.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/write">
                    <Button
                      size="lg"
                      className="bg-white hover:bg-white/90 text-black font-semibold px-8 h-14 text-base rounded-full group shadow-xl hover:shadow-cyan-500/20 transition-all"
                    >
                      Start Publishing Free
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a
                    href="https://github.com/OxShikhar/anonpress"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-base rounded-full border-white/20 bg-white/[0.02] hover:bg-white/[0.08] text-white font-mono text-sm"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Source on GitHub
                    </Button>
                  </a>
                </div>

                <p className="text-xs text-white/40 mt-8 font-mono">
                  100% Free & Open Source · Zero KYC · In-browser Ed25519 Keys
                </p>
              </div>

              {/* Right Bridge Image from original template */}
              <div className="hidden lg:flex items-end justify-center w-[520px] h-[520px] -mr-12 shrink-0">
                <img
                  src="/images/bridge.png"
                  alt="Two glowing trees connected by electrical arcs"
                  className="w-full h-full object-contain object-bottom filter drop-shadow-[0_20px_40px_rgba(6,182,212,0.2)]"
                />
              </div>
            </div>
          </div>

          {/* Decorative Corners */}
          <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-white/10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-t border-r border-white/10" />
        </div>
      </div>
    </section>
  );
}
