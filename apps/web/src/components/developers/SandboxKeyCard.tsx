import React from "react";
import { Key, RefreshCw, Check, Copy, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SandboxKeyCardProps {
  apiKey: string;
  keyCopied: boolean;
  onGenerateNewKey: () => void;
  onCopyKey: () => void;
}

export default function SandboxKeyCard({
  apiKey,
  keyCopied,
  onGenerateNewKey,
  onCopyKey,
}: SandboxKeyCardProps) {
  return (
    <Card className="border border-cyan-500/20 bg-[#0B0D14] shadow-2xl rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <CardHeader className="pb-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Key className="h-4 w-4 text-cyan-400" />
              </div>
              <CardTitle className="text-xl font-bold text-white font-sans">1-Click Sandbox API Key</CardTitle>
            </div>
            <CardDescription className="text-xs text-white/60">
              Instant sandbox credential for testing endpoints and SDK integrations without registration or credit cards.
            </CardDescription>
          </div>
          <Button
            onClick={onGenerateNewKey}
            variant="outline"
            size="sm"
            className="gap-2 text-xs self-start sm:self-auto border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono rounded-xl h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" /> Generate New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 font-mono text-sm">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-sm tracking-wide text-cyan-300 shadow-inner focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <Button
            onClick={onCopyKey}
            className="gap-2 shrink-0 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs h-10 px-5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
          >
            {keyCopied ? <Check className="h-4 w-4 text-emerald-950" /> : <Copy className="h-4 w-4" />}
            {keyCopied ? "Copied!" : "Copy Key"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-white/60 font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white/80">Active Scopes:</span>
            <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-cyan-300">publish:raw</span>
            <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-cyan-300">publish:signed</span>
            <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-cyan-300">resolve</span>
            <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-cyan-300">verify</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Rate Limit: <strong className="text-white">120 req / min</strong> (Burst: 15)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
