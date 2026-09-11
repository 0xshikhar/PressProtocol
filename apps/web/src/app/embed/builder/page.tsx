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
  const [theme, setTheme] = useState<"cyber" | "dark" | "sepia" | "light">("dark");
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
  style="border-radius: 6px; border: 1px solid rgba(240, 232, 232, 0.07); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);"
  title="PressProtocol Sovereign Reader"
></iframe>`;

  const reactCode = `// PressProtocol Sovereign Reader Component
export function SovereignEmbed() {
  return (
    <iframe
      src="${embedUrl}"
      className="w-full ${compact ? "h-[320px]" : "h-[650px]"} rounded-[6px] border border-white/10 shadow-2xl"
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
    toast.success(`Copied ${tab} code snippet`);
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
    <div className="min-h-screen bg-background text-primary selection:bg-accent-tint selection:text-primary flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-border/60 bg-surface px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2.5 text-xs font-mono text-muted hover:text-primary rounded-[6px]"
            >
              <Link href="/developers" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-[6px] bg-overlay text-secondary border border-hairline">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-primary font-sans">Universal Embed Studio</h1>
                <p className="text-[11px] text-muted hidden sm:block">
                  Embed verified sovereign articles on any website or publication
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-mono border-border/70 bg-surface hover:bg-surface-raised text-primary rounded-[6px]"
              onClick={() => window.open(embedUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 text-secondary" />
              <span>Test Live Iframe</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configurator Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 bg-surface rounded-[6px]">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2 text-primary font-sans font-semibold">
                <Shield className="h-4 w-4 text-secondary" />
                Target Content &amp; CID
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Enter any valid IPFS CIDv1 multihash or resolve permalink
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-secondary">Article CID</label>
                <Input
                  value={cid}
                  onChange={(e) => setCid(e.target.value.trim())}
                  placeholder="bafkrei..."
                  className="font-mono text-xs bg-background border-border/70 text-primary placeholder:text-muted/50 focus:border-focus rounded-[6px] h-10"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-muted font-mono">Quick presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-mono border-border/60 bg-surface-raised hover:bg-surface text-secondary rounded-[6px]"
                    onClick={() => setCid(DEFAULT_SAMPLE_CID)}
                  >
                    Sample Article
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-mono border-border/60 bg-surface-raised hover:bg-surface text-secondary rounded-[6px]"
                    onClick={() => setCid("bafkreigh2akiscaildcqjybeeqd4lq5vvdjv5k6g5qf44cqk5o22u3q7ae")}
                  >
                    Privacy Manifesto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Display Mode Card */}
          <Card className="border-border/60 bg-surface rounded-[6px]">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2 text-primary font-sans font-semibold">
                <Layers className="h-4 w-4 text-secondary" />
                Appearance &amp; Aesthetics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {/* Theme Presets */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-secondary">Reading Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                      theme === "dark"
                        ? "border-focus bg-overlay text-primary"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary hover:border-border"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-accent-primary" />
                    <div>
                      <div className="text-xs font-semibold">Sovereign Dark</div>
                      <div className="text-[10px] opacity-70">Leather &amp; Ivory</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("cyber")}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                      theme === "cyber"
                        ? "border-verified bg-verified/10 text-primary"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary hover:border-border"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-verified" />
                    <div>
                      <div className="text-xs font-semibold">Matrix Green</div>
                      <div className="text-[10px] opacity-70">Phosphor terminal</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("sepia")}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                      theme === "sepia"
                        ? "border-[#C97A2E]/60 bg-[#C97A2E]/10 text-primary"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary hover:border-border"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-[#C97A2E]" />
                    <div>
                      <div className="text-xs font-semibold">Warm Sepia</div>
                      <div className="text-[10px] opacity-70">Low eyestrain</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                      theme === "light"
                        ? "border-primary bg-background text-primary"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary hover:border-border"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <div>
                      <div className="text-xs font-semibold">Clean Ivory</div>
                      <div className="text-[10px] opacity-70">High contrast</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Display Mode */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-secondary">Display Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompact(false)}
                    className={`p-3 rounded-[6px] border text-center transition-all ${
                      !compact
                        ? "border-focus bg-overlay text-primary font-semibold"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary"
                    }`}
                  >
                    <div className="text-xs">Full Article Reader</div>
                    <div className="text-[10px] opacity-70 font-normal mt-0.5">Scrollable 650px canvas</div>
                  </button>

                  <button
                    onClick={() => setCompact(true)}
                    className={`p-3 rounded-[6px] border text-center transition-all ${
                      compact
                        ? "border-focus bg-overlay text-primary font-semibold"
                        : "border-border/60 bg-surface-raised text-muted hover:text-primary"
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
          <Card className="border-border/60 bg-surface rounded-[6px] flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-secondary" />
                <span className="text-xs font-mono font-medium text-muted">
                  Live Responsive Preview
                </span>
              </div>

              {/* Device switcher */}
              <div className="flex items-center gap-1 bg-background p-1 rounded-[6px] border border-border/60">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded-[4px] ${device === "desktop" ? "bg-surface-raised text-primary shadow-sm" : "text-muted hover:text-primary"}`}
                  onClick={() => setDevice("desktop")}
                  title="Desktop viewport (100%)"
                >
                  <Laptop className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded-[4px] ${device === "tablet" ? "bg-surface-raised text-primary shadow-sm" : "text-muted hover:text-primary"}`}
                  onClick={() => setDevice("tablet")}
                  title="Tablet viewport (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 rounded-[4px] ${device === "mobile" ? "bg-surface-raised text-primary shadow-sm" : "text-muted hover:text-primary"}`}
                  onClick={() => setDevice("mobile")}
                  title="Mobile viewport (390px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex items-center justify-center bg-background overflow-hidden border-t border-border/40">
              <div className={`transition-all duration-300 w-full flex justify-center ${getDeviceWidth()}`}>
                <iframe
                  src={embedUrl}
                  className={`w-full rounded-[6px] border border-border/70 shadow-2xl transition-all ${compact ? "h-[320px]" : "h-[560px]"}`}
                  loading="lazy"
                  allow="clipboard-write"
                  title="Live Article Preview"
                />
              </div>
            </CardContent>
          </Card>

          {/* Code Exporter Card */}
          <Card className="border-border/60 bg-surface rounded-[6px]">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary font-sans">
                  <Terminal className="h-4 w-4 text-secondary" />
                  Generated Production Code
                </CardTitle>
                <Badge variant="verified" className="text-[10px] font-mono rounded-[4px]">
                  Ready to Embed
                </Badge>
              </div>
            </CardHeader>

            <Tabs defaultValue="webcomponent" className="p-0">
              <div className="px-4 py-2 bg-surface-raised border-b border-border/60">
                <TabsList className="bg-background border border-border/60 h-8 rounded-[4px] p-0.5">
                  <TabsTrigger value="webcomponent" className="text-xs px-3 gap-1.5 h-7 rounded-[3px] data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-focus font-mono">
                    <Globe className="h-3.5 w-3.5" />
                    Web Component
                  </TabsTrigger>
                  <TabsTrigger value="iframe" className="text-xs px-3 gap-1.5 h-7 rounded-[3px] data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-focus font-mono">
                    <Code2 className="h-3.5 w-3.5" />
                    HTML &lt;iframe&gt;
                  </TabsTrigger>
                  <TabsTrigger value="react" className="text-xs px-3 gap-1.5 h-7 rounded-[3px] data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-focus font-mono">
                    <FileCode className="h-3.5 w-3.5" />
                    React / Next.js
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="text-xs px-3 gap-1.5 h-7 rounded-[3px] data-[state=active]:bg-overlay data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-focus font-mono">
                    <Sparkles className="h-3.5 w-3.5" />
                    Markdown Badge
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: WEB COMPONENT */}
              <TabsContent value="webcomponent" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted font-sans">
                    Zero-dependency Custom Element. Works anywhere (Webflow, Squarespace, Ghost, custom HTML):
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(webComponentCode, "Web Component")}
                    className="h-7 text-xs font-mono gap-1.5 border-border/70 bg-surface hover:bg-surface-raised text-primary shrink-0 rounded-[6px]"
                  >
                    {copiedTab === "Web Component" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy Tag
                  </Button>
                </div>
                <pre className="p-3.5 rounded-[6px] bg-background border border-border/70 text-xs font-mono text-primary overflow-x-auto leading-relaxed select-all">
                  {webComponentCode}
                </pre>
              </TabsContent>

              {/* TAB 2: IFRAME */}
              <TabsContent value="iframe" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted font-sans">
                    Standard HTML5 iframe snippet:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(iframeCode, "HTML iframe")}
                    className="h-7 text-xs font-mono gap-1.5 border-border/70 bg-surface hover:bg-surface-raised text-primary shrink-0 rounded-[6px]"
                  >
                    {copiedTab === "HTML iframe" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy Code
                  </Button>
                </div>
                <pre className="p-3.5 rounded-[6px] bg-background border border-border/70 text-xs font-mono text-primary overflow-x-auto leading-relaxed select-all">
                  {iframeCode}
                </pre>
              </TabsContent>

              {/* TAB 3: REACT */}
              <TabsContent value="react" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted font-sans">
                    Modern React / Next.js component:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(reactCode, "React Component")}
                    className="h-7 text-xs font-mono gap-1.5 border-border/70 bg-surface hover:bg-surface-raised text-primary shrink-0 rounded-[6px]"
                  >
                    {copiedTab === "React Component" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy Component
                  </Button>
                </div>
                <pre className="p-3.5 rounded-[6px] bg-background border border-border/70 text-xs font-mono text-primary overflow-x-auto leading-relaxed select-all">
                  {reactCode}
                </pre>
              </TabsContent>

              {/* TAB 4: MARKDOWN */}
              <TabsContent value="markdown" className="p-4 m-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted font-sans">
                    Dynamic OpenGraph social badge for GitHub READMEs, Substack, or blogs:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(markdownCode, "Markdown Badge")}
                    className="h-7 text-xs font-mono gap-1.5 border-border/70 bg-surface hover:bg-surface-raised text-primary shrink-0 rounded-[6px]"
                  >
                    {copiedTab === "Markdown Badge" ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                    Copy Badge
                  </Button>
                </div>
                <pre className="p-3.5 rounded-[6px] bg-background border border-border/70 text-xs font-mono text-primary overflow-x-auto leading-relaxed select-all">
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
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-muted">Loading Embed Studio...</div>}>
      <EmbedBuilderContent />
    </Suspense>
  );
}
