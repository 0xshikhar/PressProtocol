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
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Universal Web Component Playground</h2>
        </div>
        <p className="text-sm text-white/60 mt-1 font-sans">
          Embed 1-click sovereign publishing into any website, blog, or CMS with two lines of drop-in HTML.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration & Mock Article Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-[#0B0D14] border border-white/10 text-white rounded-2xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white font-sans">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Widget Configuration &amp; Mock Editor
              </CardTitle>
              <CardDescription className="text-xs text-white/60 font-sans">
                Customize attributes and type in the mock editor to test automatic DOM extraction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/80">Badge Mode</label>
                  <select
                    value={widgetBadge}
                    onChange={(e: any) => setWidgetBadge(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="compact">compact (Standard)</option>
                    <option value="full">full (With Transport Mirrors)</option>
                    <option value="minimal">minimal (Icon Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/80">Theme</label>
                  <select
                    value={widgetTheme}
                    onChange={(e: any) => setWidgetTheme(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="auto">auto (Match Parent)</option>
                    <option value="light">light</option>
                    <option value="dark">dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-mono text-white/80">Mock Editorial Article</label>
                <Input
                  id="demo-article-title"
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  placeholder="Article Title"
                  className="font-medium text-sm bg-black/60 border-white/10 text-white rounded-xl"
                />
                <Textarea
                  id="demo-article-body"
                  rows={4}
                  value={mockBody}
                  onChange={(e) => setMockBody(e.target.value)}
                  placeholder="Write article body..."
                  className="text-xs leading-relaxed bg-black/60 border-white/10 text-white/90 rounded-xl"
                />
              </div>

              {/* Live Publish Action Trigger */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs font-mono text-white/50">
                  Connected to <span className="text-cyan-300 font-medium">#demo-article-*</span>
                </div>
                <Button
                  onClick={handleMockWidgetPublish}
                  className="gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs h-9 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" /> Publish to IPFS &amp; Tor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Widget Event Stream */}
          {widgetEvents.length > 0 && (
            <Card className="border border-cyan-500/30 bg-[#0B0D14] rounded-2xl">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-xs font-mono font-semibold flex items-center gap-1.5 text-cyan-400">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" /> Live onpublish Event Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 space-y-1.5">
                {widgetEvents.map((ev, i) => (
                  <div key={i} className="text-xs font-mono flex items-center justify-between gap-2 text-white/60 border-b border-white/5 pb-1 last:border-0">
                    <span className="truncate">📦 CID: <strong className="text-cyan-300">{ev.cid.slice(0, 24)}...</strong></span>
                    <span className="text-[11px] text-white/40 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Embed Code Snippet & Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col bg-[#0B0D14] border border-white/10 text-white rounded-2xl shadow-xl">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  <CardTitle className="text-base font-semibold text-white font-sans">Drop-in HTML Snippet</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="gap-1.5 text-xs font-mono h-7 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="rounded-xl bg-black/60 p-4 font-mono text-xs overflow-x-auto border border-white/10 text-cyan-200/90 leading-relaxed whitespace-pre selection:bg-cyan-500/30">
                {widgetEmbedCode}
              </div>

              <div className="rounded-xl bg-white/5 p-3.5 border border-white/10 text-xs space-y-1.5 font-sans">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Zero Configuration Compatibility
                </div>
                <p className="text-white/60 leading-relaxed">
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
