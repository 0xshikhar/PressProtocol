"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Bookmark, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink,
  FileText,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { CidChip } from "@/components/protocol";

interface BookmarkItem {
  cid: string;
  title: string;
  tags: string[];
  savedAt: number;
  excerpt?: string;
}

interface UserProfile {
  walletAddress?: string;
  username?: string;
  createdAt?: number;
}

export default function ProfilePage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
    loadProfile();
  }, []);

  const loadProfile = () => {
    // Load profile from localStorage or session
    const savedProfile = localStorage.getItem("anonpress_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  };

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem("anonpress_bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        setBookmarks(parsed);
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      toast.error("Failed to load bookmarks");
    }
  };

  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    try {
      localStorage.setItem("anonpress_bookmarks", JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
      toast.error("Failed to save bookmarks");
    }
  };

  const removeBookmark = (cid: string) => {
    const updated = bookmarks.filter((b) => b.cid !== cid);
    saveBookmarks(updated);
    toast.success("Bookmark removed");
  };

  const exportBookmarks = () => {
    try {
      const dataStr = JSON.stringify(bookmarks, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `anonpress-bookmarks-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Bookmarks exported");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export bookmarks");
    }
  };

  const importBookmarks = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          throw new Error("Invalid bookmark file format");
        }

        // Merge with existing bookmarks (avoid duplicates)
        const existingCids = new Set(bookmarks.map((b) => b.cid));
        const newBookmarks = imported.filter(
          (b: BookmarkItem) => !existingCids.has(b.cid)
        );

        const merged = [...bookmarks, ...newBookmarks];
        saveBookmarks(merged);
        toast.success(`Imported ${newBookmarks.length} new bookmarks`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import bookmarks");
      }
    };
    input.click();
  };

  const clearAllBookmarks = () => {
    if (confirm("Are you sure you want to clear all bookmarks? This cannot be undone.")) {
      saveBookmarks([]);
      toast.success("All bookmarks cleared");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050508] text-neutral-400 container mx-auto px-4 py-8">Loading sovereign profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 shadow-lg">
              <User className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">Your Profile</h1>
              <p className="text-sm text-neutral-400 mt-1">
                {profile?.username || "Anonymous Sovereign Author"}
              </p>
              {profile?.walletAddress && (
                <p className="text-xs font-mono text-cyan-300 mt-1">
                  {profile.walletAddress.slice(0, 16)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
        {/* Profile Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-mono uppercase text-neutral-400">Total Bookmarks</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono text-white">{bookmarks.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-400 font-mono">
                Saved locally on this device
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-mono uppercase text-neutral-400">Tags Following</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono text-white">
                {new Set(bookmarks.flatMap((b) => b.tags)).size}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-400 font-mono">
                Unique tags in your bookmarks
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-mono uppercase text-neutral-400">Privacy Level</CardDescription>
              <CardTitle className="text-4xl font-bold font-mono text-emerald-400">100%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-400 font-mono">
                No tracking, fully anonymous
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info Card */}
        <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-sans font-bold text-white">
              <User className="h-5 w-5 text-cyan-400" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-neutral-400 text-xs">
              Your profile data is stored locally on your device for privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 p-4 rounded-xl text-xs leading-relaxed">
              <strong>Privacy First:</strong> PressProtocol doesn&apos;t track you. All your data
              (bookmarks, preferences, history) is stored locally in your browser. No
              server-side tracking, no analytics, no profiling.
            </div>
            
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-3">
                <span className="font-medium text-neutral-400">Status</span>
                <span className="col-span-2 flex items-center gap-2 text-neutral-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  Anonymous (Zero tracking)
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-3">
                <span className="font-medium text-neutral-400">Data Storage</span>
                <span className="col-span-2 text-neutral-200">Local (Browser storage only)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-3">
                <span className="font-medium text-neutral-400">Bookmarks</span>
                <span className="col-span-2 text-neutral-200 font-mono">{bookmarks.length} saved</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-3">
                <span className="font-medium text-neutral-400">Server Telemetry</span>
                <span className="col-span-2 text-emerald-400 font-mono font-medium">Disabled (0 packets) ✓</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <span className="font-medium text-neutral-400">Data Ownership</span>
                <span className="col-span-2 text-emerald-400 font-mono font-medium">You (100% Non-custodial) ✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks Section */}
        <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-sans font-bold text-white">
                  <Bookmark className="h-5 w-5 text-cyan-400" />
                  Saved Bookmarks ({bookmarks.length})
                </CardTitle>
                <CardDescription className="text-neutral-400 text-xs">
                  Bookmarks are saved locally in your browser
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={importBookmarks} className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs rounded-xl">
                  <Upload className="h-3.5 w-3.5 mr-2 text-cyan-400" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={exportBookmarks} className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 text-xs rounded-xl">
                  <Download className="h-3.5 w-3.5 mr-2 text-cyan-400" />
                  Export
                </Button>
                {bookmarks.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllBookmarks}
                    className="border-white/10 bg-white/[0.04] hover:bg-red-950/30 text-neutral-400 hover:text-red-400 text-xs rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-20 text-cyan-400" />
                <p className="mb-2 text-white font-medium">No bookmarks yet</p>
                <p className="text-xs text-neutral-400">
                  Start reading articles and bookmark them for offline preservation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <Card
                    key={bookmark.cid}
                    className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all cursor-pointer rounded-xl text-white"
                    onClick={() => {
                      window.location.href = `/read/${bookmark.cid}`;
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1.5">
                          <CardTitle className="text-base font-sans font-semibold text-white hover:text-cyan-300 transition-colors">
                            {bookmark.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <CidChip cid={bookmark.cid} />
                            <CardDescription className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                              <Clock className="h-3 w-3 text-cyan-400" />
                              Saved {formatTimestamp(bookmark.savedAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/read/${bookmark.cid}`, "_blank");
                            }}
                            className="text-neutral-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookmark(bookmark.cid);
                            }}
                            className="text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bookmark.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="border-white/10 bg-white/[0.04] text-cyan-300 font-mono text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    {bookmark.excerpt && (
                      <CardContent>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {bookmark.excerpt}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export/Import Info */}
        <Card className="border-white/10 bg-[#0B0D14] text-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-sans font-bold text-white">Data Portability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-neutral-400 leading-relaxed">
            <p>
              <strong className="text-white">Export your bookmarks:</strong> Download your bookmarks as a JSON
              file. This creates an offline sovereign backup you can preserve anywhere.
            </p>
            <p>
              <strong className="text-white">Import bookmarks:</strong> Upload a previously exported JSON file to
              restore your bookmarks. Works across devices and browser instances.
            </p>
            <p className="font-mono text-neutral-500">
              <strong className="text-neutral-400">Privacy Invariant:</strong> Your bookmark vault never leaves your local device
              unless you explicitly export it. Zero telemetry tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
