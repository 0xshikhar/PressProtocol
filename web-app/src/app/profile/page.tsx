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
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Your Profile</h1>
              <p className="text-muted-foreground">
                {profile?.username || "Anonymous User"}
              </p>
              {profile?.walletAddress && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {profile.walletAddress.slice(0, 16)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your profile data is stored locally on your device for privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>Privacy First:</strong> AnonPress doesn't track you. All your data
                (bookmarks, preferences, history) is stored locally in your browser. No
                server-side tracking, no analytics, no profiling.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Bookmarks Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Saved Bookmarks ({bookmarks.length})
                </CardTitle>
                <CardDescription>
                  Bookmarks are saved locally in your browser
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={importBookmarks}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={exportBookmarks}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {bookmarks.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllBookmarks}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="mb-2">No bookmarks yet</p>
                <p className="text-sm">
                  Start reading articles and bookmark them for later
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bookmark) => (
                  <Card
                    key={bookmark.cid}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      window.location.href = `/read/${bookmark.cid}`;
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg hover:text-primary transition-colors">
                            {bookmark.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3" />
                            Saved {formatTimestamp(bookmark.savedAt)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/read/${bookmark.cid}`, "_blank");
                            }}
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
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bookmark.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    {bookmark.excerpt && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Portability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Export your bookmarks:</strong> Download your bookmarks as a JSON
              file. This creates a backup you can save anywhere.
            </p>
            <p>
              <strong>Import bookmarks:</strong> Upload a previously exported JSON file to
              restore your bookmarks. Works across devices and browsers.
            </p>
            <p>
              <strong>Privacy Note:</strong> Your bookmark file never leaves your device
              unless you explicitly export it. We never see your bookmarks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
