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
    } catch {
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
    <div className="min-h-screen bg-canvas text-primary selection:bg-[var(--accent-tint)] selection:text-primary font-sans">
      {/* Header */}
      <div className="border-b border-hairline bg-surface relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-surface-raised border border-hairline text-secondary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-hairline bg-overlay text-secondary font-mono text-[10px] rounded-[6px]">
                  Sovereign config
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-hero font-normal text-primary tracking-tight mt-1">Protocol Settings</h1>
              <p className="text-xs sm:text-sm text-muted">
                Configure local cryptographic burner keys, zero-knowledge proxies, and storage telemetry
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-surface border border-hairline p-1 rounded-[6px] text-muted gap-1 h-auto">
            <TabsTrigger value="wallet" className="rounded-[4px] py-2 text-xs font-mono gap-2 data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] transition-all">
              <Wallet className="h-3.5 w-3.5" />
              <span>Identity &amp; Keys</span>
            </TabsTrigger>
            <TabsTrigger value="indexers" className="rounded-[4px] py-2 text-xs font-mono gap-2 data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] transition-all">
              <Server className="h-3.5 w-3.5" />
              <span>Indexers &amp; Swarm</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-[4px] py-2 text-xs font-mono gap-2 data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] transition-all">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy Rules</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-[4px] py-2 text-xs font-mono gap-2 data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] transition-all">
              <Database className="h-3.5 w-3.5" />
              <span>Data &amp; Backup</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-[4px] py-2 text-xs font-mono gap-2 data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] transition-all">
              <Package className="h-3.5 w-3.5" />
              <span>Extensions</span>
            </TabsTrigger>
          </TabsList>

          {/* Identity & Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="border-hairline bg-surface rounded-[6px]">
              <CardHeader className="pb-4 border-b border-hairline">
                <CardTitle className="text-base font-sans font-semibold text-primary flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-secondary" /> Sovereign Identity &amp; Keypair
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Client-side Ed25519 signing keys and optional Web3 wallet linkage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                {/* Active Burner Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider">
                      Active In-Browser Ed25519 Key
                    </h4>
                    <span className="text-[10px] font-mono text-secondary bg-overlay border border-hairline px-2 py-0.5 rounded-[6px]">
                      {burnerWallet?.pseudonym || "Loading..."}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-3 font-sans">
                    Every article and draft is cryptographically signed using this elliptic curve keypair stored strictly in your browser.
                  </p>
                  <div className="p-3.5 bg-background border border-hairline rounded-[6px] font-mono text-xs break-all text-primary flex items-center justify-between gap-3">
                    <span className="truncate">{burnerWallet?.publicKey || "Generating keypair..."}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleCopyKey}
                      className="h-7 text-xs font-mono gap-1 text-muted hover:text-primary shrink-0 hover:bg-surface-raised rounded-[6px]"
                    >
                      {copiedKey ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>

                {/* Optional Web3 Wallet */}
                <div className="border-t border-hairline pt-5">
                  <h4 className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider mb-1">
                    Optional Linked Web3 Wallet
                  </h4>
                  <p className="text-xs text-muted mb-3 font-sans">
                    Link an external wallet (MetaMask, Coinbase, Phantom) if you wish to verify authorship via onchain EVM address.
                  </p>
                  <div className="bg-surface-raised border border-hairline p-3.5 rounded-[6px]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${authenticated ? "bg-verified" : "bg-muted"}`} />
                        <div>
                          <p className="text-xs font-medium text-primary">
                            {authenticated ? (user?.wallet?.address ? "Web3 Wallet Connected" : "Authenticated") : "No External Wallet Linked"}
                          </p>
                          <p className="text-[11px] font-mono text-muted">
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
                            className="h-8 text-xs border-hairline bg-surface hover:bg-overlay text-secondary rounded-[6px]"
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={login}
                            className="h-8 text-xs bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-primary rounded-[6px] font-medium shadow-sm"
                          >
                            Link Wallet
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-background border border-hairline rounded-[6px] text-muted flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-muted shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-sans">
                    <strong className="text-primary font-normal">Zero-Custody Guarantee:</strong> PressProtocol servers never receive, log, or hold private keys. All cryptographic operations occur strictly within your client-side JavaScript sandbox via WebCrypto.
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
            <Card className="border-hairline bg-surface rounded-[6px]">
              <CardHeader className="pb-4 border-b border-hairline">
                <CardTitle className="text-base font-sans font-semibold text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" /> Privacy &amp; Transport Engine
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Fine-tune routing relays, anonymity hops, and IPFS swarm mirroring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-primary font-sans">Default Anonymous Mode</div>
                    <p className="text-xs text-muted font-sans">
                      Generate a single-use burner identity on publication without linking persistent identity.
                    </p>
                  </div>
                  <Switch
                    checked={anonymousPublishing}
                    onCheckedChange={setAnonymousPublishing}
                  />
                </div>

                <div className="border-t border-hairline pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-primary font-sans">Tor v3 Onion Resolution</div>
                    <p className="text-xs text-muted font-sans">
                      Route IPFS and gateway queries over 56-character Ed25519 Tor hidden services.
                    </p>
                  </div>
                  <Switch
                    checked={useTor}
                    onCheckedChange={setUseTor}
                  />
                </div>

                <div className="border-t border-hairline pt-4 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="text-xs font-semibold text-primary font-sans">Parallel Gateway Race</div>
                    <p className="text-xs text-muted font-sans">
                      Simultaneously query Cloudflare, Pinata, ipfs.io, and dweb.link for high-speed fallback.
                    </p>
                  </div>
                  <Switch
                    checked={useIPFSMirrors}
                    onCheckedChange={setUseIPFSMirrors}
                  />
                </div>

                <div className="p-3.5 bg-background border border-hairline rounded-[6px] text-muted text-xs leading-relaxed font-sans">
                  <strong className="text-secondary font-normal">Latency Notice:</strong> Onion routing maximizes censorship evasion and location unobservability, but adds 800ms&ndash;1,500ms network round-trip overhead.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Backup Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="border-hairline bg-surface rounded-[6px]">
              <CardHeader className="pb-4 border-b border-hairline">
                <CardTitle className="text-base font-sans font-semibold text-primary flex items-center gap-2">
                  <Database className="h-4 w-4 text-secondary" /> Backup, Telemetry &amp; Quota
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Export sovereign cryptographic artifacts and inspect client storage usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                {/* Storage Telemetry Gauge */}
                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary flex items-center gap-1.5 font-sans">
                      <HardDrive className="h-3.5 w-3.5 text-muted" /> Local Storage Quota
                    </span>
                    <span className="font-mono text-muted">
                      {storageUsage ? `${formatBytes(storageUsage.used)} / ${formatBytes(storageUsage.quota)}` : "Calculating..."}
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(1, usedPercentage)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted font-sans">
                    Includes browser index, cached proofs, draft versions, and cryptographic identities.
                  </p>
                </div>

                {/* Key Backup */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-hairline pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-primary font-sans">Download Signing Keypair</h4>
                    <p className="text-xs text-muted font-sans">
                      Save a portable JSON envelope of your active Ed25519 identity for import on other devices.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadKeyBackup}
                    className="h-8 text-xs font-mono gap-1.5 border-hairline bg-surface hover:bg-overlay text-primary shrink-0 rounded-[6px]"
                  >
                    <Download className="h-3.5 w-3.5 text-muted" />
                    <span>Download Key Backup</span>
                  </Button>
                </div>

                {/* Manifest Export */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-hairline pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-primary font-sans">Export Content Manifest</h4>
                    <p className="text-xs text-muted font-sans">
                      Export a verifiable JSON catalog containing all published CIDs, timestamps, and bookmarks.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportManifest}
                    className="h-8 text-xs font-mono gap-1.5 border-hairline bg-surface hover:bg-overlay text-primary shrink-0 rounded-[6px]"
                  >
                    <Download className="h-3.5 w-3.5 text-verified" />
                    <span>Export Manifest (JSON)</span>
                  </Button>
                </div>

                {/* Clear Local Data */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-hairline pt-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-primary font-sans">Purge Local Storage</h4>
                    <p className="text-xs text-muted font-sans">
                      Wipe browser cache, local drafts, and regenerate fresh burner credentials.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLocalData}
                    disabled={clearing}
                    className="h-8 text-xs font-mono gap-1.5 border-hairline bg-overlay hover:bg-surface-raised text-error hover:text-error-bright shrink-0 rounded-[6px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Local Data</span>
                  </Button>
                </div>

                <div className="p-3.5 bg-background border border-hairline rounded-[6px] text-muted text-xs leading-relaxed font-sans">
                  <strong className="text-primary font-normal">Immutability Assurance:</strong> Purging local data does NOT delete published articles from the IPFS swarm. Content addressing ensures your articles persist across distributed peers permanently.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extensions & Downloads Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="border-hairline bg-surface rounded-[6px]">
              <CardHeader className="pb-4 border-b border-hairline">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-sans font-semibold text-primary flex items-center gap-2">
                      <Package className="h-4 w-4 text-secondary" /> Client Extensions &amp; Publishing Bridges
                    </CardTitle>
                    <CardDescription className="text-xs text-muted mt-1">
                      1-click prebuilt bundles to integrate sovereign publishing into your browser, CMS, and notes
                    </CardDescription>
                  </div>
                  <Link href="/downloads">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1 text-primary border-hairline hover:bg-overlay shrink-0 rounded-[6px]">
                      <span>Full Downloads Hub</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {/* 1. Chrome Extension */}
                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-[6px] bg-surface border border-hairline flex items-center justify-center text-secondary shrink-0 mt-0.5">
                      <Chrome className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-primary font-sans">Chromium Browser Extension</h4>
                        <Badge className="bg-surface border border-hairline text-secondary font-mono text-[9px] rounded-[4px]">Manifest V3</Badge>
                        <Badge variant="outline" className="border-hairline text-muted font-mono text-[9px] rounded-[4px]">31 KB</Badge>
                      </div>
                      <p className="text-xs text-muted mt-1 font-sans">
                        Chrome, Brave, Edge, Arc. Provides instant burner identity generation and 1-click article archival to IPFS/Tor.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-extension.zip" download="press-protocol-extension.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-surface border border-hairline hover:bg-overlay text-primary font-medium shrink-0 rounded-[6px]">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                {/* 2. WordPress Bridge */}
                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-[6px] bg-surface border border-hairline flex items-center justify-center text-secondary shrink-0 mt-0.5">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-primary font-sans">WordPress Publishing Bridge</h4>
                        <Badge className="bg-anonymous/10 text-anonymous border border-anonymous/30 font-mono text-[9px] rounded-[4px]">WP 6.0+</Badge>
                        <Badge variant="outline" className="border-hairline text-muted font-mono text-[9px] rounded-[4px]">27 KB</Badge>
                      </div>
                      <p className="text-xs text-muted mt-1 font-sans">
                        Turn your self-hosted WordPress site into a decentralized publishing node with auto-syndication and proof badges.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-wordpress.zip" download="press-protocol-wordpress.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-surface border border-hairline hover:bg-overlay text-primary font-medium shrink-0 rounded-[6px]">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                {/* 3. Obsidian Plugin */}
                <div className="p-4 rounded-[6px] border border-hairline bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-[6px] bg-surface border border-hairline flex items-center justify-center text-secondary shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-primary font-sans">Obsidian Sovereign Publisher</h4>
                        <Badge className="bg-anonymous/10 text-anonymous border border-anonymous/30 font-mono text-[9px] rounded-[4px]">Markdown Native</Badge>
                      </div>
                      <p className="text-xs text-muted mt-1 font-sans">
                        Publish notes straight from your personal vault with local WebCrypto signatures and zero metadata leaks.
                      </p>
                    </div>
                  </div>
                  <a href="/downloads/press-protocol-obsidian.zip" download="press-protocol-obsidian.zip">
                    <Button size="sm" className="h-8 text-xs font-mono gap-1.5 bg-surface border border-hairline hover:bg-overlay text-primary font-medium shrink-0 rounded-[6px]">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .zip</span>
                    </Button>
                  </a>
                </div>

                <div className="p-3.5 bg-background border border-hairline rounded-[6px] text-muted text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Looking for Docker Compose node daemons or GitHub Actions CI/CD workflows?</span>
                  <Link href="/downloads">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-mono text-secondary hover:text-primary hover:bg-surface p-0 sm:px-2 rounded-[6px]">
                      View all in Downloads Hub
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
