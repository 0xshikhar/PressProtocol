"use client";

import { useState } from "react";
import { Code2, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmbedDialogProps {
  cid: string;
  title: string;
}

export function EmbedDialog({ cid, title }: EmbedDialogProps) {
  const [theme, setTheme] = useState<"dark" | "light" | "cyber">("cyber");
  const [compact, setCompact] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://pressprotocol.com";
  
  const embedUrl = `${baseUrl}/embed/${cid}?theme=${theme}${compact ? "&compact=true" : ""}`;

  const iframeSnippet = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${compact ? "280" : "600"}"
  frameborder="0"
  allow="clipboard-write"
  loading="lazy"
  style="border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;"
  title="${title.replace(/"/g, "&quot;")}"
></iframe>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Embed iframe code copied to clipboard!");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(embedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast.success("Embed URL copied to clipboard!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Code2 className="h-3.5 w-3.5" />
          <span>Embed</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Code2 className="h-5 w-5 text-emerald-400" />
            Universal Sovereign Embed Widget
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Embed this cryptographically signed article into any external website, Ghost CMS, Substack, Medium, or personal blog.
          </DialogDescription>
        </DialogHeader>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-slate-800/80">
          {/* Theme selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Widget Theme</label>
            <div className="flex gap-2">
              {(["cyber", "dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${
                    theme === t
                      ? t === "cyber"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "bg-slate-800 text-white border-slate-600"
                      : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  {t === "cyber" && <Sparkles className="w-3 h-3 inline mr-1 text-emerald-400" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Display Density</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCompact(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  !compact
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                Full Reader
              </button>
              <button
                onClick={() => setCompact(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  compact
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                Compact Card
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Interactive Preview</span>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Open in new tab <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-[220px] relative">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              title="Embed Preview"
            />
          </div>
        </div>

        {/* Code Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">HTML Iframe Embed Code</span>
            <div className="flex gap-2">
              <button
                onClick={copyUrl}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-mono"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUrl ? "URL Copied" : "Copy URL"}
              </button>
              <button
                onClick={copySnippet}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? "Code Copied" : "Copy Iframe Code"}
              </button>
            </div>
          </div>
          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all max-h-24">
            {iframeSnippet}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
