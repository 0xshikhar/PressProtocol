"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, ShieldCheck, Terminal, Layers, Sparkles } from "lucide-react";

const navLinks = [
  { name: "Capabilities", href: "#capabilities" },
  { name: "Process", href: "#process" },
  { name: "Failover Network", href: "#network" },
  { name: "Protocol Sandbox", href: "#sandbox" },
  { name: "Ecosystem", href: "#ecosystem" },
  { name: "Threat Model", href: "#security" },
];

export function LandingNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-black/75 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-[1280px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors">
              <span className="text-cyan-400 font-mono text-sm font-bold">¶</span>
              <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display tracking-tight text-xl lg:text-2xl text-white font-medium">
                PressProtocol
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                MAINNET
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs tracking-wide uppercase font-mono text-white/60 hover:text-white transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/import">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-9 px-3 rounded-lg border border-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                CMS Importer
              </Button>
            </Link>
            <Link href="/explorer">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-white/70 hover:text-white hover:bg-white/5 h-9 px-4 rounded-lg border border-white/10"
              >
                <Terminal className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                Live Explorer
              </Button>
            </Link>
            <Link href="/write">
              <Button
                size="sm"
                className="text-xs font-medium bg-white hover:bg-white/90 text-black h-9 px-5 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all group"
              >
                Start Publishing
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/95 backdrop-blur-3xl z-40 flex flex-col justify-between px-6 pt-28 pb-10">
          <div className="flex flex-col gap-6">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 pb-2 border-b border-white/10">
              Protocol Navigation
            </div>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-display text-white hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            <Link href="/import" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center border-cyan-500/30 text-cyan-400 h-12">
                <Sparkles className="w-4 h-4 mr-2" />
                Universal CMS Importer
              </Button>
            </Link>
            <Link href="/explorer" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center border-white/20 text-white h-12">
                <Terminal className="w-4 h-4 mr-2 text-cyan-400" />
                Live Network Explorer
              </Button>
            </Link>
            <Link href="/write" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-white text-black hover:bg-white/90 h-12">
                Start Publishing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
