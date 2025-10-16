/**
 * Bookmark Management (Local Storage)
 * 
 * Privacy-first bookmark system:
 * - All data stored locally in browser
 * - No server-side tracking
 * - Exportable/importable for data portability
 */

export interface BookmarkItem {
  cid: string;
  title: string;
  tags: string[];
  savedAt: number;
  excerpt?: string;
}

const STORAGE_KEY = "anonpress_bookmarks";

/**
 * Get all bookmarks
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
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.cid === cid);
}

/**
 * Add a bookmark
 */
export function addBookmark(bookmark: Omit<BookmarkItem, "savedAt">): void {
  const bookmarks = getBookmarks();
  
  // Check if already bookmarked
  if (bookmarks.some((b) => b.cid === bookmark.cid)) {
    throw new Error("Already bookmarked");
  }

  const newBookmark: BookmarkItem = {
    ...bookmark,
    savedAt: Date.now(),
  };

  bookmarks.unshift(newBookmark); // Add to beginning
  saveBookmarks(bookmarks);
}

/**
 * Remove a bookmark
 */
export function removeBookmark(cid: string): void {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => b.cid !== cid);
  saveBookmarks(filtered);
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

    // Validate bookmark structure
    for (const item of imported) {
      if (!item.cid || !item.title) {
        throw new Error("Invalid bookmark structure");
      }
    }

    // Merge with existing (avoid duplicates)
    const existing = getBookmarks();
    const existingCids = new Set(existing.map((b) => b.cid));
    const newBookmarks = imported.filter(
      (b: BookmarkItem) => !existingCids.has(b.cid)
    );

    const merged = [...existing, ...newBookmarks];
    saveBookmarks(merged);

    return newBookmarks.length; // Return count of new bookmarks
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
