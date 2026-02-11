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
    // For now, return empty array
    // In production, this would query IPFS DHT for content manifests
    console.log("🔍 DHT discovery not yet implemented (requires IPFS node)");
    
    // TODO: Implement actual DHT discovery
    // This would involve:
    // 1. Connect to IPFS node (could be js-ipfs in browser)
    // 2. Query DHT for "anonpress-manifest" providers
    // 3. Fetch manifests from IPFS
    // 4. Filter by tags if provided
    // 5. Sort by timestamp
    // 6. Return results
    
    return [];
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
