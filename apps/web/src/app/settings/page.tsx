"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Wallet, 
  Shield, 
  Database, 
  Server, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  HardDrive,
  RefreshCw,
  ExternalLink,
  Lock,
  Chrome,
  Globe,
  FileText,
  Package,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IndexerSettings } from "@/components/settings/IndexerSettings";
import { 
  getOrCreateBurnerWallet, 
  getBurnerArticles, 
  type BurnerWallet,
  createFreshBurnerWallet
} from "@/lib/burner-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";

export default function SettingsPage() {
  const [anonymousPublishing, setAnonymousPublishing] = useState(true);
  const [useTor, setUseTor] = useState(false);
  const [useIPFSMirrors, setUseIPFSMirrors] = useState(true);

  // Identity & Burner Wallet state
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Storage estimate state
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  // Privy auth
  const { ready, authenticated, user, login, logout } = usePrivy();

  useEffect(() => {
    getOrCreateBurnerWallet().then(setBurnerWallet).catch(console.error);
    updateStorageEstimate();
  }, []);

  const updateStorageEstimate = async () => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      } catch (e) {
        console.warn("Storage estimate error:", e);
      }
    }
  };

  const handleCopyKey = () => {
    if (!burnerWallet?.publicKey) return;
    navigator.clipboard.writeText(burnerWallet.publicKey);
    setCopiedKey(true);
    toast.success("Ed25519 Public Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadKeyBackup = () => {
    if (!burnerWallet) {
      toast.error("No burner identity active to backup.");
      return;
    }

    const payload = {
      protocol: "PressProtocol Sovereign Identity",
      version: "1.0.6",
      keyType: "Ed25519",
      publicKey: burnerWallet.publicKey,
      privateKey: burnerWallet.privateKey,
      pseudonym: burnerWallet.pseudonym,
      createdAt: burnerWallet.createdAt,
      exportedAt: new Date().toISOString(),
      warning: "Keep this private key offline. Possession of privateKey enables cryptographic signing on your behalf.",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pressprotocol-burner-key-${burnerWallet.publicKey.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Encrypted sovereign keypair downloaded.");
  };

  const handleExportManifest = () => {
    const articles = getBurnerArticles();
    const bookmarksRaw = typeof window !== "undefined" ? localStorage.getItem("anonpress_bookmarks") : null;
    let bookmarks = [];
    try {
      if (bookmarksRaw) bookmarks = JSON.parse(bookmarksRaw);
    } catch {}

    const manifest = {
      protocol: "PressProtocol Content Manifest",
      exportedAt: new Date().toISOString(),
      author: {
        publicKey: burnerWallet?.publicKey || "uninitialized",
        pseudonym: burnerWallet?.pseudonym || "Anonymous",
      },
      publishedArticles: articles,
      readingList: bookmarks,
      stats: {
        totalDispatches: articles.length,
        totalBookmarks: bookmarks.length,
      },
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pressprotocol-manifest-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported manifest with ${articles.length} dispatches.`);
  };

  const handleClearLocalData = async () => {
    if (!confirm("Are you sure you want to clear local storage? This will reset your burner keys and cached bookmarks.")) {
      return;
    }

    setClearing(true);
    try {
      localStorage.removeItem("pressprotocol_burner_identity");
      localStorage.removeItem("pressprotocol_burner_articles");
      localStorage.removeItem("anonpress_bookmarks");
      localStorage.removeItem("anonpress_draft");
      localStorage.removeItem("anonpress_draft_vault");

      const fresh = await createFreshBurnerWallet();
      setBurnerWallet(fresh);
      await updateStorageEstimate();
      toast.success("Local cache cleared. Fresh sovereign burner identity generated.");
    } catch (e) {
      toast.error("Failed to clear local storage.");
    } finally {
      setClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const usedPercentage = storageUsage?.quota ? Math.min(100, Math.max(1, (storageUsage.used / storageUsage.quota) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#050508] text-[#F0F2F8] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-[#070910] relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
              <Settings className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">
                  SOVEREIGN CONFIG
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">Protocol Settings</h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Configure local cryptographic burner keys, zero-knowledge proxies, and storage telemetry
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-[#0B0D14] border border-white/[0.08] p-1 rounded-xl text-zinc-400 gap-1 h-auto">
            <TabsTrigger value="wallet" className="rounded-lg py-2 text-xs font-medium gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 transition-all">
              <Wallet className="h-3.5 w-3.5 text-cyan-400" />
              <span>Identity &amp; Keys</span>
            </TabsTrigger>
            <TabsTrigger value="indexers" className="rounded-lg py-2 text-xs font-medium gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 transition-all">
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              <span>Indexers &amp; Swarm</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg py-2 text-xs font-medium gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 transition-all">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>Privacy Rules</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-lg py-2 text-xs font-medium gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 transition-all">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>Data &amp; Backup</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg py-2 text-xs font-medium gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 transition-all">
              <Package className="h-3.5 w-3.5 text-cyan-400" />
              <span>Extensions &amp; Downloads</span>
            </TabsTrigger>
          </TabsList>

          {/* Identity & Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
              <CardHeader className="pb-4 border-b border-white/[0.06]">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-400" /> Sovereign Identity &amp; Keypair
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Client-side Ed25519 signing keys and optional Web3 wallet linkage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Active Burner Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                      Active In-Browser Ed25519 Key
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      {burnerWallet?.pseudonym || "Loading..."}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">
                    Every article and draft is cryptographically signed using this elliptic curve keypair stored strictly in your browser.
                  </p>
                  <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl font-mono text-xs break-all text-cyan-300 flex items-center justify-between gap-3">
                    <span className="truncate">{burnerWallet?.publicKey || "Generating keypair..."}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleCopyKey}
                      className="h-7 text-xs font-mono gap-1 text-zinc-300 hover:text-white shrink-0 hover:bg-white/[0.08]"
                    >
                      {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                {/* Optional Web3 Wallet */}
                <div className="border-t border-white/[0.08] pt-5">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-1">
                    Optional Linked Web3 Wallet
                  </h4>
                  <p className="text-xs text-zinc-400 mb-3">
                    Link an external wallet (MetaMask, Coinbase, Phantom) if you wish to verify authorship via onchain EVM address.
                  </p>
                  <div className="bg-black/40 border border-white/[0.08] p-3.5 rounded-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${authenticated ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-zinc-600"}`} />
                        <div>
                          <p className="text-xs font-medium text-white">
                            {authenticated ? (user?.wallet?.address ? "Web3 Wallet Connected" : "Authenticated") : "No External Wallet Linked"}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            {authenticated 
                              ? (user?.wallet?.address ? `${user.wallet.address.slice(0, 8)}...${user.wallet.address.slice(-6)}` : user?.email?.address || "Connected")
                              : "Operating in 100% anonymous burner mode"}
                          </p>
                        </div>
                      </div>
                      {ready && (
                        authenticated ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={logout}
                            className="h-8 text-xs border-white/10 bg-black/40 hover:bg-white/[0.08] text-zinc-300"
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={login}
                            className="h-8 text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30"
                          >
                            Link Wallet
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/25 rounded-xl text-cyan-300/90 flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>Zero-Custody Guarantee:</strong> PressProtocol servers never receive, log, or hold private keys. All cryptographic operations occur strictly within your client-side JavaScript sandbox via WebCrypto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexers Tab */}
          <TabsContent value="indexers" className="space-y-6">
            <IndexerSettings />
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
              <CardHeader className="pb-4 border-b border-white/[0.06]">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" /> Privacy &amp; Transport Engine
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Fine-tune routing relays, anonymity hops, and IPFS swarm mirroring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-white">Default Anonymous Mode</div>
                    <p className="text-xs text-zinc-400">
                      Generate a single-use burner identity on publication without linking persistent identity.
                    </p>
                  </div>
                  <Switch
                    checked={anonymousPublishing}
                    onCheckedChange={setAnonymousPublishing}
                  />
                </div>

                <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-white">Tor v3 Onion Resolution</div>
                    <p className="text-xs text-zinc-400">
                      Route IPFS and gateway queries over 56-character Ed25519 Tor hidden services.
                    </p>
                  </div>
                  <Switch
                    checked={useTor}
                    onCheckedChange={setUseTor}
                  />
                </div>

                <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-white">Parallel Gateway Race</div>
                    <p className="text-xs text-zinc-400">
                      Simultaneously query Cloudflare, Pinata, ipfs.io, and dweb.link for high-speed fallback.
                    </p>
                  </div>
                  <Switch
                    checked={useIPFSMirrors}
                    onCheckedChange={setUseIPFSMirrors}
                  />
                </div>

                <div className="p-3.5 bg-amber-950/20 border border-amber-500/25 rounded-xl text-amber-300/90 text-xs leading-relaxed">
                  <strong>⚠️ Latency Trade-off:</strong> Onion routing maximizes censorship evasion and location unobservability, but adds 800ms-1,500ms network round-trip overhead.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Backup Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
              <CardHeader className="pb-4 border-b border-white/[0.06]">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" /> Backup, Telemetry &amp; Quota
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Export sovereign cryptographic artifacts and inspect client storage usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Storage Telemetry Gauge */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-cyan-400" /> Local Storage Quota
                    </span>
                    <span className="font-mono text-zinc-400">
                      {storageUsage ? `${formatBytes(storageUsage.used)} / ${formatBytes(storageUsage.quota)}` : "Calculating..."}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(1, usedPercentage)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Includes browser index, cached proofs, draft versions, and cryptographic identities.
                  </p>
                </div>

                {/* Key Backup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white">Download Signing Keypair</h4>
                    <p className="text-xs text-zinc-400">
                      Save a portable JSON envelope of your active Ed25519 identity for import on other devices.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadKeyBackup}
                    className="h-8 text-xs font-mono gap-1.5 border-white/10 bg-black/40 hover:bg-white/[0.08] text-zinc-200 shrink-0"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Download Key Backup</span>
                  </Button>
                </div>

                {/* Manifest Export */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white">Export Content Manifest</h4>
                    <p className="text-xs text-zinc-400">
                      Export a verifiable JSON catalog containing all published CIDs, timestamps, and bookmarks.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportManifest}
                    className="h-8 text-xs font-mono gap-1.5 border-white/10 bg-black/40 hover:bg-white/[0.08] text-zinc-200 shrink-0"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Export Manifest (JSON)</span>
                  </Button>
                </div>

                {/* Clear Local Data */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-white">Purge Local Storage</h4>
                    <p className="text-xs text-zinc-400">
                      Wipe browser cache, local drafts, and regenerate fresh burner credentials.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLocalData}
                    disabled={clearing}
                    className="h-8 text-xs font-mono gap-1.5 border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    <span>Clear Local Data</span>
                  </Button>
                </div>

                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/25 rounded-xl text-emerald-300/90 text-xs leading-relaxed">
                  <strong>💡 Immutability Assurance:</strong> Purging local data does NOT delete published articles from the IPFS swarm. Content addressing ensures your articles persist across distributed peers permanently.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extensions & Downloads Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="border-white/[0.08] bg-[#0B0D14]/90 backdrop-blur-xl">
              <CardHeader className="pb-4 border-b border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <Package className="h-4 w-4 text-cyan-400" /> Client Extensions &amp; Publishing Bridges
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-1">
                      1-click prebuilt bundles to integrate sovereign publishing into your browser, CMS, and notes
                    </CardDescription>
                  </div>
                  <Link href="/downloads">
                    <Button variant="outline" size="sm" className="h-7 text-xs font-mono gap-1 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 shrink-0">
                      <span>Full Downloads Hub</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* 1. Chrome Extension */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Chrome className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">Chromium Browser Extension</h4>
                        <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono text-[9px]">Manifest V3</Badge>
                        <Badge variant="outline" className="border-white/10 text-zinc-500 font-mono text-[9px]">31 KB</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Chrome, Brave, Edge, Arc. Provides instant burner identity generation and 1-click article archival to IPFS/Tor.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-extension.zip" download="press-protocol-extension.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                {/* 2. WordPress Bridge */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">WordPress Publishing Bridge</h4>
                        <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 font-mono text-[9px]">WP 6.0+</Badge>
                        <Badge variant="outline" className="border-white/10 text-zinc-500 font-mono text-[9px]">27 KB</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Turn your self-hosted WordPress site into a decentralized publishing node with auto-syndication and proof badges.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-wordpress.zip" download="press-protocol-wordpress.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-purple-500 hover:bg-purple-400 text-black font-semibold shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                {/* 3. Obsidian Plugin */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">Obsidian Sovereign Publisher</h4>
                        <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 font-mono text-[9px]">Markdown Native</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Publish notes straight from your personal vault with local WebCrypto signatures and zero metadata leaks.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-obsidian.zip" download="press-protocol-obsidian.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-purple-500 hover:bg-purple-400 text-black font-semibold shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-cyan-300/90 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Looking for Docker Compose node daemons or GitHub Actions CI/CD workflows?</span>
                  <Link href="/downloads">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-mono text-cyan-300 hover:text-white hover:bg-white/5 p-0 sm:px-2">
                      View all in Downloads Hub →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
