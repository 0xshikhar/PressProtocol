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
  walletAddress: z.string(),
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

      // 1. Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: body.walletAddress },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { walletAddress: body.walletAddress },
        });
      }

      // 2. Get or create identity
      let identity = await prisma.identity.findFirst({
        where: { userId: user.id },
      });

      let privateKey = body.privateKey;

      if (!identity) {
        const keypair = await identityService.generateKeypair();
        privateKey = keypair.privateKey;
        
        identity = await identityService.createIdentity(user.id, keypair.publicKey);
      }

      // 3. Upload content to IPFS
      const ipfsResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags
      );

      // 4. Create Tor onion service
      const onionResult = await torService.createOnionService(
        ipfsResult.cid,
        ipfsResult.gatewayUrl
      );

      // 5. Sign content
      const contentToSign = JSON.stringify({
        cid: ipfsResult.cid,
        title: body.title,
        tags: body.tags,
      });

      let signature: string;
      if (privateKey) {
        signature = await identityService.signContent(contentToSign, privateKey);
      } else {
        // If no private key provided, create a placeholder signature
        signature = 'unsigned';
      }

      // 6. Store in database
      const content = await prisma.content.create({
        data: {
          cid: ipfsResult.cid,
          title: body.title,
          content: body.content,
          tags: body.tags,
          userId: user.id,
          identityId: identity.id,
          signature,
        },
      });

      // 7. Create mirrors
      const webGatewayUrl = `${env.CORS_ORIGIN}/read/${ipfsResult.cid}`;
      
      await mirrorService.createMirrors(
        content.id,
        ipfsResult.cid,
        ipfsResult.gatewayUrl,
        onionResult.onionUrl,
        webGatewayUrl
      );

      // 8. Announce to discovery network
      await discoveryService.announceContent(ipfsResult.cid, body.tags);

      // 9. Get mirrors for response
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
            publicKey: identity.publicKey,
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
   */
  fastify.get('/api/content/:cid', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const content = await prisma.content.findUnique({
        where: { cid },
        include: {
          identity: {
            include: {
              user: true,
            },
          },
          mirrors: true,
        },
      });

      if (!content) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      return reply.send({
        success: true,
        data: {
          cid: content.cid,
          title: content.title,
          content: content.content,
          tags: content.tags,
          createdAt: content.createdAt,
          publisher: {
            publicKey: content.identity.publicKey,
            walletAddress: content.identity.user.walletAddress,
          },
          signature: content.signature,
          mirrors: content.mirrors.map((m) => ({
            type: m.type,
            url: m.url,
            available: m.available,
            latency: m.latency,
          })),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch content',
      });
    }
  });
}
