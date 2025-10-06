"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, ExternalLink, Copy, Check, Plus } from "lucide-react";
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

  if (!authenticated) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Publisher Dashboard</CardTitle>
            <CardDescription>
              Connect your wallet to view and manage your published content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publisher Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your published content and view mirror status
          </p>
        </div>
        <Link href="/publish">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Publication
          </Button>
        </Link>
      </div>

      {contents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No publications yet</h3>
              <p className="text-muted-foreground mb-6">
                Start publishing censorship-resistant content to see it here
              </p>
              <Link href="/publish">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Publication
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contents.map((content) => (
            <Card key={content.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{content.title}</CardTitle>
                    <CardDescription>
                      Published {new Date(content.createdAt).toLocaleDateString()}
                    </CardDescription>
                    {content.tags && content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {content.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(content.cid)}
                    >
                      {copiedCid === content.cid ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`/read/${content.cid}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Content ID
                    </div>
                    <div className="font-mono text-xs break-all">{content.cid}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Mirror Status
                    </div>
                    <div className="flex gap-4">
                      {content.mirrors.ipfs && (
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${content.mirrors.ipfs.available ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span className="text-sm">IPFS</span>
                        </div>
                      )}
                      {content.mirrors.tor && (
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${content.mirrors.tor.available ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span className="text-sm">Tor</span>
                        </div>
                      )}
                      {content.mirrors.gateway && (
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${content.mirrors.gateway.available ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span className="text-sm">Gateway</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
