import { prisma } from '../lib/prisma.js';

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
 * Current implementation uses database queries
 * Future: Can integrate IPFS DHT for fully decentralized discovery
 */
export class DiscoveryService {
  /**
   * Get recent content for discovery feed
   */
  async getRecentContent(
    limit: number = 20,
    offset: number = 0
  ): Promise<DiscoveryItem[]> {
    const content = await prisma.content.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        identity: {
          include: {
            user: {
              select: {
                walletAddress: true,
                username: true,
              },
            },
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
        publicKey: item.identity.publicKey,
        walletAddress: item.identity.user.walletAddress,
        username: item.identity.user.username || undefined,
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
        identity: {
          include: {
            user: {
              select: {
                walletAddress: true,
                username: true,
              },
            },
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
        publicKey: item.identity.publicKey,
        walletAddress: item.identity.user.walletAddress,
        username: item.identity.user.username || undefined,
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
        identity: {
          include: {
            user: {
              select: {
                walletAddress: true,
                username: true,
              },
            },
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
        publicKey: item.identity.publicKey,
        walletAddress: item.identity.user.walletAddress,
        username: item.identity.user.username || undefined,
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
        identity: {
          include: {
            user: {
              select: {
                walletAddress: true,
                username: true,
              },
            },
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
        publicKey: item.identity.publicKey,
        walletAddress: item.identity.user.walletAddress,
        username: item.identity.user.username || undefined,
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
   * Announce content to network (placeholder for IPFS DHT integration)
   */
  async announceContent(cid: string, tags: string[]): Promise<void> {
    // TODO: Implement IPFS DHT announcement
    // For now, content is discoverable via database
    console.log(`Content announced: ${cid} with tags: ${tags.join(', ')}`);
  }
}

export const discoveryService = new DiscoveryService();
