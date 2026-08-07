"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Check, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { saveArticleOffline, removeOfflineArticle, classifySourceRail } from "@/lib/offline-storage";

interface BookmarkButtonProps {
  cid: string;
  title: string;
  tags: string[];
  excerpt?: string;
  content?: string;
  author?: string;
  signature?: string;
  publicKey?: string;
  mirrors?: any;
  className?: string;
}

export function BookmarkButton({
  cid,
  title,
  tags,
  excerpt,
  content,
  author,
  signature,
  publicKey,
  mirrors,
  className,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookmarked(isBookmarked(cid));
    setLoading(false);
  }, [cid]);

  const handleToggle = async () => {
    try {
      if (bookmarked) {
        await removeOfflineArticle(cid);
        toggleBookmark({ cid, title, tags, excerpt });
        setBookmarked(false);
        toast.success("Removed from offline reading vault");
      } else {
        const words = (content || excerpt || "").split(/\s+/).filter(Boolean).length || 50;
        const readTime = Math.max(1, Math.ceil(words / 200));

        await saveArticleOffline({
          cid,
          title,
          content: content || `<p>${excerpt || title}</p>`,
          tags,
          author: author || "Sovereign Author",
          createdAt: new Date().toISOString(),
          savedAt: Date.now(),
          wordCount: words,
          readingTimeMinutes: readTime,
          excerpt,
          mirrors,
          publicKey,
          signature,
          sourceRail: classifySourceRail(tags, content),
          isVerified: !!(signature && publicKey && signature !== "unsigned"),
        });

        toggleBookmark({ cid, title, tags, excerpt, content, author });
        setBookmarked(true);
        toast.success("Preserved in offline vault — read anytime without internet!");
      }
    } catch (error: any) {
      console.error("Bookmark error:", error);
      toast.error(error.message || "Failed to toggle bookmark");
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={`gap-2 ${
        bookmarked
          ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500 font-semibold shadow-sm"
          : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
      } ${className || ""}`}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      <span>{bookmarked ? "Saved for Offline" : "Save for Offline"}</span>
    </Button>
  );
}
