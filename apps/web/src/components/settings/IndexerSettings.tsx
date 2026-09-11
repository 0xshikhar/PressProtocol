"use client";

import { useState, useEffect } from "react";
import { discoveryService, type IndexerConfig } from "@/lib/discovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Server, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function IndexerSettings() {
  const [indexers, setIndexers] = useState<IndexerConfig[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIndexerUrl, setNewIndexerUrl] = useState("");
  const [newIndexerType, setNewIndexerType] = useState<"official" | "community" | "self-hosted">("community");

  useEffect(() => {
    loadIndexers();
  }, []);

  const loadIndexers = () => {
    const currentIndexers = discoveryService.getIndexers();
    setIndexers(currentIndexers);
  };

  const handleToggle = (url: string) => {
    discoveryService.toggleIndexer(url);
    loadIndexers();
    toast.success("Indexer status updated");
  };

  const handleRemove = (url: string) => {
    discoveryService.removeIndexer(url);
    loadIndexers();
    toast.success("Indexer removed");
  };

  const handleAdd = () => {
    if (!newIndexerUrl) {
      toast.error("Please enter an indexer URL");
      return;
    }

    // Validate URL
    try {
      new URL(newIndexerUrl);
    } catch {
      toast.error("Invalid URL format");
      return;
    }

    const newIndexer: IndexerConfig = {
      url: newIndexerUrl,
      type: newIndexerType,
      trusted: newIndexerType === "official",
      enabled: true,
    };

    discoveryService.addIndexer(newIndexer);
    loadIndexers();
    setShowAddDialog(false);
    setNewIndexerUrl("");
    toast.success("Indexer added");
  };

  const getTypeBadgeClass = (type: IndexerConfig["type"]) => {
    switch (type) {
      case "official":
        return "bg-verified/10 text-verified border-verified/30";
      case "community":
        return "bg-overlay text-secondary border-hairline";
      case "self-hosted":
        return "bg-anonymous/10 text-anonymous border-anonymous/30";
      default:
        return "bg-surface-raised text-secondary border-border/60";
    }
  };

  return (
    <Card className="border-border/60 bg-surface text-primary rounded-[6px]">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-sans font-semibold text-primary">Indexer Configuration</CardTitle>
            <CardDescription className="text-xs text-muted mt-1">
              Manage indexers for content discovery. The system queries indexers in sequence and falls back to DHT if unreachable.
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent-primary hover:bg-accent-hover text-primary font-mono text-xs rounded-[6px] h-9 px-4 shrink-0">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Indexer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface border-border/80 text-primary rounded-[6px] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-sans font-semibold text-primary">Add Custom Indexer</DialogTitle>
                <DialogDescription className="text-xs text-muted">
                  Add a community or self-hosted indexer to improve discovery speed and redundancy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="indexer-url" className="text-xs font-mono text-secondary">Indexer URL</Label>
                  <Input
                    id="indexer-url"
                    placeholder="https://indexer.example.com"
                    value={newIndexerUrl}
                    onChange={(e) => setNewIndexerUrl(e.target.value)}
                    className="bg-background border-border/70 text-primary placeholder:text-muted/50 rounded-[6px] font-mono text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="indexer-type" className="text-xs font-mono text-secondary">Type</Label>
                  <select
                    id="indexer-type"
                    className="w-full border border-border/70 rounded-[6px] px-3 py-2 bg-background text-primary font-mono text-xs"
                    value={newIndexerType}
                    onChange={(e) => setNewIndexerType(e.target.value as any)}
                  >
                    <option value="community">Community</option>
                    <option value="self-hosted">Self-Hosted</option>
                  </select>
                </div>
                <Button onClick={handleAdd} className="w-full bg-accent-primary hover:bg-accent-hover text-primary font-mono text-xs rounded-[6px] h-10">
                  Add Indexer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-3">
          {indexers.map((indexer) => (
            <div
              key={indexer.url}
              className="flex items-center justify-between p-4 border border-border/60 bg-surface-raised rounded-[6px] text-primary"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-[6px] bg-background border border-border/60 flex items-center justify-center text-secondary shrink-0">
                  <Server className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-primary truncate">{indexer.url}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono rounded-[6px] px-2 py-0.5 border ${getTypeBadgeClass(indexer.type)}`}
                    >
                      {indexer.type}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted mt-1 font-mono">
                    {indexer.trusted ? "Trusted" : "Untrusted"} &bull;{" "}
                    {indexer.enabled ? "Active" : "Disabled"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  {indexer.enabled ? (
                    <CheckCircle className="h-4 w-4 text-verified" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted" />
                  )}
                  <Switch
                    checked={indexer.enabled}
                    onCheckedChange={() => handleToggle(indexer.url)}
                  />
                </div>
                {indexer.type !== "official" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(indexer.url)}
                    className="text-muted hover:text-primary hover:bg-overlay h-8 w-8 p-0 rounded-[6px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {indexers.length === 0 && (
          <div className="text-center py-8 text-muted">
            <Server className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted" />
            <p className="text-xs font-mono">No indexers configured</p>
            <p className="text-[11px] mt-1 text-muted/70">Add an indexer to enable fast discovery</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-background border border-border/60 rounded-[6px] text-xs">
          <p className="font-mono font-medium text-primary mb-2">Privacy &amp; Swarm Redundancy</p>
          <ul className="space-y-1.5 text-xs text-muted font-sans">
            <li>&bull; Indexers accelerate content lookups but are strictly non-custodial</li>
            <li>&bull; Content always resides directly on IPFS and Tor v3 onion networks</li>
            <li>&bull; If all indexers fail or go offline, DHT distributed fallback activates</li>
            <li>&bull; Disable all indexers for maximum anonymity with higher network latency</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
