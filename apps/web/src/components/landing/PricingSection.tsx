"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap, HeartHandshake } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Anonymous Reader",
    description: "Read, verify, and mirror content anywhere globally",
    price: "$0",
    period: "forever free",
    features: [
      "Unlimited read access across all IPFS gateways",
      "Tor hidden service mirror resolution (.onion)",
      "In-browser Ed25519 signature verification",
      "Zero cookies, tracking, or device fingerprints",
      "Permanent local browser caching",
    ],
    cta: "Explore Articles",
    href: "/explore",
    highlight: false,
  },
  {
    name: "Independent Journalist",
    description: "Publish without permission, censorship, or KYC",
    price: "$0",
    period: "open protocol",
    features: [
      "In-browser Ed25519 cryptographic signing",
      "Dual IPFS cluster pinning & Tor onion broadcast",
      "Sub-120ms global gateway distribution",
      "EXIF & metadata sanitization engine",
      "WordPress, Ghost, & Obsidian integration",
      "Universal embeddable iframe reader widgets",
    ],
    cta: "Start Publishing Free",
    href: "/write",
    highlight: true,
  },
  {
    name: "Protocol Node Sponsor",
    description: "Support global pinning capacity and open infrastructure",
    price: "Public Good",
    period: "Open Grants",
    features: [
      "Dedicated high-bandwidth IPFS cluster pinners",
      "High-availability Tor v3 hidden onion bridges",
      "Real-time DHT routing telemetry dashboards",
      "Custom gateway domain integration",
      "Community-driven public goods stewardship",
    ],
    cta: "View Documentation",
    href: "/docs",
    highlight: false,
  },
];

export function PricingSection() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section id="pricing" ref={sectionRef} className="relative py-28 lg:py-40 bg-black text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic Offset with Whale Artwork */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-cyan-400 mb-8">
              <span className="w-12 h-px bg-cyan-500/40" />
              Public Goods & Sustainability Model
            </span>
            <h2
              className={`text-6xl md:text-7xl lg:text-[112px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Zero cost to
              <br />
              <span className="text-stroke">speak truth.</span>
            </h2>
            <p className="mt-8 text-xl text-white/60 leading-relaxed max-w-lg">
              PressProtocol is a digital public good supported by open-source community grants. Publishing and reading are free forever.
            </p>
          </div>

          <div className="lg:col-span-5 relative p-0 h-80 lg:h-96">
            {/* Whale Image from template */}
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <img
                src="/images/whale.png"
                alt="3D Whale representing community public goods"
                className="w-full h-full object-contain object-center filter drop-shadow-[0_20px_40px_rgba(6,182,212,0.15)]"
              />
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-4">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-zinc-950/80 border transition-all duration-700 rounded-xl p-8 lg:p-10 flex flex-col justify-between ${
                  tier.highlight
                    ? "border-cyan-400 bg-zinc-900/90 shadow-2xl shadow-cyan-950/50 lg:-translate-y-2"
                    : "border-white/10 hover:border-white/25"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400 text-black text-xs font-mono font-semibold uppercase tracking-wider rounded-full shadow-lg">
                      <Zap className="w-3 h-3 fill-current" />
                      Writers & Whistleblowers
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-8 pb-6 border-b border-white/10">
                    <span className="font-mono text-xs text-white/40">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2 text-white">{tier.name}</h3>
                    <p className="text-sm text-white/50 mt-2">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl lg:text-5xl font-display text-white">{tier.price}</span>
                      <span className="text-cyan-400 text-xs font-mono">/ {tier.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 mb-10">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  href={tier.href}
                  className={`w-full py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                    tier.highlight
                      ? "bg-cyan-400 text-black font-semibold hover:bg-cyan-300 shadow-lg shadow-cyan-500/20"
                      : "border border-white/20 text-white hover:border-white/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div
          className={`mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10 text-sm text-white/50 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-cyan-400" />
            <span>Funded as a public good for global investigative journalism</span>
          </div>
          <span className="font-mono text-xs text-white/40">Zero venture subsidies · Zero ad tracking</span>
        </div>
      </div>
    </section>
  );
}
