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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-950/50 text-cyan-300 font-mono text-xs">
              <Heart className="h-3 w-3 mr-1 text-red-400" /> PUBLIC GOOD INITIATIVE
            </Badge>
            <span className="text-xs text-neutral-400 font-mono">OPEN INFRASTRUCTURE</span>
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Free Expression as an Unstoppable Public Good
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            PressProtocol was created to solve a profound problem: the modern internet has centralized around choke-points capable of deplatforming investigative reporters, suppressing whistleblower leaks, and cutting off dissent under authoritarian pressure.
          </p>
        </div>

        {/* Impact Pillars */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Censorship Immunity</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                By pairing IPFS content addressing with automatic Tor v3 hidden services, no single domain registrar or cloud vendor can take down your reporting.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Public Good Stewardship</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Developed as a regenerative digital public good, aligning technological advancement with open-source ethical stewardship.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <div className="h-10 w-10 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Dual-Identity Model</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Empowers both the anonymous dissident (ephemeral Ed25519 burner keys) and the institutional journalist (verified profiles).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story & Philosophy */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-2xl font-sans font-bold text-white">The Core Thesis</h2>
            <p className="text-neutral-400 leading-relaxed">
              When truth is dangerous, identity should be sovereign. When platforms can be coerced, publishing must be peer-to-peer.
              Traditional media platforms force writers into Faustian bargains: sacrifice your anonymity, submit your IP address, or risk having your life&apos;s work erased at the whim of an administrative subpoena or denial-of-service attack.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              PressProtocol eliminates the intermediary. You type your dispatch, sign it in your browser with mathematical certainty, and broadcast it directly to the permanent Web3 swarm.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-sans font-bold text-white">Decoupled Umbrella Architecture</h2>
            <p className="text-neutral-400 leading-relaxed">
              PressProtocol is engineered as a robust, institutional multi-package repository:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400 text-sm">
              <li><strong className="text-white">Core Node (<code className="font-mono text-xs text-cyan-300">core/node</code>)</strong>: Autonomous Fastify daemon with embedded Helia IPFS, Tor v3 Onionize daemon, and Libp2p Kademlia DHT peering.</li>
              <li><strong className="text-white">Web Application (<code className="font-mono text-xs text-cyan-300">apps/web</code>)</strong>: Next.js 14 client portal featuring in-browser cryptographic signing, dual-identity switcher, and resilient 2.5s multi-transport IPFS failover.</li>
              <li><strong className="text-white">Browser Extension (<code className="font-mono text-xs text-cyan-300">integrations/browser-extension</code>)</strong>: Native Chromium MV3 extension routing <code className="font-mono text-xs text-cyan-300">pressprotocol://</code> deep links and managing browser keys.</li>
              <li><strong className="text-white">WordPress Bridge (<code className="font-mono text-xs text-cyan-300">integrations/wordpress-plugin</code>)</strong>: 1-click bridge transforming existing WordPress sites into decentralized publishing nodes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-sans font-bold text-white">Open-Source Governance & Public Goods Trust</h2>
            <p className="text-neutral-400 leading-relaxed">
              We believe critical democratic infrastructure must never be beholden to venture-capital extraction or advertising surveillance models.
              Built under the MIT license, PressProtocol remains 100% open-source, non-custodial, and free to all citizens of the world.
            </p>
          </section>
        </div>

        {/* CTA Card */}
        <div className="p-8 rounded-2xl border border-white/10 bg-[#0B0D14] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
          <div className="space-y-1 text-center sm:text-left relative z-10">
            <h3 className="font-sans text-2xl font-bold text-white">Start Publishing Now</h3>
            <p className="text-sm text-neutral-400">No account required. Instant Ed25519 burner wallet generated in 1-click.</p>
          </div>
          <Link href="/write" className="relative z-10">
            <Button className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs">
              Open Sovereign Studio <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 font-mono">
            MIT License &bull; Free Expression Infrastructure
          </p>
          <div className="flex gap-3">
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white rounded-xl">Technical Spec</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white rounded-xl">Privacy Architecture</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
