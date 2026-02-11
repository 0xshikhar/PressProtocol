"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Network, KeyRound, Globe, ArrowUpRight } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Cryptographic Provenance",
    description:
      "Every article is signed directly in the browser with ephemeral Ed25519 keypairs. Mathematical certainty that content has not been tampered with in transit.",
    stats: { value: "100%", label: "mathematically verifiable" },
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Multi-Transport Redundancy",
    description:
      "Articles are broadcast across Pinata IPFS, Cloudflare Web3, Tor onion hidden services, and public DHT nodes simultaneously with automated failover.",
    stats: { value: "3", label: "failover networks" },
    icon: Network,
  },
  {
    number: "03",
    title: "Ephemeral Key Sovereignty",
    description:
      "Private keys exist exclusively in browser volatile RAM during signing and vanish upon session close. Zero accounts, zero cookies, zero server-side key custody.",
    stats: { value: "0", label: "keys stored server-side" },
    icon: KeyRound,
  },
  {
    number: "04",
    title: "Sub-Second Global Resolution",
    description:
      "Content-addressed SHA-256 multihashes resolve globally through distributed content gateways with edge caching and Tor circuit fallbacks.",
    stats: { value: "<120ms", label: "global gateway latency" },
    icon: Globe,
  },
];

// Floating dot particles visualization from original template
function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Generate stable particle positions
    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: (seed * 127.1) % 1,
        by: (seed * 311.7) % 1,
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;

        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);

        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-36 overflow-hidden bg-black text-white"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Full width with diagonal layout */}
        <div className="relative mb-20 lg:mb-28">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-cyan-400 mb-6">
                <span className="w-12 h-px bg-cyan-500/40" />
                Capabilities & Threat Resistance
              </span>
              <h2
                className={`text-6xl md:text-7xl lg:text-[112px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Censorship-resistant
                <br />
                <span className="text-white/40">infrastructure.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pb-4">
              <p
                className={`text-lg text-white/60 leading-relaxed transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Deploy cryptographic publishing pipelines that execute across distributed peer-to-peer storage and onion routing. No centralized gatekeepers.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout with 3D Artwork */}
        <div className="grid lg:grid-cols-12 gap-6 mb-6">
          {/* Large Hero feature card with Particle Canvas and Mirrored 3D Render */}
          <div
            className={`lg:col-span-12 relative bg-zinc-950/80 border border-white/10 min-h-[500px] overflow-hidden group transition-all duration-700 flex flex-col lg:flex-row ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            onMouseEnter={() => setActiveFeature(0)}
          >
            {/* Left: text content + particle canvas */}
            <div className="relative flex-1 p-8 lg:p-14 z-10 flex flex-col justify-between">
              <ParticleVisualization />
              <div className="relative z-10">
                <span className="font-mono text-sm text-cyan-400 font-semibold">{features[0].number}</span>
                <h3 className="text-3xl lg:text-5xl font-display mt-4 mb-6 group-hover:translate-x-2 transition-transform duration-500 text-white">
                  {features[0].title}
                </h3>
                <p className="text-lg text-white/60 leading-relaxed max-w-lg mb-8">
                  {features[0].description}
                </p>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-6">
                <span className="text-5xl lg:text-7xl font-display text-white tracking-tight">
                  {features[0].stats.value}
                </span>
                <span className="block text-sm text-white/40 font-mono mt-2 uppercase tracking-wider">
                  {features[0].stats.label}
                </span>
              </div>
            </div>

            {/* Right: mirrored 3D Architectural sculpture */}
            <div className="hidden lg:block relative w-[44%] shrink-0 overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2812%29-ng3RrNnsPMJ5CrtOjcPTmhHg01W11q.png"
                alt="Cryptographic structure render"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Fade left edge into black */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* 3 Secondary Capability Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.slice(1).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.number}
                className={`relative p-8 lg:p-10 bg-zinc-950/60 border border-white/10 hover:border-white/25 transition-all duration-500 flex flex-col justify-between group ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${(index + 1) * 120}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-sm text-white/40">{feature.number}</span>
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h4 className="text-2xl font-display text-white mb-3 group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <span className="text-3xl font-display text-white">{feature.stats.value}</span>
                  <span className="block text-xs font-mono text-white/40 mt-1 uppercase tracking-wider">
                    {feature.stats.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
