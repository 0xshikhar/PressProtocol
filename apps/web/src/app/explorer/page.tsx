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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <FileText className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">Manifest Explorer</h1>
              <p className="text-sm text-neutral-400 mt-1">
                View content manifests and DHT cache statistics across distributed swarms
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="viewer" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#0B0D14] border border-white/10 p-1 text-neutral-400">
            <TabsTrigger value="viewer" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/40">
              <FileText className="h-4 w-4" />
              Manifest Viewer
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/40">
              <BarChart3 className="h-4 w-4" />
              DHT Stats
            </TabsTrigger>
          </TabsList>

          {/* Manifest Viewer Tab */}
          <TabsContent value="viewer" className="space-y-6">
            {/* Search Input */}
            <div className="max-w-2xl space-y-2">
              <label className="text-sm font-medium text-neutral-300">Enter Manifest CID</label>
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
                  className="bg-[#0B0D14] border-white/10 text-white placeholder:text-neutral-500 rounded-xl focus-visible:ring-cyan-500/30 focus-visible:border-cyan-500/50"
                />
                <Button onClick={handleView} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl px-6">View</Button>
              </div>
              <p className="text-xs text-neutral-500">
                Enter a manifest CID to view its contents. You can find manifest CIDs in the 
                publish response or DHT stats.
              </p>
            </div>

            {/* Manifest Display */}
            {viewingCid && <ManifestViewer manifestCid={viewingCid} />}

            {!viewingCid && (
              <div className="text-center py-16 border border-white/10 rounded-2xl bg-[#0B0D14]/40 text-neutral-400">
                <FileText className="h-14 w-14 mx-auto mb-3 opacity-20 text-cyan-400" />
                <p className="text-sm">Enter a manifest CID above to inspect cryptographic provenance and IPFS mirrors</p>
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
