import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { env } from '../config/env.js';

export interface EmbeddedContent {
  id: string;
  cid: string;
  title: string;
  tags: string[];
  publisherPubKey: string;
  signature: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmbeddedMirror {
  id: string;
  contentId: string;
  type: string;
  url: string;
  available: boolean;
  latency?: number;
  lastCheck: string;
  createdAt: string;
}

export interface EmbeddedIdentity {
  id: string;
  userId?: string | null;
  publicKey: string;
  ipnsName?: string | null;
  createdAt: string;
}

export interface EmbeddedUser {
  id: string;
  walletAddress: string;
  username?: string | null;
  avatar?: string | null;
  createdAt: string;
}

export interface EmbeddedFederationPeer {
  id: string;
  url: string;
  name: string;
  lastSeen: string;
  latencyMs: number;
  isOnline: boolean;
  onionAddress?: string;
  peerId?: string;
}

export interface EmbeddedStoreData {
  contents: Record<string, EmbeddedContent>; // keyed by CID
  mirrors: Record<string, EmbeddedMirror[]>; // keyed by contentId / CID
  identities: Record<string, EmbeddedIdentity>; // keyed by publicKey
  users: Record<string, EmbeddedUser>; // keyed by walletAddress
  federationPeers: Record<string, EmbeddedFederationPeer>; // keyed by normalized URL
  pinnedCids: string[];
  meta: {
    nodeId: string;
    initializedAt: string;
    version: string;
    gossipCount: number;
  };
}

export class EmbeddedDB {
  private filePath: string;
  private data: EmbeddedStoreData | null = null;
  private isWriting = false;
  private writeQueue: (() => Promise<void>)[] = [];

  constructor(customPath?: string) {
    const baseDir = customPath || env.DATA_DIR;
    this.filePath = join(baseDir, 'db', 'store.json');
  }

  private getDefaultData(): EmbeddedStoreData {
    return {
      contents: {},
      mirrors: {},
      identities: {},
      users: {},
      federationPeers: {},
      pinnedCids: [],
      meta: {
        nodeId: env.NODE_ID || `node-${Math.random().toString(36).substring(2, 12)}`,
        initializedAt: new Date().toISOString(),
        version: '1.0.0-sovereign',
        gossipCount: 0,
      },
    };
  }

  public async init(): Promise<void> {
    try {
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      if (existsSync(this.filePath)) {
        const raw = await readFile(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = this.getDefaultData();
        await this.persist();
      }
    } catch (err) {
      console.warn('⚠️  Could not read embedded DB, using fresh memory state:', err);
      this.data = this.getDefaultData();
    }
  }

  private writePromise: Promise<void> = Promise.resolve();

  private async persist(): Promise<void> {
    if (!this.data) return;
    this.writePromise = this.writePromise.then(async () => {
      try {
        const dir = dirname(this.filePath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        const tempPath = `${this.filePath}.tmp.${Date.now()}`;
        await writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
        const { rename } = await import('fs/promises');
        await rename(tempPath, this.filePath);
      } catch (err) {
        console.error('❌ Error persisting embedded DB:', err);
      }
    });
    return this.writePromise;
  }

  private ensureLoaded() {
    if (!this.data) {
      this.data = this.getDefaultData();
    }
  }

  // --- Content operations ---

  public async saveContent(item: {
    cid: string;
    title: string;
    tags: string[];
    publisherPubKey: string;
    signature: string;
    userId?: string | null;
  }): Promise<EmbeddedContent> {
    this.ensureLoaded();
    const existing = this.data!.contents[item.cid];
    const now = new Date().toISOString();
    const record: EmbeddedContent = {
      id: existing?.id || `c-${Math.random().toString(36).substring(2, 10)}`,
      cid: item.cid,
      title: item.title,
      tags: item.tags,
      publisherPubKey: item.publisherPubKey,
      signature: item.signature,
      userId: item.userId || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    this.data!.contents[item.cid] = record;
    await this.persist();
    return record;
  }

  public getContent(cid: string): EmbeddedContent | null {
    this.ensureLoaded();
    return this.data!.contents[cid] || null;
  }

  public listRecentContent(limit: number = 20, offset: number = 0): EmbeddedContent[] {
    this.ensureLoaded();
    const all = Object.values(this.data!.contents);
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all.slice(offset, offset + limit);
  }

  public searchContent(query: string, limit: number = 20, offset: number = 0): EmbeddedContent[] {
    this.ensureLoaded();
    const q = query.toLowerCase();
    const all = Object.values(this.data!.contents).filter(
      (c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
    );
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all.slice(offset, offset + limit);
  }

  public countContent(): number {
    this.ensureLoaded();
    return Object.keys(this.data!.contents).length;
  }

  // --- Pins ---

  public addPin(cid: string): void {
    this.ensureLoaded();
    if (!this.data!.pinnedCids.includes(cid)) {
      this.data!.pinnedCids.push(cid);
      this.persist();
    }
  }

  public getPins(): string[] {
    this.ensureLoaded();
    return [...this.data!.pinnedCids];
  }

  public isPinned(cid: string): boolean {
    this.ensureLoaded();
    return this.data!.pinnedCids.includes(cid);
  }

  // --- Federation Peers ---

  public addFederationPeer(peer: {
    url: string;
    name?: string;
    onionAddress?: string;
    peerId?: string;
  }): EmbeddedFederationPeer {
    this.ensureLoaded();
    const normalizedUrl = peer.url.replace(/\/+$/, '');
    const existing = this.data!.federationPeers[normalizedUrl];
    const record: EmbeddedFederationPeer = {
      id: existing?.id || `peer-${Math.random().toString(36).substring(2, 10)}`,
      url: normalizedUrl,
      name: peer.name || existing?.name || `Peer @ ${normalizedUrl.replace(/^https?:\/\//, '')}`,
      lastSeen: new Date().toISOString(),
      latencyMs: existing?.latencyMs || 0,
      isOnline: true,
      onionAddress: peer.onionAddress || existing?.onionAddress,
      peerId: peer.peerId || existing?.peerId,
    };
    this.data!.federationPeers[normalizedUrl] = record;
    this.persist();
    return record;
  }

  public removeFederationPeer(url: string): boolean {
    this.ensureLoaded();
    const normalizedUrl = url.replace(/\/+$/, '');
    if (this.data!.federationPeers[normalizedUrl]) {
      delete this.data!.federationPeers[normalizedUrl];
      this.persist();
      return true;
    }
    return false;
  }

  public listFederationPeers(): EmbeddedFederationPeer[] {
    this.ensureLoaded();
    return Object.values(this.data!.federationPeers);
  }

  // --- Metrics ---

  public incrementGossipCount(): number {
    this.ensureLoaded();
    this.data!.meta.gossipCount = (this.data!.meta.gossipCount || 0) + 1;
    this.persist();
    return this.data!.meta.gossipCount;
  }

  public getMeta() {
    this.ensureLoaded();
    return this.data!.meta;
  }
}

export const embeddedDB = new EmbeddedDB();
// Initialize embedded DB on module load
embeddedDB.init().catch((e) => console.warn('EmbeddedDB background init warning:', e));
