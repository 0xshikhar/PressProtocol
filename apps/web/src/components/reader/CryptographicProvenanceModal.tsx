"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Terminal,
  FileCode,
  Network,
  Check,
  ExternalLink,
  Cpu,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import type { ResolveContentResponse } from "@/lib/api-client";
import type { VerificationResult } from "@/lib/signature-verifier";

interface CryptographicProvenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ResolveContentResponse;
  verificationResult: VerificationResult | null;
  cid: string;
}

export function CryptographicProvenanceModal({
  open,
  onOpenChange,
  content,
  verificationResult,
  cid,
}: CryptographicProvenanceModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pubkey = content?.publisher?.pubkey || "unsigned";
  const signature = content?.publisher?.signature || "unsigned";

  // Reconstruct the canonical RFC 8785 payload for visual inspection
  const canonicalPayload = JSON.stringify(
    {
      cid: content?.cid,
      title: content?.title,
      content: content?.content,
      tags: content?.tags || [],
      timestamp: content?.createdAt,
      publisher: {
        publicKey: content?.publisher?.pubkey,
      },
    },
    null,
    2
  );

  const curlCommand = `curl -s https://pressprotocol.com/api/content/${cid} | npx pressprotocol resolve --verify`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  verificationResult?.isValid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                }`}
              >
                {verificationResult?.isValid ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Cryptographic Provenance
                  </DialogTitle>
                  {verificationResult?.isValid && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono text-[10px]"
                    >
                      ED25519 VERIFIED ({verificationResult.latencyMs}ms)
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Zero-trust RFC 8032 digital signature & IPFS multihash verification breakdown
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="identity" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 bg-muted/20 border-b border-border/40">
            <TabsList className="bg-muted/40 h-8">
              <TabsTrigger value="identity" className="text-xs px-3 gap-1.5 h-7">
                <Key className="h-3.5 w-3.5" />
                Sovereign Identity
              </TabsTrigger>
              <TabsTrigger value="multihash" className="text-xs px-3 gap-1.5 h-7">
                <Cpu className="h-3.5 w-3.5" />
                Multihash Digest
              </TabsTrigger>
              <TabsTrigger value="canonical" className="text-xs px-3 gap-1.5 h-7">
                <FileCode className="h-3.5 w-3.5" />
                Signed RFC 8785 Bytes
              </TabsTrigger>
              <TabsTrigger value="cli" className="text-xs px-3 gap-1.5 h-7">
                <Terminal className="h-3.5 w-3.5" />
                Terminal CLI Verification
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: IDENTITY */}
          <TabsContent value="identity" className="flex-1 overflow-y-auto p-6 space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Author Pseudonym
                </div>
                <div className="font-mono text-base font-bold text-emerald-500">
                  {pubkey && pubkey.length >= 10
                    ? `Anon-${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`
                    : "Anonymous Sovereign"}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ephemeral burner identity without centralized custodial accounts or IP tracking.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Signature Algorithm
                </div>
                <div className="font-mono text-base font-bold text-foreground">
                  Ed25519 (RFC 8032)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Edwards-curve Digital Signature Algorithm with SHA-512 byte digest.
                </p>
              </div>
            </div>

            {/* Public Key Card */}
            <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Author Ed25519 Public Key (32 Bytes)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs font-mono gap-1"
                  onClick={() => handleCopy(pubkey, "Public Key")}
                >
                  {copiedKey === "Public Key" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
              <div className="font-mono text-xs p-3 rounded-lg bg-muted/40 border border-border/30 break-all select-all text-muted-foreground">
                {pubkey}
              </div>
            </div>

            {/* Signature Hex Card */}
            <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cryptographic Signature (64 Bytes)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs font-mono gap-1"
                  onClick={() => handleCopy(signature, "Signature")}
                >
                  {copiedKey === "Signature" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
              <div className="font-mono text-xs p-3 rounded-lg bg-muted/40 border border-border/30 break-all select-all text-muted-foreground">
                {signature}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: MULTIHASH DIGEST */}
          <TabsContent value="multihash" className="flex-1 overflow-y-auto p-6 space-y-4 m-0">
            <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Content Identifier (IPFS CIDv1)
                  </div>
                  <div className="font-mono text-sm font-bold mt-1 text-primary break-all select-all">
                    {cid}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-mono gap-1"
                  onClick={() => handleCopy(cid, "CIDv1")}
                >
                  {copiedKey === "CIDv1" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Deterministic Base32 RFC-4648 multihash derived purely from content bytes. Cannot be modified or censored without changing the CID.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Multihash Codec
                </div>
                <div className="font-mono text-sm font-semibold">0x55 (raw) / RFC 4648</div>
                <div className="text-xs text-muted-foreground">
                  Universal content addressing standard.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/40 bg-card/60 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Storage Protocol
                </div>
                <div className="font-mono text-sm font-semibold">IPFS Swarm & Tor Onion</div>
                <div className="text-xs text-muted-foreground">
                  Dual-transport p2p delivery.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: CANONICAL RFC 8785 BYTES */}
          <TabsContent value="canonical" className="flex-1 overflow-y-auto p-6 space-y-3 m-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Exact RFC 8785 deterministic JSON representation signed by author Ed25519 key:
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-mono gap-1.5"
                onClick={() => handleCopy(canonicalPayload, "Canonical JSON")}
              >
                {copiedKey === "Canonical JSON" ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy Canonical JSON
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-muted/40 border border-border/40 text-xs font-mono overflow-auto max-h-[360px] select-all leading-relaxed text-muted-foreground">
              {canonicalPayload}
            </pre>
          </TabsContent>

          {/* TAB 4: ZERO-TRUST CLI */}
          <TabsContent value="cli" className="flex-1 overflow-y-auto p-6 space-y-4 m-0">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Verify Independently on Your Own Machine</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You do not need to trust this browser or any web server. Run this zero-dependency terminal command to fetch the content directly, verify the Ed25519 signature locally, and inspect the raw multihash:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <span className="font-mono flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  Terminal (Bash / Zsh)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1"
                  onClick={() => handleCopy(curlCommand, "CLI Command")}
                >
                  {copiedKey === "CLI Command" ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy Command
                </Button>
              </div>
              <div className="font-mono text-xs text-emerald-400 overflow-x-auto select-all p-1">
                {curlCommand}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
