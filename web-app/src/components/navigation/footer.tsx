import Link from "next/link";
import { FileText, Github, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: "Explore", href: "/explore" },
      { name: "Publish", href: "/write" },
      { name: "Explorer", href: "/explorer" },
      { name: "How It Works", href: "/#features" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "GitHub", href: "https://github.com/0xshikhar/anonpress" },
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
    { name: "GitHub", icon: Github, href: "https://github.com/0xshikhar/pressprotocol" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/0xshikhar" },
    { name: "Website", icon: Globe, href: "https://pressprotocol.com" },
  ];

  return (
    <footer className="border-t bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 group-hover:shadow-lg transition-all">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">PressProtocol</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              An open censorship-resistant publishing platform. Share your ideas freely across IPFS, Tor, and decentralized mirrors.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
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
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
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
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PressProtocol. Built for censorship-resistant publishing.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
