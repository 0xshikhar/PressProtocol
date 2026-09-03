"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Type,
  Sun,
  Moon,
  Coffee,
  Terminal,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

export type ReaderTypeface = "serif" | "sans" | "mono";
export type ReaderTheme = "dark" | "sepia" | "paper" | "cyber";

export interface ReaderSettings {
  typeface: ReaderTypeface;
  fontSize: number; // 15 to 26
  theme: ReaderTheme;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  typeface: "serif",
  fontSize: 19,
  theme: "dark",
};

const STORAGE_KEY = "pressprotocol_reader_prefs_v1";

interface ReaderTypographyDrawerProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // Ignore fallback
    }
  }, []);

  const updateSettings = (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  return { settings, updateSettings };
}

export function ReaderTypographyDrawer({
  settings,
  onSettingsChange,
}: ReaderTypographyDrawerProps) {
  const [open, setOpen] = useState(false);

  const setTypeface = (typeface: ReaderTypeface) => {
    onSettingsChange({ ...settings, typeface });
  };

  const setTheme = (theme: ReaderTheme) => {
    onSettingsChange({ ...settings, theme });
  };

  const setFontSize = (fontSize: number) => {
    const clamped = Math.max(15, Math.min(26, fontSize));
    onSettingsChange({ ...settings, fontSize: clamped });
  };

  const resetDefaults = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-mono border-border/60 bg-background/80 backdrop-blur-md shadow-sm hover:border-primary/50 transition-all"
          title="Reader Typography & Themes (The 'Aa' Drawer)"
        >
          <Type className="h-3.5 w-3.5 text-primary" />
          <span className="font-serif font-bold text-sm">Aa</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 p-6 bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl space-y-6 flex flex-col justify-between"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold tracking-tight">
                    Reading Display
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Customize typography, sizing & ambience
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={resetDefaults}
                title="Reset to default typography"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Theme Presets */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reading Theme
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Onyx Dark */}
              <button
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "dark"
                    ? "border-cyan-500 bg-[#0b0d14] ring-2 ring-cyan-500/40 text-white"
                    : "border-white/10 bg-[#050508] hover:border-white/20 text-zinc-300"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-white/10">
                  <Moon className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Onyx Dark</div>
                  <div className="text-[10px] text-muted-foreground">Sovereign black</div>
                </div>
              </button>

              {/* Warm Sepia */}
              <button
                onClick={() => setTheme("sepia")}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "sepia"
                    ? "border-amber-700 bg-[#f4ece1] ring-2 ring-amber-700/40 text-[#2d2b28]"
                    : "border-amber-900/30 bg-[#fbf7ee] hover:border-amber-700/50 text-[#5c4a38]"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-amber-200/60">
                  <Coffee className="h-3.5 w-3.5 text-amber-900" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Warm Sepia</div>
                  <div className="text-[10px] opacity-80">Low eyestrain</div>
                </div>
              </button>

              {/* Clean Paper */}
              <button
                onClick={() => setTheme("paper")}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "paper"
                    ? "border-neutral-500 bg-white ring-2 ring-neutral-400 text-neutral-900 shadow-sm"
                    : "border-neutral-300 bg-neutral-100 hover:border-neutral-400 text-neutral-800"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-neutral-200">
                  <Sun className="h-3.5 w-3.5 text-neutral-800" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Clean Paper</div>
                  <div className="text-[10px] text-neutral-600">Daylight clarity</div>
                </div>
              </button>

              {/* Cyber Matrix */}
              <button
                onClick={() => setTheme("cyber")}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "cyber"
                    ? "border-emerald-500 bg-[#051109] ring-2 ring-emerald-500/40 text-emerald-300"
                    : "border-emerald-950 bg-[#030a06] hover:border-emerald-700 text-emerald-500"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Cyber Matrix</div>
                  <div className="text-[10px] opacity-80">Terminal vibe</div>
                </div>
              </button>
            </div>
          </div>

          {/* Typeface Family */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Typeface Family
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTypeface("serif")}
                className={`py-2 px-3 rounded-xl border text-xs font-serif transition-all flex flex-col items-center gap-1 ${
                  settings.typeface === "serif"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-muted/40 hover:bg-muted border-border/50 text-foreground"
                }`}
              >
                <span className="text-sm font-bold">Ag</span>
                <span>Editorial Serif</span>
              </button>
              <button
                onClick={() => setTypeface("sans")}
                className={`py-2 px-3 rounded-xl border text-xs font-sans transition-all flex flex-col items-center gap-1 ${
                  settings.typeface === "sans"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-muted/40 hover:bg-muted border-border/50 text-foreground"
                }`}
              >
                <span className="text-sm font-bold">Ag</span>
                <span>Modern Sans</span>
              </button>
              <button
                onClick={() => setTypeface("mono")}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all flex flex-col items-center gap-1 ${
                  settings.typeface === "mono"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-muted/40 hover:bg-muted border-border/50 text-foreground"
                }`}
              >
                <span className="text-sm font-bold">&gt;_</span>
                <span>Cypher Mono</span>
              </button>
            </div>
          </div>

          {/* Font Sizing Stepper */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Text Scale</span>
              <span className="font-mono text-sm text-foreground font-bold">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg shrink-0"
                onClick={() => setFontSize(settings.fontSize - 1)}
                disabled={settings.fontSize <= 15}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1 px-1">
                <Slider
                  value={[settings.fontSize]}
                  min={15}
                  max={26}
                  step={1}
                  onValueChange={(val) => setFontSize(val[0])}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg shrink-0"
                onClick={() => setFontSize(settings.fontSize + 1)}
                disabled={settings.fontSize >= 26}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/40 text-[11px] text-muted-foreground text-center">
          Preferences preserved in browser local storage
        </div>
      </SheetContent>
    </Sheet>
  );
}
