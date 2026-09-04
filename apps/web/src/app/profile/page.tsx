"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Key, 
  Download, 
  Upload, 
  Flame, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Cpu,
  ArrowRight,
  ExternalLink,
  Code2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CidChip } from "@/components/protocol/CidChip";
import { SignatureBadge } from "@/components/protocol/SignatureBadge";
import { 
  getOrCreateBurnerWallet, 
  createFreshBurnerWallet, 
  burnCurrentWallet, 
  signWithBurner, 
  verifyBurnerSignature,
  getBurnerArticles,
  type BurnerWallet,
  type BurnerArticle
} from "@/lib/burner-wallet";
import { toast } from "sonner";

export default function ProfilePage() {
  const [wallet, setWallet] = useState<BurnerWallet | null>(null);
  const [articles, setArticles] = useState<BurnerArticle[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPrivKey, setCopiedPrivKey] = useState(false);
  const [showPrivKey, setShowPrivKey] = useState(false);

  // Signing Sandbox state
  const [sandboxMessage, setSandboxMessage] = useState("I affirm that this dispatch is authentic and uncompromised.");
  const [generatedSignature, setGeneratedSignature] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [verifyLatency, setVerifyLatency] = useState<number | null>(null);

  // Import key modal/drawer state
  const [showImport, setShowImport] = useState(false);
  const [importKeyInput, setImportKeyInput] = useState("");

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const active = await getOrCreateBurnerWallet();
      setWallet(active);
      const userArticles = getBurnerArticles();
      setArticles(userArticles);
    } catch (e) {
      console.error("Failed to load burner wallet:", e);
    }
  };

  const handleCopyPub = () => {
    if (!wallet?.publicKey) return;
    navigator.clipboard.writeText(wallet.publicKey);
    setCopiedKey(true);
    toast.success("Public key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyPriv = () => {
    if (!wallet?.privateKey) return;
    navigator.clipboard.writeText(wallet.privateKey);
    setCopiedPrivKey(true);
    toast.success("Private key copied to clipboard");
    setTimeout(() => setCopiedPrivKey(false), 2000);
  };

  const handleBurnAndRegenerate = async () => {
    if (!confirm("Are you sure you want to burn this sovereign identity? Any unpublished drafts tied to this key cannot be resigned.")) {
      return;
    }

    try {
      const fresh = await burnCurrentWallet(false);
      setWallet(fresh);
      setGeneratedSignature(null);
      setVerificationStatus("idle");
      toast.success("Burner identity burned. Fresh Ed25519 keypair provisioned!");
    } catch (e) {
      toast.error("Failed to regenerate identity");
    }
  };

  const handleExportKey = () => {
    if (!wallet) return;
    const payload = {
      protocol: "PressProtocol Sovereign Identity",
      version: "1.0.6",
      keyType: "Ed25519",
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      pseudonym: wallet.pseudonym,
      createdAt: wallet.createdAt,
      exportedAt: new Date().toISOString(),
      warning: "Keep this private key secret. Anyone with access can sign dispatches as you.",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pressprotocol-identity-${wallet.publicKey.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded sovereign identity backup.");
  };

  const handleImportKey = () => {
    const raw = importKeyInput.trim();
    if (!raw) return;

    try {
      let privHex = raw;
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        privHex = parsed.privateKey || "";
      }

      if (privHex.length !== 64) {
        toast.error("Invalid Ed25519 private key: must be a 64-character hexadecimal string.");
        return;
      }

      // We can update the burner identity in localStorage
      const ed = require("@noble/ed25519");
      const pubBytes = ed.getPublicKey(privHex);
      const pubHex = ed.etc.bytesToHex(pubBytes);
      const pseudonym = `Anon-${pubHex.slice(0, 4)}...${pubHex.slice(-4)}`;

      const imported: BurnerWallet = {
        publicKey: pubHex,
        privateKey: privHex,
        pseudonym,
        createdAt: Date.now(),
      };

      localStorage.setItem("pressprotocol_burner_identity", JSON.stringify(imported));
      setWallet(imported);
      setShowImport(false);
      setImportKeyInput("");
      toast.success(`Imported identity: ${pseudonym}`);
    } catch (e) {
      toast.error("Failed to parse private key payload.");
    }
  };

  const handleSignMessage = async () => {
    if (!wallet?.privateKey || !sandboxMessage) return;
    try {
      const sig = await signWithBurner(sandboxMessage, wallet.privateKey);
      setGeneratedSignature(sig);
      setVerificationStatus("idle");
      toast.success("Payload signed in-browser via RFC 8032 Ed25519.");
    } catch (e) {
      toast.error("Signing failed");
    }
  };

  const handleVerifySignature = async () => {
    if (!wallet?.publicKey || !sandboxMessage || !generatedSignature) return;
    const start = performance.now();
    try {
      const valid = await verifyBurnerSignature(sandboxMessage, generatedSignature, wallet.publicKey);
      const duration = Math.round(performance.now() - start);
      setVerifyLatency(duration);
      setVerificationStatus(valid ? "valid" : "invalid");
      if (valid) {
        toast.success(`Signature mathematically verified in ${duration}ms!`);
      } else {
        toast.error("Signature verification failed!");
      }
    } catch (e) {
      setVerificationStatus("invalid");
      toast.error("Verification error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#F0F2F8] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Cockpit Top Header */}
      <div className="border-b border-white/[0.08] bg-[#070910] relative">
        <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">
                    SOVEREIGN COCKPIT
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/30 text-emerald-400 font-mono text-[10px]">
                    ZERO-CUSTODY
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Sovereign Identity Cockpit
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Client-side Ed25519 key management, cryptographic attestation ledger, and air-gapped backups
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportKey}
                className="h-8 text-xs font-mono gap-1.5 border-white/10 bg-[#0B0D14] hover:bg-white/[0.08] text-zinc-300"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export Backup</span>
              </Button>
              <Button
                size="sm"
                asChild
                className="h-8 text-xs font-mono gap-1.5 bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
              >
                <Link href="/write">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Publish Dispatch</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl space-y-8">
        {/* Active Keypair & Cryptographic Controls */}
        <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-cyan-400" />
                  Active In-Browser Ed25519 Keypair
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Stored exclusively in browser LocalStorage. Private keys never touch any server.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImport(!showImport)}
                  className="h-7 text-[11px] font-mono gap-1 border-white/10 bg-black/40 text-zinc-300 hover:text-white"
                >
                  <Upload className="h-3 w-3 text-cyan-400" />
                  <span>Import Key</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBurnAndRegenerate}
                  className="h-7 text-[11px] font-mono gap-1 border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30"
                >
                  <Flame className="h-3 w-3 text-rose-400" />
                  <span>Burn Identity</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
            {/* Import Drawer/Box */}
            {showImport && (
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-cyan-400" /> Import Existing Ed25519 Identity
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Hex key or JSON backup</span>
                </div>
                <Input
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                  placeholder="Paste 64-char hex private key or JSON identity envelope..."
                  className="bg-black/60 border-white/10 text-xs font-mono text-white placeholder:text-zinc-600"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowImport(false)}
                    className="h-7 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleImportKey}
                    className="h-7 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  >
                    Apply Key
                  </Button>
                </div>
              </div>
            )}

            {/* Public Key Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Public Key</span>
                  <span className="text-zinc-500 font-normal font-mono">(RFC 8032 / 32 Bytes)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {wallet?.pseudonym || "Loading..."}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-xs text-cyan-300 flex items-center justify-between gap-3">
                <span className="truncate select-all">{wallet?.publicKey || "Generating in-browser..."}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPub}
                  className="h-7 text-xs font-mono gap-1 text-zinc-300 hover:text-white shrink-0 hover:bg-white/[0.08]"
                >
                  {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Private Key Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Private Key</span>
                  <span className="text-rose-400/80 font-normal font-mono">(Keep Confidential)</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivKey(!showPrivKey)}
                  className="h-6 text-[11px] font-mono text-zinc-400 hover:text-white gap-1"
                >
                  {showPrivKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPrivKey ? "Mask" : "Reveal"}</span>
                </Button>
              </div>
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-xs text-zinc-400 flex items-center justify-between gap-3">
                <span className="truncate select-all">
                  {wallet?.privateKey
                    ? showPrivKey
                      ? wallet.privateKey
                      : "•".repeat(48) + wallet.privateKey.slice(-16)
                    : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPriv}
                  className="h-7 text-xs font-mono gap-1 text-zinc-300 hover:text-white shrink-0 hover:bg-white/[0.08]"
                >
                  {copiedPrivKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPrivKey ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-Browser Cryptographic Attestation Sandbox */}
        <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  Live Cryptographic Signature Sandbox
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Verify in real time how client-side WebCrypto signs and asserts payload authenticity
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30 bg-cyan-950/30">
                WebCrypto API
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Message to Attest</label>
              <Textarea
                value={sandboxMessage}
                onChange={(e) => setSandboxMessage(e.target.value)}
                rows={2}
                className="bg-black/60 border-white/10 text-xs font-mono text-white resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSignMessage}
                size="sm"
                className="h-8 text-xs font-mono gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Sign with Active Key</span>
              </Button>
              {generatedSignature && (
                <Button
                  onClick={handleVerifySignature}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-mono gap-1.5 border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verify Signature In-Browser</span>
                </Button>
              )}
            </div>

            {/* Generated Signature Block */}
            {generatedSignature && (
              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-black/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
                    Generated Ed25519 Signature (128 Hex Chars)
                  </span>
                  {verificationStatus === "valid" && (
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-950/30">
                      ✓ Validated in {verifyLatency}ms
                    </Badge>
                  )}
                  {verificationStatus === "invalid" && (
                    <Badge variant="outline" className="text-[10px] font-mono text-rose-400 border-rose-500/30 bg-rose-950/30">
                      ✗ Verification Failed
                    </Badge>
                  )}
                </div>
                <div className="font-mono text-xs text-emerald-400 break-all select-all leading-relaxed">
                  {generatedSignature}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Published Attestation Ledger */}
        <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/[0.06] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Published Dispatches Ledger
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Articles signed with your local sovereign identities
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-zinc-300">
                {articles.length} Dispatches
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {articles.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">No Dispatches Published Yet</p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Draft your first article in the sovereign editor. Content will be signed with this Ed25519 identity and pinned to IPFS.
                  </p>
                </div>
                <Button size="sm" asChild className="mt-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
                  <Link href="/write">Open Sovereign Editor</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-zinc-400">
                      <th className="pb-3 font-semibold">Title</th>
                      <th className="pb-3 font-semibold">Content CID</th>
                      <th className="pb-3 font-semibold">Published</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {articles.map((item) => (
                      <tr key={item.cid} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-sans font-medium text-white max-w-[240px] truncate">
                          {item.title}
                        </td>
                        <td className="py-3">
                          <CidChip cid={item.cid} prefixLen={8} suffixLen={6} />
                        </td>
                        <td className="py-3 text-zinc-400 text-[11px]">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-[11px] text-cyan-400 hover:text-cyan-300">
                              <Link href={`/read/${item.cid}`}>
                                <span>Read</span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-[11px] text-zinc-400 hover:text-white">
                              <Link href={`/embed/builder?cid=${item.cid}`}>
                                <span>Embed</span>
                                <Code2 className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
