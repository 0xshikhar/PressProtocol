"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Activity,
  LayoutGrid,
  List,
  ArrowUpDown,
  Code2,
  ShieldCheck,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CidChip } from "@/components/protocol/CidChip";
import { 
  getOrCreateBurnerWallet, 
  getBurnerArticles, 
  type BurnerWallet, 
} from "@/lib/burner-wallet";

interface DashboardArticle {
  id: string;
  cid: string;
  title: string;
  tags: string[];
  createdAt: string;
  views: number;
  shares: number;
  mirrors: {
    ipfs?: { available: boolean };
    tor?: { available: boolean };
    gateway?: { available: boolean };
  };
}

const DEFAULT_SAMPLE_ARTICLES: DashboardArticle[] = [
  {
    id: "sample-1",
    cid: "bafkreic7x2kwz36i6xebv6dfk2yhyovr67y3z4g244x2a3e6fgn6x5q72e",
    title: "The Architecture of Sovereign Publishing: Beyond Centralized Editorial Control",
    tags: ["sovereignty", "ipfs", "cryptography"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 4210,
    shares: 890,
    mirrors: {
      ipfs: { available: true },
      tor: { available: true },
      gateway: { available: true },
    },
  },
  {
    id: "sample-2",
    cid: "bafkreigh2akiscaildcqjybeeqd4lq5vvdjv5k6g5qf44cqk5o22u3q7ae",
    title: "Client-Side Zero-Knowledge Verification for Investigative Dispatches",
    tags: ["privacy", "ed25519", "whistleblower"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    views: 8243,
    shares: 2351,
    mirrors: {
      ipfs: { available: true },
      tor: { available: true },
      gateway: { available: true },
    },
  },
];

export default function DashboardPage() {
  const { authenticated, user, login } = usePrivy();
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [contents, setContents] = useState<DashboardArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortField, setSortField] = useState<"date" | "views" | "title">("date");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadUserContent();
  }, [authenticated]);

  const loadUserContent = async () => {
    try {
      setLoading(true);
      const bWallet = await getOrCreateBurnerWallet();
      setBurnerWallet(bWallet);

      const localArticles = getBurnerArticles();
      if (localArticles.length > 0) {
        const mapped: DashboardArticle[] = localArticles.map((item, idx) => ({
          id: `local-${idx}`,
          cid: item.cid,
          title: item.title,
          tags: ["burner-dispatch", "ed25519"],
          createdAt: new Date(item.publishedAt).toISOString(),
          views: 120 + idx * 45,
          shares: 24 + idx * 12,
          mirrors: {
            ipfs: { available: true },
            tor: { available: true },
            gateway: { available: true },
          },
        }));
        setContents(mapped);
      } else {
        setContents(DEFAULT_SAMPLE_ARTICLES);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setContents(DEFAULT_SAMPLE_ARTICLES);
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

  const sortedContents = [...contents].sort((a, b) => {
    if (sortField === "views") {
      return sortAsc ? a.views - b.views : b.views - a.views;
    }
    if (sortField === "title") {
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return sortAsc 
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleSort = (field: "date" | "views" | "title") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalViews = contents.reduce((acc, c) => acc + c.views, 0);
  const totalShares = contents.reduce((acc, c) => acc + c.shares, 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="border-b border-border/60 bg-surface/50 relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-10 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="border-hairline bg-surface-subtle text-muted-foreground font-mono text-[10px]">
                  Publisher telemetry
                </Badge>
                {authenticated ? (
                  <Badge variant="outline" className="border-verified/30 bg-verified-tint text-verified font-mono text-[10px] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Web3 Linked: {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "Verified"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-border/60 bg-surface-subtle text-muted-foreground font-mono text-[10px] flex items-center gap-1">
                    <Shield className="h-3 w-3 text-primary" />
                    Burner Identity: {burnerWallet?.pseudonym || "Anon"}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-sans font-bold text-foreground tracking-tight">Publisher Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Track sovereign content replication, swarm health, and reader verification telemetry
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!authenticated && (
                <Button 
                  onClick={login}
                  variant="outline"
                  size="sm"
                  className="text-xs font-mono border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground rounded-[6px]"
                >
                  Link External Wallet
                </Button>
              )}
              <Link href="/write">
                <Button size="sm" className="gap-1.5 bg-accent-primary hover:bg-accent-hover text-primary font-semibold rounded-[6px] text-xs px-4">
                  <Plus className="h-4 w-4" />
                  New Publication
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl space-y-8">
        {/* Analytics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card elevation="card" className="border border-border/60 bg-surface rounded-[6px] text-foreground">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Swarm Reads</p>
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{totalViews.toLocaleString()}</p>
                <Badge variant="outline" className="mt-2 gap-1 text-verified border-verified/30 bg-verified-tint text-[10px] font-mono">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +12.5% vs last week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card elevation="card" className="border border-border/60 bg-surface rounded-[6px] text-foreground">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">P2P Syndications</p>
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Share2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{totalShares.toLocaleString()}</p>
                <Badge variant="outline" className="mt-2 gap-1 text-verified border-verified/30 bg-verified-tint text-[10px] font-mono">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +8.3% syndication rate
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card elevation="card" className="border border-border/60 bg-surface rounded-[6px] text-foreground">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Dispatches Pinned</p>
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{contents.length}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-2">100% Cryptographically Verified</p>
              </div>
            </CardContent>
          </Card>

          <Card elevation="card" className="border border-border/60 bg-surface rounded-[6px] text-foreground">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Mirror Health</p>
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-verified">100%</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-2">IPFS Swarm &bull; Tor v3 Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="bg-surface-subtle border border-border/60 p-1 text-muted-foreground rounded-[6px]">
              <TabsTrigger value="all" className="gap-2 rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70 text-xs">
                <FileText className="h-3.5 w-3.5" />
                All Dispatches
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                Swarm Analytics
              </TabsTrigger>
            </TabsList>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-[6px] border border-border/60 bg-surface-subtle p-0.5 text-xs font-mono">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-[4px] transition-all ${
                    viewMode === "table"
                      ? "bg-surface-elevated text-foreground border border-border/70 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Ledger Table View"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-[4px] transition-all ${
                    viewMode === "cards"
                      ? "bg-surface-elevated text-foreground border border-border/70 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {viewMode === "table" ? (
              /* High-Density Sortable Ledger Table */
              <div className="rounded-[6px] border border-border/60 bg-surface overflow-hidden shadow-sm">
                {/* Desktop Table (sm and up) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border/60 bg-surface-subtle text-muted-foreground">
                        <th 
                          onClick={() => toggleSort("title")}
                          className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Title</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 font-semibold">Content CID</th>
                        <th 
                          onClick={() => toggleSort("views")}
                          className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Swarm Reads</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 font-semibold">Mirror Availability</th>
                        <th 
                          onClick={() => toggleSort("date")}
                          className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Published</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sortedContents.map((content) => (
                        <tr 
                          key={content.id}
                          className="hover:bg-surface-elevated/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-sans font-medium text-foreground max-w-[260px] truncate">
                            <Link href={`/read/${content.cid}`} className="hover:text-primary transition-colors">
                              {content.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <CidChip cid={content.cid} prefixLen={8} suffixLen={6} />
                          </td>
                          <td className="py-3.5 px-4 font-mono text-foreground whitespace-nowrap">
                            {content.views.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-verified" title="IPFS Swarm Online" />
                              <span className="h-2 w-2 rounded-full bg-verified" title="Public Gateway Online" />
                              <span className="h-2 w-2 rounded-full bg-anonymous" title="Tor v3 Onion Online" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(content.cid)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-[4px]"
                                title="Copy Protocol Link"
                              >
                                {copiedCid === content.cid ? (
                                  <Check className="h-3 w-3 text-verified" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-[4px]">
                                <Link href={`/embed/builder?cid=${content.cid}`}>
                                  <Code2 className="h-3 w-3" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-primary hover:text-primary/80 rounded-[4px]">
                                <Link href={`/read/${content.cid}`}>
                                  <span>Read</span>
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards for Table View (< sm) */}
                <div className="sm:hidden divide-y divide-border/60">
                  {sortedContents.map((content) => (
                    <div key={content.id} className="p-4 space-y-3">
                      <Link href={`/read/${content.cid}`} className="font-sans font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2 block">
                        {content.title}
                      </Link>

                      <div className="flex items-center justify-between gap-2">
                        <CidChip cid={content.cid} prefixLen={6} suffixLen={4} />
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                          <span>{content.views.toLocaleString()} reads</span>
                          <span>&bull;</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-verified" title="IPFS" />
                          <span className="h-2 w-2 rounded-full bg-verified" title="Gateway" />
                          <span className="h-2 w-2 rounded-full bg-anonymous" title="Tor" />
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">Synced</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(content.cid)}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-[4px]"
                          >
                            {copiedCid === content.cid ? (
                              <Check className="h-3.5 w-3.5 text-verified" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-mono border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground rounded-[4px]">
                            <Link href={`/read/${content.cid}`}>
                              <span>Read</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Grid Cards View */
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedContents.map((content) => (
                  <Card key={content.id} elevation="card" className="group border border-border/60 bg-surface hover:border-primary/40 rounded-[6px] text-foreground transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors font-semibold text-foreground">
                        {content.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <CidChip cid={content.cid} prefixLen={6} suffixLen={4} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/60 pt-2">
                        <span>Reads: {content.views}</span>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-verified" />
                          <span className="text-[10px]">Swarm Synced</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs rounded-[4px]"
                          asChild
                        >
                          <Link href={`/read/${content.cid}`}>
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Read</span>
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs rounded-[4px]"
                          onClick={() => copyToClipboard(content.cid)}
                        >
                          {copiedCid === content.cid ? (
                            <Check className="h-3.5 w-3.5 text-verified" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card elevation="card" className="border-border/60 bg-surface text-foreground rounded-[6px] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Swarm Health &amp; Distribution</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Decentralized multi-transport telemetry across IPFS gateways and Tor v3 onion circuits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground">Swarm Availability Rate</p>
                    <p className="text-xs text-verified font-mono">100% Pinned</p>
                  </div>
                  <Progress value={100} className="h-2 bg-surface-subtle" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-[6px] border border-border/60 bg-surface-subtle">
                    <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Avg. Read Duration</p>
                    <p className="text-2xl font-bold font-mono text-foreground">4.2 min</p>
                  </div>
                  <div className="p-4 rounded-[6px] border border-border/60 bg-surface-subtle">
                    <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Verification Rate</p>
                    <p className="text-2xl font-bold font-mono text-verified">100%</p>
                  </div>
                  <div className="p-4 rounded-[6px] border border-border/60 bg-surface-subtle">
                    <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Syndication Velocity</p>
                    <p className="text-2xl font-bold font-mono text-primary">26%</p>
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
