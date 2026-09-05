"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Download, 
  Chrome, 
  Globe, 
  FileText, 
  Terminal, 
  ExternalLink, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft,
  Shield, 
  Cpu, 
  Layers, 
  Package, 
  FolderDown, 
  CheckCircle2, 
  Sparkles,
  GitBranch,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function DownloadsClientView() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("extensions");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownload = (filename: string, path: string) => {
    toast.success(`Starting download for ${filename}...`);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs font-mono">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>Protocol v1.0.6</span>
            <span>&bull;</span>
            <span className="text-emerald-400">All Downloads Verified</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-950/50 text-cyan-300 font-mono text-xs">
              <Package className="h-3 w-3 mr-1 text-cyan-400" /> ECOSYSTEM CLIENTS & INTEGRATIONS
            </Badge>
            <span className="text-xs text-zinc-400 font-mono">ONE-CLICK DOWNLOADS</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Prebuilt Extensions, Plugins & Binaries
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-3xl leading-relaxed">
            Download production-ready client bundles with 1-click. Integrate sovereign decentralized publishing into your Chromium browser, WordPress site, Obsidian vault, or CI/CD pipelines.
          </p>
        </div>

        {/* Quick Links Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-[#0B0D14] border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="extensions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 font-mono text-xs gap-1.5">
              <Chrome className="h-3.5 w-3.5" /> Browser & CMS Extensions
            </TabsTrigger>
            <TabsTrigger value="obsidian" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 font-mono text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Obsidian & Notes
            </TabsTrigger>
            <TabsTrigger value="developer" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 font-mono text-xs gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> SDKs & Docker Daemon
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Browser & CMS Extensions */}
          <TabsContent value="extensions" className="space-y-6 mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Card 1: Chromium Extension */}
              <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Chrome className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono text-[10px]">Manifest V3</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-mono text-[10px]">31 KB</Badge>
                      <Badge variant="outline" className="border-white/10 text-zinc-400 font-mono text-[10px]">v1.0.6</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Chromium Browser Extension</h3>
                    <p className="text-xs text-cyan-400 font-mono mt-0.5">Chrome, Brave, Edge, Arc</p>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      Native browser extension providing instant Ed25519 keypair management, 1-click tracker scrubbing, and right-click article archival to IPFS and Tor.
                    </p>
                  </div>

                  {/* 1-Click Download Button */}
                  <div className="pt-2">
                    <a 
                      href="/downloads/press-protocol-extension.zip" 
                      download="press-protocol-extension.zip"
                      onClick={() => handleDownload("Chromium Extension", "/downloads/press-protocol-extension.zip")}
                      className="w-full block"
                    >
                      <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs h-10 gap-2 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                        <Download className="h-4 w-4" /> Download Extension (.zip)
                      </Button>
                    </a>
                  </div>

                  {/* Installation Accordion */}
                  <div className="p-4 rounded-xl border border-white/5 bg-[#08090E] space-y-2 text-xs font-mono">
                    <div className="text-zinc-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Setup Instructions (20 seconds):
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1 leading-relaxed">
                      <li>Download and extract <code className="text-cyan-300">press-protocol-extension.zip</code>.</li>
                      <li>Open <code className="text-cyan-300">chrome://extensions</code> in your browser.</li>
                      <li>Enable the <strong className="text-white">Developer mode</strong> toggle in the top-right.</li>
                      <li>Click <strong className="text-white">Load unpacked</strong> and select the unzipped directory.</li>
                      <li>PressProtocol is now active in your extensions toolbar!</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: WordPress Plugin */}
              <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 font-mono text-[10px]">WP 6.0+</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-mono text-[10px]">27 KB</Badge>
                      <Badge variant="outline" className="border-white/10 text-zinc-400 font-mono text-[10px]">PHP 8.0+</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">WordPress Publishing Bridge</h3>
                    <p className="text-xs text-purple-400 font-mono mt-0.5">Self-Hosted WP & Multisite</p>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      Transform any existing WordPress blog into an unstoppable publishing node. Automatically mirrors new blog posts to IPFS and Tor with signature proofs.
                    </p>
                  </div>

                  {/* 1-Click Download Button */}
                  <div className="pt-2">
                    <a 
                      href="/downloads/press-protocol-wordpress.zip" 
                      download="press-protocol-wordpress.zip"
                      onClick={() => handleDownload("WordPress Plugin", "/downloads/press-protocol-wordpress.zip")}
                      className="w-full block"
                    >
                      <Button className="w-full bg-purple-500 hover:bg-purple-400 text-black font-semibold font-mono text-xs h-10 gap-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                        <Download className="h-4 w-4" /> Download WordPress Plugin (.zip)
                      </Button>
                    </a>
                  </div>

                  {/* Installation Accordion */}
                  <div className="p-4 rounded-xl border border-white/5 bg-[#08090E] space-y-2 text-xs font-mono">
                    <div className="text-zinc-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Setup Instructions (30 seconds):
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1 leading-relaxed">
                      <li>Download <code className="text-purple-300">press-protocol-wordpress.zip</code>.</li>
                      <li>In WP Admin, navigate to <strong className="text-white">Plugins → Add New → Upload Plugin</strong>.</li>
                      <li>Select the zip file and click <strong className="text-white">Install Now</strong>.</li>
                      <li>Click <strong className="text-white">Activate Plugin</strong>.</li>
                      <li>Navigate to <strong className="text-white">Settings → PressProtocol</strong> to configure relays.</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 2: Obsidian Vault Plugin */}
          <TabsContent value="obsidian" className="space-y-6 mt-0">
            <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Obsidian Sovereign Publisher</h3>
                      <p className="text-xs text-purple-400 font-mono">Desktop & Mobile &bull; Markdown Native</p>
                    </div>
                  </div>

                  <a 
                    href="/downloads/press-protocol-obsidian.zip" 
                    download="press-protocol-obsidian.zip"
                    onClick={() => handleDownload("Obsidian Plugin", "/downloads/press-protocol-obsidian.zip")}
                  >
                    <Button className="bg-purple-500 hover:bg-purple-400 text-black font-semibold font-mono text-xs h-10 px-5 gap-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                      <Download className="h-4 w-4" /> Download Obsidian Plugin (.zip)
                    </Button>
                  </a>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Publish your personal research notes, investigative memos, and essays directly from Obsidian without ever leaving your editor. Retains complete markdown formatting and calculates cryptographic CIDs locally.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-white/5 bg-[#08090E] space-y-1">
                    <div className="text-xs font-mono text-purple-300 font-semibold">1. Unzip to Vault</div>
                    <p className="text-[11px] text-zinc-400">Extract bundle to <code className="text-white">.obsidian/plugins/pressprotocol/</code> inside your vault.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#08090E] space-y-1">
                    <div className="text-xs font-mono text-purple-300 font-semibold">2. Enable Plugin</div>
                    <p className="text-[11px] text-zinc-400">In Obsidian Settings → Community Plugins, reload and toggle PressProtocol ON.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#08090E] space-y-1">
                    <div className="text-xs font-mono text-purple-300 font-semibold">3. 1-Command Publish</div>
                    <p className="text-[11px] text-zinc-400">Press <code className="text-white">Cmd + P</code> → select <strong className="text-white">PressProtocol: Publish Note</strong>.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Actions CI/CD Integration */}
            <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">GitHub Actions Automated Publisher</h3>
                  </div>
                  <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono text-[10px]">CI/CD Workflow</Badge>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Automatically sign and publish articles whenever markdown files are pushed to your git repository:
                </p>
                <div className="rounded-xl border border-white/10 bg-[#08090E] overflow-hidden font-mono text-xs">
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-zinc-400">
                    <span>.github/workflows/pressprotocol.yml</span>
                    <button 
                      onClick={() => handleCopy(`name: Decentralized Publish\non:\n  push:\n    paths:\n      - 'dispatches/**.md'\njobs:\n  publish:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: 0xshikhar/PressProtocol/integrations/publish-action@v1.0.6\n        with:\n          path: 'dispatches/'\n          private_key: \${{ secrets.PRESS_PRIVATE_KEY }}`, "gh-action")}
                      className="text-cyan-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedSnippet === "gh-action" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSnippet === "gh-action" ? "Copied" : "Copy YAML"}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-cyan-300 overflow-x-auto leading-relaxed">
{`name: Decentralized Publish
on:
  push:
    paths:
      - 'dispatches/**.md'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: 0xshikhar/PressProtocol/integrations/publish-action@v1.0.6
        with:
          path: 'dispatches/'
          private_key: \${{ secrets.PRESS_PRIVATE_KEY }}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Developer SDKs & Docker Daemon */}
          <TabsContent value="developer" className="space-y-6 mt-0">
            {/* Docker Compose Card */}
            <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Server className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Autonomous Node Daemon</h3>
                      <p className="text-xs text-emerald-400 font-mono">Fastify + Embedded Helia IPFS + Tor v3 Onion Daemon</p>
                    </div>
                  </div>

                  <a 
                    href="/downloads/docker-compose.yml" 
                    download="docker-compose.yml"
                    onClick={() => handleDownload("Docker Compose", "/downloads/docker-compose.yml")}
                  >
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-mono text-xs h-10 px-5 gap-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                      <Download className="h-4 w-4" /> Download docker-compose.yml
                    </Button>
                  </a>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Run a sovereign, self-contained community node on your VPS or home server with a single command. Includes automatic Helia IPFS peer discovery and Tor v3 hidden service generation.
                </p>

                <div className="rounded-xl border border-white/10 bg-[#08090E] p-4 font-mono text-xs text-zinc-300 flex items-center justify-between">
                  <span className="text-emerald-300">docker compose up -d</span>
                  <button 
                    onClick={() => handleCopy("docker compose up -d", "docker-run")}
                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedSnippet === "docker-run" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet === "docker-run" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* SDK Code Snippets */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0D14] space-y-4">
              <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" /> Multi-Language Client SDKs
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-white/5 bg-[#08090E] flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TypeScript / Node.js</span>
                    <span className="text-cyan-300">pnpm add @pressprotocol/sdk</span>
                  </div>
                  <button onClick={() => handleCopy("pnpm add @pressprotocol/sdk", "inst-ts-dl")}>
                    {copiedSnippet === "inst-ts-dl" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-white" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-[#08090E] flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Python 3.10+</span>
                    <span className="text-emerald-300">pip install pressprotocol-sdk</span>
                  </div>
                  <button onClick={() => handleCopy("pip install pressprotocol-sdk", "inst-py-dl")}>
                    {copiedSnippet === "inst-py-dl" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-white" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-[#08090E] flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Go</span>
                    <span className="text-purple-300">go get github.com/0xshikhar/PressProtocol/sdks/go</span>
                  </div>
                  <button onClick={() => handleCopy("go get github.com/0xshikhar/PressProtocol/sdks/go", "inst-go-dl")}>
                    {copiedSnippet === "inst-go-dl" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-white" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-[#08090E] flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Instant Terminal Runner</span>
                    <span className="text-amber-300">npx @pressprotocol/sdk --help</span>
                  </div>
                  <button onClick={() => handleCopy("npx @pressprotocol/sdk --help", "inst-npx-dl")}>
                    {copiedSnippet === "inst-npx-dl" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-white" />}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA to Docs & Settings */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#0B0D14] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white">Need integration guidance or custom node setup?</h4>
            <p className="text-xs text-zinc-400">Explore full architectural specifications, REST endpoints, and threat matrices.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/docs">
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-xs font-mono text-zinc-300 hover:text-white rounded-xl">
                Documentation Hub
              </Button>
            </Link>
            <Link href="/settings">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs rounded-xl">
                Open Settings
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
