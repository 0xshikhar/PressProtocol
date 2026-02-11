import { prisma } from '../lib/prisma.js';
import { torService } from './TorService.js';

export interface MirrorHealth {
  type: string;
  url: string;
  available: boolean;
  latency: number | null;
  lastCheck: Date;
}

export class MirrorService {
  /**
   * Check health of all mirrors for content
   */
  async checkMirrorHealth(contentId: string): Promise<MirrorHealth[]> {
    const mirrors = await prisma.mirror.findMany({
      where: { contentId },
    });

    const healthChecks = await Promise.all(
      mirrors.map(async (mirror) => {
        const { available, latency } = await this.checkSingleMirror(
          mirror.type,
          mirror.url
        );

        // Update mirror status in database
        await prisma.mirror.update({
          where: { id: mirror.id },
          data: {
            available,
            latency,
            lastCheck: new Date(),
          },
        });

        return {
          type: mirror.type,
          url: mirror.url,
          available,
          latency,
          lastCheck: new Date(),
        };
      })
    );

    return healthChecks;
  }

  /**
   * Check health of a single mirror
   */
  private async checkSingleMirror(
    type: string,
    url: string
  ): Promise<{ available: boolean; latency: number | null }> {
    try {
      const startTime = Date.now();

      if (type === 'tor') {
        // Use Tor service to check onion availability
        const available = await torService.checkOnionAvailability(url);
        const latency = available ? await torService.measureOnionLatency(url) : null;
        return { available, latency };
      }

      // For IPFS and gateway, use regular HTTP request
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const latency = Date.now() - startTime;

      return {
        available: response.ok,
        latency: response.ok ? latency : null,
      };
    } catch (error) {
      console.error(`Mirror check failed for ${type} (${url}):`, error);
      return { available: false, latency: null };
    }
  }

  /**
   * Create mirrors for content
   */
  async createMirrors(
    contentId: string,
    cid: string,
    ipfsGatewayUrl: string,
    onionUrl: string,
    webGatewayUrl: string
  ) {
    console.log('🪞 [MIRROR] Creating mirrors for content:', contentId);
    
    const mirrors = [
      {
        contentId,
        type: 'ipfs',
        url: ipfsGatewayUrl,
        available: true,
        latency: 120, // Default estimated latency
      },
      {
        contentId,
        type: 'tor',
        url: onionUrl,
        available: true,
        latency: 450, // Default estimated latency for Tor
      },
      {
        contentId,
        type: 'gateway',
        url: webGatewayUrl,
        available: true,
        latency: 200, // Default estimated latency
      },
    ];

    console.log('🪞 [MIRROR] Storing mirrors:', mirrors.map(m => ({ type: m.type, url: m.url })));

    const result = await prisma.mirror.createMany({
      data: mirrors,
    });
    
    console.log(`✅ [MIRROR] Created ${result.count} mirrors`);
    
    return result;
  }

  /**
   * Get fastest available mirror
   */
  async getFastestMirror(contentId: string): Promise<MirrorHealth | null> {
    const mirrors = await prisma.mirror.findMany({
      where: {
        contentId,
        available: true,
      },
      orderBy: {
        latency: 'asc',
      },
      take: 1,
    });

    if (mirrors.length === 0) {
      return null;
    }

    const mirror = mirrors[0];
    return {
      type: mirror.type,
      url: mirror.url,
      available: mirror.available,
      latency: mirror.latency,
      lastCheck: mirror.lastCheck,
    };
  }

  /**
   * Get all mirrors for content
   */
  async getMirrors(contentId: string) {
    return prisma.mirror.findMany({
      where: { contentId },
      orderBy: { latency: 'asc' },
    });
  }

  /**
   * Update mirror status
   */
  async updateMirrorStatus(
    mirrorId: string,
    available: boolean,
    latency: number | null
  ) {
    return prisma.mirror.update({
      where: { id: mirrorId },
      data: {
        available,
        latency,
        lastCheck: new Date(),
      },
    });
  }
}

export const mirrorService = new MirrorService();
