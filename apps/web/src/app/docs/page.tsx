import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Terminal, Layers, Shield, Download, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Documentation & Developer Guides",
  description: "Comprehensive guides for running a PressProtocol Node, integrating the browser extension, installing WordPress bridges, and verifying Ed25519 signatures.",
};

export default function DocsPage() {
  const docSections = [
    {
      title: "Protocol Architecture",
      description: "Understand the multi-transport routing layer, Helia IPFS swarm, and Tor v3 onion service replication.",
      href: "/spec",
      badge: "Architecture",
      icon: Layers,
    },
    {
      title: "Zero-Knowledge Privacy",
      description: "Deep dive into sovereign in-browser burner keys, local storage wiping, and the zero-access-log threat model.",
      href: "/privacy",
      badge: "Security",
      icon: Shield,
    },
    {
      title: "Run a Sovereign Node",
      description: "Deploy your own independent PressProtocol daemon with Docker, Tor SOCKS5, and Libp2p DHT peering in 5 minutes.",
      href: "https://github.com/0xshikhar/PressProtocol/tree/main/core/node",
      badge: "Node Operator",
      icon: Terminal,
      external: true,
    },
    {
      title: "Browser Extension Setup",
      description: "Install the unpacked Chromium MV3 extension to resolve pressprotocol:// links and manage local author keys.",
      href: "/downloads/PressProtocol_Browser_Extension.zip",
      badge: "Integration",
      icon: Download,
    },
    {
      title: "WordPress Publishing Bridge",
      description: "Step-by-step guide to installing the WordPress plugin to automatically dual-pin editorial posts to IPFS and Tor.",
      href: "/downloads/PressProtocol_Wordpress_Plugin.zip",
      badge: "Integration",
      icon: Download,
    },
    {
      title: "Public Goods Mission",
      description: "Learn about our non-profit open-source governance, public goods stewardship, and censorship-resistant thesis.",
      href: "/about",
      badge: "Governance",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
              <BookOpen className="h-3 w-3 mr-1" /> DOCUMENTATION HUB
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">v1.2.0</span>
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight">
            PressProtocol Documentation
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Everything you need to write, publish, run nodes, and build on top of the world&apos;s most resilient decentralized publishing protocol.
          </p>
        </div>

        {/* Quickstart Card */}
        <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-500" />
              Quickstart: Publish in 30 Seconds
            </CardTitle>
            <CardDescription>
              No account, wallet, or payment required. Ephemeral keys generate right in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Open the <Link href="/write" className="text-primary hover:underline font-medium">Publishing Studio (/write)</Link>.</li>
              <li>Your browser automatically provisions an ephemeral Ed25519 Burner Wallet with a sovereign pseudonym (<code className="font-mono text-xs">Anon-xxxx...yyyy</code>).</li>
              <li>Type your story and hit <strong>&ldquo;Publish Anonymously&rdquo;</strong>. Your content is immediately pinned to IPFS, replicated across Tor relays, and announced to the global DHT swarm.</li>
            </ol>
            <div className="pt-2">
              <Link href="/write">
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
                  Open Publishing Studio <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card key={sec.title} className="border-border/60 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {sec.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold">{sec.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {sec.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {sec.external ? (
                    <a href={sec.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-mono">
                        <span>Read Guide</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={sec.href}>
                      <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-mono">
                        <span>Explore Section</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            MIT Open Source &bull; Maintained by PressProtocol Community
          </p>
          <div className="flex gap-3">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs">Privacy Policy</Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" size="sm" className="text-xs">Terms of Service</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
