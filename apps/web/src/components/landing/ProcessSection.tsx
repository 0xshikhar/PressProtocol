"use client";

import { useEffect, useRef, useState } from "react";
import { PenLine, Key, Send, Copy, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Write & Sanitize",
    subtitle: "clean Markdown composition",
    description:
      "Draft anonymously with zero cookies or telemetry. Client-side stripping removes device identifiers, EXIF camera metadata, and tracking pixels before hashing.",
    icon: PenLine,
    code: `// Step 1: Client-side EXIF and metadata stripping
const sanitizedDoc = sanitizePayload({
  title: "Decentralized Publishing Manifesto",
  body: markdownContent,
  timestamp: Date.now(),
  author: "Anonymous"
});
const canonicalJson = stableStringify(sanitizedDoc);
const payloadHash = sha256(canonicalJson);`,
  },
  {
    number: "02",
    title: "Sign Payload",
    subtitle: "client-side Ed25519 cryptography",
    description:
      "Your private key lives strictly in volatile memory. A single-click generates a detached Ed25519 digital signature over the SHA-256 canonical hash.",
    icon: Key,
    code: `// Step 2: In-memory cryptographic signature (RFC 8032)
const keypair = await ed25519.generateKeypair();
const signature = await ed25519.sign(payloadHash, keypair.privateKey);

const manifest = {
  cid: computeIpfsCid(sanitizedDoc),
  pubKey: toHex(keypair.publicKey),
  sig: toHex(signature),
  version: "1.0.0"
};`,
  },
  {
    number: "03",
    title: "Dual Distribution",
    subtitle: "IPFS pin & Tor broadcast",
    description:
      "The immutable payload is pinned to high-availability IPFS clusters and mirrored across Tor v3 hidden services. Censorship requires shutting down the global DHT.",
    icon: Send,
    code: `// Step 3: Multi-transport concurrent dispatch
const [ipfsResult, onionResult] = await Promise.all([
  pinata.pinJson(manifest),
  torGateway.publishOnion(manifest)
]);

console.log("Immutable CID:", ipfsResult.cid);
console.log("Onion Mirror:", onionResult.onionUrl);`,
  },
];

export function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-24 lg:py-36 bg-[#030712] text-white overflow-hidden border-y border-white/10"
    >
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header — Title + Monolith Image */}
        <div className="relative mb-0 lg:mb-4 grid lg:grid-cols-2 gap-4 lg:gap-12 items-end">
          {/* Left Title Column */}
          <div className="overflow-hidden pb-8 lg:pb-24">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <span className="inline-flex items-center gap-3 text-sm font-mono text-cyan-400 mb-8">
                <span className="w-12 h-px bg-cyan-500/40" />
                3-Step Publishing Pipeline
              </span>
            </div>

            <h2
              className={`text-6xl md:text-7xl lg:text-[120px] font-display tracking-tight leading-[0.88] transition-all duration-1000 delay-100 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
              }`}
            >
              <span className="block text-white">Write.</span>
              <span className="block text-cyan-400/80">Sign.</span>
              <span className="block text-white/20">Distribute.</span>
            </h2>
          </div>

          {/* Right Column: High-Res Monolith Architectural Artwork */}
          <div
            className={`relative h-[320px] lg:h-[580px] overflow-hidden transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/images/monolith.png"
              alt="Monolithic structure representing immutable publishing"
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-full h-full object-contain object-bottom"
            />
            {/* Fade on left and bottom edges */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Steps Layout with animated progress bar */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`relative text-left p-8 lg:p-10 border transition-all duration-500 ${
                  isActive
                    ? "bg-black border-cyan-400/80 shadow-lg shadow-cyan-950/40"
                    : "bg-black/60 border-white/10 hover:border-white/30"
                }`}
              >
                {/* Step number with animated line */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`text-4xl font-display transition-colors duration-300 ${
                      isActive ? "text-cyan-400" : "text-white/20"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1 h-px bg-white/10 overflow-hidden">
                    {isActive && (
                      <div className="h-full bg-cyan-400 animate-progress" />
                    )}
                  </div>
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-cyan-400" : "text-white/30"
                    }`}
                  />
                </div>

                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-display mb-1 text-white">
                  {step.title}
                </h3>
                <span className="text-sm font-mono text-cyan-400/70 block mb-4">
                  {step.subtitle}
                </span>

                {/* Description */}
                <p
                  className={`text-sm text-white/60 leading-relaxed transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {step.description}
                </p>

                {/* Bottom Active indicator line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 transition-transform duration-500 origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Code Preview Terminal for the Active Step */}
        <div className="relative bg-black border border-white/15 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-white/50">
                protocol-kernel/{steps[activeStep].title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}.ts
              </span>
            </div>
            <button
              onClick={() => handleCopyCode(steps[activeStep].code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white/70 border border-white/10 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-6 font-mono text-xs sm:text-sm text-cyan-300/90 overflow-x-auto leading-relaxed">
            <code>{steps[activeStep].code}</code>
          </pre>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 6.5s linear forwards;
        }
      `}</style>
    </section>
  );
}
