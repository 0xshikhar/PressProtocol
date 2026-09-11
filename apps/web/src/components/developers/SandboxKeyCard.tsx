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
    <Card elevation="card" className="relative">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[6px] bg-[rgba(124,39,51,0.14)] border border-[rgba(124,39,51,0.28)] text-accent-ribbon">
                <Key className="h-4 w-4 text-accent-ribbon" />
              </div>
              <CardTitle className="text-xl font-medium text-text-primary font-sans">1-Click Sandbox API Key</CardTitle>
            </div>
            <CardDescription className="text-xs text-text-muted">
              Instant sandbox credential for testing endpoints and SDK integrations without registration or credit cards.
            </CardDescription>
          </div>
          <Button
            onClick={onGenerateNewKey}
            variant="outline"
            size="sm"
            className="gap-2 text-xs self-start sm:self-auto border-hairline bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary font-mono rounded-[6px] h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 text-accent-ribbon" /> Generate New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 font-mono text-sm">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="w-full rounded-[6px] border border-hairline bg-canvas px-4 py-2.5 font-mono text-sm tracking-wide text-text-primary shadow-inner focus:outline-none focus:border-hairline"
            />
          </div>
          <Button
            onClick={onCopyKey}
            className="gap-2 shrink-0 bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium text-xs h-10 px-5 rounded-[6px] shadow-none transition-all"
          >
            {keyCopied ? <Check className="h-4 w-4 text-verified" /> : <Copy className="h-4 w-4" />}
            {keyCopied ? "Copied!" : "Copy Key"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-text-muted font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text-secondary">Active Scopes:</span>
            <span className="px-2 py-0.5 rounded-[4px] border border-hairline bg-overlay text-[11px] text-text-secondary">publish:raw</span>
            <span className="px-2 py-0.5 rounded-[4px] border border-hairline bg-overlay text-[11px] text-text-secondary">publish:signed</span>
            <span className="px-2 py-0.5 rounded-[4px] border border-hairline bg-overlay text-[11px] text-text-secondary">resolve</span>
            <span className="px-2 py-0.5 rounded-[4px] border border-hairline bg-overlay text-[11px] text-text-secondary">verify</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-warning" />
            <span>Rate Limit: <strong className="text-text-primary tnum">120 req / min</strong> (Burst: 15)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
