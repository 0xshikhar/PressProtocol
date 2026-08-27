import React from "react";
import { Zap, ShieldCheck, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArchitectureGuarantees() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
            <Zap className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold">Sub-45ms Response SLA</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed">
          By isolating heavy ZK proving algorithms to dedicated offline pipelines, every REST endpoint responds in under 45ms with zero native compiler dependencies.
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-2">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold">Zero-Custody Architecture</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed">
          Using <code className="font-mono text-foreground">POST /api/v1/publish/signed</code>, client devices sign payloads locally in-memory. The gateway never receives, stores, or handles private keys.
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-2">
            <Database className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold">Multi-Transport Redundancy</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed">
          Every published CID is automatically mapped to IPFS DHT swarms, Tor v3 hidden services, and local peer caches for 100% censorship resistance.
        </CardContent>
      </Card>
    </section>
  );
}
