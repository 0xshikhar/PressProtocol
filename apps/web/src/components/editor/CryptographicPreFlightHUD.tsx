"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Key,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Sparkles,
  ExternalLink,
  Wand2,
  FileCode,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scanContentPrivacy, type PrivacyScanResult } from "@/lib/privacy-scanner";
import { calculateReadingTime } from "@/lib/reading-time";
import type { BurnerWallet } from "@/lib/burner-wallet";
import { toast } from "sonner";

interface CryptographicPreFlightHUDProps {
  cid: string;
  content: string;
  title: string;
  burnerWallet: BurnerWallet | null;
  onBurnWallet: () => Promise<void>;
  identityMode: "anonymous" | "verified";
  onCleanseTrackers: () => void;
  onZenToggle: () => void;
  isZenMode: boolean;
}

export function CryptographicPreFlightHUD({
  cid,
  content,
  title,
  burnerWallet,
  onBurnWallet,
  identityMode,
  onCleanseTrackers,
  onZenToggle,
  isZenMode,
}: CryptographicPreFlightHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"multihash" | "identity" | "privacy">("multihash");
  const [copiedCid, setCopiedCid] = useState(false);
  const [copiedPubKey, setCopiedPubKey] = useState(false);

  // Compute live privacy metrics
  const privacyScan: PrivacyScanResult = useMemo(() => {
    return scanContentPrivacy(content);
  }, [content]);

  // Compute live reading stats
  const readingStats = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  const handleCopyCid = () => {
    if (!cid) return;
    navigator.clipboard.writeText(cid);
    setCopiedCid(true);
    toast.success("Deterministic CID copied to clipboard");
    setTimeout(() => setCopiedCid(false), 2000);
  };

  const handleCopyPubKey = () => {
    if (!burnerWallet?.publicKey) return;
    navigator.clipboard.writeText(burnerWallet.publicKey);
    setCopiedPubKey(true);
    toast.success("Ed25519 Public Key copied");
    setTimeout(() => setCopiedPubKey(false), 2000);
  };

  const handleExportPrivateKey = () => {
    if (!burnerWallet?.privateKey) return;
    navigator.clipboard.writeText(burnerWallet.privateKey);
    toast.success("Private Key scalar copied to clipboard (Keep this safe!)");
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto">
      {/* Expanded Inspector Drawer */}
      {isExpanded && (
        <div className="mb-3 rounded-2xl border border-hairline bg-surface/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-verified" />
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                Cryptographic Pre-Flight HUD
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-verified/10 text-verified border border-verified/30">
                In-Memory RAM
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/40 px-2 pt-1 gap-1 bg-muted/10 text-xs">
            <button
              type="button"
              className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === "multihash"
                  ? "border-primary text-foreground bg-background/60"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("multihash")}
            >
              Deterministic CID
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "identity"
                  ? "border-primary text-foreground bg-background/60"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("identity")}
            >
              <span>Sovereign Identity</span>
              {burnerWallet && (
                <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              )}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "privacy"
                  ? "border-primary text-foreground bg-background/60"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("privacy")}
            >
              <span>Privacy Scanner</span>
              {privacyScan.isClean ? (
                <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 text-xs space-y-3 max-h-72 overflow-y-auto">
            {activeTab === "multihash" && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="font-medium">IPFS CIDv1 Multihash (raw-sha256)</span>
                    <button
                      type="button"
                      onClick={handleCopyCid}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedCid ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCid ? "Copied" : "Copy CID"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 font-mono text-[11px] text-foreground break-all border border-border/40 select-all">
                    {cid || "Type content to calculate..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Word Count</span>
                    <span className="font-semibold text-foreground text-sm">{readingStats.words} words</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Estimated Read</span>
                    <span className="font-semibold text-foreground text-sm">{readingStats.formattedTime}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  🛡️ This CID is deterministically calculated in local memory. The content hash is identical across any IPFS node in the world.
                </p>
              </div>
            )}

            {activeTab === "identity" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Active Pseudonym</span>
                    <span className="font-mono font-semibold text-sm text-verified">
                      {burnerWallet?.pseudonym || "Anon Burner"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                    onClick={onBurnWallet}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    Burn & Rotate
                  </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="font-medium">Ed25519 Public Key (RFC 8032)</span>
                    <button
                      type="button"
                      onClick={handleCopyPubKey}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedPubKey ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedPubKey ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 font-mono text-[10px] text-foreground break-all border border-border/30">
                    {burnerWallet?.publicKey || "No burner key initialized"}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                    onClick={handleExportPrivateKey}
                  >
                    <Key className="h-3 w-3" />
                    Copy Private Key Scalar
                  </Button>
                  <span className="text-[10px] text-muted-foreground font-mono">Volatile RAM Only</span>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Privacy Health Score</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold font-mono ${privacyScan.score >= 90 ? "text-verified" : "text-warning"}`}>
                        {privacyScan.score}/100
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {privacyScan.isClean ? "Zero surveillance beacons" : `${privacyScan.issuesCount} tracking issues detected`}
                      </span>
                    </div>
                  </div>

                  {!privacyScan.isClean && (
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 text-xs bg-verified hover:bg-verified-bright text-white"
                      onClick={onCleanseTrackers}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Cleanse Trackers
                    </Button>
                  )}
                </div>

                {privacyScan.issues.length > 0 ? (
                  <div className="space-y-1.5">
                    {privacyScan.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-md bg-warning/10 border border-warning/20 text-[11px] text-warning space-y-0.5"
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>{issue.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-verified/10 border border-verified/20 text-verified text-[11px] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Clean sovereign text. No tracking query params or surveillance scripts detected.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Status Pill Bar */}
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-full border border-hairline bg-surface/90 backdrop-blur-xl shadow-2xl text-xs">
        {/* CID indicator */}
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            setActiveTab("multihash");
          }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Shield className="h-3.5 w-3.5 text-verified group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11px] max-w-[100px] sm:max-w-[140px] truncate">
            {cid ? `${cid.slice(0, 8)}...${cid.slice(-4)}` : "Calculating..."}
          </span>
        </button>

        <div className="w-px h-3.5 bg-border/60" />

        {/* Word count */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>{readingStats.words}w</span>
        </div>

        <div className="w-px h-3.5 bg-border/60 hidden sm:block" />

        {/* Privacy Status */}
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab("privacy");
          }}
          className="flex items-center gap-1 text-[11px] hover:underline"
        >
          {privacyScan.isClean ? (
            <span className="flex items-center gap-1 text-verified">
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              <span className="hidden md:inline">Sovereign Clean</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-warning font-medium">
              <ShieldAlert className="h-3 w-3" />
              <span>{privacyScan.issuesCount} Trackers</span>
            </span>
          )}
        </button>

        <div className="w-px h-3.5 bg-border/60" />

        {/* Identity Pseudonym */}
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab("identity");
          }}
          className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-verified hover:underline"
        >
          <span>{burnerWallet?.pseudonym || "Anon Burner"}</span>
        </button>

        <div className="w-px h-3.5 bg-border/60 hidden lg:block" />

        {/* Zen Focus Mode Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={onZenToggle}
          title={isZenMode ? "Exit Zen Mode (Esc)" : "Enter Zen Mode (⌘+Shift+F)"}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>

        {/* Expand / Minimize Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse HUD" : "Expand Cryptographic HUD"}
        >
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
