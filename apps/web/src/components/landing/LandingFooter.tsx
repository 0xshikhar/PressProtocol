"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
  badge?: string;
}

const footerLinks: Record<string, FooterLink[]> = {
  Protocol: [
    { name: "Write Article", href: "/write" },
    { name: "Explore Manifests", href: "/explore" },
    { name: "Protocol Spec", href: "/spec" },
    { name: "Documentation", href: "/docs" },
  ],
  Transports: [
    { name: "Pinata IPFS Gateway", href: "https://gateway.pinata.cloud", external: true },
    { name: "Cloudflare Web3", href: "https://cloudflare-ipfs.com", external: true },
    { name: "IPFS DHT Node", href: "https://ipfs.io", external: true },
    { name: "Tor v3 Onion Mirror", href: "http://pressprotocol.onion", external: true },
  ],
  Developers: [
    { name: "GitHub Repository", href: "https://github.com/0xshikhar/PressProtocol", external: true },
    { name: "Ed25519 Spec (RFC 8032)", href: "/spec" },
    { name: "WordPress Plugin", href: "#ecosystem" },
    { name: "Chromium Extension", href: "#ecosystem" },
  ],
  Company: [
    { name: "Support (100% Solo-Built Public Good) ♥", href: "/support" },
    { name: "About PressProtocol", href: "/about" },
    { name: "Public Goods Mission", href: "/about" },
    { name: "Architecture Spec", href: "/spec" },
  ],
  Legal: [
    { name: "Zero-Log Privacy", href: "/privacy" },
    { name: "Terms & Licensing", href: "/terms" },
    { name: "Threat Model", href: "#security" },
  ],
};

const socialLinks = [
  { name: "GitHub", href: "https://github.com/0xshikhar/PressProtocol" },
  { name: "Twitter", href: "https://twitter.com/pressprotocol" },
  { name: "Documentation", href: "/docs" },
];

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
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
      ctx.lineWidth = 1;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y =
            height * 0.5 +
            Math.sin(x * 0.01 + time + wave * 0.5) * 25 +
            Math.sin(x * 0.02 + time * 1.5 + wave) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />;
}

export function LandingFooter() {
  return (
    <footer className="relative bg-black text-white border-t border-white/10">
      {/* Sleek Harmonic Wave Canvas Header */}
      <div className="h-24 w-full relative overflow-hidden bg-gradient-to-b from-black via-zinc-950/60 to-black">
        <AnimatedWaveCanvas />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors overflow-hidden p-1">
                  <Image
                    src="/pressprotocol-logo-small.png"
                    alt="PressProtocol Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-2xl font-display tracking-tight text-white group-hover:text-cyan-300 transition-colors">PressProtocol</span>
              </Link>

              <p className="text-white/50 leading-relaxed mb-8 max-w-xs text-sm">
                Open, uncensorable publishing infrastructure. Content-addressed with IPFS, anonymized with Tor, and verified with client-side Ed25519 keys.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1 group font-mono text-xs"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-white mb-6 font-mono text-xs uppercase tracking-wider text-cyan-400/90">
                  {title}
                </h3>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer" : undefined}
                        className="text-xs text-white/50 hover:text-white transition-colors inline-flex items-center gap-1.5"
                      >
                        {link.name}
                        {link.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Harmonic Wave Canvas Strip */}
        <div className="h-16 w-full relative overflow-hidden border-t border-white/10 opacity-70">
          <AnimatedWaveCanvas />
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-white/40">
            &copy; 2026 PressProtocol. Open censorship-resistant infrastructure under MIT License.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-white/50">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/spec" className="hover:text-white transition-colors">Spec</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <span className="hidden sm:inline text-white/20">|</span>
            <a href="#telemetry" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Multi-Transport Mesh Active
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
