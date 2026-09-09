import { Hero } from "@/components/landing/Hero";
import { FeaturedDispatches } from "@/components/landing/FeaturedDispatches";
import { GatewayTelemetry } from "@/components/landing/GatewayTelemetry";
import { ProcessStepper } from "@/components/landing/ProcessStepper";
import { TransportNetwork } from "@/components/landing/TransportNetwork";
import { ProtocolSandbox } from "@/components/landing/ProtocolSandbox";
import { EcosystemBento } from "@/components/landing/EcosystemBento";
import { PrivacyThreatModel } from "@/components/landing/PrivacyThreatModel";
import { CallToAction } from "@/components/landing/CallToAction";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0A0C] text-[var(--text-primary)] selection:bg-[#7C2733]/40 selection:text-[#EEE7E1] overflow-x-hidden">
      <main className="pt-2 sm:pt-4">
        {/* 1. Hero: Editorial Typography, Living Dispatch Card & Failover Demonstration */}
        <Hero />

        {/* 2. Featured Dispatches: Verified, unseizable investigative journalism */}
        <FeaturedDispatches />

        {/* 3. Live Gateway & Relay Telemetry: Real-time probes across edge relays */}
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

