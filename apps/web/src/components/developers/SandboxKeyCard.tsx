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
    <Card className="border-blue-500/20 bg-gradient-to-br from-card via-blue-500/5 to-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl font-bold">1-Click Sandbox API Key</CardTitle>
            </div>
            <CardDescription>
              Instant sandbox credential for testing endpoints and SDK integrations without registration or credit cards.
            </CardDescription>
          </div>
          <Button
            onClick={onGenerateNewKey}
            variant="outline"
            size="sm"
            className="gap-2 text-xs self-start sm:self-auto border-blue-500/30 hover:bg-blue-500/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Generate New Key
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
              className="w-full rounded-md border border-input bg-muted/60 px-3 py-2 font-mono text-sm tracking-wide text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <Button
            onClick={onCopyKey}
            className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {keyCopied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
            {keyCopied ? "Copied!" : "Copy Key"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">Active Scopes:</span>
            <Badge variant="outline" className="font-mono text-[11px] bg-background">publish:raw</Badge>
            <Badge variant="outline" className="font-mono text-[11px] bg-background">publish:signed</Badge>
            <Badge variant="outline" className="font-mono text-[11px] bg-background">resolve</Badge>
            <Badge variant="outline" className="font-mono text-[11px] bg-background">verify</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Rate Limit: <strong className="text-foreground">120 req / min</strong> (Burst: 15)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
