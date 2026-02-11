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
    navigator.clipboard.writeText(`anonpress://${cid}`);
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
      <div className="min-h-screen bg-background">
        <div className="border-b bg-gradient-to-b from-blue-50/50 to-white">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold">Publisher Dashboard</h1>
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="border-2 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect to View Dashboard</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Connect your wallet to access your publisher dashboard and manage your content
              </p>
              <Button onClick={login} size="lg" className="gap-2 hover:scale-105 transition-all">
                Login / SignUp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Publisher Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Track your content performance and manage publications
              </p>
            </div>
            <Link href="/publish">
              <Button size="lg" className="gap-2 hover:scale-105 transition-all">
                <Plus className="h-5 w-5" />
                New Publication
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-2 gap-1 text-green-600 border-green-200">
                    <TrendingUp className="h-3 w-3" />
                    +{analytics.viewsGrowth}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Shares</p>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{analytics.totalShares.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-2 gap-1 text-green-600 border-green-200">
                    <TrendingUp className="h-3 w-3" />
                    +{analytics.sharesGrowth}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Publications</p>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.totalPublications}</p>
                <p className="text-sm text-muted-foreground mt-2">Total articles</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Active Readers</p>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{analytics.activeReaders.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <FileText className="h-4 w-4" />
              All Content
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Published
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {contents.length === 0 ? (
              <Card className="border-2 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No publications yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Start publishing censorship-resistant content to see it here. Your content will be distributed across IPFS, Tor, and gateway mirrors.
                  </p>
                  <Link href="/publish">
                    <Button size="lg" className="gap-2 hover:scale-105 transition-all">
                      <Plus className="h-5 w-5" />
                      Create Your First Publication
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contents.map((content) => (
                  <Card key={content.id} className="group hover:shadow-lg transition-all border-2 hover:border-primary/30 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {content.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tags */}
                      {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {content.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {content.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{content.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Mirror Status */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Distribution Status
                        </p>
                        <div className="flex gap-3">
                          {content.mirrors.ipfs && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.ipfs.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                              )}
                              <span className="text-xs">IPFS</span>
                            </div>
                          )}
                          {content.mirrors.tor && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.tor.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                              )}
                              <span className="text-xs">Tor</span>
                            </div>
                          )}
                          {content.mirrors.gateway && (
                            <div className="flex items-center gap-1.5">
                              {content.mirrors.gateway.available ? (
                                <CheckCircle className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                              )}
                              <span className="text-xs">Gateway</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => window.open(`/read/${content.cid}`, "_blank")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.cid)}
                        >
                          {copiedCid === content.cid ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
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
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Showing all published content
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>
                  Detailed analytics and insights for your publications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Overall Health</p>
                    <p className="text-sm text-muted-foreground">98%</p>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Avg. Read Time</p>
                    <p className="text-2xl font-bold">4.2 min</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
                    <p className="text-2xl font-bold">67%</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Share Rate</p>
                    <p className="text-2xl font-bold">26%</p>
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
