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
  publicKey: z.string().optional(), // Optional - client-provided Ed25519 public key
  signature: z.string().optional(), // Optional - client-provided Ed25519 signature
  timestamp: z.string().optional(), // Optional - client-signed timestamp
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
      let publicKey = body.publicKey;
      let signature = body.signature;
      const publishedTimestamp = body.timestamp || new Date().toISOString();

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
        publicKey = identity.publicKey;
      } else if (body.publicKey) {
        // Client provided sovereign burner public key
        identity = await prisma.identity.findUnique({
          where: { publicKey: body.publicKey },
        });

        if (!identity) {
          identity = await prisma.identity.create({
            data: {
              publicKey: body.publicKey,
            },
          });
        }
        publicKey = identity.publicKey;
      } else {
        // Anonymous publishing - generate ephemeral keypair
        const keypair = await identityService.generateKeypair();
        privateKey = keypair.privateKey;
        
        // Create anonymous identity (no user linkage)
        identity = await prisma.identity.create({
          data: {
            publicKey: keypair.publicKey,
          },
        });
        publicKey = identity.publicKey;
      }

      // 2. Sign content BEFORE uploading to IPFS if not already signed client-side
      const contentToSign = JSON.stringify({
        title: body.title,
        tags: body.tags,
        timestamp: publishedTimestamp,
      });

      if (!signature) {
        signature = privateKey
          ? await identityService.signContent(contentToSign, privateKey)
          : 'unsigned';
      }

      // 3. Upload FULL content to IPFS (source of truth) with synchronized timestamp
      const ipfsResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags,
        { pubkey: publicKey, signature },
        publishedTimestamp
      );

      // 4. Create Tor onion service
      console.log('🧅 [PUBLISH] Creating Tor onion service...');
      const onionResult = await torService.createOnionService(
        ipfsResult.cid,
        ipfsResult.gatewayUrl
      );
      console.log('🧅 [PUBLISH] Tor onion result:', onionResult);

      // 5. Store metadata in database (CACHE LAYER ONLY)
      const content = await prisma.content.create({
        data: {
          cid: ipfsResult.cid,
          title: body.title,
          tags: body.tags,
          publisherPubKey: publicKey,
          userId: userId || undefined, // undefined for anonymous
          signature,
          createdAt: new Date(publishedTimestamp),
        },
      });

      console.log('✅ Content metadata cached in database');
      console.log('📦 Source of truth: IPFS CID', ipfsResult.cid);

      // 6. Create mirrors
      const webGatewayUrl = `${env.CORS_ORIGIN}/read/${ipfsResult.cid}`;
      
      console.log('🪞 [PUBLISH] Creating mirrors with:', {
        ipfs: ipfsResult.gatewayUrl,
        tor: onionResult.onionUrl,
        gateway: webGatewayUrl,
      });
      
      await mirrorService.createMirrors(
        content.id,
        ipfsResult.cid,
        ipfsResult.gatewayUrl,
        onionResult.onionUrl,
        webGatewayUrl
      );
      
      console.log('✅ [PUBLISH] Mirrors created successfully');

      // 7. Announce to IPFS DHT for decentralized discovery (Phase 2B)
      // Creates manifest with excerpt, word count, reading time
      const dhtResult = await discoveryService.announceContent(
        ipfsResult.cid,
        body.title,
        body.content,
        body.tags,
        { pubkey: publicKey, signature },
        {
          ipfs: ipfsResult.gatewayUrl,
          tor: onionResult.onionUrl,
          gateway: webGatewayUrl,
        }
      );

      // 8. Get mirrors for response
      const mirrors = await mirrorService.getMirrors(content.id);

      return reply.status(201).send({
        success: true,
        data: {
          cid: ipfsResult.cid,
          shareUrl: `pressprotocol://${ipfsResult.cid}`,
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

        // Transform mirrors array to object structure for frontend
        const mirrorsObj: any = {
          ipfs: null,
          tor: null,
          gateway: null,
        };
        
        cachedContent.mirrors.forEach((m) => {
          mirrorsObj[m.type] = {
            url: m.url,
            available: m.available,
            latency: m.latency,
          };
        });

        console.log('📡 [READ] Returning content with mirrors:', {
          cid: cachedContent.cid,
          title: cachedContent.title,
          mirrors: mirrorsObj,
        });

        return reply.send({
          success: true,
          data: {
            cid: cachedContent.cid,
            title: cachedContent.title,
            content: fullContent?.content || "", // From IPFS or local cache
            tags: cachedContent.tags,
            createdAt: cachedContent.createdAt,
            publisher: {
              publicKey: cachedContent.publisherPubKey,
              walletAddress: cachedContent.user?.walletAddress,
              username: cachedContent.user?.username,
              pubkey: cachedContent.publisherPubKey,
              signature: cachedContent.signature,
              isAnonymous: !cachedContent.userId,
            },
            signature: cachedContent.signature,
            mirrors: mirrorsObj,
            recommended: 'ipfs', // Default recommendation
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

  /**
   * GET /ipfs/:cid - Serve IPFS content through backend (for Tor onion access)
   * This allows .onion URLs like http://abc.onion/ipfs/QmXYZ to work
   */
  fastify.get('/ipfs/:cid', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };
      
      console.log(`🔍 [TOR-IPFS] Fetching content for Tor access: ${cid}`);

      // Try database cache first
      const cachedContent = await prisma.content.findUnique({
        where: { cid },
        include: {
          user: true,
          mirrors: true,
        },
      });

      if (!cachedContent) {
        console.log(`⚠️  [TOR-IPFS] Content not found in cache: ${cid}`);
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      // Fetch FULL content from IPFS
      let fullContent;
      try {
        fullContent = await storageService.getContentFromIPFS(cid);
        console.log(`✅ [TOR-IPFS] Content fetched from IPFS: ${cachedContent.title}`);
      } catch (ipfsError) {
        console.error(`❌ [TOR-IPFS] IPFS fetch failed:`, ipfsError);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch content from IPFS',
        });
      }

      // Return HTML page (for browser viewing)
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cachedContent.title} - PressProtocol (Tor)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 2rem;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            padding: 3rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .tor-badge {
            display: inline-block;
            background: #7e4798;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .meta {
            color: #666;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #eee;
        }
        .tags {
            margin-bottom: 2rem;
        }
        .tag {
            display: inline-block;
            background: #e0e0e0;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .content {
            font-size: 1.125rem;
            line-height: 1.8;
        }
        .content p { margin-bottom: 1.5rem; }
        .content h2 { margin: 2rem 0 1rem; font-size: 1.875rem; }
        .content h3 { margin: 1.5rem 0 0.75rem; font-size: 1.5rem; }
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 0.875rem;
        }
        .cid {
            font-family: monospace;
            background: #f0f0f0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <span class="tor-badge">🧅 Accessed via Tor</span>
        <h1>${cachedContent.title}</h1>
        <div class="meta">
            <div><strong>Published:</strong> ${new Date(cachedContent.createdAt).toLocaleDateString()}</div>
            <div><strong>Publisher:</strong> <span class="cid">${cachedContent.publisherPubKey.slice(0, 16)}...</span></div>
            <div><strong>CID:</strong> <span class="cid">${cid}</span></div>
        </div>
        ${cachedContent.tags.length > 0 ? `
        <div class="tags">
            ${cachedContent.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        ` : ''}
        <div class="content">
            ${fullContent.content}
        </div>
        <div class="footer">
            <p>🔐 This content is censorship-resistant and accessible via Tor</p>
            <p>Powered by <strong>PressProtocol</strong> - Decentralized Publishing Platform</p>
        </div>
    </div>
</body>
</html>
      `;

      reply.type('text/html').send(html);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to serve content',
      });
    }
  });
}
