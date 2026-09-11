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

export type ReaderTypeface = "charter" | "sans" | "editorial" | "mono" | "serif";
export type ReaderTheme = "dark" | "sepia" | "paper" | "cyber";

export interface ReaderSettings {
  typeface: ReaderTypeface;
  fontSize: number; // 15 to 26
  theme: ReaderTheme;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  typeface: "charter",
  fontSize: 19,
  theme: "dark",
};

const STORAGE_KEY = "pressprotocol_reader_prefs_v2";

interface ReaderTypographyDrawerProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("pressprotocol_reader_prefs_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate legacy "serif" setting to Medium-standard "charter"
        if (parsed.typeface === "serif") {
          parsed.typeface = "charter";
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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
          className="h-8 gap-1.5 text-xs font-mono border-border/70 bg-surface hover:bg-surface-raised rounded-[6px] shadow-sm transition-all"
          title="Reader Typography & Themes (The 'Aa' Drawer)"
        >
          <Type className="h-3.5 w-3.5 text-secondary" />
          <span className="font-serif font-bold text-sm">Aa</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 p-6 bg-surface border-border/80 shadow-2xl space-y-6 flex flex-col justify-between font-sans text-primary"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[6px] bg-overlay text-secondary border border-hairline">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-semibold tracking-tight text-primary font-sans">
                    Reading Display
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted mt-0.5 font-sans">
                    Customize typography, sizing &amp; ambience
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted hover:text-primary rounded-[4px]"
                onClick={resetDefaults}
                title="Reset to default typography"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Theme Presets */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-medium text-muted">
              Reading Theme
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Sovereign Dark */}
              <button
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "dark"
                    ? "border-focus bg-overlay text-primary"
                    : "border-border/60 bg-surface-raised hover:border-border text-muted hover:text-primary"
                }`}
              >
                <div className="p-1.5 rounded-[4px] bg-background">
                  <Moon className="h-3.5 w-3.5 text-secondary" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Sovereign Dark</div>
                  <div className="text-[10px] text-muted">Leather &amp; Ivory</div>
                </div>
              </button>

              {/* Warm Sepia */}
              <button
                onClick={() => setTheme("sepia")}
                className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "sepia"
                    ? "border-amber-700 bg-[#f4ece1] text-[#2d2b28]"
                    : "border-amber-900/30 bg-[#fbf7ee] hover:border-amber-700/50 text-[#5c4a38]"
                }`}
              >
                <div className="p-1.5 rounded-[4px] bg-amber-200/60">
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
                className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "paper"
                    ? "border-neutral-500 bg-white text-neutral-900 shadow-sm"
                    : "border-neutral-300 bg-neutral-100 hover:border-neutral-400 text-neutral-800"
                }`}
              >
                <div className="p-1.5 rounded-[4px] bg-neutral-200">
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
                className={`p-3 rounded-[6px] border text-left transition-all flex items-center gap-2.5 ${
                  settings.theme === "cyber"
                    ? "border-verified bg-verified/10 text-verified"
                    : "border-verified/20 bg-canvas hover:border-verified/40 text-verified/70"
                }`}
              >
                <div className="p-1.5 rounded-[4px] bg-verified/10">
                  <Terminal className="h-3.5 w-3.5 text-verified" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Matrix Green</div>
                  <div className="text-[10px] opacity-80">Terminal phosphor</div>
                </div>
              </button>
            </div>
          </div>

          {/* Typeface Family */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-medium text-muted">
              Typeface Family
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Charter Serif */}
              <button
                onClick={() => setTypeface("charter")}
                className={`py-2.5 px-3 rounded-[6px] border text-left transition-all flex flex-col gap-0.5 ${
                  settings.typeface === "charter" || settings.typeface === "serif"
                    ? "bg-overlay text-primary border-focus font-semibold"
                    : "bg-surface-raised hover:bg-surface border-border/60 text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-charter text-sm font-bold">Charter</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">Default</span>
                </div>
                <span className="text-[10px] opacity-80 font-sans">Medium standard</span>
              </button>

              {/* Modern Sans - Inter */}
              <button
                onClick={() => setTypeface("sans")}
                className={`py-2.5 px-3 rounded-[6px] border text-left transition-all flex flex-col gap-0.5 ${
                  settings.typeface === "sans"
                    ? "bg-overlay text-primary border-focus font-semibold"
                    : "bg-surface-raised hover:bg-surface border-border/60 text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-sans text-sm font-bold">Inter Sans</span>
                </div>
                <span className="text-[10px] opacity-80 font-sans">Clean &amp; neutral</span>
              </button>

              {/* Editorial Serif - Instrument Serif */}
              <button
                onClick={() => setTypeface("editorial")}
                className={`py-2.5 px-3 rounded-[6px] border text-left transition-all flex flex-col gap-0.5 ${
                  settings.typeface === "editorial"
                    ? "bg-overlay text-primary border-focus font-semibold"
                    : "bg-surface-raised hover:bg-surface border-border/60 text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-hero text-sm">Display Serif</span>
                </div>
                <span className="text-[10px] opacity-80 font-sans">Instrument Serif</span>
              </button>

              {/* Code Monospace */}
              <button
                onClick={() => setTypeface("mono")}
                className={`py-2.5 px-3 rounded-[6px] border text-left transition-all flex flex-col gap-0.5 ${
                  settings.typeface === "mono"
                    ? "bg-overlay text-primary border-focus font-semibold"
                    : "bg-surface-raised hover:bg-surface border-border/60 text-secondary hover:text-primary"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-sm font-bold">Code Mono</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">JetBrains / Menlo</span>
              </button>
            </div>
          </div>

          {/* Font Sizing Stepper */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-medium text-muted">
              <span>Text scale</span>
              <span className="font-mono text-sm text-primary font-bold">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[6px] bg-surface-raised border border-border/60">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-[4px] border-border/70 bg-surface shrink-0"
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
                className="h-8 w-8 rounded-[4px] border-border/70 bg-surface shrink-0"
                onClick={() => setFontSize(settings.fontSize + 1)}
                disabled={settings.fontSize >= 26}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 text-[11px] font-mono text-muted text-center">
          Preferences preserved in browser local storage
        </div>
      </SheetContent>
    </Sheet>
  );
}
