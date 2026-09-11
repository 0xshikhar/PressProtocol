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
      
      const response = await fetch("/api/manifests/stats");
      
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
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 rounded-[4px]" />
          <Skeleton className="h-4 w-2/3 mt-2 rounded-[4px]" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-[4px]" />
            <Skeleton className="h-20 rounded-[4px]" />
            <Skeleton className="h-20 rounded-[4px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Overview */}
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary font-sans font-semibold">
                <Database className="h-4 w-4 text-secondary" />
                DHT Manifest Cache
              </CardTitle>
              <CardDescription className="text-muted text-xs">
                In-memory manifest index for fast discovery
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
              className="border-border/70 bg-surface hover:bg-surface-raised text-primary text-xs font-mono rounded-[6px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-secondary ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manifest Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-surface-raised border border-border/60 rounded-[6px]">
              <FileText className="h-6 w-6 text-secondary mb-2" />
              <div className="text-3xl font-bold text-primary font-mono tnum">{stats.manifestCount}</div>
              <div className="text-[11px] text-muted mt-1 font-mono">Manifests cached</div>
            </div>

            {/* Tag Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-surface-raised border border-border/60 rounded-[6px]">
              <Tag className="h-6 w-6 text-secondary mb-2" />
              <div className="text-3xl font-bold text-primary font-mono tnum">{stats.tagCount}</div>
              <div className="text-[11px] text-muted mt-1 font-mono">Unique tags</div>
            </div>

            {/* Average Tags per Manifest */}
            <div className="flex flex-col items-center justify-center p-6 bg-surface-raised border border-border/60 rounded-[6px]">
              <Database className="h-6 w-6 text-secondary mb-2" />
              <div className="text-3xl font-bold text-primary font-mono tnum">
                {stats.manifestCount > 0
                  ? (stats.tags.length / stats.manifestCount).toFixed(1)
                  : "0"}
              </div>
              <div className="text-[11px] text-muted mt-1 font-mono">Avg tags/manifest</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helia Node Status */}
      {stats.heliaNode && (
        <Card className="border-border/60 bg-surface rounded-[6px]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-primary font-sans font-semibold">
              <Database className="h-4 w-4 text-secondary" />
              Helia IPFS Node Status
              {stats.heliaNode.ready ? (
                <Badge variant="verified" className="font-mono text-[10px] rounded-[4px]">Ready</Badge>
              ) : (
                <Badge variant="secondary" className="bg-surface-raised text-muted font-mono text-[10px] rounded-[4px]">Offline</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-muted text-xs">
              Peer-to-peer IPFS node for decentralized content storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.heliaNode.ready ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-raised border border-border/60 rounded-[6px]">
                    <div className="text-[11px] text-muted mb-1 font-mono">Peer ID</div>
                    <div className="text-xs font-mono break-all text-primary">
                      {stats.heliaNode.peerId?.slice(0, 16)}...
                    </div>
                  </div>
                  <div className="p-4 bg-surface-raised border border-border/60 rounded-[6px]">
                    <div className="text-[11px] text-muted mb-1 font-mono">Connected peers</div>
                    <div className="text-2xl font-bold font-mono text-primary tnum">{stats.heliaNode.peers || 0}</div>
                  </div>
                  <div className="p-4 bg-surface-raised border border-border/60 rounded-[6px]">
                    <div className="text-[11px] text-muted mb-1 font-mono">Addresses</div>
                    <div className="text-2xl font-bold font-mono text-primary tnum">{stats.heliaNode.addresses || 0}</div>
                  </div>
                </div>
                <p className="text-xs text-verified font-mono">
                  &bull; P2P operations enabled: Manifests can be uploaded directly to IPFS network
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted">
                <p>Helia node is not initialized. Using Pinata gateway fallback.</p>
                <p className="mt-2 text-xs text-muted/70 font-mono">
                  To enable P2P operations, ensure required dependencies are installed and the node can start.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tag Cloud */}
      {stats.tags.length > 0 && (
        <Card className="border-border/60 bg-surface rounded-[6px]">
          <CardHeader>
            <CardTitle className="text-base text-primary font-sans font-semibold">Tag Cloud</CardTitle>
            <CardDescription className="text-muted text-xs">
              All tags currently indexed in the DHT cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {stats.tags.sort().map((tag) => (
                <Badge key={tag} variant="outline" className="border-border/60 bg-surface-raised text-secondary font-mono text-xs rounded-[4px]">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <CardTitle className="text-base text-primary font-sans font-semibold">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-secondary font-light leading-relaxed">
          <p>
            <strong className="text-primary font-normal">Manifests</strong> are lightweight JSON files stored on IPFS that contain:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-muted text-xs font-sans">
            <li>Content CID and metadata</li>
            <li>Excerpt (first 200 characters)</li>
            <li>Tags for discovery</li>
            <li>Publisher information</li>
            <li>Mirror URLs</li>
            <li>Reading statistics</li>
          </ul>
          <p className="mt-4">
            <strong className="text-primary font-normal">DHT Cache</strong> is an in-memory index that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-muted text-xs font-sans">
            <li>Stores recently published manifests</li>
            <li>Enables fast tag-based discovery</li>
            <li>Provides fallback when indexers fail</li>
            <li>Can be queried without database</li>
          </ul>
          <p className="mt-4 text-xs text-muted font-mono">
            Note: In production, queries route across the IPFS DHT network for censorship-resistant multi-swarm discovery.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
