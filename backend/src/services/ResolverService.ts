import { prisma } from '../lib/prisma.js';
import { mirrorService, MirrorHealth } from './MirrorService.js';

export interface ResolvedContent {
  cid: string;
  title: string;
  content: string;
  tags: string[];
  mirrors: {
    ipfs?: MirrorHealth;
    tor?: MirrorHealth;
    gateway?: MirrorHealth;
  };
  recommended: string;
  publisher: {
    publicKey: string;
    walletAddress?: string;
  };
  signature: string;
  createdAt: Date;
}

export class ResolverService {
  /**
   * Resolve content by CID
   */
  async resolveContent(cid: string): Promise<ResolvedContent | null> {
    const content = await prisma.content.findUnique({
      where: { cid },
      include: {
        identity: {
          include: { user: true },
        },
        mirrors: true,
      },
    });

    if (!content) {
      return null;
    }

    // Check mirror health
    const mirrorHealth = await mirrorService.checkMirrorHealth(content.id);

    // Organize mirrors by type
    const mirrors: ResolvedContent['mirrors'] = {};
    for (const mirror of mirrorHealth) {
      if (mirror.type === 'ipfs') mirrors.ipfs = mirror;
      if (mirror.type === 'tor') mirrors.tor = mirror;
      if (mirror.type === 'gateway') mirrors.gateway = mirror;
    }

    // Determine recommended mirror (fastest available)
    const recommended = this.getRecommendedMirror(mirrorHealth);

    return {
      cid: content.cid,
      title: content.title,
      content: content.content,
      tags: content.tags,
      mirrors,
      recommended,
      publisher: {
        publicKey: content.identity.publicKey,
        walletAddress: content.identity.user.walletAddress,
      },
      signature: content.signature,
      createdAt: content.createdAt,
    };
  }

  /**
   * Get recommended mirror based on availability and latency
   */
  private getRecommendedMirror(mirrors: MirrorHealth[]): string {
    // Filter available mirrors
    const available = mirrors.filter((m) => m.available);

    if (available.length === 0) {
      return 'gateway'; // Default fallback
    }

    // Sort by latency
    available.sort((a, b) => {
      const latencyA = a.latency ?? Infinity;
      const latencyB = b.latency ?? Infinity;
      return latencyA - latencyB;
    });

    return available[0].type;
  }

  /**
   * Get all available mirrors for CID
   */
  async getAvailableMirrors(cid: string): Promise<MirrorHealth[]> {
    const content = await prisma.content.findUnique({
      where: { cid },
      include: { mirrors: true },
    });

    if (!content) {
      return [];
    }

    return mirrorService.checkMirrorHealth(content.id);
  }

  /**
   * Get content metadata without full content
   */
  async getContentMetadata(cid: string) {
    return prisma.content.findUnique({
      where: { cid },
      select: {
        id: true,
        cid: true,
        title: true,
        tags: true,
        createdAt: true,
        identity: {
          select: {
            publicKey: true,
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
  }
}

export const resolverService = new ResolverService();
