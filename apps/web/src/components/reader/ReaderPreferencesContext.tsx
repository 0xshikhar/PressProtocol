"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ReaderTypeface = "charter" | "sans" | "editorial" | "mono" | "dyslexic" | "serif";
export type ReaderTheme = "dark" | "sepia" | "paper" | "cyber" | "eink";
export type ReaderLineHeight = "compact" | "normal" | "loose";
export type ReaderContentWidth = "narrow" | "normal" | "wide";

export interface ReaderSettings {
  typeface: ReaderTypeface;
  fontSize: number; // 15 to 26
  theme: ReaderTheme;
  lineHeight: ReaderLineHeight;
  contentWidth: ReaderContentWidth;
  distractionFree: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  typeface: "charter",
  fontSize: 19,
  theme: "dark",
  lineHeight: "normal",
  contentWidth: "normal",
  distractionFree: false,
};

const STORAGE_KEY = "pressprotocol_reader_prefs_v3";

interface ReaderPreferencesContextType {
  settings: ReaderSettings;
  updateSettings: (newSettings: Partial<ReaderSettings> | ((prev: ReaderSettings) => ReaderSettings)) => void;
  resetDefaults: () => void;
  toggleDistractionFree: () => void;
}

const ReaderPreferencesContext = createContext<ReaderPreferencesContextType | undefined>(undefined);

export function useStandaloneReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);

  // Initialize from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("pressprotocol_reader_prefs_v2") ||
        localStorage.getItem("pressprotocol_reader_prefs_v1");

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.typeface === "serif") {
          parsed.typeface = "charter";
        }
        setSettings((prev) => ({
          ...DEFAULT_READER_SETTINGS,
          ...prev,
          ...parsed,
          // Always launch with distractionFree false on initial page load
          distractionFree: false,
        }));
      }
    } catch {
      // Gracefully fall back to defaults
    }
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<ReaderSettings> | ((prev: ReaderSettings) => ReaderSettings)) => {
      setSettings((prev) => {
        const updated = typeof newSettings === "function" ? newSettings(prev) : { ...prev, ...newSettings };
        try {
          if (typeof window !== "undefined") {
            // Save preferences excluding temporary session distractionFree
            const toSave = { ...updated, distractionFree: false };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
          }
        } catch {
          // Ignore write failure
        }
        return updated;
      });
    },
    []
  );

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_READER_SETTINGS);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_READER_SETTINGS));
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleDistractionFree = useCallback(() => {
    setSettings((prev) => ({ ...prev, distractionFree: !prev.distractionFree }));
  }, []);

  // Listen for Escape key to exit distraction-free mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSettings((prev) => (prev.distractionFree ? { ...prev, distractionFree: false } : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    settings,
    updateSettings,
    resetDefaults,
    toggleDistractionFree,
  };
}

export function ReaderPreferencesProvider({ children }: { children: React.ReactNode }) {
  const value = useStandaloneReaderSettings();

  return (
    <ReaderPreferencesContext.Provider value={value}>
      {children}
    </ReaderPreferencesContext.Provider>
  );
}

export function useReaderPreferences() {
  const context = useContext(ReaderPreferencesContext);
  return context;
}

// Backwards-compatible hook signature matching existing code - works standalone or with Provider
export function useReaderSettings() {
  const context = useContext(ReaderPreferencesContext);
  const standalone = useStandaloneReaderSettings();
  
  if (context) {
    return {
      settings: context.settings,
      updateSettings: (newSettings: ReaderSettings) => context.updateSettings(newSettings),
      resetDefaults: context.resetDefaults,
      toggleDistractionFree: context.toggleDistractionFree,
    };
  }

  return {
    settings: standalone.settings,
    updateSettings: (newSettings: ReaderSettings) => standalone.updateSettings(newSettings),
    resetDefaults: standalone.resetDefaults,
    toggleDistractionFree: standalone.toggleDistractionFree,
  };
}
