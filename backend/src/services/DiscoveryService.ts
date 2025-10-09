import { prisma } from '../lib/prisma.js';
import { ipfsDHTService, type ContentManifest } from './IPFSDHTService.js';
import { storageService } from './StorageService.js';

export interface DiscoveryItem {
  cid: string;
  title: string;
  tags: string[];
  createdAt: Date;
  publisher: {
    publicKey: string;
    walletAddress?: string;
    username?: string;
  };
}

/**
 * DiscoveryService handles content discovery and feed generation
 * 
 * Architecture: HYBRID with graceful degradation
 * - Primary: Database cache (fast, reliable for demo)
 * - Fallback: IPFS DHT (decentralized, censorship-resistant)
 * 
 * Database is ACCELERATION LAYER only - not source of truth
 * Source of truth: IPFS (immutable content) + DHT (decentralized discovery)
 */
export class DiscoveryService {
  /**
   * Get recent content for discovery feed
   * Uses database cache for speed
   */
  async getRecentContent(
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    console.log('📅 Fetching recent content from cache...');
    const content = await prisma.content.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    return content.map((item) => ({
      cid: item.cid,
      title: item.title,
      tags: item.tags,
      createdAt: item.createdAt,
      publisher: {
        publicKey: item.publisherPubKey,
        walletAddress: item.user?.walletAddress,
        username: item.user?.username || undefined,
      },
    }));
  }

  /**
   * Discover content by tags
   */
  async discoverByTags(
    tags: string[],
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    const content = await prisma.content.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    return content.map((item) => ({
      cid: item.cid,
      title: item.title,
      tags: item.tags,
      createdAt: item.createdAt,
      publisher: {
        publicKey: item.publisherPubKey,
        walletAddress: item.user?.walletAddress,
        username: item.user?.username || undefined,
      },
    }));
  }

  /**
   * Search content by title or tags
   */
  async searchContent(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    const content = await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    return content.map((item) => ({
      cid: item.cid,
      title: item.title,
      tags: item.tags,
      createdAt: item.createdAt,
      publisher: {
        publicKey: item.publisherPubKey,
        walletAddress: item.user?.walletAddress,
        username: item.user?.username || undefined,
      },
    }));
  }

  /**
   * Get content by publisher
   */
  async getPublisherContent(
    walletAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return [];
    }

    const content = await prisma.content.findMany({
      where: { userId: user.id },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    return content.map((item) => ({
      cid: item.cid,
      title: item.title,
      tags: item.tags,
      createdAt: item.createdAt,
      publisher: {
        publicKey: item.publisherPubKey,
        walletAddress: item.user?.walletAddress,
        username: item.user?.username || undefined,
      },
    }));
  }

  /**
   * Get trending tags
   */
  async getTrendingTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    // Get all content
    const allContent = await prisma.content.findMany({
      select: { tags: true },
    });

    // Count tag occurrences
    const tagCounts = new Map<string, number>();
    
    for (const content of allContent) {
      for (const tag of content.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Sort by count and return top N
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * Announce content to IPFS DHT network
   * Makes content discoverable without central server
   */
  async announceContent(
    cid: string,
    tags: string[],
    manifest: ContentManifest
  ): Promise<{ dhtAnnounced: boolean; manifestCid?: string }> {
    try {
      // Try to announce to DHT
      if (ipfsDHTService.isAvailable()) {
        const result = await ipfsDHTService.announceContent(manifest);
        console.log(`✅ Content announced to DHT: ${cid}`);
        console.log(`📜 Manifest CID: ${result.manifestCid}`);
        console.log(`🏷️  Tags: ${tags.join(', ')}`);
        
        return {
          dhtAnnounced: true,
          manifestCid: result.manifestCid,
        };
      } else {
        console.warn('⚠️  DHT not available - content cached in database only');
        console.log(`📦 Content: ${cid} with tags: ${tags.join(', ')}`);
        
        return {
          dhtAnnounced: false,
        };
      }
    } catch (error) {
      console.error('DHT announcement failed:', error);
      console.log('🔄 Falling back to database-only discovery');
      
      return {
        dhtAnnounced: false,
      };
    }
  }

  /**
   * Discover content by tags - HYBRID approach
   * Tries DHT first, falls back to database
   */
  async discoverByTagsHybrid(
    tags: string[],
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    // Try DHT first if available
    if (ipfsDHTService.isAvailable()) {
      try {
        console.log(`🔍 Trying DHT discovery for: ${tags.join(', ')}`);
        const dhtResults = await ipfsDHTService.discoverByTags(tags, limit);
        
        if (dhtResults.length > 0) {
          console.log(`✅ Found ${dhtResults.length} items via DHT`);
          // Convert DHT results to DiscoveryItem format
          return dhtResults.map(manifest => ({
            cid: manifest.cid,
            title: manifest.title,
            tags: manifest.tags,
            createdAt: new Date(manifest.timestamp),
            publisher: {
              publicKey: manifest.publisher.pubkey,
            },
          }));
        }
      } catch (error) {
        console.warn('DHT query failed, falling back to database:', error);
      }
    }

    // Fallback to database
    console.log('📊 Using database cache for discovery');
    return this.discoverByTags(tags, limit, offset);
  }
}

export const discoveryService = new DiscoveryService();
