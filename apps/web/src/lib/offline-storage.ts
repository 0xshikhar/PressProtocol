/**
 * PressProtocol Offline-First Storage Engine
 * Zero-telemetry, client-side storage for articles and bookmarks.
 * Uses browser IndexedDB with automatic localStorage fallback.
 * Strictly local to the user's browser; zero server-side telemetry.
 */

export interface OfflineArticle {
  cid: string;
  title: string;
  content: string; // Full semantic HTML body
  tags: string[];
  author?: string;
  publicKey?: string;
  signature?: string;
  createdAt: string;
  savedAt: number;
  mirrors?: {
    ipfs?: { url: string; available?: boolean };
    tor?: { url: string; available?: boolean };
    gateway?: { url: string; available?: boolean };
  };
  wordCount: number;
  readingTimeMinutes: number;
  excerpt?: string;
  sourceRail: "Studio" | "Notion" | "Substack/RSS" | "WordPress" | "Web Clipper" | "Git SSG" | "Community";
  isVerified: boolean;
  walletAddress?: string;
}

export interface OfflineVaultBackup {
  version: "1.0.0";
  exportedAt: string;
  totalArticles: number;
  articles: OfflineArticle[];
}

export interface StorageMetrics {
  count: number;
  totalBytes: number;
  formattedSize: string;
  totalReadTimeMinutes: number;
}

const DB_NAME = "pressprotocol_vault";
const DB_VERSION = 1;
const STORE_NAME = "articles";
const LOCAL_STORAGE_FALLBACK_KEY = "pressprotocol_offline_vault";

/**
 * Classifies the publication rail based on tags and metadata.
 */
export function classifySourceRail(tags: string[] = [], content: string = ""): OfflineArticle["sourceRail"] {
  const normalizedTags = tags.map((t) => t.toLowerCase());

  if (normalizedTags.includes("notion") || normalizedTags.includes("notion-import")) {
    return "Notion";
  }
  if (
    normalizedTags.includes("rss") ||
    normalizedTags.includes("substack") ||
    normalizedTags.includes("medium") ||
    normalizedTags.includes("feed-archive")
  ) {
    return "Substack/RSS";
  }
  if (normalizedTags.includes("wordpress") || normalizedTags.includes("wp-plugin")) {
    return "WordPress";
  }
  if (normalizedTags.includes("web-clipper") || normalizedTags.includes("browser-extension")) {
    return "Web Clipper";
  }
  if (normalizedTags.includes("git-publish") || normalizedTags.includes("publish-action") || normalizedTags.includes("github-action")) {
    return "Git SSG";
  }
  if (normalizedTags.includes("studio") || normalizedTags.includes("sovereign-studio")) {
    return "Studio";
  }

  // Content heuristics
  if (content.includes('data-type="callout"')) {
    return "Studio";
  }

  return "Community";
}

/**
 * Opens or initializes the IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available in current environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "cid" });
        store.createIndex("savedAt", "savedAt", { unique: false });
        store.createIndex("sourceRail", "sourceRail", { unique: false });
        store.createIndex("isVerified", "isVerified", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates an article in offline storage (IndexedDB + localStorage backup).
 */
export async function saveArticleOffline(article: OfflineArticle): Promise<void> {
  // Ensure timestamp and calculated fields
  const prepared: OfflineArticle = {
    ...article,
    savedAt: article.savedAt || Date.now(),
    sourceRail: article.sourceRail || classifySourceRail(article.tags, article.content),
    isVerified: !!(article.signature && article.publicKey && article.signature !== "unsigned"),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(prepared);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    // Fallback to localStorage
    saveToLocalStorageFallback(prepared);
    return;
  }

  // Also sync lightweight index into localStorage for synchronous UI badge checks
  syncLightweightIndex(prepared);
}

/**
 * Retrieves a single offline article by CID.
 */
export async function getOfflineArticle(cid: string): Promise<OfflineArticle | null> {
  if (!cid) return null;

  try {
    const db = await openDatabase();
    return await new Promise<OfflineArticle | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
    return getFromLocalStorageFallback(cid);
  }
}

/**
 * Retrieves all offline articles sorted chronologically by savedAt descending.
 */
export async function getAllOfflineArticles(): Promise<OfflineArticle[]> {
  try {
    const db = await openDatabase();
    const articles = await new Promise<OfflineArticle[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    return articles.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return getAllFromLocalStorageFallback();
  }
}

/**
 * Removes an article from offline storage.
 */
export async function removeOfflineArticle(cid: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cid);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }

  removeFromLocalStorageFallback(cid);
}

/**
 * Quick synchronous check if an article CID is bookmarked / saved locally.
 */
export function isArticleOfflineSync(cid: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_FALLBACK_KEY}_index`);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      return list.includes(cid);
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Asynchronous check if an article is available offline.
 */
export async function isArticleOffline(cid: string): Promise<boolean> {
  const article = await getOfflineArticle(cid);
  return article !== null;
}

/**
 * Exports entire local vault as a portable .pressproof-vault.json bundle.
 */
export async function exportOfflineVault(): Promise<string> {
  const articles = await getAllOfflineArticles();
  const backup: OfflineVaultBackup = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    totalArticles: articles.length,
    articles,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Restores articles into offline vault from JSON backup.
 */
export async function importOfflineVault(jsonString: string): Promise<{ imported: number; updated: number }> {
  const parsed = JSON.parse(jsonString);
  const articles: OfflineArticle[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.articles)
    ? parsed.articles
    : [];

  if (articles.length === 0) {
    throw new Error("No valid articles found in vault backup file");
  }

  let imported = 0;
  let updated = 0;

  for (const art of articles) {
    if (!art.cid || !art.title) continue;
    const exists = await isArticleOffline(art.cid);
    await saveArticleOffline(art);
    if (exists) {
      updated++;
    } else {
      imported++;
    }
  }

  return { imported, updated };
}

/**
 * Clears all cached offline articles.
 */
export async function clearOfflineVault(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_FALLBACK_KEY);
    localStorage.removeItem(`${LOCAL_STORAGE_FALLBACK_KEY}_index`);
  }
}

/**
 * Calculates storage consumption and aggregate read time.
 */
export async function getOfflineStorageMetrics(): Promise<StorageMetrics> {
  const articles = await getAllOfflineArticles();
  let totalBytes = 0;
  let totalReadTimeMinutes = 0;

  for (const a of articles) {
    totalBytes += Buffer.byteLength(JSON.stringify(a), "utf8");
    totalReadTimeMinutes += a.readingTimeMinutes || 1;
  }

  let formattedSize = `${(totalBytes / 1024).toFixed(1)} KB`;
  if (totalBytes > 1024 * 1024) {
    formattedSize = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return {
    count: articles.length,
    totalBytes,
    formattedSize,
    totalReadTimeMinutes,
  };
}

// ----------------------------------------------------------------------------
// LocalStorage Fallback Helpers
// ----------------------------------------------------------------------------

function saveToLocalStorageFallback(article: OfflineArticle): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getAllFromLocalStorageFallback();
    const filtered = existing.filter((a) => a.cid !== article.cid);
    filtered.unshift(article);
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(filtered));
    syncLightweightIndex(article);
  } catch (err) {
    console.warn("localStorage fallback write failed:", err);
  }
}

function getFromLocalStorageFallback(cid: string): OfflineArticle | null {
  if (typeof window === "undefined") return null;
  try {
    const articles = getAllFromLocalStorageFallback();
    return articles.find((a) => a.cid === cid) || null;
  } catch {
    return null;
  }
}

function getAllFromLocalStorageFallback(): OfflineArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function removeFromLocalStorageFallback(cid: string): void {
  if (typeof window === "undefined") return;
  try {
    const articles = getAllFromLocalStorageFallback().filter((a) => a.cid !== cid);
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(articles));

    const indexRaw = localStorage.getItem(`${LOCAL_STORAGE_FALLBACK_KEY}_index`);
    if (indexRaw) {
      const idx: string[] = JSON.parse(indexRaw);
      localStorage.setItem(
        `${LOCAL_STORAGE_FALLBACK_KEY}_index`,
        JSON.stringify(idx.filter((id) => id !== cid))
      );
    }
  } catch {
    // ignore
  }
}

function syncLightweightIndex(article: OfflineArticle): void {
  if (typeof window === "undefined") return;
  try {
    const indexRaw = localStorage.getItem(`${LOCAL_STORAGE_FALLBACK_KEY}_index`);
    let idx: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!idx.includes(article.cid)) {
      idx.unshift(article.cid);
      localStorage.setItem(`${LOCAL_STORAGE_FALLBACK_KEY}_index`, JSON.stringify(idx));
    }
  } catch {
    // ignore
  }
}
