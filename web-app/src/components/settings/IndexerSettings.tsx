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
    toast.success("Indexer updated");
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
    toast.success("Indexer added");
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Indexer Configuration</CardTitle>
            <CardDescription>
              Manage indexers for content discovery. The system tries each indexer in order
              and falls back to IPFS DHT if all fail.
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Indexer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Indexer</DialogTitle>
                <DialogDescription>
                  Add a community or self-hosted indexer to improve discovery speed and redundancy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="indexer-url">Indexer URL</Label>
                  <Input
                    id="indexer-url"
                    placeholder="https://indexer.example.com"
                    value={newIndexerUrl}
                    onChange={(e) => setNewIndexerUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indexer-type">Type</Label>
                  <select
                    id="indexer-type"
                    className="w-full border rounded-md p-2 bg-background"
                    value={newIndexerType}
                    onChange={(e) => setNewIndexerType(e.target.value as any)}
                  >
                    <option value="community">Community</option>
                    <option value="self-hosted">Self-Hosted</option>
                  </select>
                </div>
                <Button onClick={handleAdd} className="w-full">
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
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{indexer.url}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getTypeColor(indexer.type)} text-white`}
                    >
                      {indexer.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {indexer.trusted ? "Trusted" : "Untrusted"} •{" "}
                    {indexer.enabled ? "Active" : "Disabled"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {indexer.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
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
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {indexers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No indexers configured</p>
            <p className="text-sm mt-1">Add an indexer to enable fast discovery</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm">
          <p className="font-medium mb-2">🔒 Privacy & Decentralization</p>
          <ul className="space-y-1 text-muted-foreground">
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
