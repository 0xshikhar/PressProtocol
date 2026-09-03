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
      <Card className="border-white/10 bg-[#0B0D14]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-cyan-400" />
                DHT Manifest Cache
              </CardTitle>
              <CardDescription className="text-neutral-400">
                In-memory manifest index for fast discovery
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={refreshing}
              className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 text-cyan-400 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manifest Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-xl">
              <FileText className="h-8 w-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white font-mono">{stats.manifestCount}</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-mono">Manifests Cached</div>
            </div>

            {/* Tag Count */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-xl">
              <Tag className="h-8 w-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white font-mono">{stats.tagCount}</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-mono">Unique Tags</div>
            </div>

            {/* Average Tags per Manifest */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-xl">
              <Database className="h-8 w-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white font-mono">
                {stats.manifestCount > 0
                  ? (stats.tags.length / stats.manifestCount).toFixed(1)
                  : "0"}
              </div>
              <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-mono">Avg Tags/Manifest</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helia Node Status (Phase 2C) */}
      {stats.heliaNode && (
        <Card className="border-white/10 bg-[#0B0D14]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-cyan-400" />
              Helia IPFS Node Status
              {stats.heliaNode.ready ? (
                <Badge variant="default" className="bg-emerald-600/90 text-white font-mono">Ready</Badge>
              ) : (
                <Badge variant="secondary" className="bg-white/10 text-neutral-300 font-mono">Offline</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Peer-to-peer IPFS node for decentralized content storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.heliaNode.ready ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="text-xs text-neutral-400 mb-1 font-mono uppercase">Peer ID</div>
                    <div className="text-xs font-mono break-all text-cyan-300">
                      {stats.heliaNode.peerId?.slice(0, 16)}...
                    </div>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="text-xs text-neutral-400 mb-1 font-mono uppercase">Connected Peers</div>
                    <div className="text-2xl font-bold font-mono text-white">{stats.heliaNode.peers || 0}</div>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="text-xs text-neutral-400 mb-1 font-mono uppercase">Addresses</div>
                    <div className="text-2xl font-bold font-mono text-white">{stats.heliaNode.addresses || 0}</div>
                  </div>
                </div>
                <p className="text-xs text-emerald-400 font-mono">
                  ✅ P2P operations enabled: Manifests can be uploaded directly to IPFS network
                </p>
              </div>
            ) : (
              <div className="text-sm text-neutral-400">
                <p>Helia node is not initialized. Using Pinata gateway fallback.</p>
                <p className="mt-2 text-xs text-neutral-500">
                  To enable P2P operations, ensure required dependencies are installed and the node can start.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tag Cloud */}
      {stats.tags.length > 0 && (
        <Card className="border-white/10 bg-[#0B0D14]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Tag Cloud</CardTitle>
            <CardDescription className="text-neutral-400">
              All tags currently indexed in the DHT cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.tags.sort().map((tag) => (
                <Badge key={tag} variant="outline" className="border-white/10 bg-white/[0.04] text-neutral-300 font-mono text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-white/10 bg-[#0B0D14]">
        <CardHeader>
          <CardTitle className="text-lg text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-neutral-300">
          <p>
            <strong className="text-white">Manifests</strong> are lightweight JSON files stored on IPFS that contain:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-neutral-400">
            <li>Content CID and metadata</li>
            <li>Excerpt (first 200 characters)</li>
            <li>Tags for discovery</li>
            <li>Publisher information</li>
            <li>Mirror URLs</li>
            <li>Reading statistics</li>
          </ul>
          <p className="mt-4">
            <strong className="text-white">DHT Cache</strong> is an in-memory index that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-neutral-400">
            <li>Stores recently published manifests</li>
            <li>Enables fast tag-based discovery</li>
            <li>Provides fallback when indexers fail</li>
            <li>Can be queried without database</li>
          </ul>
          <p className="mt-4 text-xs text-neutral-500 font-mono">
            <strong>Note:</strong> In production, queries route across the IPFS DHT network for censorship-resistant multi-swarm discovery.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
