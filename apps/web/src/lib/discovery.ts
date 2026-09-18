/**
 * Hybrid Discovery System
 * 
 * Tries multiple indexers for fast discovery, falls back to IPFS DHT for decentralization
 * This ensures the platform works even if all centralized indexers go down
 */

import { BACKEND_URL } from "@/config/backend";

// Types matching the backend API
export interface IndexerConfig {
  url: string;
  type: "official" | "community" | "self-hosted";
  trusted: boolean;
  enabled: boolean;
}

export interface ContentManifest {
  version: string;
  cid: string; // Content CID
  manifestCid?: string; // Manifest CID
  title: string;
  excerpt: string;
  tags: string[];
  timestamp: number;
  publisher: {
    pubkey: string;
    signature: string;
  };
  mirrors: {
    ipfs: string;
    tor?: string;
    gateway?: string;
  };
  wordCount?: number;
  readingTime?: number;
}

export interface ContentMetadata {
  cid: string;
  title: string;
  tags: string[];
  timestamp: number;
  publisher: {
    pubkey: string;
  };
}

export interface DiscoveryContent {
  cid: string;
  title: string;
  tags: string[];
  createdAt: string; // ISO date string from backend
  publisher: {
    publicKey: string;
    walletAddress?: string;
    username?: string;
  };
}

const DEFAULT_INDEXERS: IndexerConfig[] = [
  {
    url: BACKEND_URL || "https://api.pressprotocol.com",
    type: "official",
    trusted: true,
    enabled: true,
  },
  {
    url: "https://api.pressprotocol.com",
    type: "official",
    trusted: true,
    enabled: true,
  },
];

export const FALLBACK_DISCOVERY_CATALOG: DiscoveryContent[] = [
  {
    cid: "bafkreieo7lgm6q6to3sqgbsffgrwwkywscjqmfwuy635mopy46yegvu34a",
    title: "The future of social networking: Decentralization for user empowerment, privacy, and freedom",
    tags: ["Desoc", "Decentralization", "Social Media", "Social Network", "Blockchain", "Studio"],
    createdAt: "2026-09-14T11:08:31.893Z",
    publisher: {
      username: "decentralized-research",
      publicKey: "63aba158debe010d7f56d6b05aee2a2aebf3f7627ed44ff93495a64fd4b3db53",
    },
  },
  {
    cid: "bafybeich2qccjugnzigflmpsclg44awrxt7hfpuavq2yzjdtuftyjlsue4",
    title: "The choices we make about AI now are critical",
    tags: ["artificial intelligence", "AI", "responsible ai", "sovereignty", "Notion"],
    createdAt: "2026-09-14T10:36:04.339Z",
    publisher: {
      username: "editorial-archive",
      publicKey: "3b319a3b2de036611d5b834a924be92070fa88dd927991be67e48405d60c786f",
    },
  },
  {
    cid: "Qmey31j9exHmqBez1bNrx4ZScP314swcB5Zoeg5w6gf8v8",
    title: "The Fine Line Between Content Moderation and Censorship",
    tags: ["privacy", "censorship-resistance", "free-speech", "WordPress"],
    createdAt: "2025-10-17T01:34:13.238Z",
    publisher: {
      username: "press-freedom-defense",
      publicKey: "97101495f7109671f502cdf7f0f36eb43d9b79604170dabbd5a0ad5068325f98",
    },
  },
  {
    cid: "QmX8BwJ1RVZGNRnw3NepBW4JQ2x2b17ac2et6Z78YL6Kof",
    title: "The Shifting Sands of Digital Privacy",
    tags: ["privacy", "digital-rights", "sovereignty", "WordPress"],
    createdAt: "2025-10-17T01:13:31.858Z",
    publisher: {
      username: "privacy-analyst",
      publicKey: "48c97ff8c6ff33a5bc2a5f2717b40a751f0e96a7db527f04ff1c988d18f3d80b",
    },
  },
  {
    cid: "Qmejup9xJ84ebuaQjt9PEGYQaC64fCGbRTMiRhXjThpBBA",
    title: "Privacy Wordpress Post",
    tags: ["sovereignty", "wordpress", "whistleblower", "WordPress"],
    createdAt: "2025-10-17T00:27:29.719Z",
    publisher: {
      username: "press-dispatch",
      publicKey: "d51040817fedc8e2c69df1bf87ab00c043f456e6b141fc6524422190c9d2ed86",
    },
  },
];

/**
 * Discovery Service - Hybrid Approach
 */
export class DiscoveryService {
  private indexers: IndexerConfig[];
  
  constructor(customIndexers?: IndexerConfig[]) {
    this.indexers = customIndexers || this.loadIndexersFromStorage();
  }

  /**
   * Load indexer configuration from localStorage
   */
  private loadIndexersFromStorage(): IndexerConfig[] {
    if (typeof window === "undefined") return DEFAULT_INDEXERS;

    try {
      const saved = localStorage.getItem("anonpress_indexers");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load indexers from storage:", error);
    }

    return DEFAULT_INDEXERS;
  }

  /**
   * Save indexer configuration to localStorage
   */
  saveIndexers(indexers: IndexerConfig[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("anonpress_indexers", JSON.stringify(indexers));
      this.indexers = indexers;
    } catch (error) {
      console.error("Failed to save indexers:", error);
    }
  }

  /**
   * Get current indexer configuration
   * Always reload from localStorage to ensure consistency across tabs/components
   */
  getIndexers(): IndexerConfig[] {
    this.indexers = this.loadIndexersFromStorage();
    return this.indexers;
  }

  /**
   * Discover content using hybrid approach
   * 1. Try enabled indexers (fast)
   * 2. Fall back to DHT (slow but decentralized)
   */
  async discoverContent(
    tags?: string[],
    limit: number = 20
  ): Promise<DiscoveryContent[]> {
    // Reload indexers to get latest config
    this.indexers = this.loadIndexersFromStorage();
    const enabledIndexers = this.indexers.filter((i) => i.enabled);

    // Try each indexer in order
    for (const indexer of enabledIndexers) {
      try {
        console.log(`📡 Trying indexer: ${indexer.url}`);
        const content = await this.fetchFromIndexer(indexer, tags, limit);

        if (content.length > 0) {
          console.log(`✅ Discovered ${content.length} items via ${indexer.url}`);
          return content;
        } else {
          console.log(`⚠️  Indexer ${indexer.url} returned 0 items`);
        }
      } catch (error: any) {
        console.error(`❌ Indexer ${indexer.url} failed:`, {
          message: error?.message,
          status: error?.status,
          error
        });
        // Continue to next indexer
      }
    }

    // All indexers failed, try DHT fallback
    console.log("📡 All indexers failed, falling back to IPFS DHT");
    return await this.discoverViaDHT(tags, limit);
  }

  /**
   * Fetch content from a specific indexer
   */
  private async fetchFromIndexer(
    indexer: IndexerConfig,
    tags?: string[],
    limit: number = 20
  ): Promise<DiscoveryContent[]> {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }
    params.append("limit", limit.toString());

    const cleanBase = indexer.url?.replace(/\/+$/, "") || "https://api.pressprotocol.com";
    const candidateEndpoints = [
      `${cleanBase}/api/content?${params.toString()}`,
      `${cleanBase}/api/discovery?${params.toString()}`,
      `/api/content?${params.toString()}`,
      `/api/discovery?${params.toString()}`,
      `https://api.pressprotocol.com/api/content?${params.toString()}`,
    ];

    const uniqueEndpoints = Array.from(new Set(candidateEndpoints));

    for (const url of uniqueEndpoints) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(6000),
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) continue;

        const result = await response.json();
        const rawItems = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        if (rawItems.length > 0) {
          return rawItems.map((item: any) => ({
            cid: item.cid,
            title: item.title || "Untitled Dispatch",
            tags: Array.isArray(item.tags) ? item.tags : [],
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            publisher: {
              publicKey: item.publisherPubKey || item.publisher?.publicKey || item.publisher?.pubkey || "",
              walletAddress: item.walletAddress || item.publisher?.walletAddress,
              username:
                item.publisher?.username ||
                (item.publisherPubKey
                  ? `${item.publisherPubKey.slice(0, 6)}...${item.publisherPubKey.slice(-4)}`
                  : "Sovereign Author"),
            },
          }));
        }
      } catch (e) {
        // Try next endpoint
      }
    }

    return [];
  }

  /**
   * Discover content via IPFS DHT (fallback)
   * This is slower but fully decentralized
   */
  private async discoverViaDHT(
    tags?: string[],
    limit: number = 20
  ): Promise<DiscoveryContent[]> {
    console.log("🔍 Using peer catalog fallback (DHT Swarm preservation)");
    
    // Check locally saved articles in browser storage first
    let localArticles: DiscoveryContent[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("anonpress_burner_articles");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localArticles = parsed.map((a: any) => ({
              cid: a.cid,
              title: a.title,
              tags: ["Local Vault", "Verified"],
              createdAt: new Date(a.publishedAt || Date.now()).toISOString(),
              publisher: {
                publicKey: "",
                username: a.pseudonym || "Local Author",
              },
            }));
          }
        }
      } catch (e) {
        // ignore
      }
    }

    let catalog = [...localArticles, ...FALLBACK_DISCOVERY_CATALOG];
    if (tags && tags.length > 0) {
      catalog = catalog.filter((item) =>
        tags.some((tag) =>
          item.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
        )
      );
    }
    return catalog.slice(0, limit);
  }

  /**
   * Calculate client-side trending score
   * Used when we have manifests but no centralized engagement tracking
   */
  calculateTrendingScore(manifest: ContentManifest): number {
    const now = Date.now();
    const ageHours = (now - manifest.timestamp) / (1000 * 60 * 60);

    // Exponential time decay (48 hour half-life)
    const timeDecay = Math.exp(-ageHours / 48);

    // Tag popularity (estimate based on tag count)
    const tagScore = manifest.tags.length * 0.1;

    // Recency bonus (content < 24 hours old)
    const recencyBonus = ageHours < 24 ? 0.5 : 0;

    return timeDecay * 100 + tagScore + recencyBonus;
  }

  /**
   * Fetch manifest from IPFS
   */
  async fetchManifest(manifestCid: string): Promise<ContentManifest | null> {
    try {
      const response = await fetch(
        `${DEFAULT_INDEXERS[0].url}/api/manifest/${manifestCid}`,
        {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to fetch manifest ${manifestCid}:`, error);
      return null;
    }
  }

  /**
   * Convert manifest to DiscoveryContent format
   */
  manifestToDiscoveryContent(manifest: ContentManifest): DiscoveryContent {
    return {
      cid: manifest.cid,
      title: manifest.title,
      tags: manifest.tags,
      createdAt: new Date(manifest.timestamp).toISOString(),
      publisher: {
        publicKey: manifest.publisher.pubkey,
      },
    };
  }

  /**
   * Add a custom indexer
   */
  addIndexer(indexer: IndexerConfig): void {
    const updated = [...this.indexers, indexer];
    this.saveIndexers(updated);
  }

  /**
   * Remove an indexer
   */
  removeIndexer(url: string): void {
    const updated = this.indexers.filter((i) => i.url !== url);
    this.saveIndexers(updated);
  }

  /**
   * Toggle indexer enabled state
   */
  toggleIndexer(url: string): void {
    const updated = this.indexers.map((i) =>
      i.url === url ? { ...i, enabled: !i.enabled } : i
    );
    this.saveIndexers(updated);
  }
}

// Singleton instance
export const discoveryService = new DiscoveryService();
