import { Hero } from "@/components/landing/Hero";
import { BrokenWebComparison } from "@/components/landing/BrokenWebComparison";
import { FrontlinePersonas } from "@/components/landing/FrontlinePersonas";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { IntegrationMoat } from "@/components/landing/IntegrationMoat";
import { ProtocolBridge } from "@/components/landing/ProtocolBridge";
import { CallToAction } from "@/components/landing/CallToAction";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0A0C] text-[var(--text-primary)] selection:bg-[#7C2733]/40 selection:text-[#EEE7E1] overflow-x-hidden">
      <main className="pt-2 sm:pt-4">
        {/* 01 - Hero: Sovereign publishing infrastructure */}
        <Hero />

        {/* 02 - Philosophy: The Broken Web vs. The Sovereign Web */}
        <BrokenWebComparison />

        {/* 03 - Audience & Purpose: Built for work that needs to endure */}
        <FrontlinePersonas />

        {/* 04 - Publishing Process: From draft to durable publication + Reader Experience */}
        <HowItWorks />

        {/* 05 - Ecosystem Moat: Keep the workflow you already have + 1-Click Importers */}
        <IntegrationMoat />

        {/* 06 - Protocol Architecture & Invariants: Simple on the surface, open underneath -> /spec */}
        <ProtocolBridge />

        {/* 07 - Final Call to Action: Your work deserves to last */}
        <CallToAction />
      </main>
    </div>
  );
}
