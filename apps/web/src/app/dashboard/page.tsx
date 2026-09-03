"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Eye, 
  Share2, 
  TrendingUp, 
  BarChart3, 
  Users,
  Activity,
  Download,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CidChip } from "@/components/protocol";

interface UserContent {
  id: string;
  cid: string;
  title: string;
  tags: string[];
  createdAt: string;
  mirrors: {
    ipfs?: { available: boolean };
    tor?: { available: boolean };
    gateway?: { available: boolean };
  };
}

export default function DashboardPage() {
  const { authenticated, login } = usePrivy();
  const [contents, setContents] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCid, setCopiedCid] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) {
      loadUserContent();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const loadUserContent = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch user's content from the API
      // For now, we'll use mock data
      const mockData: UserContent[] = [];
      setContents(mockData);
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load your content");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (cid: string) => {
    navigator.clipboard.writeText(`pressprotocol://${cid}`);
    setCopiedCid(cid);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedCid(null), 2000);
  };

  const getMirrorStatusColor = (available: boolean) => {
    return available ? "text-green-500" : "text-red-500";
  };

  // Mock analytics data
  const analytics = {
    totalViews: 12453,
    totalShares: 3241,
    totalPublications: contents.length,
    activeReaders: 892,
    viewsGrowth: 12.5,
    sharesGrowth: 8.3
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />
          <div className="container relative z-10 mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">Publisher Dashboard</h1>
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="border-white/10 bg-[#0B0D14] shadow-2xl rounded-2xl text-white">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
                <BarChart3 className="h-8 w-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-sans font-bold text-white mb-2">Connect to View Dashboard</h2>
              <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Connect your sovereign identity or Web3 wallet to access your publisher analytics and manage your decentralized publications.
              </p>
              <Button onClick={login} size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs px-6">
                Login / Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <div className="border-b border-white/10 bg-[#0B0D14]/80">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 bg-white/10" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-white/10 bg-[#0B0D14]">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-4 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">Publisher Dashboard</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Track your content performance and manage publications across IPFS and Tor
              </p>
            </div>
            <Link href="/write">
              <Button size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs px-6 shadow-lg shadow-cyan-950/50">
                <Plus className="h-4 w-4" />
                New Publication
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Total Views</p>
                <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono text-white">{analytics.totalViews.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-2 gap-1 text-emerald-400 border-emerald-500/30 bg-emerald-950/40 text-[11px] font-mono">
                    <TrendingUp className="h-3 w-3" />
                    +{analytics.viewsGrowth}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Total Shares</p>
                <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Share2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono text-white">{analytics.totalShares.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-2 gap-1 text-emerald-400 border-emerald-500/30 bg-emerald-950/40 text-[11px] font-mono">
                    <TrendingUp className="h-3 w-3" />
                    +{analytics.sharesGrowth}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Publications</p>
                <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-white">{analytics.totalPublications}</p>
                <p className="text-xs font-mono text-neutral-400 mt-2">Total syndicated articles</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all rounded-2xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Active Readers</p>
                <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-white">{analytics.activeReaders.toLocaleString()}</p>
                <p className="text-xs font-mono text-neutral-400 mt-2">Past 30 days p2p traffic</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-[#0B0D14] border border-white/10 p-1 text-neutral-400">
            <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/40">
              <FileText className="h-4 w-4" />
              All Content
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/40">
              <CheckCircle className="h-4 w-4" />
              Published
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/40">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {contents.length === 0 ? (
              <Card className="border-white/10 bg-[#0B0D14] rounded-2xl text-white shadow-xl">
                <CardContent className="py-16 text-center">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                    <FileText className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-white mb-2">No publications yet</h3>
                  <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                    Start publishing censorship-resistant content to see it here. Your content will be distributed across IPFS, Tor, and gateway mirrors.
                  </p>
                  <Link href="/write">
                    <Button size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs px-6">
                      <Plus className="h-4 w-4" />
                      Create Your First Publication
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contents.map((content) => (
                  <Card key={content.id} className="group hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 rounded-2xl text-white">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <CardTitle className="text-base line-clamp-2 group-hover:text-cyan-300 transition-colors font-sans font-semibold text-white">
                          {content.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CidChip cid={content.cid} />
                        <CardDescription className="text-xs text-neutral-400 font-mono">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tags */}
                      {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {content.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="border-white/10 bg-white/[0.04] text-neutral-300 font-mono text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {content.tags.length > 3 && (
                            <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-neutral-400 font-mono text-xs">
                              +{content.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Mirror Status */}
                      <div>
                        <p className="text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">
                          Distribution Status
                        </p>
                        <div className="flex gap-3 text-xs font-mono">
                          {content.mirrors.ipfs && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.ipfs.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <span className="text-neutral-300">IPFS</span>
                            </div>
                          )}
                          {content.mirrors.tor && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.tor.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <span className="text-neutral-300">Tor</span>
                            </div>
                          )}
                          {content.mirrors.gateway && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.gateway.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <span className="text-neutral-300">Gateway</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs"
                          onClick={() => window.open(`/read/${content.cid}`, "_blank")}
                        >
                          <Eye className="h-3.5 w-3.5 text-cyan-400" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs"
                          onClick={() => copyToClipboard(content.cid)}
                        >
                          {copiedCid === content.cid ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-neutral-400" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
                <p className="text-neutral-400 text-sm">
                  Showing all verified published content across IPFS swarms
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-sans font-bold text-white">Content Performance</CardTitle>
                <CardDescription className="text-neutral-400">
                  Detailed telemetry and insights for your publications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-neutral-300">Overall Health</p>
                    <p className="text-sm text-emerald-400 font-mono">98% Resilient</p>
                  </div>
                  <Progress value={98} className="h-2 bg-white/10" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <p className="text-xs font-mono uppercase text-neutral-400 mb-1">Avg. Read Time</p>
                    <p className="text-2xl font-bold font-mono text-white">4.2 min</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <p className="text-xs font-mono uppercase text-neutral-400 mb-1">Engagement Rate</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400">67%</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <p className="text-xs font-mono uppercase text-neutral-400 mb-1">Share Rate</p>
                    <p className="text-2xl font-bold font-mono text-cyan-400">26%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
