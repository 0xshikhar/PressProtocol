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
  Download
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050508]/90 backdrop-blur-2xl text-white shadow-2xl transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* Left: Brand Identity & Network Badge */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors overflow-hidden p-1 shadow-lg">
              <Image
                src="/pressprotocol-logo-small.png"
                alt="PressProtocol Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="font-sans tracking-tight text-lg text-white font-bold group-hover:text-cyan-300 transition-colors">
              PressProtocol
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation: 3 Toggle-Based Category Headers */}
        <div className="hidden lg:flex items-center justify-center space-x-1 flex-1 min-w-0 px-4">
          {/* 1. Dispatches Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-xs font-mono tracking-wide transition-all h-8 px-2.5 rounded-lg border",
                  isDispatchesActive
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                )}
              >
                <span>Discovery & Editorial</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[#0B0D14]/95 backdrop-blur-2xl border-white/10 p-2 shadow-2xl text-white"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Discovery & Editorial
              </div>
              {dispatchesLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-cyan-500/15 text-cyan-300" : "hover:bg-white/5 text-zinc-300 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-cyan-400" : "text-zinc-400")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1">{link.label}</div>
                      <div className="text-[11px] text-zinc-500 leading-snug">{link.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Protocol Dropdown (Public Goods & Mission first) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 text-xs font-mono tracking-wide transition-all h-8 px-2.5 rounded-lg border",
                  isProtocolActive
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                )}
              >
                <span>Protocol</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[#0B0D14]/95 backdrop-blur-2xl border-white/10 p-2 shadow-2xl text-white"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Network & Governance
              </div>
              {protocolLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-cyan-500/15 text-cyan-300" : "hover:bg-white/5 text-zinc-300 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-cyan-400" : "text-zinc-400")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1 flex items-center gap-1.5">
                        <span>{link.label}</span>
                        {link.href === "/support" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/25 text-rose-300 font-mono border border-rose-500/40">Solo Built</span>
                        )}
                        {link.href === "/about" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-mono">Manifesto</span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-snug">{link.desc}</div>
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
                  "gap-1 text-xs font-mono tracking-wide transition-all h-8 px-2.5 rounded-lg border",
                  isDevelopersActive
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                )}
              >
                <span>Developers</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 bg-[#0B0D14]/95 backdrop-blur-2xl border-white/10 p-2 shadow-2xl text-white"
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                SDKs & Infrastructure
              </div>
              {developerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-cyan-500/15 text-cyan-300" : "hover:bg-white/5 text-zinc-300 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-cyan-400" : "text-zinc-400")} />
                    <div>
                      <div className="text-xs font-mono font-medium leading-none mb-1">{link.label}</div>
                      <div className="text-[11px] text-zinc-500 leading-snug">{link.desc}</div>
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
                className="hidden md:flex h-8 px-2.5 gap-2 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all font-mono text-xs"
              >
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden xl:inline text-[11px] text-zinc-500">Search CIDs...</span>
                <kbd className="hidden xl:inline-flex items-center px-1 py-0.5 text-[9px] font-mono bg-white/10 text-zinc-400 rounded">⌘K</kbd>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto bg-[#050508]/95 backdrop-blur-2xl border-b border-white/10 text-white">
              <SheetHeader>
                <SheetTitle className="text-white font-mono text-xs uppercase tracking-wider">Search Network Publications</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSearch} className="mt-4 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search by CID (bafy...), title, or Ed25519 author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-400 h-11"
                  autoFocus
                />
              </form>
            </SheetContent>
          </Sheet>

          {/* Primary High-Contrast CTA Button: Publish */}
          <Link href="/write">
            <Button
              size="sm"
              className={cn(
                "gap-1.5 text-xs font-mono font-semibold tracking-wide transition-all h-8 px-3.5 rounded-lg border shadow-lg",
                isPublishActive
                  ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  : "border-cyan-400/60 bg-cyan-500 text-black hover:bg-cyan-400 hover:border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Publish</span>
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
                    "h-8 px-2.5 gap-2 rounded-lg border transition-all font-mono text-xs",
                    isProfileActive
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-white/20"
                  )}
                  title="Sovereign Identity Cockpit & Local Vault"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
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
                        className="h-8 px-2.5 sm:px-3 gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs transition-all shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                      >
                        <Key className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Set Up Local Key</span>
                        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-[#0B0D14] border border-white/15 text-xs text-zinc-300 max-w-xs p-2.5 font-sans">
                    Generates an Ed25519 keypair in your browser. Nothing is sent to a server.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenuContent
              align="end"
              className="w-72 bg-[#0B0D14]/95 backdrop-blur-2xl border-white/10 p-2 shadow-2xl text-white font-mono"
            >
              {/* Identity Header */}
              <div className="p-2.5 mb-1 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    <span>Sovereign Identity</span>
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>

                {burnerWallet ? (
                  <div className="mt-1.5 flex items-center justify-between text-xs font-mono text-zinc-300">
                    <span className="truncate">{burnerWallet.pseudonym}</span>
                    <button
                      onClick={handleCopyKey}
                      className="text-zinc-500 hover:text-cyan-400 transition-colors p-1"
                      title="Copy Public Key"
                    >
                      {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSetupLocalKey}
                    size="sm"
                    className="w-full mt-2 h-7 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono"
                  >
                    Generate Local Keypair
                  </Button>
                )}
              </div>

              {/* Section 1: Content & Vault */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Content & Vault
              </div>

              {/* 1. My Vault (Saved offline articles) */}
              <DropdownMenuItem
                onClick={() => router.push("/bookmarks")}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                <BookMarked className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-zinc-200">My Vault</div>
                  <div className="text-[10px] text-zinc-500 font-sans">Encrypted offline articles & proofs</div>
                </div>
              </DropdownMenuItem>

              {/* 2. My Drafts (Locally hosted drafts) */}
              <DropdownMenuItem
                onClick={() => router.push("/write")}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                <HardDrive className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-zinc-200">My Drafts</div>
                  <div className="text-[10px] text-zinc-500 font-sans">Local unpinned drafts in browser storage</div>
                </div>
              </DropdownMenuItem>

              {/* 3. My Publications */}
              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-zinc-200">My Publications</div>
                  <div className="text-[10px] text-zinc-500 font-sans">All signed articles published to IPFS & Tor</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-white/10" />

              {/* Section 2: Identity & Protocol Controls */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Key Management
              </div>

              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                <UserCheck className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-zinc-200">Identity Cockpit</div>
                  <div className="text-[10px] text-zinc-500 font-sans">Burner key rotation, backup export & import</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
              >
                <Settings className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-zinc-200">Protocol Settings</div>
                  <div className="text-[10px] text-zinc-500 font-sans">Gateways, Tor routing & local data purge</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 bg-white/10" />

              {/* Emergency Burn Action */}
              <DropdownMenuItem
                onClick={handleBurn}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <Flame className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-medium text-red-300">Emergency Burn</div>
                  <div className="text-[10px] text-red-400/70 font-sans">Wipe local keys from this device</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] bg-[#050508]/95 backdrop-blur-3xl border-l border-white/10 text-white overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/15 overflow-hidden p-1 shadow-md">
                      <Image
                        src="/pressprotocol-logo-small.png"
                        alt="PressProtocol Logo"
                        width={36}
                        height={36}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-sans font-bold text-base text-white">PressProtocol</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Accordion */}
                <Accordion type="single" collapsible defaultValue="dispatches" className="w-full space-y-2">
                  {/* 1. Discovery & Editorial */}
                  <AccordionItem value="dispatches" className="border-white/10">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-cyan-300 py-3">
                      Discovery & Editorial
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {dispatchesLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9",
                              pathname === link.href ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-400 hover:text-white"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-cyan-400" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 2. Protocol */}
                  <AccordionItem value="protocol" className="border-white/10">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-cyan-300 py-3">
                      Protocol & Governance
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {protocolLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9",
                              pathname === link.href ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-400 hover:text-white"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-zinc-400" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 3. Developers */}
                  <AccordionItem value="developers" className="border-white/10">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-cyan-300 py-3">
                      Developers
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      {developerLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-2.5 text-xs font-mono h-9",
                              pathname === link.href ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-400 hover:text-white"
                            )}
                          >
                            <link.icon className="h-3.5 w-3.5 text-zinc-400" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* 4. Sovereign Vault */}
                  <AccordionItem value="vault" className="border-white/10">
                    <AccordionTrigger className="text-xs font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 py-3">
                      Sovereign Vault
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pt-1 pb-3">
                      <Link href="/bookmarks">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-zinc-400 hover:text-white h-9">
                          <BookMarked className="h-3.5 w-3.5 text-cyan-400" />
                          My Vault (Saved)
                        </Button>
                      </Link>
                      <Link href="/write">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-zinc-400 hover:text-white h-9">
                          <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                          My Drafts
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-zinc-400 hover:text-white h-9">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          My Publications
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-zinc-400 hover:text-white h-9">
                          <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                          Identity Cockpit
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start gap-2.5 text-xs font-mono text-zinc-400 hover:text-white h-9">
                          <Settings className="h-3.5 w-3.5 text-zinc-400" />
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
