"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Github, Twitter, Globe, Shield, Terminal, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/embed") || pathname === "/docs" || pathname === "/write") return null;

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Discover Feed", href: "/explore" },
        { name: "Trending Editorial", href: "/trending" },
        { name: "Publishing Studio", href: "/write" },
        { name: "Reading Vault", href: "/bookmarks" },
        { name: "Content Importer", href: "/import" },
        { name: "Universal Embedder", href: "/embed/builder" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Downloads & Extensions", href: "/downloads" },
        { name: "Documentation Hub", href: "/docs" },
        { name: "Developer Portal", href: "/developers" },
        { name: "Protocol Spec (RFC)", href: "/spec" },
        { name: "Network Explorer", href: "/explorer" },
        { name: "System Diagnostics", href: "/help" },
        { name: "OpenAPI JSON Spec", href: "/api/v1/openapi.json", external: true },
      ],
    },
    {
      title: "Information",
      links: [
        { name: "About PressProtocol", href: "/about" },
        { name: "How It Works", href: "/#features" },
        { name: "Threat Model", href: "/privacy" },
        { name: "Public Goods Mission", href: "/about" },
        { name: "Octant Evaluation", href: "/about" },
        { name: "Contact & Security", href: "/contact" },
      ],
    },
    {
      title: "Guarantees",
      links: [
        { name: "Zero-Custody Guarantee", href: "/terms" },
        { name: "Ed25519 Provenance", href: "/spec" },
        { name: "Censorship Resistance", href: "/about" },
        { name: "Air-Gapped Signing", href: "/write" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { name: "IPFS Swarm Guide", href: "/docs" },
        { name: "Tor Onion Daemon", href: "/docs" },
        { name: "WordPress Bridge", href: "https://github.com/0xshikhar/PressProtocol/tree/main/integrations/wordpress-plugin", external: true },
        { name: "Obsidian Plugin", href: "https://github.com/0xshikhar/PressProtocol/tree/main/integrations/obsidian-plugin", external: true },
        { name: "Browser Web Clipper", href: "https://github.com/0xshikhar/PressProtocol/tree/main/integrations/browser-extension", external: true },
        { name: "GitHub Organization", href: "https://github.com/0xshikhar/PressProtocol", external: true },
      ],
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/0xshikhar/PressProtocol" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/0xshikhar" },
    { name: "Website", icon: Globe, href: "https://pressprotocol.com" },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#050508] text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Top Tier: Brand Identity & Telemetry */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/[0.08]">
          <div className="max-w-xl">
            <Link href="/" className="mb-3 flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors overflow-hidden p-1 shadow-lg">
                <Image
                  src="/pressprotocol-logo-small.png"
                  alt="PressProtocol Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
                <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="font-sans tracking-tight text-xl text-white font-bold group-hover:text-cyan-300 transition-colors">
                PressProtocol
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Autonomous censorship-resistant publishing infrastructure. Decentralized syndicated dispatch across IPFS swarms, Tor hidden services, and air-gapped cryptographic proofs.
            </p>
          </div>

          {/* Live Protocol Health Status & Social Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mainnet Swarm Active</span>
              <span className="text-emerald-500/50">|</span>
              <span className="text-zinc-400">18ms SLA</span>
            </div>

            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/30 transition-colors"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Tier: 5 Structured Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-10">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs font-mono">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                      {link.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Tier: Copyright, Guarantees & Legal */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} PressProtocol.</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="hidden sm:inline text-zinc-400">Pure sovereign, zero-custody publishing.</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-zinc-400">
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/terms" className="hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/spec" className="hover:text-cyan-300 transition-colors">
              Protocol RFC Architecture
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

