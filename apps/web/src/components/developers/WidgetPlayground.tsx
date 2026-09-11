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
          <Sparkles className="h-5 w-5 text-accent-ribbon" />
          <h2 className="text-2xl font-medium tracking-tight text-text-primary font-sans">Universal Web Component Playground</h2>
        </div>
        <p className="text-sm text-text-muted mt-1 font-sans">
          Embed 1-click sovereign publishing into any website, blog, or CMS with two lines of drop-in HTML.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration & Mock Article Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card elevation="card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-text-primary font-sans">
                <Sliders className="h-4 w-4 text-accent-ribbon" />
                Widget Configuration &amp; Mock Editor
              </CardTitle>
              <CardDescription className="text-xs text-text-muted font-sans">
                Customize attributes and type in the mock editor to test automatic DOM extraction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-secondary">Badge Mode</label>
                  <select
                    value={widgetBadge}
                    onChange={(e: any) => setWidgetBadge(e.target.value)}
                    className="w-full rounded-[6px] border border-hairline bg-canvas px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-hairline"
                  >
                    <option value="compact">compact (Standard)</option>
                    <option value="full">full (With Transport Mirrors)</option>
                    <option value="minimal">minimal (Icon Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-secondary">Theme</label>
                  <select
                    value={widgetTheme}
                    onChange={(e: any) => setWidgetTheme(e.target.value)}
                    className="w-full rounded-[6px] border border-hairline bg-canvas px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-hairline"
                  >
                    <option value="auto">auto (Match Parent)</option>
                    <option value="light">light</option>
                    <option value="dark">dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-hairline">
                <label className="text-xs font-mono text-text-secondary">Mock Editorial Article</label>
                <Input
                  id="demo-article-title"
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  placeholder="Article Title"
                  className="font-medium text-sm bg-canvas border-hairline text-text-primary rounded-[6px] focus-visible:ring-accent-primary/40"
                />
                <Textarea
                  id="demo-article-body"
                  rows={4}
                  value={mockBody}
                  onChange={(e) => setMockBody(e.target.value)}
                  placeholder="Write article body..."
                  className="text-xs leading-relaxed bg-canvas border-hairline text-text-primary rounded-[6px] focus-visible:ring-accent-primary/40"
                />
              </div>

              {/* Live Publish Action Trigger */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs font-mono text-text-muted">
                  Connected to <span className="text-text-secondary font-medium">#demo-article-*</span>
                </div>
                <Button
                  onClick={handleMockWidgetPublish}
                  className="gap-2 bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium text-xs h-9 px-4 rounded-[6px] shadow-none transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" /> Publish to IPFS &amp; Tor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Widget Event Stream */}
          {widgetEvents.length > 0 && (
            <Card elevation="card">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-xs font-mono font-medium flex items-center gap-1.5 text-text-primary">
                  <Radio className="h-3.5 w-3.5 text-verified" /> Live onpublish Event Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 space-y-1.5">
                {widgetEvents.map((ev, i) => (
                  <div key={i} className="text-xs font-mono flex items-center justify-between gap-2 text-text-secondary border-b border-hairline pb-1 last:border-0">
                    <span className="truncate">📦 CID: <strong className="text-accent-ribbon font-mono">{ev.cid.slice(0, 24)}...</strong></span>
                    <span className="text-[11px] text-text-muted shrink-0 tnum">{ev.timestamp}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Embed Code Snippet & Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <Card elevation="card" className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-hairline">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent-ribbon" />
                  <CardTitle className="text-base font-medium text-text-primary font-sans">Drop-in HTML Snippet</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="gap-1.5 text-xs font-mono h-7 border-hairline bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary rounded-[6px]"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="rounded-[6px] bg-canvas p-4 font-mono text-xs overflow-x-auto border border-hairline text-text-secondary leading-relaxed whitespace-pre">
                {widgetEmbedCode}
              </div>

              <div className="rounded-[6px] bg-overlay p-3.5 border border-hairline text-xs space-y-1.5 font-sans">
                <div className="font-medium text-text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-verified" />
                  Zero Configuration Compatibility
                </div>
                <p className="text-text-muted leading-relaxed">
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
