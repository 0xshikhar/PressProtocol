"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, Lock, Eye, FileCheck, CheckCircle } from "lucide-react";

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Ephemeral in-memory signing",
    description: "Private keys are generated in volatile browser memory and wiped on close.",
    image: "/images/isolated.jpg",
  },
  {
    icon: Lock,
    title: "Cryptographic hash integrity",
    description: "Every payload is verified by SHA-256 multihashes and Ed25519 signatures.",
    image: "/images/encrypted.jpg",
  },
  {
    icon: Eye,
    title: "Immutable peer-to-peer trails",
    description: "Every published version produces a unique CID that cannot be retroactively altered.",
    image: "/images/audit.jpg",
  },
  {
    icon: FileCheck,
    title: "Tor onion transport failover",
    description: "Censorship-resistant routing guarantees access even under total clearnet DNS blocks.",
    image: "/images/permissions.jpg",
  },
];

const standards = ["Ed25519 RFC 8032", "IPFS CIDv1", "Tor v3 Onion", "Octant Public Goods"];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % securityFeatures.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" ref={sectionRef} className="relative py-28 lg:py-36 overflow-hidden bg-black text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20">
          <span
            className={`inline-flex items-center gap-4 text-sm font-mono text-cyan-400 mb-8 transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="w-12 h-px bg-cyan-500/40" />
            Security & Threat Model Architecture
          </span>

          <h2
            className={`text-6xl md:text-7xl lg:text-[112px] font-display tracking-tight leading-[0.9] mb-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Autonomous,
            <br />
            <span className="text-white/40">not vulnerable.</span>
          </h2>

          <div
            className={`transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              High-assurance architectural defense. Cryptographic identity and multi-transport redundancy guarantee articles survive state-level censorship, ISP blocklists, and hosting provider seizures.
            </p>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Large Visual Card with Dynamic Cross-Fading Images */}
          <div
            className={`lg:col-span-7 relative p-8 lg:p-12 border border-white/10 bg-zinc-950/80 min-h-[440px] overflow-hidden transition-all duration-700 flex flex-col justify-between ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Dynamic feature image with cross-fade */}
            <div className="absolute inset-0 pointer-events-none items-center justify-end hidden lg:flex">
              {securityFeatures.map((feature, index) => (
                <img
                  key={feature.image}
                  src={feature.image}
                  alt={feature.title}
                  className="absolute h-4/5 w-4/5 object-contain object-right transition-opacity duration-700"
                  style={{ opacity: activeFeature === index ? 0.75 : 0 }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-10">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Active Threat Immunity</span>
              <div className="mt-8">
                <span className="text-7xl lg:text-9xl font-display text-white">0</span>
                <span className="block text-white/60 mt-2 font-mono text-sm">Centralized points of censorship or key seizure</span>
              </div>
            </div>

            {/* Standard & Certification Badges */}
            <div className="relative z-10 pt-8 border-t border-white/10 flex flex-wrap gap-2">
              {standards.map((standard, index) => (
                <span
                  key={standard}
                  className={`px-3 py-1.5 rounded border border-white/10 bg-white/[0.03] text-xs font-mono text-white/70 flex items-center gap-1.5 transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  {standard}
                </span>
              ))}
            </div>
          </div>

          {/* Feature Cards Stack */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;

              return (
                <div
                  key={feature.title}
                  className={`p-6 border transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "border-cyan-400/80 bg-zinc-900/90 shadow-lg shadow-cyan-950/30"
                      : "border-white/10 bg-zinc-950/60 hover:border-white/30"
                  } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                        isActive
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                          : "border-white/10 bg-white/[0.02] text-white/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1 text-base">{feature.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
