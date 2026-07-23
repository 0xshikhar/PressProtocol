import fs from "fs";
import path from "path";
import type { PressProtocolManifest, PublishResultItem } from "./types.js";

const CURRENT_MANIFEST_VERSION = "1.0.0";
const GENERATOR_TAG = "pressprotocol/publish-action@v1";

/**
 * Loads and parses an existing publication manifest if present on disk.
 */
export function loadManifest(manifestPath: string): PressProtocolManifest | null {
  const resolved = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(resolved)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(resolved, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.articles)) {
      return parsed as PressProtocolManifest;
    }
  } catch (err: any) {
    console.warn(`⚠️ Warning: Existing manifest at ${manifestPath} could not be parsed: ${err.message}`);
  }

  return null;
}

/**
 * Saves the publication manifest to disk with pretty formatting.
 */
export function saveManifest(manifestPath: string, manifest: PressProtocolManifest): void {
  const resolved = path.resolve(process.cwd(), manifestPath);
  const dir = path.dirname(resolved);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(resolved, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

/**
 * Merges newly published or updated articles into an existing or new publication manifest.
 * Preserves historical posts and updates existing entries by filePath/slug.
 */
export function mergeArticlesIntoManifest(
  existing: PressProtocolManifest | null,
  newArticles: PublishResultItem[],
  metadata: {
    author: string;
    publicKey: string;
    repository?: string;
  }
): PressProtocolManifest {
  const articlesMap = new Map<string, PublishResultItem>();

  // 1. Seed with existing articles
  if (existing && Array.isArray(existing.articles)) {
    for (const art of existing.articles) {
      const key = art.filePath || art.slug;
      articlesMap.set(key, art);
    }
  }

  // 2. Upsert new/modified articles
  for (const art of newArticles) {
    const key = art.filePath || art.slug;
    articlesMap.set(key, art);
  }

  // 3. Sort articles deterministically by date descending
  const mergedArticles = Array.from(articlesMap.values()).sort((a, b) => {
    const dateA = new Date(a.date || a.publishedAt).getTime() || 0;
    const dateB = new Date(b.date || b.publishedAt).getTime() || 0;
    return dateB - dateA;
  });

  return {
    manifestVersion: CURRENT_MANIFEST_VERSION,
    generator: GENERATOR_TAG,
    updatedAt: new Date().toISOString(),
    publicKey: metadata.publicKey,
    author: metadata.author,
    repository: metadata.repository || existing?.repository,
    totalArticles: mergedArticles.length,
    articles: mergedArticles,
  };
}
