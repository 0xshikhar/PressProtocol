import { ShieldCheck, Code, Globe, Layers } from "lucide-react";

export function ProofRibbon() {
  return (
    <div className="border-y border-hairline bg-surface/50 backdrop-blur-sm py-4">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-8 text-xs font-mono text-secondary">
          <div className="flex items-center gap-2">
            <Code className="h-3.5 w-3.5 text-muted" />
            <span className="text-primary font-medium">Open Source (MIT)</span>
            <span className="text-muted/60">&bull; Verifiable Substrate</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted" />
            <span className="text-primary font-medium">Live Protocol</span>
            <span className="text-muted/60">&bull; Multi-Network Routing</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-verified" />
            <span className="text-primary font-medium">Client-Side Cryptography</span>
            <span className="text-muted/60">&bull; Ed25519 Local Signing</span>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted" />
            <span className="text-primary font-medium">8+ Publishing Integrations</span>
            <span className="text-muted/60">&bull; Active Ecosystem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
