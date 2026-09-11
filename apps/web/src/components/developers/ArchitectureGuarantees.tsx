import React from "react";
import { Zap, ShieldCheck, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArchitectureGuarantees() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <Card elevation="card">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-[6px] bg-[rgba(124,39,51,0.14)] border border-[rgba(124,39,51,0.28)] flex items-center justify-center text-accent-ribbon mb-2">
            <Zap className="h-4 w-4 text-accent-ribbon" />
          </div>
          <CardTitle className="text-base font-medium text-text-primary font-sans">Sub-45ms Response SLA</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-secondary leading-relaxed font-sans">
          By isolating heavy ZK proving algorithms to dedicated offline pipelines, every REST endpoint responds in under 45ms with zero native compiler dependencies.
        </CardContent>
      </Card>

      <Card elevation="card">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-[6px] bg-verified/10 border border-verified/25 flex items-center justify-center text-verified mb-2">
            <ShieldCheck className="h-4 w-4 text-verified" />
          </div>
          <CardTitle className="text-base font-medium text-text-primary font-sans">Zero-Custody Architecture</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-secondary leading-relaxed font-sans">
          Using <code className="font-mono text-text-primary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">POST /api/v1/publish/signed</code>, client devices sign payloads locally in-memory. The gateway never receives, stores, or handles private keys.
        </CardContent>
      </Card>

      <Card elevation="card">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-[6px] bg-[#8770C4]/15 border border-[#8770C4]/30 flex items-center justify-center text-[#8770C4] mb-2">
            <Database className="h-4 w-4 text-[#8770C4]" />
          </div>
          <CardTitle className="text-base font-medium text-text-primary font-sans">Multi-Transport Redundancy</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-text-secondary leading-relaxed font-sans">
          Every published CID is automatically mapped to IPFS DHT swarms, Tor v3 hidden services, and local peer caches for 100% censorship resistance.
        </CardContent>
      </Card>
    </section>
  );
}
