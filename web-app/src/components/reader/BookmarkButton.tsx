"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  cid: string;
  title: string;
  tags: string[];
  excerpt?: string;
}

export function BookmarkButton({ cid, title, tags, excerpt }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookmarked(isBookmarked(cid));
    setLoading(false);
  }, [cid]);

  const handleToggle = () => {
    try {
      const added = toggleBookmark({ cid, title, tags, excerpt });
      setBookmarked(added);
      
      if (added) {
        toast.success("Bookmark added");
      } else {
        toast.success("Bookmark removed");
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
      className="gap-2"
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
