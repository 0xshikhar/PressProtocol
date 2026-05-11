/**
 * Offline-First Multi-Draft Vault & Version History Snapshot Engine
 * 
 * Provides resilient, zero-telemetry local persistence for drafts and revisions.
 * Authors can maintain multiple articles concurrently and restore historic snapshots.
 */

export interface DraftItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

export interface DraftSnapshot {
  id: string;
  draftId: string;
  timestamp: number;
  title: string;
  contentSnippet: string;
  wordCount: number;
  content: string;
}

const VAULT_KEY = "pressprotocol_draft_vault_v1";
const ACTIVE_DRAFT_KEY = "pressprotocol_active_draft_id";
const SNAPSHOTS_KEY_PREFIX = "pressprotocol_snapshots_";
const LEGACY_DRAFT_KEY = "anonpress_draft";

const MAX_SNAPSHOTS_PER_DRAFT = 25;
const MIN_SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between auto-snapshots

function computeWordCount(text: string): number {
  if (!text) return 0;
  // Strip HTML tags for accurate word count
  const clean = text.replace(/<[^>]*>/g, " ").trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Migrate single legacy draft if it exists and vault is empty
 */
function checkLegacyMigration(): DraftItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawLegacy = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!rawLegacy) return [];

    const legacy = JSON.parse(rawLegacy);
    if (legacy.title || legacy.content) {
      const migratedDraft: DraftItem = {
        id: generateId(),
        title: legacy.title || "Untitled Draft",
        content: legacy.content || "",
        tags: Array.isArray(legacy.tags) ? legacy.tags : [],
        createdAt: legacy.lastSaved || Date.now(),
        updatedAt: legacy.lastSaved || Date.now(),
        wordCount: computeWordCount(legacy.content || ""),
      };

      const drafts = [migratedDraft];
      localStorage.setItem(VAULT_KEY, JSON.stringify(drafts));
      localStorage.setItem(ACTIVE_DRAFT_KEY, migratedDraft.id);
      return drafts;
    }
  } catch (err) {
    console.error("Failed to migrate legacy draft:", err);
  }

  return [];
}

/**
 * Retrieve all drafts from the local vault
 */
export function getAllDrafts(): DraftItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) {
      return checkLegacyMigration();
    }

    const drafts: DraftItem[] = JSON.parse(raw);
    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error("Failed to read draft vault:", err);
    return [];
  }
}

/**
 * Get active draft ID
 */
export function getActiveDraftId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_DRAFT_KEY);
}

/**
 * Set active draft ID
 */
export function setActiveDraftId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_DRAFT_KEY, id);
}

/**
 * Get a specific draft by ID
 */
export function getDraft(id: string): DraftItem | null {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Create a new draft in the vault
 */
export function createDraft(
  title: string = "",
  content: string = "",
  tags: string[] = []
): DraftItem {
  const drafts = getAllDrafts();
  const newDraft: DraftItem = {
    id: generateId(),
    title: title || "Untitled Article",
    content: content || "",
    tags: tags || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: computeWordCount(content || ""),
  };

  drafts.unshift(newDraft);
  if (typeof window !== "undefined") {
    localStorage.setItem(VAULT_KEY, JSON.stringify(drafts));
    localStorage.setItem(ACTIVE_DRAFT_KEY, newDraft.id);
  }

  // Create initial snapshot
  createSnapshot(newDraft.id, newDraft.title, newDraft.content, true);

  return newDraft;
}

/**
 * Save / Update a draft in the vault
 */
export function saveDraft(
  id: string,
  updates: Partial<Omit<DraftItem, "id" | "createdAt">>
): DraftItem {
  const drafts = getAllDrafts();
  const index = drafts.findIndex((d) => d.id === id);

  const wordCount = updates.content !== undefined ? computeWordCount(updates.content) : 0;

  if (index === -1) {
    // If not found, create it with this id
    const newDraft: DraftItem = {
      id,
      title: updates.title || "Untitled Article",
      content: updates.content || "",
      tags: updates.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount,
    };
    drafts.unshift(newDraft);
    if (typeof window !== "undefined") {
      localStorage.setItem(VAULT_KEY, JSON.stringify(drafts));
      localStorage.setItem(ACTIVE_DRAFT_KEY, id);
    }
    createSnapshot(id, newDraft.title, newDraft.content, true);
    return newDraft;
  }

  const existing = drafts[index];
  const updated: DraftItem = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
    wordCount: updates.content !== undefined ? wordCount : existing.wordCount,
  };

  drafts[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(VAULT_KEY, JSON.stringify(drafts));
  }

  // Check if we should automatically create a snapshot
  maybeCreateAutoSnapshot(updated);

  return updated;
}

/**
 * Delete a draft and its snapshots
 */
export function deleteDraft(id: string): void {
  const drafts = getAllDrafts().filter((d) => d.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(VAULT_KEY, JSON.stringify(drafts));
    localStorage.removeItem(`${SNAPSHOTS_KEY_PREFIX}${id}`);

    // If active was deleted, point to next or clear
    if (getActiveDraftId() === id) {
      if (drafts.length > 0) {
        localStorage.setItem(ACTIVE_DRAFT_KEY, drafts[0].id);
      } else {
        localStorage.removeItem(ACTIVE_DRAFT_KEY);
      }
    }
  }
}

/**
 * Get snapshots for a given draft
 */
export function getDraftSnapshots(draftId: string): DraftSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(`${SNAPSHOTS_KEY_PREFIX}${draftId}`);
    if (!raw) return [];
    const snapshots: DraftSnapshot[] = JSON.parse(raw);
    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error("Failed to read draft snapshots:", err);
    return [];
  }
}

/**
 * Create a new snapshot for version history
 */
export function createSnapshot(
  draftId: string,
  title: string,
  content: string,
  force: boolean = false
): DraftSnapshot | null {
  if (typeof window === "undefined") return null;

  const snapshots = getDraftSnapshots(draftId);
  const now = Date.now();

  // If not forced, enforce minimum interval
  if (!force && snapshots.length > 0) {
    const latest = snapshots[0];
    if (now - latest.timestamp < MIN_SNAPSHOT_INTERVAL_MS) {
      return null;
    }
    // Also avoid duplicate identical snapshots
    if (latest.content === content && latest.title === title) {
      return null;
    }
  }

  const cleanText = content.replace(/<[^>]*>/g, " ").trim();
  const contentSnippet = cleanText.substring(0, 140) + (cleanText.length > 140 ? "..." : "");

  const newSnapshot: DraftSnapshot = {
    id: generateId(),
    draftId,
    timestamp: now,
    title: title || "Untitled Version",
    contentSnippet,
    wordCount: computeWordCount(content),
    content,
  };

  const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, MAX_SNAPSHOTS_PER_DRAFT);
  localStorage.setItem(`${SNAPSHOTS_KEY_PREFIX}${draftId}`, JSON.stringify(updatedSnapshots));

  return newSnapshot;
}

/**
 * Conditionally create a snapshot on significant edits or interval
 */
function maybeCreateAutoSnapshot(draft: DraftItem): void {
  const snapshots = getDraftSnapshots(draft.id);
  if (snapshots.length === 0) {
    createSnapshot(draft.id, draft.title, draft.content, true);
    return;
  }

  const latest = snapshots[0];
  const now = Date.now();
  const wordDiff = Math.abs(draft.wordCount - latest.wordCount);

  // Snapshot if >5 minutes passed AND word count shifted by >= 25 words, or >15 mins regardless
  if (
    (now - latest.timestamp >= MIN_SNAPSHOT_INTERVAL_MS && wordDiff >= 25) ||
    now - latest.timestamp >= 15 * 60 * 1000
  ) {
    createSnapshot(draft.id, draft.title, draft.content, true);
  }
}

/**
 * Restore a specific snapshot
 */
export function restoreDraftSnapshot(
  draftId: string,
  snapshotId: string
): DraftSnapshot | null {
  const snapshots = getDraftSnapshots(draftId);
  const target = snapshots.find((s) => s.id === snapshotId);
  if (!target) return null;

  // Save the draft with the snapshot's state
  saveDraft(draftId, {
    title: target.title,
    content: target.content,
  });

  // Also log a restoration snapshot so the author can roll forward if needed
  createSnapshot(
    draftId,
    `Restored from ${new Date(target.timestamp).toLocaleTimeString()}`,
    target.content,
    true
  );

  return target;
}
