import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import { Shield, Zap, Globe, Lock, FileText, Network } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Decentralized Censorship-Resistant Publishing
            </h1>
            <p className="text-xl text-muted-foreground">
              Publish content that can&apos;t be taken down. Distributed across IPFS, Tor, and gateway mirrors for maximum resilience.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/publish">
                <Button size="lg" className="gap-2">
                  <FileText className="h-5 w-5" />
                  Start Publishing
                </Button>
              </Link>
              <Link href="#discover">
                <Button size="lg" variant="outline" className="gap-2">
                  <Globe className="h-5 w-5" />
                  Discover Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Why AnonPress?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Censorship-Resistant</CardTitle>
              <CardDescription>
                Content distributed across multiple networks ensures it can&apos;t be taken down
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Network className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-Network Distribution</CardTitle>
              <CardDescription>
                Automatic publishing to IPFS, Tor, and gateway mirrors for maximum availability
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Intelligent Routing</CardTitle>
              <CardDescription>
                Browser extension automatically selects the fastest available mirror
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Cryptographic Verification</CardTitle>
              <CardDescription>
                Ed25519 signatures ensure content authenticity and publisher identity
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Decentralized Discovery</CardTitle>
              <CardDescription>
                IPFS DHT-based content discovery without central servers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Easy Publishing</CardTitle>
              <CardDescription>
                Simple web interface or WordPress plugin for familiar publishing experience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Publish Your Content</h3>
                <p className="text-muted-foreground">
                  Write your article using our rich text editor or WordPress plugin. Add tags for discoverability.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Automatic Distribution</h3>
                <p className="text-muted-foreground">
                  Content is automatically uploaded to IPFS, published as a Tor onion service, and made available via gateway mirrors.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share & Discover</h3>
                <p className="text-muted-foreground">
                  Share your anonpress:// link anywhere. Readers can discover content through IPFS DHT or browse the discovery feed.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Resilient Access</h3>
                <p className="text-muted-foreground">
                  Browser extension automatically routes to the fastest available mirror. If one network goes down, content remains accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Feed Section */}
      <section id="discover" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Discover Content</h2>
            <p className="text-muted-foreground">
              Browse recently published content from the decentralized network
            </p>
          </div>
          <DiscoveryFeed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold">Ready to Publish?</h2>
            <p className="text-xl text-muted-foreground">
              Join the censorship-resistant publishing revolution. Your voice can&apos;t be silenced.
            </p>
            <Link href="/publish">
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Start Publishing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
