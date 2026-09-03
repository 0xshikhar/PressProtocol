"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Github, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname?.startsWith("/embed")) return null;
  const footerLinks = {
    platform: [
      { name: "Explore", href: "/explore" },
      { name: "Publish", href: "/write" },
      { name: "Explorer", href: "/explorer" },
      { name: "How It Works", href: "/#features" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Developer Portal", href: "/developers" },
      { name: "OpenAPI Spec", href: "/api/v1/openapi.json" },
      { name: "GitHub", href: "https://github.com/0xshikhar/PressProtocol" },
      { name: "IPFS Guide", href: "/docs/ipfs" },
      { name: "Tor Setup", href: "/docs/tor" },
    ],
    legal: [
      { name: "About", href: "/about" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Contact", href: "/contact" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/0xshikhar/PressProtocol" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/0xshikhar" },
    { name: "Website", icon: Globe, href: "https://pressprotocol.com" },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#050508] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors">
                <span className="text-cyan-400 font-mono text-sm font-bold">¶</span>
                <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-display tracking-tight text-xl text-white font-medium group-hover:text-cyan-300 transition-colors">
                PressProtocol
              </span>
            </Link>
            <p className="mb-4 max-w-sm text-xs text-white/60 leading-relaxed font-sans">
              Autonomous censorship-resistant publishing infrastructure. Decentralized syndicated dispatch across IPFS swarms, Tor hidden services, and air-gapped cryptographic proofs.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-cyan-500/30"
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

          {/* Links */}
          <div>
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-white/40">Platform</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-white/40">Resources</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-cyan-400 transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-white/40">Guarantees</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-8 border-t border-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs font-mono text-white/40">
          <p>
            © {new Date().getFullYear()} PressProtocol. Pure sovereign, zero-custody publishing.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/spec" className="hover:text-cyan-400 transition-colors">
              Protocol Spec
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
