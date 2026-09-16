import { Metadata } from "next";
import Link from "next/link";
import { Globe, Heart, Shield, Award, Users, Terminal, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About PressProtocol - Decentralized Public Good",
  description: "PressProtocol mission, open-source public goods stewardship, and censorship-resistant publishing architecture.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text-primary hover:bg-overlay text-xs font-mono">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-hairline bg-overlay text-text-secondary font-mono text-xs">
              <Heart className="h-3 w-3 mr-1 text-accent-ribbon" /> PUBLIC GOOD INITIATIVE
            </Badge>
            <span className="text-xs text-text-muted font-mono">OPEN INFRASTRUCTURE</span>
          </div>
          <h1 className="font-hero text-4xl sm:text-5xl tracking-tight text-text-primary">
            Free Expression as an Unstoppable Public Good
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-sans">
            PressProtocol was created to solve a profound problem: the modern internet has centralized around choke-points capable of deplatforming investigative reporters, suppressing whistleblower leaks, and cutting off dissent under authoritarian pressure.
          </p>
        </div>

        {/* Impact Pillars */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card elevation="card">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-[6px] bg-verified/10 border border-verified/25 flex items-center justify-center text-verified mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-base text-text-primary font-sans">Censorship Immunity</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                By pairing IPFS content addressing with automatic Tor v3 hidden services, no single domain registrar or cloud vendor can take down your reporting.
              </p>
            </CardContent>
          </Card>

          <Card elevation="card">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-[6px] bg-[rgba(124,39,51,0.14)] border border-[rgba(124,39,51,0.28)] flex items-center justify-center text-accent-ribbon mb-2">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-base text-text-primary font-sans">Public Good Stewardship</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                Developed as a regenerative digital public good, aligning technological advancement with open-source ethical stewardship.
              </p>
            </CardContent>
          </Card>

          <Card elevation="card">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-[6px] bg-[#8770C4]/15 border border-[#8770C4]/30 flex items-center justify-center text-[#8770C4] mb-2">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-base text-text-primary font-sans">Dual-Identity Model</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                Empowers both the anonymous dissident (ephemeral Ed25519 burner keys) and the institutional journalist (verified profiles).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story & Philosophy */}
        <div className="space-y-8 text-text-secondary">
          <section className="space-y-3">
            <h2 className="text-2xl font-hero text-text-primary">The Core Thesis</h2>
            <p className="text-text-muted leading-relaxed text-sm sm:text-base font-sans">
              When truth is dangerous, identity should be sovereign. When platforms can be coerced, publishing must be peer-to-peer.
              Traditional media platforms force writers into Faustian bargains: sacrifice your anonymity, submit your IP address, or risk having your life&apos;s work erased at the whim of an administrative subpoena or denial-of-service attack.
            </p>
            <p className="text-text-muted leading-relaxed text-sm sm:text-base font-sans">
              PressProtocol eliminates the intermediary. You type your dispatch, sign it in your browser with mathematical certainty, and preserve it directly across a decentralized, censorship-resistant network.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero text-text-primary">Decoupled Umbrella Architecture</h2>
            <p className="text-text-muted leading-relaxed text-sm sm:text-base font-sans">
              PressProtocol is engineered as a robust, institutional multi-package repository:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-muted text-sm font-sans">
              <li><strong className="text-text-primary">Core Node (<code className="font-mono text-xs text-text-secondary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">core/node</code>)</strong>: Autonomous Fastify daemon with embedded Helia IPFS, Tor v3 Onionize daemon, and Libp2p Kademlia DHT peering.</li>
              <li><strong className="text-text-primary">Web Application (<code className="font-mono text-xs text-text-secondary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">apps/web</code>)</strong>: Next.js client portal featuring in-browser cryptographic signing, dual-identity switcher, and resilient 2.5s multi-transport IPFS failover.</li>
              <li><strong className="text-text-primary">Browser Extension (<code className="font-mono text-xs text-text-secondary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">integrations/browser-extension</code>)</strong>: Native Chromium MV3 extension routing <code className="font-mono text-xs text-text-secondary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">pressprotocol://</code> deep links and managing browser keys.</li>
              <li><strong className="text-text-primary">WordPress Bridge (<code className="font-mono text-xs text-text-secondary bg-overlay border border-hairline px-1.5 py-0.5 rounded-[4px]">integrations/wordpress-plugin</code>)</strong>: 1-click bridge transforming existing WordPress sites into decentralized publishing nodes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero text-text-primary">Open-Source Governance &amp; Public Goods Trust</h2>
            <p className="text-text-muted leading-relaxed text-sm sm:text-base font-sans">
              We believe critical democratic infrastructure must never be beholden to venture-capital extraction or advertising surveillance models.
              Built under the MIT license, PressProtocol remains 100% open-source, non-custodial, and free to all citizens of the world.
            </p>
          </section>
        </div>

        {/* CTA Card */}
        <Card elevation="card" className="p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left relative z-10">
            <h3 className="font-hero text-2xl text-text-primary">Start Publishing Now</h3>
            <p className="text-sm text-text-muted font-sans">No account required. Instant Ed25519 burner wallet generated in 1-click.</p>
          </div>
          <Link href="/write" className="relative z-10">
            <Button className="gap-2 bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium rounded-[6px] text-xs h-10 shadow-none">
              Open Sovereign Studio &rarr;
            </Button>
          </Link>
        </Card>

        {/* Footer */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-mono">
            MIT License &bull; Free Expression Infrastructure
          </p>
          <div className="flex gap-3">
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs border-hairline bg-overlay text-text-secondary hover:text-text-primary rounded-[6px]">Technical Spec</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs border-hairline bg-overlay text-text-secondary hover:text-text-primary rounded-[6px]">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
