import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { Hero } from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { InfrastructureSection } from "@/components/landing/InfrastructureSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { ProtocolSandbox } from "@/components/landing/ProtocolSandbox";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Floating Glass Navigation */}
      <LandingNavigation />

      <main>
        {/* 1. Hero Section with Looping Background Video, Blur Words, and Metric Bar */}
        <Hero />

        {/* 2. Capabilities & Features with Particle Canvas and 3D Architectural Render */}
        <FeaturesSection />

        {/* 3. How It Works (Write -> Sign -> Distribute) with Monolith Artwork & Code Terminal */}
        <ProcessSection />

        {/* 4. Global Infrastructure with 3D Globe Sphere, Animated Circuit SVG, and ISP Failover */}
        <InfrastructureSection />

        {/* 5. Live Protocol Telemetry with GridBackground Canvas, Wave Ribbon, and Number Scrambler */}
        <MetricsSection />

        {/* 6. Interactive Protocol Sandbox & Live In-Browser Ed25519 Cryptographic Verifier */}
        <ProtocolSandbox />

        {/* 7. Ecosystem & Integrations with Full-Width Neural Banner and Halo Cards */}
        <IntegrationsSection />

        {/* 8. Security & Threat Model with Cross-Fading Images and Certifications */}
        <SecuritySection />

        {/* 9. Public Goods & Sustainability Model with 3D Whale and Outline Typography */}
        <PricingSection />

        {/* 10. Call to Action with Glowing Trees Bridge Artwork and Spotlight */}
        <CallToAction />
      </main>

      {/* 11. Panoramic Bioluminescent Horizon Banner and Harmonic Wave Footer */}
      <LandingFooter />
    </div>
  );
}
