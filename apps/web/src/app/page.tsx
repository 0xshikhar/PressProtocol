import { Hero } from "@/components/landing/Hero";
import { GatewayTelemetry } from "@/components/landing/GatewayTelemetry";
import { ProcessStepper } from "@/components/landing/ProcessStepper";
import { TransportNetwork } from "@/components/landing/TransportNetwork";
import { ProtocolSandbox } from "@/components/landing/ProtocolSandbox";
import { EcosystemBento } from "@/components/landing/EcosystemBento";
import { PrivacyThreatModel } from "@/components/landing/PrivacyThreatModel";
import { CallToAction } from "@/components/landing/CallToAction";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      <main className="pt-2 sm:pt-4">
        {/* 1. Hero: Editorial Typography, Letter Blur, Volumetric Depth & Protocol Telemetry */}
        <Hero />

        {/* 2. Live Gateway & Relay Telemetry: Real-time probes across Pinata, Cloudflare, Tor */}
        <GatewayTelemetry />

        {/* 3. 3-Step Interactive Process Stepper: Write & Sanitize -> Ed25519 Sign -> Dual Pin */}
        <ProcessStepper />

        {/* 4. Multi-Transport Failover Network with "Simulate ISP Gateway Block" Interactive Demo */}
        <TransportNetwork />

        {/* 5. Crown Jewel: Interactive Protocol Sandbox & Live Cryptographic Verifier */}
        <ProtocolSandbox />

        {/* 6. Universal Distribution Bento Grid: 1-Click Downloads & SDK Snippet */}
        <EcosystemBento />

        {/* 7. Security & Threat Model: Public Goods Threat Matrix */}
        <PrivacyThreatModel />

        {/* 8. Spotlight Call to Action: In-Memory Key Sovereign Publishing */}
        <CallToAction />
      </main>
    </div>
  );
}

