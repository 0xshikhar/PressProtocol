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
                  Independent Publishing
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-hero tracking-tight mb-5 leading-[1.04] text-primary">
                  Your work deserves
                  <br />
                  <span className="text-secondary font-light">to last.</span>
                </h2>

                <p className="text-base sm:text-lg text-secondary mb-8 leading-relaxed max-w-xl font-light measure-lead">
                  Publish it your way. Keep control over how it is represented. Give readers a publication they can continue to find and verify.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/write" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary font-medium px-7 h-12 text-sm rounded-[6px] transition-colors flex items-center justify-center gap-2 group border border-[rgba(240,232,232,0.12)]"
                    >
                      <span>Start Writing</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/spec" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-6 text-sm rounded-[6px] border-hairline bg-transparent hover:bg-overlay text-secondary hover:text-primary font-mono"
                    >
                      Explore the Protocol
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-muted mt-6 font-mono">
                  Open Source (MIT) &bull; Client-Side Signing &bull; No Account Required to Read
                </p>
              </div>

              {/* Right: Editorial Sealed Publication Card */}
              <div className="hidden lg:flex flex-col justify-between p-6 rounded-[6px] border border-hairline bg-canvas w-[380px] shrink-0 shadow-sm relative overflow-hidden">
                <div className="w-full pb-3.5 border-b border-hairline flex items-center justify-between text-xs font-mono text-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    <span className="text-primary font-medium text-[11px] uppercase tracking-wider">Sealed Publication</span>
                  </div>
                  <span className="text-verified text-[11px] font-mono">Signed &bull; Preserved</span>
                </div>

                <div className="w-full py-5 space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Independent Dispatch
                  </div>
                  <h4 className="font-sans text-xl font-semibold text-primary leading-snug tracking-tight">
                    The Case for the Durable Essay
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                    <span className="font-medium text-primary">Maya Lindqvist</span>
                    <span className="text-muted">&bull; 7 min read</span>
                  </div>
                  <p className="text-xs text-secondary font-light leading-relaxed">
                    Your publishing history belongs to you. Not to an intermediary host, an algorithm, or a billing cycle.
                  </p>
                </div>

                <div className="w-full pt-3.5 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-muted">
                  <span className="text-secondary flex items-center gap-1">
                    <span className="text-verified">✓</span>
                    <span>Client-side proof attached</span>
                  </span>
                  <span className="text-[10px] text-muted">Standard Web Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
