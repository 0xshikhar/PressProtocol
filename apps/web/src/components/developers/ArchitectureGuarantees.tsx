import React from "react";
import { Zap, ShieldCheck, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArchitectureGuarantees() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <Card className="bg-[#0B0D14] border border-white/10 text-white rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
            <Zap className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold text-white font-sans">Sub-45ms Response SLA</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-white/60 leading-relaxed font-sans">
          By isolating heavy ZK proving algorithms to dedicated offline pipelines, every REST endpoint responds in under 45ms with zero native compiler dependencies.
        </CardContent>
      </Card>

      <Card className="bg-[#0B0D14] border border-white/10 text-white rounded-2xl shadow-xl hover:border-emerald-500/30 transition-all">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold text-white font-sans">Zero-Custody Architecture</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-white/60 leading-relaxed font-sans">
          Using <code className="font-mono text-cyan-300 bg-white/5 px-1.5 py-0.5 rounded">POST /api/v1/publish/signed</code>, client devices sign payloads locally in-memory. The gateway never receives, stores, or handles private keys.
        </CardContent>
      </Card>

      <Card className="bg-[#0B0D14] border border-white/10 text-white rounded-2xl shadow-xl hover:border-purple-500/30 transition-all">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 mb-2">
            <Database className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold text-white font-sans">Multi-Transport Redundancy</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-white/60 leading-relaxed font-sans">
          Every published CID is automatically mapped to IPFS DHT swarms, Tor v3 hidden services, and local peer caches for 100% censorship resistance.
        </CardContent>
      </Card>
    </section>
  );
}
