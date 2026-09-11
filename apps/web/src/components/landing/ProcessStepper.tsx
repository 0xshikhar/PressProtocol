"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    tag: "Sanitization",
    title: "Write & Sanitize",
    subtitle: "Zero-telemetry drafting in browser memory",
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
    tag: "Cryptography",
    title: "Cryptographic Attestation",
    subtitle: "Client-side Ed25519, key never leaves device",
    description:
      "An Ed25519 keypair is generated in volatile browser memory. The private key signs the canonical RFC 8785 SHA-256 hash of the sanitized payload. The private key is discarded immediately after signing; your identity is your public key.",
    bullets: [
      "Volatile memory only - never touches disk or server",
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
    tag: "Replication",
    title: "Multi-Transport Pinning",
    subtitle: "Simultaneous IPFS + Tor replication",
    description:
      "The signed envelope is pinned across decentralized IPFS clusters, mapped to a Tor hidden service (.onion), and syndicated to global HTTP gateway mirrors. If any clearnet gateway is blocked, readers automatically fail over to alternate routes.",
    bullets: [
      "Immutable IPFS content addressing (CIDv1)",
      "Tor hidden service onion circuit redundancy",
      "Zero single points of failure across independent nodes",
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
  const STEP_DURATION = 6000;

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
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
    <section id="process" className="relative py-24 sm:py-32 bg-canvas text-primary border-t border-hairline">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        {/* Section Header: 1-Eyebrow Rule */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-muted uppercase mb-3">
              Verified Architecture &bull; Client Lifecycle
            </div>
            <h2 className="font-hero text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-primary">
              Deterministic.
              <br />
              <span className="text-secondary font-light">From keystroke to peer.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-secondary font-light leading-relaxed measure-lead">
            Every publication executes a verifiable, mathematically provable cryptographic cycle designed to survive network censorship and gateway manipulation.
          </p>
        </div>

        {/* 3-Card Stepper Header Grid (Section 3.3: Authentic 01/02/03 sequence) */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => handleStepClick(idx)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={cn(
                  "relative p-6 rounded-[6px] border cursor-pointer transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
                  isActive
                    ? "bg-elevated border-focus"
                    : "bg-surface border-hairline hover:border-focus"
                )}
              >
                {/* Progress bar line for active step: Press Burgundy accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden rounded-t-[6px] bg-white/[0.04]">
                  {isActive && (
                    <div
                      className="h-full bg-[var(--accent-primary)] transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span
                    className={cn(
                      "font-mono text-xl font-medium tabular-nums",
                      isActive ? "text-primary" : "text-muted"
                    )}
                  >
                    {step.number}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary px-2 py-0.5 rounded-[4px] bg-overlay border border-hairline">
                    {step.tag}
                  </span>
                </div>

                {/* Section 3.1 & 10: Inter ONLY for card title */}
                <h3 className="font-sans text-lg font-semibold text-primary mb-1.5 tracking-tight">
                  {step.title}
                </h3>
                <p className="font-sans text-xs text-secondary line-clamp-2 leading-relaxed">{step.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Active Step Inspector Panel (Card Elevation) */}
        <div
          key={activeStep}
          className="relative rounded-[6px] border border-hairline bg-surface p-6 lg:p-10 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Description & Guarantees */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-muted mb-3">
                <CheckCircle2 className="w-4 h-4 text-verified" />
                <span>Phase {steps[activeStep].number} &bull; Client Execution</span>
              </div>
              <h4 className="font-sans text-2xl lg:text-3xl font-semibold text-primary mb-4 tracking-tight">
                {steps[activeStep].title}
              </h4>
              <p className="text-secondary text-sm lg:text-base leading-relaxed mb-6 font-light measure-lead">
                {steps[activeStep].description}
              </p>

              <div className="space-y-2.5 pt-4 border-t border-hairline">
                {steps[activeStep].bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs lg:text-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Code Terminal */}
            <div className="lg:col-span-6">
              <div className="rounded-[6px] border border-hairline bg-canvas overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline bg-surface">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted/40" />
                    <div className="w-2 h-2 rounded-full bg-muted/40" />
                    <div className="w-2 h-2 rounded-full bg-muted/40" />
                    <span className="ml-2 font-mono text-[11px] text-muted">
                      protocol-step-{steps[activeStep].number}.ts
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted uppercase">
                    TypeScript
                  </span>
                </div>

                {/* Code Content */}
                <div className="p-5 font-mono text-xs text-primary/90 overflow-x-auto leading-relaxed bg-[#0E0C0E]">
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
