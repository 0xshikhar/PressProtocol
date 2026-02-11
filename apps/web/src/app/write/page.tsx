"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { EnhancedEditor } from "@/components/editor/EnhancedEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Loader2, Save, Eye } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { calculateReadingTime } from "@/lib/reading-time";

interface Draft {
  title: string;
  content: string;
  tags: string[];
  lastSaved: number;
}

const DRAFT_KEY = "anonpress_draft";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function WritePage() {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft: Draft = JSON.parse(savedDraft);
        setTitle(draft.title);
        setContent(draft.content);
        setTags(draft.tags);
        setLastSaved(draft.lastSaved);
        toast.success("Draft loaded from local storage");
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [title, content, tags]);

  const saveDraft = () => {
    setAutoSaving(true);
    try {
      const draft: Draft = {
        title,
        content,
        tags,
        lastSaved: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(Date.now());
      toast.success("Draft saved locally", { duration: 1500 });
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setAutoSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setContent("");
    setTags([]);
    setLastSaved(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    setIsPublishing(true);

    try {
      const walletAddress = user?.wallet?.address;

      const response = await apiClient.publishContent(
        {
          title: title.trim(),
          content,
          tags,
        },
        walletAddress
      );

      toast.success("Content published successfully!");

      // Clear draft after successful publish
      clearDraft();

      // Redirect to published content
      router.push(`/read/${response.cid}`);
    } catch (error) {
      console.error("Publishing error:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const readingStats = content ? calculateReadingTime(content) : null;

  const getLastSavedText = () => {
    if (!lastSaved) return null;

    const secondsAgo = Math.floor((Date.now() - lastSaved) / 1000);

    if (secondsAgo < 60) return "Saved just now";
    if (secondsAgo < 3600) return `Saved ${Math.floor(secondsAgo / 60)} min ago`;
    return `Saved ${Math.floor(secondsAgo / 3600)} hours ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Save status */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
              >
                ← Back
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {autoSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    {getLastSavedText()}
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Not saved
                  </>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {readingStats && (
                <span className="text-sm text-muted-foreground mr-2">
                  {readingStats.formattedTime} • {readingStats.words} words
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Edit" : "Preview"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={autoSaving || (!title && !content)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              {!authenticated ? (
                <Button size="sm" onClick={login}>
                  Connect to Publish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing || !title.trim() || !content.trim()}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {showPreview ? (
          // Preview Mode
          <div className="space-y-6">
            <h1 className="font-serif text-4xl font-bold">{title || "Untitled"}</h1>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="text-4xl font-bold border-0 px-0 font-serif placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-sm text-muted-foreground">
                Tags (optional)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Editor */}
            <EnhancedEditor
              content={content}
              onChange={setContent}
              placeholder="Tell your story..."
            />

            {/* Tips */}
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
              <p className="font-medium mb-2">💡 Writing Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your draft auto-saves every 30 seconds to your browser</li>
                <li>Images are uploaded to IPFS for permanent storage</li>
                <li>Published content is immutable and censorship-resistant</li>
                <li>You can publish anonymously (no wallet needed)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
