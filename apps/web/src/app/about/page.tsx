import { Metadata } from "next";
import Link from "next/link";
import { Globe, Heart, Shield, Award, Users, Terminal, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About PressProtocol — Decentralized Public Good",
  description: "PressProtocol mission, open-source public goods stewardship, and censorship-resistant publishing architecture.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
              <Heart className="h-3 w-3 mr-1 text-red-400" /> PUBLIC GOOD INITIATIVE
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">OPEN INFRASTRUCTURE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            Free Expression as an Unstoppable Public Good
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            PressProtocol was created to solve a profound problem: the modern internet has centralized around choke-points capable of deplatforming investigative reporters, suppressing whistleblower leaks, and cutting off dissent under authoritarian pressure.
          </p>
        </div>

        {/* Impact Pillars */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Censorship Immunity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By pairing IPFS content addressing with automatic Tor v3 hidden services, no single domain registrar or cloud vendor can take down your reporting.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Public Good Stewardship</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Developed as a regenerative digital public good, aligning technological advancement with open-source ethical stewardship.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Dual-Identity Model</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowers both the anonymous dissident (ephemeral Ed25519 burner keys) and the institutional journalist (verified profiles).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story & Philosophy */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">The Core Thesis</h2>
            <p className="text-muted-foreground leading-relaxed">
              When truth is dangerous, identity should be sovereign. When platforms can be coerced, publishing must be peer-to-peer. 
              Traditional media platforms force writers into Faustian bargains: sacrifice your anonymity, submit your IP address, or risk having your life&apos;s work erased at the whim of an administrative subpoena or denial-of-service attack.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              PressProtocol eliminates the intermediary. You type your dispatch, sign it in your browser with mathematical certainty, and broadcast it directly to the permanent Web3 swarm.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">Decoupled Umbrella Architecture</h2>
            <p className="text-muted-foreground leading-relaxed">
              PressProtocol is engineered as a robust, institutional multi-package repository:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
              <li><strong>Core Node (<code className="font-mono text-xs">core/node</code>)</strong>: Autonomous Fastify daemon with embedded Helia IPFS, Tor v3 Onionize daemon, and Libp2p Kademlia DHT peering.</li>
              <li><strong>Web Application (<code className="font-mono text-xs">apps/web</code>)</strong>: Next.js 14 client portal featuring in-browser cryptographic signing, dual-identity switcher, and resilient 2.5s multi-transport IPFS failover.</li>
              <li><strong>Browser Extension (<code className="font-mono text-xs">integrations/browser-extension</code>)</strong>: Native Chromium MV3 extension routing <code className="font-mono text-xs">pressprotocol://</code> deep links and managing browser keys.</li>
              <li><strong>WordPress Bridge (<code className="font-mono text-xs">integrations/wordpress-plugin</code>)</strong>: 1-click bridge transforming existing WordPress sites into decentralized publishing nodes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">Open-Source Governance & Public Goods Trust</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe critical democratic infrastructure must never be beholden to venture-capital extraction or advertising surveillance models. 
              Built under the MIT license, PressProtocol remains 100% open-source, non-custodial, and free to all citizens of the world.
            </p>
          </section>
        </div>

        {/* CTA Card */}
        <div className="p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-background flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold">Start Publishing Now</h3>
            <p className="text-sm text-muted-foreground">No account required. Instant Ed25519 burner wallet generated in 1-click.</p>
          </div>
          <Link href="/write">
            <Button className="gap-2 bg-primary text-primary-foreground font-medium">
              Open Studio <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            MIT License &bull; Free Expression Infrastructure
          </p>
          <div className="flex gap-3">
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs">Technical Spec</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
