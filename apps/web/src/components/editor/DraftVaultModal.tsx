"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAllDrafts,
  getActiveDraftId,
  setActiveDraftId,
  createDraft,
  deleteDraft,
  getDraftSnapshots,
  restoreDraftSnapshot,
  createSnapshot,
  type DraftItem,
  type DraftSnapshot,
} from "@/lib/draft-vault";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  RotateCcw,
  Search,
  History,
  Archive,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface DraftVaultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDraftId: string | null;
  onSelectDraft: (draft: DraftItem) => void;
  onNewDraft: () => void;
  currentTitle: string;
  currentContent: string;
}

export function DraftVaultModal({
  open,
  onOpenChange,
  currentDraftId,
  onSelectDraft,
  onNewDraft,
  currentTitle,
  currentContent,
}: DraftVaultModalProps) {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "history">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DraftSnapshot | null>(null);

  const refreshDrafts = () => {
    const list = getAllDrafts();
    setDrafts(list);
    if (currentDraftId) {
      setSnapshots(getDraftSnapshots(currentDraftId));
    }
  };

  useEffect(() => {
    if (open) {
      refreshDrafts();
    }
  }, [open, currentDraftId]);

  const filteredDrafts = drafts.filter((d) => {
    const query = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(query) ||
      d.tags.some((t) => t.toLowerCase().includes(query)) ||
      d.content.toLowerCase().includes(query)
    );
  });

  const handleSelect = (draft: DraftItem) => {
    setActiveDraftId(draft.id);
    onSelectDraft(draft);
    onOpenChange(false);
    toast.success(`Loaded draft: ${draft.title || "Untitled"}`);
  };

  const handleCreateNew = () => {
    const newDraft = createDraft();
    refreshDrafts();
    setActiveDraftId(newDraft.id);
    onSelectDraft(newDraft);
    onOpenChange(false);
    toast.success("Created new blank article draft");
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Permanently delete "${title || "Untitled Article"}"?`)) {
      deleteDraft(id);
      refreshDrafts();
      toast.success("Draft deleted from local vault");
    }
  };

  const handleManualSnapshot = () => {
    if (!currentDraftId) return;
    const snap = createSnapshot(currentDraftId, currentTitle, currentContent, true);
    if (snap) {
      setSnapshots(getDraftSnapshots(currentDraftId));
      toast.success("Created revision checkpoint");
    }
  };

  const handleRestore = (snapshot: DraftSnapshot) => {
    if (!currentDraftId) return;
    if (
      confirm(
        `Restore article to version from ${new Date(
          snapshot.timestamp
        ).toLocaleTimeString()}? Current unsaved edits will be saved as a recovery snapshot.`
      )
    ) {
      const restored = restoreDraftSnapshot(currentDraftId, snapshot.id);
      if (restored) {
        refreshDrafts();
        const updatedDraft = getAllDrafts().find((d) => d.id === currentDraftId);
        if (updatedDraft) {
          onSelectDraft(updatedDraft);
        }
        onOpenChange(false);
        toast.success("Restored earlier snapshot successfully");
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  Offline Draft Vault
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Decentralized local persistence • Zero telemetry • Real-time version history
                </DialogDescription>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleCreateNew}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              New Article
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 py-2.5 bg-muted/20 border-b border-border/40 flex items-center justify-between">
            <TabsList className="bg-muted/40 h-8">
              <TabsTrigger value="library" className="text-xs px-3 gap-1.5 h-7">
                <FileText className="h-3.5 w-3.5" />
                Drafts ({drafts.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs px-3 gap-1.5 h-7"
                disabled={!currentDraftId}
              >
                <History className="h-3.5 w-3.5" />
                Version History ({snapshots.length})
              </TabsTrigger>
            </TabsList>

            {activeTab === "library" && (
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter articles & tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background/50"
                />
              </div>
            )}

            {activeTab === "history" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSnapshot}
                className="h-7 text-xs gap-1.5 font-mono"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                Take Snapshot
              </Button>
            )}
          </div>

          {/* TAB 1: DRAFTS LIBRARY */}
          <TabsContent
            value="library"
            className="flex-1 overflow-y-auto p-6 space-y-3 m-0"
          >
            {filteredDrafts.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-3">
                <FileText className="h-10 w-10 mx-auto stroke-1 text-muted-foreground/50" />
                <div className="text-sm font-medium">No drafts found in vault</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Articles you write are securely preserved offline on this device without tracking.
                </p>
                <Button size="sm" variant="outline" onClick={handleCreateNew} className="text-xs">
                  Create First Article
                </Button>
              </div>
            ) : (
              filteredDrafts.map((draft) => {
                const isActive = draft.id === currentDraftId;
                return (
                  <div
                    key={draft.id}
                    onClick={() => handleSelect(draft)}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-card hover:bg-muted/40 border-border/40 hover:border-border/80"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {draft.title || "Untitled Article"}
                        </span>
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary text-[10px] font-mono py-0 h-4 border-primary/20"
                          >
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(draft.updatedAt)}
                        </span>
                        <span>•</span>
                        <span>{draft.wordCount} words</span>
                        {draft.tags && draft.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1 overflow-hidden">
                              {draft.tags.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleDelete(e, draft.id, draft.title)}
                        title="Delete draft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* TAB 2: VERSION HISTORY SNAPSHOTS */}
          <TabsContent
            value="history"
            className="flex-1 overflow-y-auto p-6 m-0 space-y-4"
          >
            {snapshots.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-3">
                <History className="h-10 w-10 mx-auto stroke-1 text-muted-foreground/50" />
                <div className="text-sm font-medium">No snapshots yet for this draft</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Automatic checkpoints are captured every 5 minutes when you make significant changes.
                </p>
                <Button size="sm" variant="outline" onClick={handleManualSnapshot} className="text-xs">
                  Create First Checkpoint
                </Button>
              </div>
            ) : (
              <div className="relative border-l border-border/60 ml-4 pl-6 space-y-6">
                {snapshots.map((snap, idx) => (
                  <div key={snap.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background transition-colors ${
                        idx === 0
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 group-hover:border-primary"
                      }`}
                    />

                    <div className="p-4 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/30 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            {snap.title || "Untitled Article"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(snap.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono">{snap.wordCount} words</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(snap)}
                          className="h-7 text-xs gap-1 font-medium hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </Button>
                      </div>

                      {snap.contentSnippet && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 font-serif italic bg-muted/20 p-2 rounded">
                          &ldquo;{snap.contentSnippet}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
