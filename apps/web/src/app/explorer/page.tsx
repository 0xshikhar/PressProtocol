"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManifestViewer } from "@/components/manifests/ManifestViewer";
import { ManifestStats } from "@/components/manifests/ManifestStats";
import { FileText, BarChart3 } from "lucide-react";

export default function ManifestsPage() {
  const [manifestCid, setManifestCid] = useState("");
  const [viewingCid, setViewingCid] = useState<string | null>(null);

  const handleView = () => {
    if (manifestCid.trim()) {
      setViewingCid(manifestCid.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Manifest Explorer</h1>
              <p className="text-muted-foreground">
                View content manifests and DHT cache statistics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="viewer" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="viewer" className="gap-2">
              <FileText className="h-4 w-4" />
              Manifest Viewer
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              DHT Stats
            </TabsTrigger>
          </TabsList>

          {/* Manifest Viewer Tab */}
          <TabsContent value="viewer" className="space-y-6">
            {/* Search Input */}
            <div className="max-w-2xl space-y-2">
              <label className="text-sm font-medium">Enter Manifest CID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="QmXXXXXX... (manifest CID)"
                  value={manifestCid}
                  onChange={(e) => setManifestCid(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleView();
                    }
                  }}
                />
                <Button onClick={handleView}>View</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a manifest CID to view its contents. You can find manifest CIDs in the 
                publish response or DHT stats.
              </p>
            </div>

            {/* Manifest Display */}
            {viewingCid && <ManifestViewer manifestCid={viewingCid} />}

            {!viewingCid && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Enter a manifest CID above to view its details</p>
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <ManifestStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
