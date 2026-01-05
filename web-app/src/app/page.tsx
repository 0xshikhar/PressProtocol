import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { Hero } from "@/components/landing/Hero";
import { GatewayTelemetry } from "@/components/landing/GatewayTelemetry";
import { ProcessStepper } from "@/components/landing/ProcessStepper";
import { TransportNetwork } from "@/components/landing/TransportNetwork";
import { ProtocolSandbox } from "@/components/landing/ProtocolSandbox";
import { EcosystemBento } from "@/components/landing/EcosystemBento";
import { PrivacyThreatModel } from "@/components/landing/PrivacyThreatModel";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Floating Glass Navigation */}
      <LandingNavigation />

      <main>
        {/* P2: Hero & Live Protocol Metric Bar */}
        <Hero />

        {/* Real-time Gateway Pings & Relay Telemetry */}
        <GatewayTelemetry />

        {/* P4: 3-Step Interactive Process Stepper (Write -> Sign -> Pin) */}
        <ProcessStepper />

        {/* P5: Multi-Transport Failover Network (IPFS + Tor + Mirrors) */}
        <TransportNetwork />

        {/* P3: Crown Jewel Interactive Protocol Sandbox & Signature Verifier */}
        <ProtocolSandbox />

        {/* P6: Universal Ecosystem Bento Grid & Downloads (WordPress, Chrome MV3, SDK) */}
        <EcosystemBento />

        {/* P7: Security & Formal Threat Model (Octant Public Goods Review) */}
        <PrivacyThreatModel />

        {/* Primary Call to Action */}
        <CallToAction />
      </main>

      {/* Cyber-Infrastructure Animated Wave Footer */}
      <LandingFooter />
    </div>
  );
}
