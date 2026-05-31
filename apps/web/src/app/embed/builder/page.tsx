"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Eye,
  ArrowLeft,
  Sparkles,
  Terminal,
  Shield,
  Layers,
  FileCode,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const DEFAULT_SAMPLE_CID = "bafkreic7x2kwz36i6xebv6dfk2yhyovr67y3z4g244x2a3e6fgn6x5q72e";

function EmbedBuilderContent() {
  const searchParams = useSearchParams();
  const initialCid = searchParams.get("cid") || DEFAULT_SAMPLE_CID;

  const [cid, setCid] = useState(initialCid);
  const [theme, setTheme] = useState<"cyber" | "dark" | "sepia" | "light">("cyber");
  const [compact, setCompact] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  useEffect(() => {
    const queryCid = searchParams.get("cid");
    if (queryCid) {
      setCid(queryCid);
    }
  }, [searchParams]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://pressprotocol.com";
  const embedUrl = `${origin}/embed/${encodeURIComponent(cid)}?theme=${theme}${compact ? "&compact=true" : ""}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${compact ? "320" : "650"}"
  frameborder="0"
  loading="lazy"
  allow="clipboard-write"
  style="border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);"
  title="PressProtocol Sovereign Reader"
></iframe>`;

  const reactCode = `// PressProtocol Sovereign Reader Component
export function SovereignEmbed() {
  return (
    <iframe
      src="${embedUrl}"
      className="w-full ${compact ? "h-[320px]" : "h-[650px]"} rounded-xl border border-white/10 shadow-2xl"
      loading="lazy"
      allow="clipboard-write"
      title="PressProtocol Sovereign Reader"
    />
  );
}`;

  const markdownCode = `[![Read on PressProtocol](${origin}/api/og/${cid})](${origin}/read/${cid})`;

  const webComponentCode = `<!-- 1. Include the zero-dependency Web Component in your <head> or <body> -->
<script type="module" src="${origin}/embed.js"></script>

<!-- 2. Drop the custom tag anywhere (Webflow, Ghost, WordPress, custom HTML) -->
<press-embed 
  cid="${cid}" 
  theme="${theme}" 
  compact="${compact ? "true" : "false"}"
></press-embed>`;

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    toast.success(`Copied ${tab} code snippet to clipboard!`);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Top Bar */}
      <header className="border-b border-border/40 sticky top-0 z-30 bg-background/90 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href={cid ? `/read/${cid}` : "/"}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">Universal Embed Studio</h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Embed verified sovereign articles on any website or publication
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-mono"
              onClick={() => window.open(embedUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Test Live Iframe</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configurator Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Target Content & CID
              </CardTitle>
              <CardDescription className="text-xs">
                Enter any valid IPFS CIDv1 multihash or resolve permalink
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Article CID</label>
                <Input
                  value={cid}
                  onChange={(e) => setCid(e.target.value.trim())}
                  placeholder="bafkrei..."
                  className="font-mono text-xs bg-background/50 h-9"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground">Quick presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] font-mono"
                    onClick={() => setCid(DEFAULT_SAMPLE_CID)}
                  >
                    Sample Article
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] font-mono"
                    onClick={() => setCid("bafkreigh2akiscaildcqjybeeqd4lq5vvdjv5k6g5qf44cqk5o22u3q7ae")}
                  >
                    Privacy Manifesto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Display Mode Card */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Appearance & Aesthetics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Reading Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme("cyber")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      theme === "cyber"
                        ? "border-emerald-500 bg-[#051109] ring-2 ring-emerald-500/40 text-emerald-300"
                        : "border-border/50 bg-background/50 hover:border-emerald-700/50 text-muted-foreground"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div>
                      <div className="text-xs font-bold">Cyber Matrix</div>
                      <div className="text-[10px] opacity-70">Terminal green</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      theme === "dark"
                        ? "border-primary bg-zinc-900 ring-2 ring-primary/40 text-white"
                        : "border-border/50 bg-background/50 hover:border-zinc-700 text-muted-foreground"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-zinc-400" />
                    <div>
                      <div className="text-xs font-bold">Dark Velvet</div>
                      <div className="text-[10px] opacity-70">Deep contrast</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("sepia")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      theme === "sepia"
                        ? "border-amber-700 bg-[#f4ece1] ring-2 ring-amber-700/40 text-[#2d2b28]"
                        : "border-border/50 bg-background/50 hover:border-amber-600/50 text-muted-foreground"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-amber-600" />
                    <div>
                      <div className="text-xs font-bold">Warm Sepia</div>
                      <div className="text-[10px] opacity-70">Low eyestrain</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      theme === "light"
                        ? "border-neutral-500 bg-white ring-2 ring-neutral-400 text-neutral-900 shadow-sm"
                        : "border-border/50 bg-background/50 hover:border-neutral-400 text-muted-foreground"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-neutral-900" />
                    <div>
                      <div className="text-xs font-bold">Clean Paper</div>
                      <div className="text-[10px] opacity-70">Daylight clarity</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Display Mode */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Display Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompact(false)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      !compact
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="text-xs">Full Article Reader</div>
                    <div className="text-[10px] opacity-70 font-normal mt-0.5">Scrollable 650px canvas</div>
                  </button>

                  <button
                    onClick={() => setCompact(true)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      compact
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="text-xs">Compact Card</div>
                    <div className="text-[10px] opacity-70 font-normal mt-0.5">Summary card 320px</div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Interactive Preview & Multi-Format Exporter (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          {/* Live Preview Container */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Responsive Preview
                </span>
              </div>

              {/* Device switcher */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded ${device === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setDevice("desktop")}
                  title="Desktop viewport (100%)"
                >
                  <Laptop className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded ${device === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setDevice("tablet")}
                  title="Tablet viewport (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded ${device === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setDevice("mobile")}
                  title="Mobile viewport (390px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex items-center justify-center bg-zinc-950/60 overflow-hidden">
              <div className={`transition-all duration-300 w-full flex justify-center ${getDeviceWidth()}`}>
                <iframe
                  src={embedUrl}
                  className={`w-full rounded-xl border border-white/10 shadow-2xl transition-all ${compact ? "h-[320px]" : "h-[560px]"}`}
                  loading="lazy"
                  allow="clipboard-write"
                  title="Live Article Preview"
                />
              </div>
            </CardContent>
          </Card>

          {/* Code Exporter Card */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  Generated Production Code
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                  Ready to Embed
                </Badge>
              </div>
            </CardHeader>

            <Tabs defaultValue="webcomponent" className="p-0">
              <div className="px-4 py-2 bg-muted/20 border-b border-border/40">
                <TabsList className="bg-muted/40 h-8">
                  <TabsTrigger value="webcomponent" className="text-xs px-3 gap-1.5 h-7">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Web Component
                  </TabsTrigger>
                  <TabsTrigger value="iframe" className="text-xs px-3 gap-1.5 h-7">
                    <Code2 className="h-3.5 w-3.5" />
                    HTML &lt;iframe&gt;
                  </TabsTrigger>
                  <TabsTrigger value="react" className="text-xs px-3 gap-1.5 h-7">
                    <FileCode className="h-3.5 w-3.5" />
                    React / Next.js
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="text-xs px-3 gap-1.5 h-7">
                    <Sparkles className="h-3.5 w-3.5" />
                    Markdown Badge
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: WEB COMPONENT */}
              <TabsContent value="webcomponent" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Zero-dependency Custom Element. Works anywhere (Webflow, Squarespace, Ghost, custom HTML):
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(webComponentCode, "Web Component")}
                    className="h-7 text-xs font-mono gap-1.5"
                  >
                    {copiedTab === "Web Component" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy Component Tag
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed select-all">
                  {webComponentCode}
                </pre>
              </TabsContent>

              {/* TAB 2: IFRAME */}
              <TabsContent value="iframe" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Standard HTML5 iframe snippet:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(iframeCode, "HTML iframe")}
                    className="h-7 text-xs font-mono gap-1.5"
                  >
                    {copiedTab === "HTML iframe" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy iframe Code
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-cyan-400 overflow-x-auto leading-relaxed select-all">
                  {iframeCode}
                </pre>
              </TabsContent>

              {/* TAB 3: REACT */}
              <TabsContent value="react" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Modern React / Next.js component:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(reactCode, "React Component")}
                    className="h-7 text-xs font-mono gap-1.5"
                  >
                    {copiedTab === "React Component" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy React Snippet
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed select-all">
                  {reactCode}
                </pre>
              </TabsContent>

              {/* TAB 4: MARKDOWN */}
              <TabsContent value="markdown" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Dynamic OpenGraph social badge for GitHub READMEs, Substack, or blogs:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(markdownCode, "Markdown Badge")}
                    className="h-7 text-xs font-mono gap-1.5"
                  >
                    {copiedTab === "Markdown Badge" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy Markdown
                  </Button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed select-all">
                  {markdownCode}
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EmbedBuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Embed Studio...</div>}>
      <EmbedBuilderContent />
    </Suspense>
  );
}
