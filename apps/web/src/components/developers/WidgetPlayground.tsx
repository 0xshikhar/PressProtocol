import React, { useState } from "react";
import { Sparkles, Sliders, Share2, Radio, Code2, Check, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateDeterministicCIDv1 } from "@pressprotocol/sdk";

export default function WidgetPlayground() {
  const [widgetTheme, setWidgetTheme] = useState<"auto" | "light" | "dark">("auto");
  const [widgetBadge, setWidgetBadge] = useState<"compact" | "full" | "minimal">("compact");
  const [mockTitle, setMockTitle] = useState<string>("Sovereign Archival Demonstration");
  const [mockBody, setMockBody] = useState<string>(
    "This text is live-monitored by the <pressprotocol-publish> web component. When the button is clicked, it extracts the DOM content, calculates the deterministic CIDv1 multihash in-memory, signs the payload, and produces a tamper-proof proof receipt."
  );
  const [widgetEvents, setWidgetEvents] = useState<Array<{ timestamp: string; cid: string; eventType: string }>>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleMockWidgetPublish = async () => {
    const cid = calculateDeterministicCIDv1(mockBody);
    const newEvent = {
      timestamp: new Date().toLocaleTimeString(),
      cid,
      eventType: "pressprotocol:published",
    };
    setWidgetEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
  };

  const widgetEmbedCode = `<!-- 1. Include PressProtocol Universal Rails -->
<script src="https://cdn.pressprotocol.com/v1/widget.js" async></script>

<!-- 2. Embed 1-Click Sovereign Publishing Button into your CMS or Editor -->
<pressprotocol-publish 
  target-title="#article-title" 
  target-editor="#article-body"
  node-url="https://node.pressprotocol.com"
  theme="${widgetTheme}"
  badge="${widgetBadge}"
  onpublish="console.log('Published CID:', event.detail.cid)">
</pressprotocol-publish>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(widgetEmbedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="widget-playground" className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-bold tracking-tight">Universal Web Component Playground</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Embed 1-click sovereign publishing into any website, blog, or CMS with two lines of drop-in HTML.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration & Mock Article Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                Widget Configuration &amp; Mock Editor
              </CardTitle>
              <CardDescription className="text-xs">
                Customize attributes and type in the mock editor to test automatic DOM extraction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Badge Mode</label>
                  <select
                    value={widgetBadge}
                    onChange={(e: any) => setWidgetBadge(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="compact">compact (Standard)</option>
                    <option value="full">full (With Transport Mirrors)</option>
                    <option value="minimal">minimal (Icon Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Theme</label>
                  <select
                    value={widgetTheme}
                    onChange={(e: any) => setWidgetTheme(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">auto (Match Parent)</option>
                    <option value="light">light</option>
                    <option value="dark">dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-semibold text-foreground">Mock Editorial Article</label>
                <Input
                  id="demo-article-title"
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  placeholder="Article Title"
                  className="font-medium text-sm"
                />
                <Textarea
                  id="demo-article-body"
                  rows={4}
                  value={mockBody}
                  onChange={(e) => setMockBody(e.target.value)}
                  placeholder="Write article body..."
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Live Publish Action Trigger */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Connected to <span className="font-mono font-medium text-foreground">#demo-article-*</span>
                </div>
                <Button
                  onClick={handleMockWidgetPublish}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-xs shadow-sm"
                >
                  <Share2 className="h-3.5 w-3.5" /> Publish to IPFS &amp; Tor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Widget Event Stream */}
          {widgetEvents.length > 0 && (
            <Card className="border-indigo-500/20 bg-indigo-500/5">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Radio className="h-3.5 w-3.5 animate-pulse" /> Live onpublish Event Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 space-y-1.5">
                {widgetEvents.map((ev, i) => (
                  <div key={i} className="text-xs font-mono flex items-center justify-between gap-2 text-muted-foreground border-b border-indigo-500/10 pb-1 last:border-0">
                    <span className="truncate">📦 CID: <strong className="text-foreground">{ev.cid.slice(0, 24)}...</strong></span>
                    <span className="text-[11px] shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Embed Code Snippet & Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-base font-semibold">Drop-in HTML Snippet</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="gap-1.5 text-xs h-7"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="rounded-md bg-muted/70 p-3 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
                {widgetEmbedCode}
              </div>

              <div className="rounded-lg bg-muted/30 p-3 border text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Zero Configuration Compatibility
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The widget automatically connects to TipTap, Lexical, Quill, ProseMirror, Slate, TinyMCE, or standard HTML inputs without requiring backend modifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
