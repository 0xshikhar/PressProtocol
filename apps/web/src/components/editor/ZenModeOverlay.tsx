"use client";

import { useEffect } from "react";
import { Minimize2, Shield, Loader2, Send, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZenModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (title: string) => void;
  children: React.ReactNode;
  isPublishing?: boolean;
  onPublish?: () => void;
  isAnon?: boolean;
  autoSaving?: boolean;
  lastSavedText?: string | null;
  onOpenVault?: () => void;
  draftsCount?: number;
}

export function ZenModeOverlay({
  isOpen,
  onClose,
  title,
  onTitleChange,
  children,
  isPublishing = false,
  onPublish,
  isAnon = true,
  autoSaving = false,
  lastSavedText = "",
  onOpenVault,
  draftsCount = 0,
}: ZenModeOverlayProps) {
  // Listen for Escape or ⌘+Shift+F to exit Zen mode
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Zen Floating Control Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border/40 py-2.5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-verified-tint text-verified border border-verified/30 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              <span>Zen Focus Mode</span>
            </span>
            {lastSavedText && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {autoSaving ? "Saving..." : lastSavedText}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onPublish && (
              <Button
                size="sm"
                className="gap-2 text-xs h-8"
                onClick={onPublish}
                disabled={isPublishing || !title.trim()}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Publish
                  </>
                )}
              </Button>
            )}

            {onOpenVault && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 font-mono"
                onClick={onOpenVault}
                title="Open Drafts Vault"
              >
                <Archive className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Vault ({draftsCount})</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={onClose}
              title="Exit Zen Mode (Esc)"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit Zen</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Zen Writing Canvas */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title..."
          className="w-full text-4xl sm:text-5xl font-serif font-bold bg-transparent border-0 px-0 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 text-foreground"
        />

        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}
