"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, Twitter, Globe, Terminal, Shield, FileText } from "lucide-react";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  Protocol: [
    { name: "Start Publishing", href: "/write", external: false },
    { name: "Live Network Explorer", href: "/explorer", external: false },
    { name: "Protocol Sandbox", href: "#sandbox", external: false },
    { name: "Failover Infrastructure", href: "#network", external: false },
  ],
  Distribution: [
    { name: "WordPress Plugin", href: "https://github.com/0xshikhar/anonpress/tree/main/wordpress-plugin", external: true },
    { name: "Chromium Extension", href: "https://github.com/0xshikhar/anonpress/tree/main/browser-extension", external: true },
    { name: "TypeScript SDK", href: "https://www.npmjs.com/package/@pressprotocol/sdk", external: true },
    { name: "Tor Hidden Service", href: "#network", external: false },
  ],
  Assurance: [
    { name: "Octant Grant Strategy", href: "/docs/octant", external: false },
    { name: "Formal Threat Model", href: "#security", external: false },
    { name: "Architecture Whitepaper", href: "/docs/architecture", external: false },
    { name: "GitHub Monorepo", href: "https://github.com/0xshikhar/anonpress", external: true },
  ],
};

function AnimatedWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y =
            height * 0.5 +
            Math.sin(x * 0.008 + time + wave * 0.6) * 24 +
            Math.sin(x * 0.015 + time * 1.4 + wave) * 14;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-24 opacity-60" />;
}

export function LandingFooter() {
  return (
    <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden pt-20 pb-12">
      {/* Wave Canvas Banner */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
        <AnimatedWaveCanvas />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 mb-16 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors">
                  <span className="text-cyan-400 font-mono text-sm font-bold">¶</span>
                </div>
                <span className="font-display tracking-tight text-2xl text-white font-medium">
                  PressProtocol
                </span>
              </Link>
              <p className="text-sm text-white/60 font-light leading-relaxed max-w-sm mb-6">
                Institutional-grade censorship-resistant publishing protocol. Content addressing, client-side Ed25519 signatures, and automated multi-transport failover across IPFS and Tor.
              </p>
            </div>

            <div className="flex items-center gap-4 text-white/50 text-xs font-mono">
              <span>EST. 2026</span>
              <span>·</span>
              <span className="text-emerald-400">MAINNET LIVE</span>
              <span>·</span>
              <span>MIT LICENSE</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4">
                  {category}
                </h4>
                <ul className="space-y-3 font-mono text-xs">
                  {links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-cyan-400 transition-colors inline-flex items-center gap-1 group"
                        >
                          <span>{link.name}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-white/70 hover:text-cyan-400 transition-colors"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/40">
          <div>
            © {new Date().getFullYear()} PressProtocol Foundation. Designed for public goods & independent journalism.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/0xshikhar/anonpress"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/0xshikhar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://octant.build"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Octant Epoch Review
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
