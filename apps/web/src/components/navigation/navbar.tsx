"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  BookMarked,
  TrendingUp,
  FileText,
  Settings,
  User,
  UploadCloud,
  Terminal,
  Globe,
  BookOpen,
  Activity,
  ChevronDown,
  HardDrive,
  CheckCircle2,
  UserCheck,
  Cpu,
  Share2,
  BarChart3,
  Key,
  Shield,
  Flame,
  Copy,
  Check,
  Layers,
  Heart,
  ExternalLink,
  Download,
  PenLine
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getOrCreateBurnerWallet,
  burnCurrentWallet,
  type BurnerWallet
} from "@/lib/burner-wallet";
import { toast } from "sonner";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load sovereign burner identity from browser localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("pressprotocol_burner_identity");
      if (raw) {
        try {
          setBurnerWallet(JSON.parse(raw));
        } catch (e) {
          console.warn("Could not parse existing burner identity");
        }
      }
    }
  }, [pathname]);

  // Only suppress on standalone embed iframe
  if (pathname?.startsWith("/embed/")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleSetupLocalKey = async () => {
    try {
      const wallet = await getOrCreateBurnerWallet();
      setBurnerWallet(wallet);
      toast.success("Sovereign Ed25519 keypair generated in browser!");
    } catch (err) {
      toast.error("Failed to generate local key");
    }
  };

  const handleCopyKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (burnerWallet?.publicKey) {
      navigator.clipboard.writeText(burnerWallet.publicKey);
      setCopiedKey(true);
      toast.success("Public key copied to clipboard");
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleBurn = async () => {
    if (confirm("Are you sure you want to burn this sovereign identity? All local keys will be wiped from this device.")) {
      const fresh = await burnCurrentWallet(true);
      setBurnerWallet(fresh);
      toast.success("Local identity burned. Fresh sovereign key initialized.");
      router.push("/profile");
    }
  };

  // 1. Dispatches Header Cluster
  const dispatchesLinks = [
    { href: "/explore", label: "Explore Feed", icon: Search, desc: "Browse the live decentralized publication feed" },
    { href: "/trending", label: "Trending", icon: TrendingUp, desc: "Real-time propagation velocity, top authors" },
    { href: "/import", label: "Import & Scrub", icon: UploadCloud, desc: "Bring in RSS, Substack, or any URL - trackers stripped automatically" },
    { href: "/embed/builder", label: "Embed Builder", icon: Share2, desc: "Syndicate verified articles on any external site" },
  ];

  // 2. Protocol Header Cluster (Public Goods & Support placed FIRST)
  const protocolLinks = [
    { href: "/support", label: "Support Our Mission ♥", icon: Heart, desc: "100% solo-built public good - support sovereign infrastructure" },
    { href: "/about", label: "Public Goods Manifesto", icon: Heart, desc: "Our mission, architecture, and public good charter" },
    { href: "/explorer", label: "Network Explorer", icon: Globe, desc: "Live DHT peers, swarm health, real-time ledger" },
    { href: "/privacy", label: "Threat Model", icon: Shield, desc: "Formal security guarantees, attack-by-attack" },
    { href: "/spec", label: "Spec (RFC)", icon: FileText, desc: "RFC 8785 canonical JSON, Ed25519, DAG-PB chunking" },
    { href: "/help", label: "Diagnostics", icon: Activity, desc: "Test your own browser's WebCrypto / IPFS / Tor setup live" },
  ];

  // 3. Developers Header Cluster (API Reference links to rendered interactive page)
  const developerLinks = [
    { href: "/docs", label: "Documentation", icon: BookOpen, desc: "Quickstart, guides, full REST spec" },
    { href: "/downloads", label: "Downloads & Extensions", icon: Download, desc: "Chromium extension, WordPress & Obsidian plugins" },
    { href: "/developers", label: "Sandbox & Portal", icon: Terminal, desc: "Interactive crypto sandbox, live cURL builder" },
    { href: "/developers/api-reference", label: "API Reference", icon: Cpu, desc: "Rendered interactive OpenAPI specification" },
    { href: "/docs#integrations", label: "Integrations Guide", icon: Layers, desc: "WordPress bridge, Notion sync, Ghost webhooks" },
  ];

  const isDispatchesActive = dispatchesLinks.some(link => pathname === link.href);
  const isProtocolActive = protocolLinks.some(link => pathname === link.href);
  const isDevelopersActive = developerLinks.some(link => pathname === link.href);
  const isPublishActive = pathname === "/write";
  const isProfileActive = pathname === "/profile" || pathname === "/bookmarks" || pathname === "/dashboard";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 backdrop-blur-2xl text-[var(--text-primary)] shadow-sm transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] group-hover:border-[var(--accent-primary)]/50 transition-colors overflow-hidden p-1 shadow-sm">
              <Image
                src="/pressprotocol-logo-small.png"
                alt="PressProtocol Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
              <div className="absolute -inset-0.5 rounded-[6px] bg-[var(--accent-primary)]/15 blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="font-sans tracking-tight text-lg text-[var(--text-primary)] font-bold transition-colors">
              PressProtocol
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center space-x-1 flex-1 min-w-0 px-4">
          {/* 1. Dispatches Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-xs font-mono tracking-wide transition-all h-9 px-3 rounded-[6px]",
                  isDispatchesActive
                    ? "border-b-2 border-b-[var(--accent-primary)] text-[var(--text-primary)] rounded-b-none bg-transparent"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                )}
              >
                <span>Read</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[var(--bg-elevated)] backdrop-blur-2xl border border-[var(--border-hairline)] p-2 shadow-2xl text-[var(--text-primary)]"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Editorial &amp; Dispatches
              </div>
              {dispatchesLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer transition-colors",
                      isActive ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1">{link.label}</div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-snug">{link.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Protocol Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-xs font-mono tracking-wide transition-all h-9 px-3 rounded-[6px]",
                  isProtocolActive
                    ? "border-b-2 border-b-[var(--accent-primary)] text-[var(--text-primary)] rounded-b-none bg-transparent"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                )}
              >
                <span>Protocol</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[var(--bg-elevated)] backdrop-blur-2xl border border-[var(--border-hairline)] p-2 shadow-2xl text-[var(--text-primary)]"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Network &amp; Governance
              </div>
              {protocolLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer transition-colors",
                      isActive ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1 text-[var(--text-primary)]">
                        {link.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-snug">{link.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Developers Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-xs font-mono tracking-wide transition-all h-9 px-3 rounded-[6px]",
                  isDevelopersActive
                    ? "border-b-2 border-b-[var(--accent-primary)] text-[var(--text-primary)] rounded-b-none bg-transparent"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                )}
              >
                <span>Developers</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[var(--bg-elevated)] backdrop-blur-2xl border border-[var(--border-hairline)] p-2 shadow-2xl text-[var(--text-primary)]"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                SDKs &amp; Infrastructure
              </div>
              {developerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer transition-colors",
                      isActive ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1">{link.label}</div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-snug">{link.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Search, Publish CTA, Consolidated Sovereign Account Menu */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Quick Search Trigger (⌘K) */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex h-8 px-2.5 gap-2 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)] transition-all font-mono text-xs"
              >
                <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="hidden xl:inline text-[11px] text-[var(--text-muted)]">Search CIDs...</span>
                <kbd className="hidden xl:inline-flex items-center px-1 py-0.5 text-[9px] font-mono bg-[var(--bg-overlay)] text-[var(--text-secondary)] rounded-[4px]">⌘K</kbd>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto bg-[var(--bg-canvas)]/98 backdrop-blur-2xl border-b border-[var(--border-hairline)] text-[var(--text-primary)]">
              <SheetHeader>
                <SheetTitle className="text-[var(--text-primary)] font-mono text-xs uppercase tracking-wider">Search Network Publications</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSearch} className="mt-4 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search by CID (bafy...), title, or Ed25519 author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] h-11 rounded-[6px]"
                  autoFocus
                />
              </form>
            </SheetContent>
          </Sheet>

          {/* Primary Editorial CTA Button: Write (Press Burgundy - Section 8) */}
          <Link href="/write">
            <Button
              size="sm"
              className={cn(
                "gap-1.5 text-xs font-sans font-medium tracking-normal transition-all h-8 px-3.5 rounded-[6px]",
                isPublishActive
                  ? "bg-[var(--accent-hover)] text-[var(--text-primary)] shadow-sm"
                  : "bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-deep)] shadow-sm"
              )}
            >
              <PenLine className="h-3.5 w-3.5 text-[var(--text-primary)]" />
              <span>Write</span>
            </Button>
          </Link>

          {/* Consolidated Sovereign Account Menu */}
          <DropdownMenu>
            {burnerWallet?.publicKey ? (
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2.5 gap-2 rounded-[6px] border transition-all font-mono text-xs",
                    isProfileActive
                      ? "border-[var(--border-focus)] bg-[var(--bg-overlay)] text-[var(--text-primary)]"
                      : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]"
                  )}
                  title="Sovereign Identity Cockpit & Local Vault"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--verified-bright)]" />
                  <span className="hidden sm:inline">{burnerWallet.pseudonym}</span>
                  <User className="h-3.5 w-3.5 sm:hidden" />
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 sm:px-3 gap-1.5 rounded-[6px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs transition-all"
                      >
                        <Key className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <span className="hidden sm:inline">Identity</span>
                        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] max-w-xs p-2.5 font-sans">
                    Local Ed25519 cryptographic keypair in browser storage. Zero server custody.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenuContent
              align="end"
              className="w-72 bg-[var(--bg-elevated)] backdrop-blur-2xl border border-[var(--border-hairline)] p-2 shadow-2xl text-[var(--text-primary)] font-mono rounded-[6px]"
            >
              {/* Identity Header */}
              <div className="p-2.5 mb-1 rounded-[6px] bg-[var(--bg-overlay)] border border-[var(--border-hairline)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-[var(--verified-bright)]" />
                    <span>Sovereign Identity</span>
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-[var(--verified-bright)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--verified-bright)]" />
                    Active
                  </span>
                </div>

                {burnerWallet ? (
                  <div className="mt-1.5 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                    <span className="truncate">{burnerWallet.pseudonym}</span>
                    <button
                      onClick={handleCopyKey}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                      title="Copy Public Key"
                    >
                      {copiedKey ? <Check className="h-3 w-3 text-[var(--verified-bright)]" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSetupLocalKey}
                    size="sm"
                    className="w-full mt-2 h-7 text-xs bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] border-none font-mono rounded-[6px]"
                  >
                    Generate Local Keypair
                  </Button>
                )}
              </div>

              {/* Section 1: Content & Vault */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Content &amp; Vault
              </div>

              {/* 1. My Vault */}
              <DropdownMenuItem
                onClick={() => router.push("/bookmarks")}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <BookMarked className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--text-primary)]">My Vault</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans">Encrypted offline articles &amp; proofs</div>
                </div>
              </DropdownMenuItem>

              {/* 2. My Drafts */}
              <DropdownMenuItem
                onClick={() => router.push("/write")}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <HardDrive className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--text-primary)]">My Drafts</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans">Local unpinned drafts in browser storage</div>
                </div>
              </DropdownMenuItem>

              {/* 3. My Publications */}
              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--verified-bright)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--text-primary)]">My Publications</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans">All signed articles published to IPFS &amp; Tor</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-[var(--border-hairline)]" />

              {/* Section 2: Identity & Protocol Controls */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Key Management
              </div>

              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <UserCheck className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--text-primary)]">Identity Cockpit</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans">Burner key rotation, backup export &amp; import</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <Settings className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--text-primary)]">Protocol Settings</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-sans">Gateways, Tor routing &amp; local data purge</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-[var(--border-hairline)]" />

              {/* Emergency Burn Action */}
              <DropdownMenuItem
                onClick={handleBurn}
                className="flex items-start gap-2.5 p-2 rounded-[6px] cursor-pointer hover:bg-[var(--error-tint)] text-[var(--error-bright)] transition-colors"
              >
                <Flame className="h-4 w-4 text-[var(--error-bright)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-[var(--error-bright)]">Emergency Burn</div>
                  <div className="text-[10px] text-[var(--error-bright)]/70 font-sans">Wipe local keys from this device</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-overlay">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] bg-[var(--bg-canvas)]/98 backdrop-blur-3xl border-l border-[var(--border-hairline)] text-[var(--text-primary)] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden p-1 shadow-sm">
                      <Image
                        src="/pressprotocol-logo-small.png"
                        alt="PressProtocol Logo"
                        width={36}
                        height={36}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-sans font-bold text-base text-[var(--text-primary)]">PressProtocol</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Accordion */}
                <Accordion type="single" collapsible defaultValue="dispatches" className="w-full space-y-2">
                  {/* 1. Discovery & Editorial */}
                  <AccordionItem value="dispatches" className="border-[var(--border-hairline)]">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-3">
                      Discovery &amp; Editorial
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {dispatchesLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9 rounded-[6px]",
                              pathname === link.href ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 2. Protocol */}
                  <AccordionItem value="protocol" className="border-[var(--border-hairline)]">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-3">
                      Protocol &amp; Governance
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {protocolLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9 rounded-[6px]",
                              pathname === link.href ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 3. Developers */}
                  <AccordionItem value="developers" className="border-[var(--border-hairline)]">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-3">
                      Developers
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {developerLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9 rounded-[6px]",
                              pathname === link.href ? "bg-[var(--accent-tint)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 4. Sovereign Vault */}
                  <AccordionItem value="vault" className="border-[var(--border-hairline)]">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-3">
                      Sovereign Vault
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      <Link href="/bookmarks">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[6px] h-9">
                          <BookMarked className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          My Vault (Saved)
                        </Button>
                      </Link>
                      <Link href="/write">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[6px] h-9">
                          <HardDrive className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          My Drafts
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[6px] h-9">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--verified-bright)]" />
                          My Publications
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[6px] h-9">
                          <UserCheck className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          Identity Cockpit
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-[6px] h-9">
                          <Settings className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          Protocol Settings
                        </Button>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
