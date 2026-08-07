/**
 * Bookmark Management & Offline Integration
 * 
 * Privacy-first bookmark system:
 * - All data stored locally in browser
 * - Zero server-side telemetry or tracking
 * - Backed by both IndexedDB offline cache and localStorage
 * - Exportable/importable for data portability
 */

import {
  saveArticleOffline,
  removeOfflineArticle,
  isArticleOfflineSync,
  classifySourceRail,
  type OfflineArticle,
} from "./offline-storage";

export interface BookmarkItem {
  cid: string;
  title: string;
  tags: string[];
  savedAt: number;
  excerpt?: string;
  author?: string;
  content?: string;
  sourceRail?: string;
  isVerified?: boolean;
}

const STORAGE_KEY = "anonpress_bookmarks";

/**
 * Get all bookmarks from localStorage (synchronous)
 */
export function getBookmarks(): BookmarkItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load bookmarks:", error);
  }

  return [];
}

/**
 * Check if a CID is bookmarked
 */
export function isBookmarked(cid: string): boolean {
  if (!cid) return false;
  if (isArticleOfflineSync(cid)) return true;
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.cid === cid);
}

/**
 * Add a bookmark and persist to offline storage
 */
export function addBookmark(bookmark: Omit<BookmarkItem, "savedAt">): void {
  const bookmarks = getBookmarks();
  
  if (bookmarks.some((b) => b.cid === bookmark.cid)) {
    throw new Error("Already bookmarked");
  }

  const newBookmark: BookmarkItem = {
    ...bookmark,
    savedAt: Date.now(),
  };

  bookmarks.unshift(newBookmark);
  saveBookmarks(bookmarks);

  // Sync to offline database in background
  if (typeof window !== "undefined") {
    const offlineItem: OfflineArticle = {
      cid: bookmark.cid,
      title: bookmark.title,
      content: bookmark.content || `<p>${bookmark.excerpt || bookmark.title}</p>`,
      tags: bookmark.tags || [],
      author: bookmark.author || "Sovereign Author",
      createdAt: new Date().toISOString(),
      savedAt: Date.now(),
      wordCount: (bookmark.content || bookmark.excerpt || "").split(/\s+/).filter(Boolean).length || 50,
      readingTimeMinutes: Math.max(1, Math.ceil(((bookmark.content || "").split(/\s+/).length || 50) / 200)),
      excerpt: bookmark.excerpt,
      sourceRail: (bookmark.sourceRail as any) || classifySourceRail(bookmark.tags || []),
      isVerified: bookmark.isVerified ?? false,
    };
    saveArticleOffline(offlineItem).catch(() => {});
  }
}

/**
 * Remove a bookmark
 */
export function removeBookmark(cid: string): void {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => b.cid !== cid);
  saveBookmarks(filtered);

  if (typeof window !== "undefined") {
    removeOfflineArticle(cid).catch(() => {});
  }
}

/**
 * Toggle bookmark
 */
export function toggleBookmark(bookmark: Omit<BookmarkItem, "savedAt">): boolean {
  if (isBookmarked(bookmark.cid)) {
    removeBookmark(bookmark.cid);
    return false; // Removed
  } else {
    addBookmark(bookmark);
    return true; // Added
  }
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(bookmarks: BookmarkItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error("Failed to save bookmarks:", error);
    throw new Error("Failed to save bookmarks");
  }
}

/**
 * Export bookmarks as JSON
 */
export function exportBookmarks(): string {
  const bookmarks = getBookmarks();
  return JSON.stringify(bookmarks, null, 2);
}

/**
 * Import bookmarks from JSON
 */
export function importBookmarks(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error("Invalid format: expected array");
    }

    for (const item of imported) {
      if (!item.cid || !item.title) {
        throw new Error("Invalid bookmark structure");
      }
    }

    const existing = getBookmarks();
    const existingCids = new Set(existing.map((b) => b.cid));
    const newBookmarks = imported.filter(
      (b: BookmarkItem) => !existingCids.has(b.cid)
    );

    const merged = [...existing, ...newBookmarks];
    saveBookmarks(merged);

    // Sync to offline database in background
    for (const b of newBookmarks) {
      saveArticleOffline({
        cid: b.cid,
        title: b.title,
        content: b.content || `<p>${b.excerpt || b.title}</p>`,
        tags: b.tags || [],
        author: b.author || "Sovereign Author",
        createdAt: new Date().toISOString(),
        savedAt: b.savedAt || Date.now(),
        wordCount: 100,
        readingTimeMinutes: 1,
        excerpt: b.excerpt,
        sourceRail: classifySourceRail(b.tags || []),
        isVerified: false,
      }).catch(() => {});
    }

    return newBookmarks.length;
  } catch (error) {
    console.error("Import failed:", error);
    throw new Error("Failed to import bookmarks");
  }
}

/**
 * Clear all bookmarks
 */
export function clearAllBookmarks(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get bookmarks count
 */
export function getBookmarkCount(): number {
  return getBookmarks().length;
}

export * from "./offline-storage";
