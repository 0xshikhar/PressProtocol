import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { storageService } from '../services/StorageService.js';
import { torService } from '../services/TorService.js';
import { mirrorService } from '../services/MirrorService.js';
import { identityService } from '../services/IdentityService.js';
import { discoveryService } from '../services/DiscoveryService.js';
import { env } from '../config/env.js';

const publishContentSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  walletAddress: z.string().optional(), // Optional - anonymous publishing
  privateKey: z.string().optional(), // For signing, should be handled securely
});

const getContentQuerySchema = z.object({
  tags: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export async function contentRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/content - Publish new content
   */
  fastify.post('/api/content', async (request, reply) => {
    try {
      const body = publishContentSchema.parse(request.body);

      // 1. Generate or get identity (anonymous by default)
      let user = null;
      let userId = null;
      let identity = null;
      let privateKey = body.privateKey;

      if (body.walletAddress) {
        // Authenticated publishing
        user = await prisma.user.findUnique({
          where: { walletAddress: body.walletAddress },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { walletAddress: body.walletAddress },
          });
        }
        userId = user.id;

        // Get or create identity for user
        identity = await prisma.identity.findFirst({
          where: { userId: user.id },
        });

        if (!identity) {
          const keypair = await identityService.generateKeypair();
          privateKey = keypair.privateKey;
          identity = await identityService.createIdentity(user.id, keypair.publicKey);
        }
      } else {
        // Anonymous publishing - generate ephemeral keypair
        const keypair = await identityService.generateKeypair();
        privateKey = keypair.privateKey;
        
        // Create anonymous identity (no user linkage)
        identity = await prisma.identity.create({
          data: {
            publicKey: keypair.publicKey,
            // userId is optional - omit for anonymous
          },
        });
      }

      const publicKey = identity.publicKey;

      // 2. Sign content BEFORE uploading to IPFS
      const contentToSign = JSON.stringify({
        title: body.title,
        tags: body.tags,
        timestamp: new Date().toISOString(),
      });

      const signature = privateKey
        ? await identityService.signContent(contentToSign, privateKey)
        : 'unsigned';

      // 3. Upload FULL content to IPFS (source of truth)
      const ipfsResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags,
        { pubkey: publicKey, signature }
      );

      // 4. Create Tor onion service
      const onionResult = await torService.createOnionService(
        ipfsResult.cid,
        ipfsResult.gatewayUrl
      );

      // 5. Store metadata in database (CACHE LAYER ONLY)
      // Full content lives on IPFS - database just has CID + metadata
      const content = await prisma.content.create({
        data: {
          cid: ipfsResult.cid,
          title: body.title,
          tags: body.tags,
          publisherPubKey: publicKey,
          userId: userId || undefined, // undefined for anonymous
          signature,
        },
      });

      console.log('✅ Content metadata cached in database');
      console.log('📦 Source of truth: IPFS CID', ipfsResult.cid);

      // 6. Create mirrors
      const webGatewayUrl = `${env.CORS_ORIGIN}/read/${ipfsResult.cid}`;
      
      await mirrorService.createMirrors(
        content.id,
        ipfsResult.cid,
        ipfsResult.gatewayUrl,
        onionResult.onionUrl,
        webGatewayUrl
      );

      // 7. Announce to IPFS DHT for decentralized discovery
      const manifest = {
        cid: ipfsResult.cid,
        title: body.title,
        tags: body.tags,
        timestamp: Date.now(),
        publisher: { pubkey: publicKey, signature },
        mirrors: {
          ipfs: ipfsResult.gatewayUrl,
          tor: onionResult.onionUrl,
          gateway: webGatewayUrl,
        },
      };

      const dhtResult = await discoveryService.announceContent(
        ipfsResult.cid,
        body.tags,
        manifest
      );

      // 8. Get mirrors for response
      const mirrors = await mirrorService.getMirrors(content.id);

      return reply.status(201).send({
        success: true,
        data: {
          cid: ipfsResult.cid,
          shareUrl: `anonpress://${ipfsResult.cid}`,
          mirrors: {
            ipfs: mirrors.find((m) => m.type === 'ipfs')?.url,
            tor: mirrors.find((m) => m.type === 'tor')?.url,
            gateway: mirrors.find((m) => m.type === 'gateway')?.url,
          },
          publisher: {
            publicKey: publicKey,
            isAnonymous: !body.walletAddress,
          },
          dht: {
            announced: dhtResult.dhtAnnounced,
            manifestCid: dhtResult.manifestCid,
          },
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish content',
      });
    }
  });

  /**
   * GET /api/content - List content with optional filtering
   */
  fastify.get('/api/content', async (request, reply) => {
    try {
      const query = getContentQuerySchema.parse(request.query);
      const limit = parseInt(query.limit || '20');
      const offset = parseInt(query.offset || '0');

      let content;

      if (query.tags) {
        const tags = query.tags.split(',');
        content = await discoveryService.discoverByTags(tags, limit, offset);
      } else {
        content = await discoveryService.getRecentContent(limit, offset);
      }

      return reply.send({
        success: true,
        data: content,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content',
      });
    }
  });

  /**
   * GET /api/content/:cid - Get specific content by CID
   * HYBRID APPROACH: Try cache first, fallback to IPFS
   */
  fastify.get('/api/content/:cid', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      // Try database cache first (fast)
      const cachedContent = await prisma.content.findUnique({
        where: { cid },
        include: {
          user: true,
          mirrors: true,
        },
      });

      let fullContent;
      let fromCache = false;

      if (cachedContent) {
        // Fetch FULL content from IPFS (source of truth)
        try {
          fullContent = await storageService.getContentFromIPFS(cid);
          fromCache = false;
          console.log('✅ Fetched content from IPFS (source of truth)');
        } catch (ipfsError) {
          // IPFS fetch failed - this shouldn't happen but handle gracefully
          console.warn('⚠️  IPFS fetch failed, using cached data');
          fullContent = null;
          fromCache = true;
        }

        return reply.send({
          success: true,
          data: {
            cid: cachedContent.cid,
            title: cachedContent.title,
            content: fullContent?.content, // From IPFS
            tags: cachedContent.tags,
            createdAt: cachedContent.createdAt,
            publisher: {
              publicKey: cachedContent.publisherPubKey,
              walletAddress: cachedContent.user?.walletAddress,
              username: cachedContent.user?.username,
              isAnonymous: !cachedContent.userId,
            },
            signature: cachedContent.signature,
            mirrors: cachedContent.mirrors.map((m) => ({
              type: m.type,
              url: m.url,
              available: m.available,
              latency: m.latency,
            })),
            source: fromCache ? 'cache' : 'ipfs',
          },
        });
      }

      // Not in cache - try IPFS directly (truly decentralized!)
      try {
        console.log('🔍 Content not in cache, fetching from IPFS...');
        fullContent = await storageService.getContentFromIPFS(cid);
        
        return reply.send({
          success: true,
          data: {
            cid,
            title: fullContent.title,
            content: fullContent.content,
            tags: fullContent.tags,
            createdAt: new Date(fullContent.timestamp),
            publisher: fullContent.publisher || { publicKey: 'unknown' },
            signature: fullContent.publisher?.signature || 'unsigned',
            mirrors: [
              {
                type: 'ipfs',
                url: `https://gateway.pinata.cloud/ipfs/${cid}`,
                available: true,
              },
            ],
            source: 'ipfs-direct',
            note: 'Content fetched directly from IPFS (not cached)',
          },
        });
      } catch (ipfsError) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found in cache or IPFS',
        });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content',
      });
    }
  });
}
