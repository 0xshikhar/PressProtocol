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
    toast.success("Indexer updated - refresh explore page to see changes");
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
    } catch (error) {
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
    toast.success("Indexer added - refresh explore page to see changes");
  };

  const getTypeColor = (type: IndexerConfig["type"]) => {
    switch (type) {
      case "official":
        return "bg-green-500";
      case "community":
        return "bg-blue-500";
      case "self-hosted":
        return "bg-purple-500";
    }
  };

  return (
    <Card className="border-white/10 bg-[#0B0D14] text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-sans font-semibold text-white">Indexer Configuration</CardTitle>
            <CardDescription className="text-zinc-400">
              Manage indexers for content discovery. The system tries each indexer in order
              and falls back to IPFS DHT if all fail.
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Indexer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#15151C] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-lg font-sans font-semibold text-white">Add Custom Indexer</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Add a community or self-hosted indexer to improve discovery speed and redundancy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="indexer-url" className="text-xs text-neutral-400">Indexer URL</Label>
                  <Input
                    id="indexer-url"
                    placeholder="https://indexer.example.com"
                    value={newIndexerUrl}
                    onChange={(e) => setNewIndexerUrl(e.target.value)}
                    className="mt-1 bg-black/60 border-white/10 text-white placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <Label htmlFor="indexer-type" className="text-xs text-neutral-400">Type</Label>
                  <select
                    id="indexer-type"
                    className="w-full border border-white/10 rounded-md p-2 bg-black/60 text-white mt-1"
                    value={newIndexerType}
                    onChange={(e) => setNewIndexerType(e.target.value as any)}
                  >
                    <option value="community">Community</option>
                    <option value="self-hosted">Self-Hosted</option>
                  </select>
                </div>
                <Button onClick={handleAdd} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                  Add Indexer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indexers.map((indexer) => (
            <div
              key={indexer.url}
              className="flex items-center justify-between p-4 border border-white/10 bg-white/[0.03] rounded-xl text-white"
            >
              <div className="flex items-center gap-3 flex-1">
                <Server className="h-5 w-5 text-cyan-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-neutral-200">{indexer.url}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTypeColor(indexer.type)} text-white border-0`}
                    >
                      {indexer.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-mono">
                    {indexer.trusted ? "Trusted" : "Untrusted"} •{" "}
                    {indexer.enabled ? "Active" : "Disabled"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {indexer.enabled ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
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
                    className="text-neutral-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {indexers.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Server className="h-12 w-12 mx-auto mb-3 opacity-30 text-cyan-400" />
            <p>No indexers configured</p>
            <p className="text-xs mt-1 text-neutral-500">Add an indexer to enable fast discovery</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm">
          <p className="font-medium text-white mb-2">🔒 Privacy & Decentralization</p>
          <ul className="space-y-1 text-xs text-neutral-400">
            <li>• Indexers improve speed but are optional</li>
            <li>• Content always stays on IPFS (source of truth)</li>
            <li>• If all indexers fail, DHT fallback activates</li>
            <li>• Disable all indexers for maximum privacy (slower)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
