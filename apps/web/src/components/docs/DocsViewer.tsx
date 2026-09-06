"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  BookOpen,
  Zap,
  Terminal,
  Layout,
  Shield,
  Globe,
  Key,
  Code,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Github,
  Activity,
  ArrowRight,
  ArrowLeft,
  FileCode2,
  Lock,
  Layers,
  Sparkles,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NavSectionItem {
  id: string;
  title: string;
  icon: any;
  desc: string;
}

interface NavGroup {
  title: string;
  items: NavSectionItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction", icon: BookOpen, desc: "Protocol overview & core thesis" },
      { id: "quickstart", title: "Quickstart (cURL)", icon: Zap, desc: "Publish in 30 seconds via cURL" },
      { id: "installation", title: "SDK Installation", icon: Terminal, desc: "TypeScript, Python, Go, Rust" },
    ]
  },
  {
    title: "Core Architecture",
    items: [
      { id: "architecture", title: "System Architecture", icon: Layout, desc: "Decoupled P2P network layers" },
      { id: "identity", title: "Identity & Keypairs", icon: Shield, desc: "Ephemeral Ed25519 WebCrypto keys" },
      { id: "ipfs-tor", title: "IPFS & Tor Swarms", icon: Globe, desc: "Multi-transport failover network" },
    ]
  },
  {
    title: "Developer REST API",
    items: [
      { id: "auth", title: "Zero-Custody Auth", icon: Key, desc: "Air-gapped signature authentication" },
      { id: "publish", title: "Publishing Endpoints", icon: Code, desc: "POST /api/v1/publish/raw & signed" },
      { id: "verify", title: "Verification & Resolution", icon: CheckCircle2, desc: "GET /api/v1/resolve & verify" },
    ]
  }
];

export function DocsViewer() {
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<boolean | null>(null);

  // Smooth scroll handler with offset for sticky navbar (80px)
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // Scroll spy to highlight active section on user scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial hash on load
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      setTimeout(() => scrollToSection(hashId), 100);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Filter navigation items by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const q = searchQuery.toLowerCase();
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#050508] text-white/80 selection:bg-cyan-500/30">
      <div className="flex w-full">
        {/* Left Sticky Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-[#0B0D14] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
          {/* Search box */}
          <div className="p-4 border-b border-white/5 sticky top-0 bg-[#0B0D14]/95 backdrop-blur-md z-10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="pl-9 bg-white/5 border-white/10 text-xs h-9 focus-visible:ring-cyan-500/50 font-mono text-white placeholder:text-zinc-500 rounded-lg"
              />
            </div>
          </div>

          {/* Navigation links tree */}
          <nav className="flex-1 p-4 space-y-6">
            {filteredGroups.map((section) => (
              <div key={section.title}>
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-2">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg transition-all text-left font-mono ${isActive
                              ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                              : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                        >
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                          <span className="truncate">{item.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Quick links at bottom of sidebar */}
          <div className="p-4 border-t border-white/5 bg-[#050508]/40 space-y-2">
            <Link href="/downloads" className="flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors">
              <span>Downloads &amp; Extensions</span>
              <Download className="h-3 w-3 text-cyan-400" />
            </Link>
            <Link href="/developers/api-reference" className="flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors">
              <span>Interactive REST Spec</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link href="/explorer" className="flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors">
              <span>Live Network Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-16">

            {/* 1. Introduction Section */}
            <section id="introduction" className="scroll-mt-24 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
                  <span>Docs</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>Getting Started</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-zinc-400">Introduction</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-white tracking-tight mb-4">
                  Introduction to PressProtocol
                </h1>
                <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-sans">
                  Sovereign, decentralized publishing infrastructure built on IPFS content addressing, Tor v3 onion routing, and client-side Ed25519 cryptography.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 block mb-1">Core Principle: Zero-Custody, Pure Math</strong>
                  PressProtocol guarantees censorship resistance, provenance, and data durability through decentralized consensus and cryptographic proofs-never relying on centralized servers or gatekeepers.
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <div
                  onClick={() => scrollToSection("quickstart")}
                  className="p-5 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 transition-all group cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1.5 flex items-center gap-1.5">
                    Quickstart Guide <ArrowRight className="h-3 w-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Publish your first decentralized article in under 30 seconds using a simple cURL request.
                  </p>
                </div>

                <Link
                  href="/developers/api-reference"
                  className="p-5 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 transition-all group block"
                >
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                    <Code className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1.5 flex items-center gap-1.5">
                    Interactive API Reference <ArrowRight className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Test endpoints live in the browser, view OpenAPI 3.0 request/response schemas, and build payloads.
                  </p>
                </Link>
              </div>
            </section>

            {/* 2. Quickstart Section */}
            <section id="quickstart" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono text-[10px]">
                  STEP 1
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Quickstart: Publish via cURL
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Send a raw markdown payload to any public or self-hosted PressProtocol node. The node chunks your dispatch into IPFS blocks and replicates it across the peer-to-peer swarm:
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0B0D14] overflow-hidden font-mono text-xs">
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 text-zinc-400 flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Terminal cURL
                  </span>
                  <button
                    onClick={() => handleCopy(`curl -X POST https://api.pressprotocol.com/api/v1/publish/raw \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "title": "Decentralized Dispatches in Hostile Regimes",\n    "content": "# Sovereign Publishing\\n\\nZero custody, pure math.",\n    "tags": ["cryptography", "freedom-of-speech"]\n  }'`, "quickstart-curl")}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedSnippet === "quickstart-curl" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet === "quickstart-curl" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 text-cyan-300 overflow-x-auto leading-relaxed text-xs">
                  {`curl -X POST https://api.pressprotocol.com/api/v1/publish/raw \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Decentralized Dispatches in Hostile Regimes",
    "content": "# Sovereign Publishing\\n\\nZero custody, pure math.",
    "tags": ["cryptography", "freedom-of-speech"]
  }'`}
                </pre>
              </div>

              <p className="text-xs text-zinc-400">Response payload with generated multihash CID and gateway resolver:</p>
              <div className="rounded-xl border border-white/10 bg-[#08090E] p-4 font-mono text-xs text-zinc-300">
                <pre className="text-emerald-300 overflow-x-auto">
                  {`{
  "success": true,
  "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "gatewayUrl": "https://ipfs.io/ipfs/bafybeigdyrzt5sfp...",
  "timestamp": 1773520000000
}`}
                </pre>
              </div>
            </section>

            {/* 3. SDK Installation */}
            <section id="installation" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-mono text-[10px]">
                  SDK v1.0.6
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  SDK Installation
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Native client SDKs provide client-side Ed25519 signing, RFC 8785 JSON canonicalization, and multi-transport IPFS resolution:
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0B0D14] overflow-hidden font-mono text-xs">
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 text-zinc-400 flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <FileCode2 className="h-3.5 w-3.5 text-emerald-400" /> Package Managers
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[11px] text-zinc-500 mb-1">TypeScript / Node.js</div>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-cyan-300">
                      <code>pnpm add @pressprotocol/sdk</code>
                      <button onClick={() => handleCopy("pnpm add @pressprotocol/sdk", "inst-ts")}>
                        {copiedSnippet === "inst-ts" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500 hover:text-white" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-500 mb-1">Python 3.10+</div>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-emerald-300">
                      <code>pip install pressprotocol-sdk</code>
                      <button onClick={() => handleCopy("pip install pressprotocol-sdk", "inst-py")}>
                        {copiedSnippet === "inst-py" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500 hover:text-white" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-500 mb-1">Go</div>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-purple-300">
                      <code>go get github.com/0xshikhar/PressProtocol/sdks/go</code>
                      <button onClick={() => handleCopy("go get github.com/0xshikhar/PressProtocol/sdks/go", "inst-go")}>
                        {copiedSnippet === "inst-go" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500 hover:text-white" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-500 mb-1">Rust (Cargo)</div>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-amber-300">
                      <code>cargo add pressprotocol</code>
                      <button onClick={() => handleCopy("cargo add pressprotocol", "inst-rs")}>
                        {copiedSnippet === "inst-rs" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500 hover:text-white" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. System Architecture */}
            <section id="architecture" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/30 bg-purple-950/40 text-purple-300 font-mono text-[10px]">
                  ARCHITECTURE
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  System Architecture & Protocol Invariants
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PressProtocol decouples user identity, editorial authoring, content storage, and network transport into four autonomous layers:
              </p>

              <div className="grid sm:grid-cols-3 gap-3 not-prose my-4">
                <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] space-y-2">
                  <div className="text-cyan-400 font-mono text-xs font-semibold flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Layer 1: Crypto
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ed25519 signing over RFC 8785 JSON canonical representations. Proves authorship without centralized accounts.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] space-y-2">
                  <div className="text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> Layer 2: IPFS Swarm
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Helia DAG-PB chunked content multihash addressing. Immutable, deduplicated, and swarm-distributable.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] space-y-2">
                  <div className="text-purple-400 font-mono text-xs font-semibold flex items-center gap-1.5">
                    <Lock className="h-4 w-4" /> Layer 3: Tor Onion
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Autonomous node syncing via Tor v3 onion services. Defeats ISP-level DNS poisoning and IP blocking.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Identity & Keys */}
            <section id="identity" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/30 bg-amber-950/40 text-amber-300 font-mono text-[10px]">
                  SOVEREIGN KEYS
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Identity & Ephemeral Burner Keypairs
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                In PressProtocol, an account is not a database row-it is an Ed25519 keypair held exclusively in local browser WebCrypto or cold-storage hardware. No emails, no phone numbers, and no passwords:
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0B0D14] overflow-hidden font-mono text-xs">
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 text-zinc-400 flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-amber-400" /> TypeScript WebCrypto Example
                  </span>
                  <button
                    onClick={() => handleCopy(`import { SovereignSigner } from "@pressprotocol/sdk";\n\n// Generate ephemeral burner keypair in WebCrypto\nconst signer = await SovereignSigner.generate();\nconst signature = await signer.signEnvelope({\n  cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",\n  timestamp: Date.now()\n});\n\nconsole.log("Author Fingerprint:", signer.publicKeyHex);`, "identity-code")}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedSnippet === "identity-code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet === "identity-code" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 text-amber-300 overflow-x-auto leading-relaxed">
                  {`import { SovereignSigner } from "@pressprotocol/sdk";

// Generate ephemeral burner keypair in WebCrypto
const signer = await SovereignSigner.generate();
const signature = await signer.signEnvelope({
  cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  timestamp: Date.now()
});

console.log("Author Fingerprint:", signer.publicKeyHex);`}
                </pre>
              </div>
            </section>

            {/* 6. IPFS & Tor */}
            <section id="ipfs-tor" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono text-[10px]">
                  NETWORKING
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  IPFS Swarm & Tor Onion Routing
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                When content is published, it is announced over dual-rail transports:
              </p>
              <ul className="space-y-3 text-sm text-zinc-300 list-disc pl-5">
                <li>
                  <strong className="text-white">Public Clear-Net:</strong> Dispatches are announced to the Helia / Kubo Kademlia DHT and pinned across distributed IPFS cluster providers (Pinata, Cloudflare, Infura).
                </li>
                <li>
                  <strong className="text-white">Tor v3 Hidden Service:</strong> PressProtocol nodes expose native `.onion` endpoints, enabling anonymous reader clients to pull content over encrypted onion circuits even under strict ISP filtering.
                </li>
              </ul>
            </section>

            {/* 7. Zero-Custody Auth */}
            <section id="auth" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-red-500/30 bg-red-950/40 text-red-300 font-mono text-[10px]">
                  AUTHENTICATION
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Zero-Custody Authentication
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PressProtocol does not use session cookies or centralized OAuth databases. Requests requiring proof-of-authorship carry an RFC 8032 digital signature in the request headers:
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0B0D14] p-4 font-mono text-xs text-zinc-300 space-y-3">
                <div className="text-zinc-400">Authentication Headers Format:</div>
                <pre className="text-cyan-300 overflow-x-auto">
                  {`X-Press-Public-Key: <ed25519_hex_public_key>
X-Press-Signature: <64_byte_hex_signature>
X-Press-Timestamp: <unix_epoch_ms>`}
                </pre>
                <p className="text-zinc-400 text-xs font-sans">
                  The receiving node verifies that the signature matches the canonical JSON representation of the payload and confirms that the timestamp is within a 5-minute drift window to prevent replay attacks.
                </p>
              </div>
            </section>

            {/* 8. Publishing API */}
            <section id="publish" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-mono text-[10px]">
                  REST API
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Publishing Endpoints
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Two primary endpoints are available for ingesting content into the network:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14]">
                  <div className="flex items-center gap-2 font-mono text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">POST</span>
                    <span className="text-white font-semibold">/api/v1/publish/raw</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Accepts raw markdown and metadata. Chunks into Helia DAG-PB blocks and signs with node authority.
                  </p>
                  <Link href="/developers/api-reference#publish-raw" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                    <span>View full schema & cURL in Interactive API Reference</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14]">
                  <div className="flex items-center gap-2 font-mono text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">POST</span>
                    <span className="text-white font-semibold">/api/v1/publish/signed</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Ingests an air-gapped pre-signed Ed25519 payload generated locally on client devices.
                  </p>
                  <Link href="/developers/api-reference#publish-signed" className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1">
                    <span>View full schema & cURL in Interactive API Reference</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* 9. Verification & Resolution */}
            <section id="verify" className="scroll-mt-24 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono text-[10px]">
                  VERIFICATION
                </Badge>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Verification & Multi-Gateway Resolution
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Retrieve and cryptographically verify any published manifest by racing multiple IPFS gateways and Tor onion mirrors concurrently:
              </p>

              <div className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
                  <span className="text-white font-semibold">/api/v1/resolve/{`{cid}`}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Races Pinata, Cloudflare, local Helia DHT, and Tor hidden services. Returns payload from the fastest responding transport.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Tamper detection: Strict multihash CID verification</span>
                  <span className="text-emerald-400">RFC 8032 Validated</span>
                </div>
              </div>
            </section>

            {/* Dedicated Docs Footer */}
            <div className="pt-12 border-t border-white/10 space-y-8 pb-16">
              {/* Pagination Next / Prev */}
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => scrollToSection("architecture")}
                  className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 text-left transition-colors group"
                >
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mb-1">
                    <ArrowLeft className="h-3 w-3" /> Previous Topic
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    System Architecture
                  </div>
                </button>

                <Link
                  href="/developers/api-reference"
                  className="p-4 rounded-xl border border-white/10 bg-[#0B0D14] hover:border-cyan-500/30 text-right transition-colors group block"
                >
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-end gap-1 mb-1">
                    Next Section <ArrowRight className="h-3 w-3" />
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Interactive API Reference
                  </div>
                </Link>
              </div>

              {/* Feedback Widget */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0B0D14] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-zinc-400">Was this documentation page helpful?</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => { setHelpfulFeedback(true); toast.success("Thank you for your feedback!"); }}
                    variant="outline"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-lg border-white/10 ${helpfulFeedback === true ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-white/5 text-zinc-400 hover:text-white"}`}
                  >
                    Yes, helpful
                  </Button>
                  <Button
                    onClick={() => { setHelpfulFeedback(false); toast.info("Feedback noted. We are actively refining these guides."); }}
                    variant="outline"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-lg border-white/10 ${helpfulFeedback === false ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-white/5 text-zinc-400 hover:text-white"}`}
                  >
                    Could be better
                  </Button>
                </div>
              </div>

              {/* Meta & Links */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/0xshikhar/PressProtocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>Edit on GitHub</span>
                  </a>
                  <span>&bull;</span>
                  <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    <span>System Diagnostics</span>
                  </Link>
                </div>
                <div>
                  PressProtocol v1.0.6 &bull; MIT License
                </div>
              </div>

            </div>

          </div>
        </main>

        {/* Right Sticky Sidebar (TOC) */}
        <aside className="hidden xl:block w-64 border-l border-white/5 bg-[#050508] h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-6">
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            On this page
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            {NAV_GROUPS.flatMap(g => g.items).map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left block w-full truncate transition-colors py-0.5 ${isActive
                        ? "text-cyan-400 font-medium translate-x-1"
                        : "text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Need Help?
            </div>
            <Link
              href="/help"
              className="p-3 rounded-lg border border-white/5 bg-[#0B0D14] block hover:border-cyan-500/30 transition-colors group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-cyan-300 mb-1 flex items-center justify-between">
                <span>Run Diagnostics</span>
                <Activity className="h-3 w-3 text-cyan-400" />
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Test browser WebCrypto, Tor, and IPFS connectivity.
              </p>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
