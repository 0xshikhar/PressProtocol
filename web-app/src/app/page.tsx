import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  FileText, 
  Network, 
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Database,
  Eye,
  Award,
  GitBranch
} from "lucide-react";

export default function Home() {
  const stats = [
    { value: "10K+", label: "Articles Published", icon: FileText },
    { value: "5K+", label: "Active Publishers", icon: Users },
    { value: "99.9%", label: "Uptime Guarantee", icon: TrendingUp },
    { value: "100%", label: "Censorship Proof", icon: Shield },
  ];

  const features = [
    {
      icon: Shield,
      title: "Censorship-Resistant",
      description: "Content distributed across multiple networks ensures it can't be taken down by any single authority.",
      color: "text-primary"
    },
    {
      icon: Network,
      title: "Multi-Network Distribution",
      description: "Automatic publishing to IPFS, Tor, and gateway mirrors for maximum availability and resilience.",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Intelligent Routing",
      description: "Browser extension automatically selects the fastest available mirror for optimal reading experience.",
      color: "text-blue-500"
    },
    {
      icon: Lock,
      title: "Cryptographic Verification",
      description: "Ed25519 signatures ensure content authenticity and verify publisher identity.",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Decentralized Discovery",
      description: "IPFS DHT-based content discovery without relying on centralized servers.",
      color: "text-blue-600"
    },
    {
      icon: Database,
      title: "Permanent Storage",
      description: "Content stored permanently on IPFS with automatic pinning and replication.",
      color: "text-blue-500"
    },
  ];

  const benefits = [
    "No single point of failure",
    "Anonymous publishing option",
    "Immutable content records",
    "Global content distribution",
    "Zero censorship risk",
    "Open-source transparency"
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1 px-4 py-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Decentralized Publishing Platform</span>
            </Badge>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Publish Content That
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent block mt-2">Can&apos;t Be Silenced</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Professional decentralized publishing platform. Distribute your content across IPFS, Tor, and gateway mirrors with cryptographic verification and intelligent routing.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/publish">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <FileText className="h-5 w-5" />
                  Start Publishing Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="gap-2 hover:scale-105 transition-all">
                  <Globe className="h-5 w-5" />
                  Explore Content
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {benefits.slice(0, 3).map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-blue-200">
            <Award className="mr-1 h-3 w-3" />
            Why Choose PressProtocol
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Built for the Future of Publishing</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Advanced technology stack ensuring your content remains accessible, verifiable, and censorship-resistant.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-blue-200">
              <GitBranch className="mr-1 h-3 w-3" />
              Simple Workflow
            </Badge>
            <h2 className="text-4xl font-bold mb-4">How PressProtocol Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Four simple steps to publish censorship-resistant content
            </p>
          </div>
          
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  step: "01",
                  title: "Create Your Content",
                  description: "Use our powerful rich text editor to write articles, essays, or reports. Add images, formatting, and tags for better discoverability.",
                  icon: FileText
                },
                {
                  step: "02",
                  title: "Automatic Distribution",
                  description: "Content is automatically uploaded to IPFS, published as a Tor onion service, and distributed across gateway mirrors.",
                  icon: Network
                },
                {
                  step: "03",
                  title: "Cryptographic Signing",
                  description: "Your content is signed with Ed25519 keys, ensuring authenticity and enabling readers to verify the publisher's identity.",
                  icon: Lock
                },
                {
                  step: "04",
                  title: "Share & Monitor",
                  description: "Share your unique anonpress:// link. Monitor views, mirror health, and content distribution in real-time from your dashboard.",
                  icon: Eye
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="relative overflow-hidden border-2 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-blue-50" />
                    <CardHeader className="p-6">
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-blue-100">{item.step}</span>
                      </div>
                      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Feed Section */}
      {/* <section id="discover" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 border-blue-200">
              <TrendingUp className="mr-1 h-3 w-3" />
              Latest Content
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Discover Recent Publications</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Browse the latest censorship-resistant content from publishers around the world
            </p>
          </div>
          <DiscoveryFeed />
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
        <div className="container mx-auto px-4 py-20">
          <Card className="mx-auto max-w-4xl border-2 shadow-2xl hover:shadow-3xl transition-shadow">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400">
                <FileText className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Publish?
              </h2>
              
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Join thousands of publishers using PressProtocol to share censorship-resistant content. 
                Your voice deserves to be heard, and we ensure it can&apos;t be silenced.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/publish">
                  <Button size="lg" className="gap-2 hover:scale-105 transition-all">
                    <FileText className="h-5 w-5" />
                    Start Publishing Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2 hover:scale-105 transition-all">
                    View Dashboard
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                {benefits.slice(3).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
