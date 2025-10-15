"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Database, Tag, FileText } from "lucide-react";
import { toast } from "sonner";

interface ManifestStats {
  manifestCount: number;
  tagCount: number;
  tags: string[];
  heliaNode?: {
    ready: boolean;
    peerId?: string;
    peers?: number;
    addresses?: number;
  };
}

export function ManifestStats() {
  const [stats, setStats] = useState<ManifestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch("http://localhost:4000/api/manifests/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const result = await response.json();
      setStats(result.data);
      toast.success("Stats refreshed");
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                DHT Manifest Cache
              </CardTitle>
              <CardDescription>
                In-memory manifest index for fast discovery
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manifest Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.manifestCount}</div>
              <div className="text-sm text-muted-foreground">Manifests Cached</div>
            </div>

            {/* Tag Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <Tag className="h-8 w-8 text-primary mb-2" />
              <div className="text-3xl font-bold">{stats.tagCount}</div>
              <div className="text-sm text-muted-foreground">Unique Tags</div>
            </div>

            {/* Average Tags per Manifest */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
              <Database className="h-8 w-8 text-primary mb-2" />
              <div className="text-3xl font-bold">
                {stats.manifestCount > 0
                  ? (stats.tags.length / stats.manifestCount).toFixed(1)
                  : "0"}
              </div>
              <div className="text-sm text-muted-foreground">Avg Tags/Manifest</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helia Node Status (Phase 2C) */}
      {stats.heliaNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Helia IPFS Node Status
              {stats.heliaNode.ready ? (
                <Badge variant="default" className="bg-green-500">Ready</Badge>
              ) : (
                <Badge variant="secondary">Offline</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Peer-to-peer IPFS node for decentralized content storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.heliaNode.ready ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Peer ID</div>
                    <div className="text-xs font-mono break-all">
                      {stats.heliaNode.peerId?.slice(0, 16)}...
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Connected Peers</div>
                    <div className="text-2xl font-bold">{stats.heliaNode.peers || 0}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Addresses</div>
                    <div className="text-2xl font-bold">{stats.heliaNode.addresses || 0}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✅ P2P operations enabled: Manifests can be uploaded directly to IPFS network
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>Helia node is not initialized. Using Pinata gateway fallback.</p>
                <p className="mt-2 text-xs">
                  To enable P2P operations, ensure required dependencies are installed and the node can start.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tag Cloud */}
      {stats.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tag Cloud</CardTitle>
            <CardDescription>
              All tags currently indexed in the DHT cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.tags.sort().map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Manifests</strong> are lightweight JSON files stored on IPFS that contain:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Content CID and metadata</li>
            <li>Excerpt (first 200 characters)</li>
            <li>Tags for discovery</li>
            <li>Publisher information</li>
            <li>Mirror URLs</li>
            <li>Reading statistics</li>
          </ul>
          <p className="mt-4">
            <strong>DHT Cache</strong> is an in-memory index that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Stores recently published manifests</li>
            <li>Enables fast tag-based discovery</li>
            <li>Provides fallback when indexers fail</li>
            <li>Can be queried without database</li>
          </ul>
          <p className="mt-4 text-xs">
            <strong>Note:</strong> In Phase 2C, this will query the actual IPFS DHT network
            for truly decentralized discovery across all nodes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
