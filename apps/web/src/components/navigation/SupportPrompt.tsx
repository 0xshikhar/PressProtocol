"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Github, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupportPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if user has not dismissed before
    const isDismissed = localStorage.getItem("pressprotocol_support_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pressprotocol_support_dismissed", "true");
  };

  const handleStar = () => {
    window.open("https://github.com/0xshikhar/PressProtocol", "_blank");
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-xl bg-[#0B0D14]/95 border border-rose-500/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(244,63,94,0.18)] text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400 animate-pulse" />
            <span>100% Solo-Built Public Good</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-white transition-colors p-0.5 rounded-md"
            aria-label="Dismiss prompt"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
          PressProtocol is self-funded and built by an independent solo developer. 100% of all contributions fund our Tor relays, IPFS nodes, and open-source infrastructure.
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2 border-t border-white/5">
          <Link href="/support" onClick={handleDismiss}>
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-rose-500 hover:bg-rose-400 text-white font-semibold font-mono rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
            >
              <Heart className="h-3.5 w-3.5 fill-white" />
              <span>Support Us ♥</span>
            </Button>
          </Link>

          <Button
            onClick={handleStar}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs text-zinc-300 hover:text-white border-white/10 hover:bg-white/5 font-mono flex items-center gap-1.5"
          >
            <Github className="h-3.5 w-3.5" />
            <span>Star</span>
          </Button>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-zinc-400 hover:text-white font-mono ml-auto"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
