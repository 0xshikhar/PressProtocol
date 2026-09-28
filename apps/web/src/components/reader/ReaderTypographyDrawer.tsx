"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  Contrast,
  Maximize2,
  Minimize2,
  AlignJustify,
  Columns,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_READER_SETTINGS,
  useReaderPreferences,
  useReaderSettings,
  type ReaderContentWidth,
  type ReaderLineHeight,
  type ReaderSettings,
  type ReaderTheme,
  type ReaderTypeface,
} from "./ReaderPreferencesContext"

export type {
  ReaderSettings,
  ReaderTheme,
  ReaderTypeface,
  ReaderLineHeight,
  ReaderContentWidth,
}
export { useReaderSettings, useReaderPreferences, DEFAULT_READER_SETTINGS }

interface ReaderTypographyDrawerProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
  triggerClassName?: string;
}

export function ReaderTypographyDrawer({
  settings,
  onSettingsChange,
  triggerClassName,
}: ReaderTypographyDrawerProps) {
  const [open, setOpen] = useState(false)

  const setTypeface = (typeface: ReaderTypeface) => {
    onSettingsChange({ ...settings, typeface })
  }

  const setTheme = (theme: ReaderTheme) => {
    onSettingsChange({ ...settings, theme })
  }

  const setFontSize = (fontSize: number) => {
    const clamped = Math.max(15, Math.min(26, fontSize))
    onSettingsChange({ ...settings, fontSize: clamped })
  }

  const setLineHeight = (lineHeight: ReaderLineHeight) => {
    onSettingsChange({ ...settings, lineHeight })
  }

  const setContentWidth = (contentWidth: ReaderContentWidth) => {
    onSettingsChange({ ...settings, contentWidth })
  }

  const toggleDistractionFree = () => {
    onSettingsChange({
      ...settings,
      distractionFree: !settings.distractionFree,
    })
  }

  const resetDefaults = () => {
    onSettingsChange(DEFAULT_READER_SETTINGS)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-mono border-border/70 bg-surface hover:bg-surface-raised rounded-[6px] shadow-sm transition-all",
            triggerClassName
          )}
          title="Reader Typography, Themes & Accessibility (The 'Aa' Drawer)"
        >
          <Type className="h-3.5 w-3.5 text-secondary" />
          <span className="font-serif text-sm font-bold">Aa</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-84 flex max-h-screen flex-col justify-between space-y-6 overflow-y-auto border-border/80 bg-surface p-6 font-sans text-primary shadow-2xl sm:w-96"
      >
        <div className="space-y-6">
          {/* Header */}
          <SheetHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-[6px] border border-hairline bg-overlay p-1.5 text-secondary">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="font-sans text-base font-semibold tracking-tight text-primary">
                    Reading Display
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 font-sans text-xs text-muted">
                    Customize typography, sizing &amp; accessibility
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-[4px] text-muted hover:text-primary"
                onClick={resetDefaults}
                title="Reset to default typography"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Theme Presets */}
          <div className="space-y-2.5">
            <div className="font-mono text-xs font-medium text-muted">
              Reading Theme
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Sovereign Dark */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2.5 rounded-[6px] border p-2.5 text-left transition-all ${settings.theme === "dark"
                    ? "border-focus bg-overlay text-primary"
                    : "bg-surface-raised border-border/60 text-muted hover:border-border hover:text-primary"
                  }`}
              >
                <div className="rounded-[4px] bg-background p-1.5">
                  <Moon className="h-3.5 w-3.5 text-secondary" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Onyx Dark</div>
                  <div className="text-[10px] text-muted">
                    Leather &amp; Ivory
                  </div>
                </div>
              </button>

              {/* Warm Sepia */}
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`flex items-center gap-2.5 rounded-[6px] border p-2.5 text-left transition-all ${settings.theme === "sepia"
                    ? "border-amber-700 bg-[#f4ece1] text-[#2d2b28]"
                    : "border-amber-900/30 bg-[#fbf7ee] text-[#5c4a38] hover:border-amber-700/50"
                  }`}
              >
                <div className="rounded-[4px] bg-amber-200/60 p-1.5">
                  <Coffee className="h-3.5 w-3.5 text-amber-900" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Warm Sepia</div>
                  <div className="text-[10px] opacity-80">Low eyestrain</div>
                </div>
              </button>

              {/* Clean Paper */}
              <button
                type="button"
                onClick={() => setTheme("paper")}
                className={`flex items-center gap-2.5 rounded-[6px] border p-2.5 text-left transition-all ${settings.theme === "paper"
                    ? "border-neutral-500 bg-white text-neutral-900 shadow-sm"
                    : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-400"
                  }`}
              >
                <div className="rounded-[4px] bg-neutral-200 p-1.5">
                  <Sun className="h-3.5 w-3.5 text-neutral-800" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Clean Paper</div>
                  <div className="text-[10px] text-neutral-600">
                    Daylight clarity
                  </div>
                </div>
              </button>

              {/* E-Ink High-Contrast Accessibility */}
              <button
                type="button"
                onClick={() => setTheme("eink")}
                className={`flex items-center gap-2.5 rounded-[6px] border p-2.5 text-left transition-all ${settings.theme === "eink"
                    ? "border-black bg-white font-bold text-black shadow-sm ring-2 ring-black"
                    : "border-neutral-400 bg-neutral-50 text-neutral-900 hover:border-black"
                  }`}
                title="Pure monochrome E-Ink mode: 100% contrast, zero animations, sharp borders"
              >
                <div className="rounded-[4px] bg-black p-1.5 text-white">
                  <Contrast className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">E-Ink Mono</div>
                  <div className="text-[10px] opacity-80">Zero flicker</div>
                </div>
              </button>

              {/* Cyber Matrix */}
              <button
                type="button"
                onClick={() => setTheme("cyber")}
                className={`col-span-2 flex items-center gap-2.5 rounded-[6px] border p-2.5 text-left transition-all ${settings.theme === "cyber"
                    ? "border-[#00FF66] bg-[#00FF66]/15 font-semibold text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.25)]"
                    : "border-[#00FF66]/30 bg-[#061409] text-[#00FF66]/80 hover:border-[#00FF66]/60"
                  }`}
              >
                <div className="rounded-[4px] bg-[#00FF66]/20 p-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#00FF66]" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Matrix Terminal</div>
                  <div className="text-[10px] opacity-80">
                    Retro phosphor green
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Typeface Family */}
          <div className="space-y-2.5">
            <div className="font-mono text-xs font-medium text-muted">
              Typeface Family
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Charter Serif */}
              <button
                type="button"
                onClick={() => setTypeface("charter")}
                className={`flex flex-col gap-0.5 rounded-[6px] border px-2.5 py-2 text-left transition-all ${settings.typeface === "charter" ||
                    settings.typeface === "serif"
                    ? "border-focus bg-overlay font-semibold text-primary"
                    : "bg-surface-raised border-border/60 text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-charter text-sm font-bold">
                    Charter
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                    Default
                  </span>
                </div>
                <span className="font-sans text-[10px] opacity-80">
                  Medium standard
                </span>
              </button>

              {/* Modern Sans - Inter */}
              <button
                type="button"
                onClick={() => setTypeface("sans")}
                className={`flex flex-col gap-0.5 rounded-[6px] border px-2.5 py-2 text-left transition-all ${settings.typeface === "sans"
                    ? "border-focus bg-overlay font-semibold text-primary"
                    : "bg-surface-raised border-border/60 text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-sans text-sm font-bold">
                    Inter Sans
                  </span>
                </div>
                <span className="font-sans text-[10px] opacity-80">
                  Clean &amp; neutral
                </span>
              </button>

              {/* Editorial Serif - Instrument Serif */}
              <button
                type="button"
                onClick={() => setTypeface("editorial")}
                className={`flex flex-col gap-0.5 rounded-[6px] border px-2.5 py-2 text-left transition-all ${settings.typeface === "editorial"
                    ? "border-focus bg-overlay font-semibold text-primary"
                    : "bg-surface-raised border-border/60 text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-hero text-sm">Display Serif</span>
                </div>
                <span className="font-sans text-[10px] opacity-80">
                  Instrument Serif
                </span>
              </button>

              {/* Code Monospace */}
              <button
                type="button"
                onClick={() => setTypeface("mono")}
                className={`flex flex-col gap-0.5 rounded-[6px] border px-2.5 py-2 text-left transition-all ${settings.typeface === "mono"
                    ? "border-focus bg-overlay font-semibold text-primary"
                    : "bg-surface-raised border-border/60 text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-mono text-sm font-bold">Code Mono</span>
                </div>
                <span className="font-mono text-[10px] opacity-80">
                  JetBrains / Menlo
                </span>
              </button>

              {/* OpenDyslexic Accessibility Typeface */}
              <button
                type="button"
                onClick={() => setTypeface("dyslexic")}
                className={`col-span-2 flex flex-col gap-0.5 rounded-[6px] border px-2.5 py-2 text-left transition-all ${settings.typeface === "dyslexic"
                    ? "border-focus bg-overlay font-semibold text-primary ring-1 ring-amber-500/40"
                    : "bg-surface-raised border-border/60 text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-dyslexic text-sm font-bold text-amber-400">
                    OpenDyslexic
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 opacity-80">
                    Accessibility
                  </span>
                </div>
                <span className="font-sans text-[10px] opacity-80">
                  Weighted letterforms for dyslexia support
                </span>
              </button>
            </div>
          </div>

          {/* Line Height & Content Width Layout Controls */}
          <div className="grid grid-cols-2 gap-3">
            {/* Line Height */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 font-mono text-xs font-medium text-muted">
                <AlignJustify className="h-3 w-3" />
                <span>Line Spacing</span>
              </div>
              <div className="bg-surface-raised grid grid-cols-3 gap-1 rounded-[6px] border border-border/60 p-1">
                {(["compact", "normal", "loose"] as ReaderLineHeight[]).map(
                  (lh) => (
                    <button
                      key={lh}
                      type="button"
                      onClick={() => setLineHeight(lh)}
                      className={`rounded-[4px] py-1 font-mono text-[11px] capitalize transition-colors ${settings.lineHeight === lh
                          ? "bg-overlay font-bold text-primary shadow-sm"
                          : "text-muted hover:text-primary"
                        }`}
                    >
                      {lh === "compact"
                        ? "Tight"
                        : lh === "normal"
                          ? "Mid"
                          : "Loose"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Reading Width */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 font-mono text-xs font-medium text-muted">
                <Columns className="h-3 w-3" />
                <span>Reading Width</span>
              </div>
              <div className="bg-surface-raised grid grid-cols-3 gap-1 rounded-[6px] border border-border/60 p-1">
                {(["narrow", "normal", "wide"] as ReaderContentWidth[]).map(
                  (cw) => (
                    <button
                      key={cw}
                      type="button"
                      onClick={() => setContentWidth(cw)}
                      className={`rounded-[4px] py-1 font-mono text-[11px] capitalize transition-colors ${settings.contentWidth === cw
                          ? "bg-overlay font-bold text-primary shadow-sm"
                          : "text-muted hover:text-primary"
                        }`}
                    >
                      {cw === "narrow"
                        ? "Slim"
                        : cw === "normal"
                          ? "Std"
                          : "Wide"}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Font Sizing Stepper */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs font-medium text-muted">
              <span>Text scale</span>
              <span className="font-mono text-sm font-bold text-primary">
                {settings.fontSize}px
              </span>
            </div>
            <div className="bg-surface-raised flex items-center gap-3 rounded-[6px] border border-border/60 p-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-[4px] border-border/70 bg-surface"
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
                className="h-8 w-8 shrink-0 rounded-[4px] border-border/70 bg-surface"
                onClick={() => setFontSize(settings.fontSize + 1)}
                disabled={settings.fontSize >= 26}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Distraction-Free Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={toggleDistractionFree}
              className={`flex w-full items-center justify-between rounded-[6px] border p-2.5 font-mono text-xs transition-all ${settings.distractionFree
                  ? "border-accent bg-accent/15 font-semibold text-primary shadow-sm"
                  : "bg-surface-raised border-border/60 text-secondary hover:border-border hover:text-primary"
                }`}
            >
              <span className="flex items-center gap-2">
                {settings.distractionFree ? (
                  <Minimize2 className="h-4 w-4 text-accent" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-muted" />
                )}
                <span>Distraction-Free Focus Mode</span>
              </span>
              <span className="rounded border border-hairline bg-overlay px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                {settings.distractionFree ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 text-center font-mono text-[11px] text-muted">
          Preferences preserved in browser local storage
        </div>
      </SheetContent>
    </Sheet>
  )
}
