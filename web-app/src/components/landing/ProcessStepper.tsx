"use client";

import { useEffect, useState, useRef } from "react";
import { PenLine, Key, Share2, CheckCircle2, Shield, Code, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    tag: "CLIENT COMPOSITION",
    title: "Write & Sanitize",
    subtitle: "Zero-telemetry drafting",
    description:
      "Draft in our minimal distraction-free editor or import directly from WordPress or Ghost. HTML is deterministically sanitized client-side against strict XSS and tracking allowlists before leaving your browser.",
    bullets: [
      "No drafts saved to centralized database",
      "Tracking pixels and external analytics stripped",
      "Deterministic DOM canonicalization",
    ],
    code: `// 1. Client-side DOM Sanitization
const cleanEnvelope = sanitizeArticle({
  title: "Decentralized Truth in 2026",
  html: editor.getHTML(),
  allowlist: ['p', 'h1', 'h2', 'blockquote', 'code', 'img'],
  stripTrackers: true, // Strips cookies, beacons, & embeds
  timestamp: Date.now()
});`,
  },
  {
    number: "02",
    tag: "CLIENT CRYPTOGRAPHY",
    title: "Cryptographic Signing",
    subtitle: "In-memory Ed25519 sovereignty",
    description:
      "An Ed25519 keypair is generated in volatile browser memory. The private key signs the canonical SHA-256 hash of the sanitized payload. The private key is discarded immediately after signing; your identity is your public key.",
    bullets: [
      "Volatile memory only — never touches disk or server",
      "Ed25519 high-speed elliptic curve signatures",
      "Verifiable by any reader without trusted intermediaries",
    ],
    code: `// 2. Volatile Ed25519 Signing
const canonicalBytes = new TextEncoder().encode(JSON.stringify(cleanEnvelope));
const digest = await crypto.subtle.digest("SHA-256", canonicalBytes);

const signature = await ed25519.sign(new Uint8Array(digest), volatilePrivKey);
const authorPubKey = ed25519.getPublicKey(volatilePrivKey);
// Signature: 3a9f82c... attached to envelope`,
  },
  {
    number: "03",
    tag: "MULTI-NETWORK RESILIENCE",
    title: "Multi-Transport Pinning",
    subtitle: "Simultaneous IPFS + Tor replication",
    description:
      "The signed envelope is pinned across decentralized IPFS clusters, mapped to a Tor hidden service (.onion), and syndicated to global HTTP gateway mirrors. If any clearnet gateway is blocked, readers automatically fail over to alternate routes.",
    bullets: [
      "Immutable IPFS content addressing (CIDv1)",
      "Tor hidden service onion circuit redundancy",
      "Zero single points of failure across 30+ countries",
    ],
    code: `// 3. Multi-Transport Distribution
const bundle = await publishMultiTransport({
  payload: signedEnvelope,
  targets: [
    { transport: "IPFS", cluster: "helios-pinning", cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" },
    { transport: "TOR", onion: "press7fk2...onion" },
    { transport: "GATEWAYS", mirrors: ["pinata", "cloudflare", "ipfs.io"] }
  ]
});`,
  },
];

export function ProcessStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const STEP_DURATION = 6000; // 6 seconds per step

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update progress every 50ms
    const stepIncrement = (interval / STEP_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % steps.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, activeStep]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  return (
    <section id="process" className="relative py-28 lg:py-36 bg-[#04070e] text-white overflow-hidden border-t border-white/10">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-950/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6">
              <span>●</span>
              <span>VERIFIED WORKFLOW</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95] text-white">
              Deterministic.
              <br />
              <span className="text-white/40">From keystroke to peer.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm lg:text-base text-white/60 font-light leading-relaxed">
            Every publication executes a verifiable, mathematically provable cryptographic cycle designed to survive state censorship and gateway manipulation.
          </p>
        </div>

        {/* 3-Card Stepper Header Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => handleStepClick(idx)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`relative p-6 lg:p-8 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-white/[0.05] border-cyan-500/50 shadow-lg shadow-cyan-950/30"
                    : "bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                {/* Progress bar line for active step */}
                <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-2xl bg-white/5">
                  {isActive && (
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`font-mono text-2xl lg:text-3xl font-bold ${
                      isActive ? "text-cyan-400" : "text-white/30"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 px-2 py-0.5 rounded bg-white/5">
                    {step.tag}
                  </span>
                </div>

                <h3 className="font-display text-2xl lg:text-3xl text-white mb-2 font-medium">
                  {step.title}
                </h3>
                <p className="text-xs lg:text-sm text-white/50 line-clamp-2">{step.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Active Step Inspector Panel */}
        <div
          className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl p-6 lg:p-12 overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Description & Guarantees */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-400 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>STEP {steps[activeStep].number} SPECIFICATION</span>
              </div>
              <h4 className="font-display text-3xl lg:text-4xl text-white mb-4">
                {steps[activeStep].title}
              </h4>
              <p className="text-white/70 text-sm lg:text-base leading-relaxed mb-6 font-light">
                {steps[activeStep].description}
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10">
                {steps[activeStep].bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs lg:text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Code Terminal */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-white/10 bg-[#060a12] overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-white/40">
                      protocol-step-{steps[activeStep].number}.ts
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400/70 uppercase">
                    TypeScript SDK
                  </span>
                </div>

                {/* Code Content */}
                <div className="p-5 font-mono text-xs text-white/90 overflow-x-auto leading-relaxed bg-[#02050a]">
                  <pre>
                    <code>{steps[activeStep].code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
