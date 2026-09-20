"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Download, 
  Chrome, 
  Globe, 
  FileText, 
  ExternalLink, 
  Check, 
  Copy, 
  ArrowLeft, 
  Cpu, 
  Package, 
  CheckCircle2, 
  GitBranch, 
  Server, 
  ListFilter,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Terminal,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface EcosystemItem {
  id: string;
  category: "extensions" | "integrations" | "node" | "sdks";
  categoryLabel: string;
  name: string;
  platform: string;
  type: string;
  format: string;
  version: string;
  description: string;
  badges: string[];
  actionType: "download" | "copy";
  actionLabel: string;
  actionSnippet?: string;
  actionUrl?: string;
  sourceUrl: string;
  registryUrl?: string;
  registryName?: string;
  installSteps?: string[];
  quickstart?: string;
  icon: "chrome" | "globe" | "file-text" | "git-branch" | "server" | "cpu";
}

// Complete Ecosystem Registry Catalog (Single Source of Truth)
const ECOSYSTEM_REGISTRY: EcosystemItem[] = [
  {
    id: "chrome",
    category: "extensions",
    categoryLabel: "Browser & CMS",
    name: "Chromium Browser Web Clipper",
    platform: "Chrome, Brave, Edge, Arc",
    type: "Manifest V3 Extension",
    format: ".zip (38 KB)",
    version: "v1.0.7",
    description: "In-browser Ed25519 burner keypair management, automatic URL tracker scrubbing (UTM/fbclid), and 1-click sovereign archival to IPFS and Tor.",
    badges: ["Manifest V3", "38 KB", "v1.0.7"],
    actionType: "download",
    actionUrl: "/downloads/press-protocol-extension.zip",
    actionLabel: "Download Extension (.zip)",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/integrations/browser-extension",
    installSteps: [
      "Extract press-protocol-extension.zip on your local machine.",
      "Navigate to chrome://extensions and toggle 'Developer mode' ON.",
      "Click 'Load unpacked' and select the extracted directory."
    ],
    icon: "chrome"
  },
  {
    id: "wordpress",
    category: "extensions",
    categoryLabel: "Browser & CMS",
    name: "WordPress Publishing Bridge",
    platform: "WordPress 6.0+ & Multisite",
    type: "CMS Plugin",
    format: ".zip (27 KB)",
    version: "v1.0.7",
    description: "Mirror every WordPress post into a signed, immutable IPFS multihash and Tor onion publication. Zero database modifications; runs alongside your existing theme.",
    badges: ["WP 6.0+", "PHP 8.0+", "27 KB", "v1.0.7"],
    actionType: "download",
    actionUrl: "/downloads/press-protocol-wordpress.zip",
    actionLabel: "Download Plugin (.zip)",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/integrations/wordpress-plugin",
    installSteps: [
      "In WP Admin: navigate to Plugins → Add New → Upload Plugin.",
      "Upload press-protocol-wordpress.zip and click 'Install Now'.",
      "Click 'Activate Plugin' and configure your IPFS/Tor relays in Settings."
    ],
    icon: "globe"
  },
  {
    id: "obsidian",
    category: "integrations",
    categoryLabel: "Editor & CI/CD",
    name: "Obsidian Sovereign Publisher",
    platform: "Desktop & Mobile",
    type: "Markdown Vault Native",
    format: ".zip (18 KB)",
    version: "v1.0.7",
    description: "Publish investigative notes and research memos straight from Obsidian. Calculates CIDs locally and syndicates without leaving your editor.",
    badges: ["Desktop & Mobile", "Community Plugin", "v1.0.7"],
    actionType: "download",
    actionUrl: "/downloads/press-protocol-obsidian.zip",
    actionLabel: "Download Plugin (.zip)",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/integrations/obsidian-plugin",
    installSteps: [
      "Extract zip contents into .obsidian/plugins/pressprotocol/.",
      "In Obsidian Settings → Community Plugins: reload and toggle ON.",
      "Hit Cmd + P (or Ctrl + P) → select 'Publish Note to PressProtocol'."
    ],
    icon: "file-text"
  },
  {
    id: "github-action",
    category: "integrations",
    categoryLabel: "Editor & CI/CD",
    name: "GitHub Actions Automated Publisher",
    platform: "GitHub Actions CI/CD",
    type: "CI/CD Pipeline",
    format: "Marketplace Action",
    version: "v1.0.7",
    description: "Sign and syndicate new markdown posts to IPFS and Tor whenever commits are pushed to your repository.",
    badges: ["CI/CD Pipeline", "v1.0.7"],
    actionType: "copy",
    actionSnippet: "- uses: 0xshikhar/PressProtocol/integrations/publish-action@v1.0.7\n  with:\n    content_dir: './content/posts'\n    private_key: ${{ secrets.PRESSPROTOCOL_PRIVATE_KEY }}",
    actionLabel: "Copy Action YAML",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/integrations/publish-action",
    installSteps: [
      "Add PRESSPROTOCOL_PRIVATE_KEY to your GitHub repository Secrets.",
      "Create .github/workflows/pressprotocol.yml in your repo.",
      "Paste the Action workflow snippet to automate decentralized publishing."
    ],
    icon: "git-branch"
  },
  {
    id: "node",
    category: "node",
    categoryLabel: "Node Daemon",
    name: "Autonomous Node Daemon",
    platform: "Docker, VPS, Linux/macOS",
    type: "Daemon Service",
    format: "docker-compose.yml",
    version: "v1.0.7",
    description: "Deploy a sovereign community node on your VPS or home server in 30 seconds. Features automatic IPFS peer discovery, DHT indexing, and auto-generated Tor v3 onion services.",
    badges: ["Fastify", "Embedded Helia IPFS", "Tor v3", "v1.0.7"],
    actionType: "download",
    actionUrl: "/downloads/docker-compose.yml",
    actionLabel: "Download docker-compose.yml",
    actionSnippet: "docker compose up -d",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/core/node",
    installSteps: [
      "Download docker-compose.yml via button or curl -O https://pressprotocol.com/downloads/docker-compose.yml",
      "Run: docker compose up -d",
      "Verify health: curl http://localhost:4000/api/node/health"
    ],
    icon: "server"
  },
  {
    id: "ts-sdk",
    category: "sdks",
    categoryLabel: "Developer SDKs",
    name: "TypeScript / Node.js SDK",
    platform: "Node 18+, Bun, Deno, Browser",
    type: "npm Package",
    format: "@pressprotocol/sdk",
    version: "v1.0.7",
    description: "Isomorphic TypeScript client for Node, Bun, Deno, and modern browser runtimes. Complete typings for manifest signing, multihash verification, and gateway resolution.",
    badges: ["npm package", "v1.0.7"],
    actionType: "copy",
    actionSnippet: "pnpm add @pressprotocol/sdk",
    actionLabel: "pnpm add @pressprotocol/sdk",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/packages/sdk",
    registryUrl: "https://www.npmjs.com/package/@pressprotocol/sdk",
    registryName: "npm",
    quickstart: "import { PressProtocolClient } from '@pressprotocol/sdk';\n\nconst client = new PressProtocolClient();\nconst result = await client.publish({ title: 'My Post', content: 'Hello Web3' });",
    icon: "cpu"
  },
  {
    id: "py-sdk",
    category: "sdks",
    categoryLabel: "Developer SDKs",
    name: "Python Client SDK",
    platform: "Python 3.9 - 3.14",
    type: "PyPI Package",
    format: "pressprotocol-py",
    version: "v1.0.7",
    description: "Async Python library with cryptographic Ed25519 signing, canonical JSON hashing, and multi-gateway failover resolution.",
    badges: ["PyPI Package", "v1.0.7"],
    actionType: "copy",
    actionSnippet: "pip install pressprotocol-py",
    actionLabel: "pip install pressprotocol-py",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/sdks/python",
    registryUrl: "https://pypi.org/project/pressprotocol-py/",
    registryName: "PyPI",
    quickstart: "from pressprotocol import PressProtocol\n\nclient = PressProtocol()\nstatus = client.ping()",
    icon: "cpu"
  },
  {
    id: "go-sdk",
    category: "sdks",
    categoryLabel: "Developer SDKs",
    name: "Go (Golang) Client SDK",
    platform: "Go 1.20+",
    type: "Go Module",
    format: "github.com/.../sdks/go",
    version: "v1.0.7",
    description: "High-performance Golang module with zero external C-dependencies. Optimized for daemons, CLI tools, and microservices.",
    badges: ["pkg.go.dev", "v1.0.7"],
    actionType: "copy",
    actionSnippet: "go get github.com/0xshikhar/PressProtocol/sdks/go@v1.0.7",
    actionLabel: "go get sdks/go@v1.0.7",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/sdks/go",
    registryUrl: "https://pkg.go.dev/github.com/0xshikhar/PressProtocol/sdks/go",
    registryName: "pkg.go.dev",
    quickstart: "import pressprotocol \"github.com/0xshikhar/PressProtocol/sdks/go\"\n\nclient := pressprotocol.NewClient()",
    icon: "cpu"
  },
  {
    id: "rs-sdk",
    category: "sdks",
    categoryLabel: "Developer SDKs",
    name: "Rust Client SDK",
    platform: "Rust 2021 Edition",
    type: "Cargo Crate",
    format: "pressprotocol-rs",
    version: "v1.0.7",
    description: "Zero-copy Rust crate for memory-safe decentralized publication parsing, CID calculation, and multihash verification.",
    badges: ["crates.io", "v1.0.7"],
    actionType: "copy",
    actionSnippet: "cargo add pressprotocol-rs",
    actionLabel: "cargo add pressprotocol-rs",
    sourceUrl: "https://github.com/0xshikhar/PressProtocol/tree/master/sdks/rust",
    registryUrl: "https://crates.io/crates/pressprotocol-rs",
    registryName: "crates.io",
    quickstart: "use pressprotocol_rs::PressProtocolClient;\n\nlet client = PressProtocolClient::new();",
    icon: "cpu"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Releases", count: 9 },
  { id: "extensions", label: "Browser & CMS", count: 2 },
  { id: "integrations", label: "Editor & CI/CD", count: 2 },
  { id: "node", label: "Node Daemon", count: 1 },
  { id: "sdks", label: "Developer SDKs", count: 4 },
];

export function DownloadsClientView() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownload = (filename: string) => {
    toast.success(`Starting download for ${filename}...`);
  };

  const toggleGuide = (id: string) => {
    setExpandedGuides((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return ECOSYSTEM_REGISTRY;
    return ECOSYSTEM_REGISTRY.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const renderIcon = (iconName: EcosystemItem["icon"]) => {
    switch (iconName) {
      case "chrome":
        return <Chrome className="h-5 w-5 text-accent-ribbon" />;
      case "globe":
        return <Globe className="h-5 w-5 text-[#8770C4]" />;
      case "file-text":
        return <FileText className="h-5 w-5 text-accent-ribbon" />;
      case "git-branch":
        return <GitBranch className="h-5 w-5 text-accent-ribbon" />;
      case "server":
        return <Server className="h-5 w-5 text-verified" />;
      case "cpu":
      default:
        return <Cpu className="h-5 w-5 text-accent-ribbon" />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto max-w-6xl space-y-8 sm:space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text-primary hover:bg-overlay text-xs font-mono h-8 px-2.5">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-text-muted">
            <span>Protocol v1.0.7</span>
            <span>&bull;</span>
            <span className="text-verified">9 Production Packages</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-3 sm:space-y-4 border-b border-hairline pb-6 sm:pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-hairline bg-overlay text-text-secondary font-mono text-xs">
              <Package className="h-3 w-3 mr-1 text-accent-ribbon" /> ECOSYSTEM CLIENTS &amp; BINARIES
            </Badge>
            <span className="text-xs text-text-muted font-mono hidden sm:inline">&bull; 100% OPEN SOURCE (MIT)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-hero tracking-tight text-text-primary leading-tight">
            Downloads &amp; Ecosystem Directory
          </h1>
          <p className="text-xs sm:text-base text-text-muted max-w-3xl leading-relaxed">
            Download verified client binaries, install official language SDKs, or deploy sovereign daemon nodes. All tools feature in-memory cryptographic attestation and multi-transport failover across IPFS and Tor.
          </p>
        </div>

        {/* Unified Control Bar: Categories Filter & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* Category Filter Pills (Mobile Horizontal Scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-elevated text-text-primary border border-hairline font-medium shadow-sm"
                    : "bg-surface hover:bg-overlay text-text-muted hover:text-text-primary border border-hairline"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? "bg-overlay text-accent-ribbon" : "bg-overlay text-text-muted"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle (Cards vs Directory Table) */}
          <div className="flex items-center gap-1 bg-overlay p-1 rounded-[6px] border border-hairline self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-mono transition-all ${
                viewMode === "cards"
                  ? "bg-elevated text-text-primary border border-hairline font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Guides &amp; Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-mono transition-all ${
                viewMode === "table"
                  ? "bg-elevated text-text-primary border border-hairline font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="High-Density Matrix View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Package Matrix</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Rich Cards with Collapsible Setup Guides */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const isExpanded = !!expandedGuides[item.id];
              return (
                <Card 
                  key={item.id} 
                  elevation="card"
                  className="flex flex-col justify-between"
                >
                  <CardContent className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-11 w-11 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center shrink-0">
                          {renderIcon(item.icon)}
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {item.badges.map((b, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="border-hairline bg-overlay text-text-secondary font-mono text-[10px]"
                            >
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Title and Platform */}
                      <div>
                        <h3 className="text-base sm:text-lg font-medium font-sans text-text-primary tracking-tight">{item.name}</h3>
                        <p className="text-xs text-accent-ribbon font-mono mt-0.5">{item.platform}</p>
                        <p className="text-xs text-text-muted mt-2 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Block & Quick Commands */}
                    <div className="space-y-3 pt-2">
                      {item.actionType === "download" ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a 
                            href={item.actionUrl} 
                            download
                            onClick={() => handleDownload(item.name)}
                            className="flex-1 block"
                          >
                            <Button className="w-full bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium font-mono text-xs h-10 gap-2 rounded-[6px] shadow-none">
                              <Download className="h-4 w-4" /> {item.actionLabel}
                            </Button>
                          </a>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" className="w-full sm:w-auto h-10 border-hairline bg-overlay hover:bg-elevated font-mono text-xs text-text-secondary hover:text-text-primary gap-1.5 rounded-[6px]">
                              <span>Source</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-[6px] bg-canvas border border-hairline font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                            <code className="text-text-primary break-all sm:break-normal text-[11px] select-all">
                              {item.actionSnippet}
                            </code>
                            <button 
                              onClick={() => handleCopy(item.actionSnippet || "", item.id)} 
                              className="text-text-muted hover:text-text-primary shrink-0 p-1 rounded-[4px] hover:bg-overlay"
                              title="Copy command"
                            >
                              {copiedSnippet === item.id ? (
                                <Check className="h-3.5 w-3.5 text-verified" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            {item.registryUrl ? (
                              <a 
                                href={item.registryUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-[11px]"
                              >
                                <span>View on {item.registryName}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : <span />}
                            <a 
                              href={item.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-text-muted hover:text-text-primary flex items-center gap-1 text-[11px]"
                            >
                              <span>GitHub Source</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Expandable Setup Instructions Accordion */}
                      {(item.installSteps || item.quickstart) && (
                        <div className="border-t border-hairline pt-2">
                          <button
                            onClick={() => toggleGuide(item.id)}
                            className="flex items-center justify-between w-full text-left text-[11px] font-mono text-text-muted hover:text-text-primary py-1 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Terminal className="h-3 w-3 text-accent-ribbon" />
                              {item.installSteps ? "Setup & Installation Steps" : "Code Quickstart"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-text-muted" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3 rounded-[6px] border border-hairline bg-canvas space-y-2 text-xs font-mono">
                              {item.installSteps && (
                                <ol className="list-decimal list-inside space-y-1.5 text-text-secondary leading-relaxed text-[11px]">
                                  {item.installSteps.map((step, idx) => (
                                    <li key={idx} className="pl-1">
                                      <span className="text-text-secondary">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}
                              {item.quickstart && (
                                <div className="space-y-1">
                                  <div className="text-[10px] text-text-muted uppercase tracking-wider">Example Usage:</div>
                                  <pre className="p-2 rounded-[4px] bg-overlay border border-hairline text-[10px] sm:text-[11px] text-text-secondary overflow-x-auto">
                                    {item.quickstart}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: High-Density Directory Matrix (Responsive Table) */
          <div className="space-y-4">
            {/* Desktop Table View (sm and up) */}
            <div className="hidden sm:block rounded-[6px] border border-hairline bg-surface overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-hairline bg-overlay text-text-muted">
                      <th className="p-4 uppercase tracking-wider font-medium">Package / Tool</th>
                      <th className="p-4 uppercase tracking-wider font-medium">Platform &amp; Type</th>
                      <th className="p-4 uppercase tracking-wider font-medium">Target / Format</th>
                      <th className="p-4 uppercase tracking-wider font-medium">Version</th>
                      <th className="p-4 uppercase tracking-wider font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-overlay/40 transition-colors">
                        <td className="p-4">
                          <div className="font-sans font-medium text-sm text-text-primary flex items-center gap-2">
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-accent-ribbon font-mono mt-0.5">{item.categoryLabel}</div>
                        </td>
                        <td className="p-4 text-text-secondary">
                          <div>{item.platform}</div>
                          <div className="text-[11px] text-text-muted">{item.type}</div>
                        </td>
                        <td className="p-4">
                          <code className="px-2 py-1 rounded-[4px] bg-canvas border border-hairline text-[11px] text-text-secondary">
                            {item.format}
                          </code>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <Badge variant="outline" className="border-hairline bg-overlay text-text-muted font-mono text-[10px] tnum">
                            {item.version}
                          </Badge>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {item.actionType === "download" ? (
                            <a
                              href={item.actionUrl}
                              download
                              onClick={() => handleDownload(item.name)}
                            >
                              <Button size="sm" className="h-8 px-3 rounded-[6px] bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium text-xs gap-1.5 font-mono shadow-none">
                                <Download className="h-3.5 w-3.5" />
                                <span>{item.actionLabel.replace("Download ", "")}</span>
                              </Button>
                            </a>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleCopy(item.actionSnippet || "", item.id)}
                              className="h-8 px-3 rounded-[6px] bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary font-mono text-xs gap-1.5 border border-hairline"
                            >
                              {copiedSnippet === item.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-verified" />
                                  <span className="text-verified">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-text-muted" />
                                  <span>{item.actionLabel.startsWith("pnpm") ? "Copy pnpm" : item.actionLabel.startsWith("pip") ? "Copy pip" : item.actionLabel.startsWith("go") ? "Copy go" : item.actionLabel.startsWith("cargo") ? "Copy cargo" : "Copy YAML"}</span>
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View (< sm) */}
            <div className="sm:hidden space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[6px] border border-hairline bg-surface space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-sans font-medium text-sm text-text-primary leading-snug">{item.name}</h3>
                      <div className="text-[11px] text-accent-ribbon font-mono mt-0.5">{item.categoryLabel} &bull; {item.version}</div>
                    </div>
                    <Badge variant="outline" className="border-hairline bg-overlay text-[10px] font-mono text-text-muted shrink-0 tnum">
                      {item.type}
                    </Badge>
                  </div>

                  <div className="text-xs text-text-secondary font-mono bg-canvas p-2 rounded-[4px] border border-hairline break-all">
                    {item.format}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-text-primary text-xs font-mono flex items-center gap-1"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    {item.actionType === "download" ? (
                      <a
                        href={item.actionUrl}
                        download
                        onClick={() => handleDownload(item.name)}
                        className="flex-1 max-w-[160px]"
                      >
                        <Button size="sm" className="w-full h-9 rounded-[6px] bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium text-xs gap-1.5 font-mono shadow-none">
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCopy(item.actionSnippet || "", item.id)}
                        className="flex-1 max-w-[160px] h-9 rounded-[6px] bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary font-mono text-xs gap-1.5 border border-hairline"
                      >
                        {copiedSnippet === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-verified" />
                            <span className="text-verified">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-text-muted" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA to Docs & Developer Hub */}
        <div className="p-4 sm:p-6 rounded-[6px] border border-hairline bg-surface flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-medium font-sans text-text-primary">Need integration guidance, REST endpoints, or node setup?</h4>
            <p className="text-xs text-text-muted">Explore full architectural specifications, interactive sandbox, and OpenAPI 3.1 schema.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Link href="/developers" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-hairline bg-overlay text-xs font-mono text-text-secondary hover:text-text-primary rounded-[6px] h-9">
                Developer Portal
              </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium font-mono text-xs rounded-[6px] h-9 shadow-none">
                Documentation Hub
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
