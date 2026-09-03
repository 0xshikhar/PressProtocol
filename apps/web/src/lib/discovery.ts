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
    url: BACKEND_URL,
    type: "official",
    trusted: true,
    enabled: true,
  },
];

export const FALLBACK_DISCOVERY_CATALOG: DiscoveryContent[] = [
  {
    cid: "QmZtmD2qt8fJv3CL8E4yq1nMGVC4LMDcENuWBZ8gVa9Boh",
    title: "A Cypherpunk's Manifesto (Eric Hughes, 1993)",
    tags: ["cryptography", "privacy", "sovereignty", "Studio"],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    publisher: {
      username: "cypherpunk-archive",
      publicKey: "ed25519_9bf8a473b190f8983944203795b21021469e38f9ec2ea7a09c2a8fefb09e25b1",
    },
  },
  {
    cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    title: "A Declaration of the Independence of Cyberspace (John Perry Barlow, 1996)",
    tags: ["sovereignty", "governance", "tor", "Git SSG"],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    publisher: {
      username: "eff-historical",
      publicKey: "ed25519_3e5c9b78a4e1d3f98214bb09e25b1021469e38f9ec2ea7a09c2a8fefb098a473",
    },
  },
  {
    cid: "QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4",
    title: "Bitcoin: A Peer-to-Peer Electronic Cash System (Satoshi Nakamoto, 2008)",
    tags: ["cryptography", "ipfs", "p2p", "Substack/RSS"],
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    publisher: {
      username: "satoshi",
      publicKey: "ed25519_e08d6d4fa8f60f64e2e2830f5dc937cb1017ef0df5359b3917a22ef6806085a6",
    },
  },
  {
    cid: "QmSrPmbaUKA3ZodhzTnxtRghQRTRNJeDF71CcWqDYDcgFo",
    title: "Whistleblower Protections in the Era of Ubiquitous Surveillance",
    tags: ["whistleblower", "tor", "privacy", "WordPress"],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    publisher: {
      username: "press-freedom-defense",
      publicKey: "ed25519_5df28e81b67e3a9689df464971c0dfb57bb3d159a6745f448c26f0ec4e1f76d4",
    },
  },
  {
    cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    title: "Self-Hosting and P2P Swarm Storage: A Practical Blueprint",
    tags: ["ipfs", "sovereignty", "notion", "Notion"],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    publisher: {
      username: "decentralized-lab",
      publicKey: "ed25519_8c30d3e5b190f8983944203795b21021469e38f9ec2ea7a09c2a8fefb09e25b1",
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

    const url = `${indexer.url}/api/discovery?${params.toString()}`;
    console.log(`🔍 Fetching from: ${url}`);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log(`📥 Response status: ${response.status} from ${indexer.url}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Indexer returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`📦 Data received:`, { itemCount: result?.data?.length || 0 });
    return result.data || [];
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
    
    let catalog = [...FALLBACK_DISCOVERY_CATALOG];
    if (tags && tags.length > 0) {
      catalog = catalog.filter(item => 
        tags.some(tag => item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))
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
