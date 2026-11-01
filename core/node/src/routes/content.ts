import { FastifyInstance } from 'fastify';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { storageService } from '../services/StorageService.js';
import { torService } from '../services/TorService.js';
import { mirrorService } from '../services/MirrorService.js';
import { discoveryService } from '../services/DiscoveryService.js';
import { publicAppUrl, publicNodeUrl } from '../lib/public-urls.js';
import { rateLimit } from '../lib/auth.js';
import { verifyPublication } from '@pressprotocol/sdk/protocol';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TOR_ARTICLE_CSP =
  "default-src 'none'; img-src https: data:; media-src https:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

const articleSanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'a', 'p', 'br', 'hr', 'em', 'strong', 'b', 'i', 'u', 's', 'del', 'ins', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'q', 'cite',
    'pre', 'code', 'kbd', 'samp', 'var',
    'figure', 'figcaption', 'img', 'picture', 'video', 'audio', 'source',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
    'dl', 'dt', 'dd', 'details', 'summary', 'sup', 'sub', 'small', 'time', 'abbr',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    video: ['src', 'controls', 'poster', 'width', 'height'],
    audio: ['src', 'controls'],
    source: ['src', 'type', 'srcset', 'media'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
    col: ['span'],
    time: ['datetime'],
    '*': ['class', 'id', 'lang', 'dir'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'ipfs'],
  allowedSchemesByTag: { img: ['https', 'http', 'data', 'ipfs'] },
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
};

const publishContentSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  walletAddress: z.string().optional(), // Optional - anonymous publishing
  publicKey: z.string().optional(), // Optional - client-provided Ed25519 public key
  signature: z.string().optional(), // Optional - client-provided Ed25519 signature
  timestamp: z.string().optional(), // Optional - client-signed timestamp
  author: z.string().optional(),
  sourceUrl: z.string().optional(),
  excerpt: z.string().optional(),
  readingTime: z.number().optional(),
  wordCount: z.number().optional(),
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
  fastify.post('/api/content', { preHandler: rateLimit(120) }, async (request, reply) => {
    try {
      const body = publishContentSchema.parse(request.body);

      // 1. Optional client signature — must be protocol v2 (content-bound). A wallet
      //    address alone is stored only as a label; it does not authenticate the publish.
      let user = null;
      let userId = null;
      const publishedTimestamp = body.timestamp || new Date().toISOString();
      let publicKey: string | undefined;
      let signature = 'unsigned';
      let signatureStatus: 'verified' | 'unsigned' = 'unsigned';

      if (body.signature || body.publicKey) {
        const verification = await verifyPublication({
          title: body.title,
          tags: body.tags,
          timestamp: body.timestamp || '',
          content: body.content,
          publicKey: body.publicKey || '',
          signature: body.signature || '',
        });
        if (!verification.isValid) {
          return reply.status(401).send({
            success: false,
            error:
              verification.status === 'legacy'
                ? 'Signature uses the legacy v1 format (metadata only). Re-sign with protocol v2.'
                : 'Invalid signature for the v2 content-bound payload.',
          });
        }
        publicKey = body.publicKey;
        signature = body.signature!;
        signatureStatus = 'verified';
        await prisma.identity.create({
          data: { publicKey: body.publicKey! },
        }).catch(() => undefined); // dedupe best-effort
      }

      if (body.walletAddress) {
        user = await prisma.user.findUnique({
          where: { walletAddress: body.walletAddress },
        });
        if (!user) {
          user = await prisma.user.create({
            data: { walletAddress: body.walletAddress },
          });
        }
        userId = user.id;
      }

      // Metadata passed through from client (e.g. browser extension)
      const publicationMetadata = {
        author: body.author,
        sourceUrl: body.sourceUrl,
        excerpt: body.excerpt,
        readingTime: body.readingTime,
        wordCount: body.wordCount,
      };

      // 3. Upload FULL content to IPFS (source of truth) with synchronized timestamp and metadata
      const ipfsResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags,
        { pubkey: publicKey, signature },
        publishedTimestamp,
        publicationMetadata
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
          publisherPubKey: publicKey || 'unsigned',
          userId: userId || undefined, // undefined for anonymous
          signature,
          createdAt: new Date(publishedTimestamp),
        },
      });

      console.log('✅ Content metadata cached in database');
      console.log('📦 Source of truth: IPFS CID', ipfsResult.cid);

      // 6. Create mirrors
      const webGatewayUrl = `${publicAppUrl()}/read/${ipfsResult.cid}`;
      
      console.log('🪞 [PUBLISH] Creating mirrors with:', {
        ipfs: ipfsResult.gatewayUrl || `${publicNodeUrl()}/ipfs/${ipfsResult.cid}`,
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
      // Creates manifest with excerpt, word count, reading time and client metadata
      const dhtResult = await discoveryService.announceContent(
        ipfsResult.cid,
        body.title,
        body.content,
        body.tags,
        { pubkey: publicKey, signature },
        {
          ipfs: ipfsResult.gatewayUrl || `${publicNodeUrl()}/ipfs/${ipfsResult.cid}`,
          tor: onionResult.onionUrl,
          gateway: webGatewayUrl,
        },
        publicationMetadata
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
            publicKey: publicKey || null,
            signatureStatus,
            sigVersion: signatureStatus === 'verified' ? 2 : null,
            isAnonymous: !publicKey,
          },
          storage: ipfsResult.storage,
          pinnedToIpfs: ipfsResult.pinned,
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
  /**
   * GET /read/:cid & GET /ipfs/:cid - Serve content as isolated HTML for Tor Browser
   * Both endpoints route to the self-contained Tor reading pane with zero clearnet leaks
   */
  const serveTorArticle = async (request: any, reply: any) => {
    try {
      const { cid } = request.params as { cid: string };
      
      console.log(`🔍 [TOR-READER] Resolving content for Tor access: ${cid}`);

      // 1. Try database cache first
      let cachedContent: any = null;
      try {
        cachedContent = await prisma.content.findUnique({
          where: { cid },
          include: {
            user: true,
            mirrors: true,
          },
        });
      } catch (dbErr) {
        console.warn(`⚠️ [TOR-READER] Database query skipped or failed:`, dbErr);
      }

      // 2. Fetch content from IPFS (primary source of truth)
      let fullContent: any = null;
      try {
        fullContent = await storageService.getContentFromIPFS(cid);
        console.log(`✅ [TOR-READER] Content fetched from IPFS swarm for CID: ${cid}`);
      } catch (ipfsError) {
        console.warn(`⚠️ [TOR-READER] IPFS fetch failed:`, ipfsError);
      }

      // 3. Fallback: If neither cache nor IPFS yielded content, return 404
      if (!cachedContent && !fullContent) {
        console.log(`❌ [TOR-READER] Content not found in cache or IPFS: ${cid}`);
        return reply.status(404).send({
          success: false,
          error: 'Content not found on decentralized network',
          cid,
        });
      }

      // Normalize fields
      const rawTitle = cachedContent?.title || fullContent?.title || 'Preserved Sovereign Dispatch';
      const rawBodyHtml = fullContent?.content || '<p>Content body synchronizing across DHT...</p>';
      const rawTags: string[] = cachedContent?.tags || (Array.isArray(fullContent?.tags) ? fullContent.tags : []);
      const rawTimestamp = fullContent?.timestamp || cachedContent?.createdAt?.toISOString?.() || '';
      const createdAt = cachedContent?.createdAt ? new Date(cachedContent.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
      const publisherKey = cachedContent?.publisherPubKey || fullContent?.publisher?.pubkey || fullContent?.publisher?.publicKey || '';
      const signature = cachedContent?.signature || fullContent?.publisher?.signature || '';

      // Sanitize untrusted article HTML — it arrives from arbitrary IPFS publishers
      const bodyHtml = sanitizeHtml(rawBodyHtml, articleSanitizeOptions);
      const title = escapeHtml(String(rawTitle));
      const tags = rawTags.map((t: string) => escapeHtml(String(t)));

      // Verify the signature against the fetched body instead of trusting a badge
      let proofBadge = 'Unsigned';
      if (signature && publisherKey && signature !== 'unsigned' && publisherKey !== 'unsigned') {
        const verification = await verifyPublication({
          title: String(rawTitle),
          tags: rawTags,
          timestamp: rawTimestamp,
          content: rawBodyHtml,
          publicKey: publisherKey,
          signature,
        });
        proofBadge =
          verification.status === 'verified'
            ? '✓ Ed25519 Verified (v2, content-bound)'
            : verification.status === 'legacy'
              ? 'Legacy signature (metadata only)'
              : '⚠ Signature invalid';
      }

      const shortKey = publisherKey.length > 24 ? publisherKey.slice(0, 16) + '...' + publisherKey.slice(-8) : (publisherKey || 'sovereign-anonymous-author');

      // Return hardened self-contained HTML page conforming to v2 design tokens
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — PressProtocol (Tor v3)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            line-height: 1.75;
            color: #EEE7E1;
            background-color: #0B0A0C;
            padding: 2.5rem 1rem;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 680px;
            margin: 0 auto;
            background-color: #141216;
            padding: 3rem 2.5rem;
            border-radius: 8px;
            border: 1px solid rgba(240, 232, 232, 0.08);
            box-shadow: 0 12px 32px -4px rgba(0,0,0,0.6);
        }
        .header-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1.25rem;
            border-bottom: 1px solid rgba(240, 232, 232, 0.08);
        }
        .tor-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(135, 112, 196, 0.14);
            color: #A18CDA;
            border: 1px solid rgba(135, 112, 196, 0.3);
            padding: 0.35rem 0.85rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-weight: 600;
        }
        .proof-badge {
            font-size: 0.75rem;
            color: #3E9C72;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        h1 {
            font-size: 2.25rem;
            line-height: 1.25;
            margin-bottom: 1.5rem;
            font-weight: 700;
            color: #EEE7E1;
            letter-spacing: -0.02em;
        }
        .meta {
            color: #A79E96;
            margin-bottom: 2.5rem;
            padding-bottom: 1.25rem;
            border-bottom: 1px solid rgba(240, 232, 232, 0.06);
            font-size: 0.8125rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .meta-label { color: #6F675F; }
        .meta-val { color: #A79E96; }
        .tags {
            margin-bottom: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .tag {
            display: inline-block;
            background: rgba(240, 232, 232, 0.05);
            color: #A79E96;
            border: 1px solid rgba(240, 232, 232, 0.08);
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .content {
            font-size: 1.0625rem;
            line-height: 1.85;
            color: #EEE7E1;
        }
        .content p { margin-bottom: 1.5rem; }
        .content h2 { margin: 2rem 0 1rem; font-size: 1.5rem; color: #EEE7E1; border-bottom: 1px solid rgba(240, 232, 232, 0.08); padding-bottom: 0.5rem; }
        .content h3 { margin: 1.5rem 0 0.75rem; font-size: 1.25rem; color: #EEE7E1; }
        .content blockquote {
            border-left: 2px solid #7C2733;
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: #A79E96;
            font-style: italic;
        }
        .content pre, .content code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            background: #0B0A0C;
            border: 1px solid rgba(240, 232, 232, 0.08);
            border-radius: 4px;
            font-size: 0.875rem;
        }
        .content code { padding: 0.15rem 0.35rem; }
        .content pre { padding: 1rem; overflow-x: auto; margin: 1.5rem 0; }
        .footer {
            margin-top: 3.5rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(240, 232, 232, 0.08);
            text-align: center;
            color: #6F675F;
            font-size: 0.8125rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .footer strong { color: #A79E96; }
        .cid-chip {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            background: #0B0A0C;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            border: 1px solid rgba(240, 232, 232, 0.08);
            font-size: 0.75rem;
            color: #A79E96;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-strip">
            <span class="tor-badge">🧅 Tor v3 Hidden Circuit</span>
            <span class="proof-badge">${proofBadge}</span>
        </div>
        <h1>${title}</h1>
        <div class="meta">
            <div class="meta-row">
                <span class="meta-label">Published:</span>
                <span class="meta-val">${createdAt}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Author Sovereign Key:</span>
                <span class="meta-val">${escapeHtml(shortKey)}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">IPFS CID:</span>
                <span class="cid-chip">${escapeHtml(cid)}</span>
            </div>
        </div>
        ${tags.length > 0 ? `
        <div class="tags">
            ${tags.map((t: string) => `<span class="tag">#${t}</span>`).join('')}
        </div>
        ` : ''}
        <article class="content">
            ${bodyHtml}
        </article>
        <div class="footer">
            <p>🛡️ Served with zero client tracking scripts directly through the Tor network</p>
            <p>Powered by <strong>PressProtocol Sovereign Community Node</strong></p>
        </div>
    </div>
</body>
</html>`;

      reply
        .header('Content-Security-Policy', TOR_ARTICLE_CSP)
        .header('X-Content-Type-Options', 'nosniff')
        .header('Cross-Origin-Opener-Policy', 'same-origin')
        .type('text/html; charset=utf-8')
        .send(html);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to serve sovereign content via Tor',
      });
    }
  };

  fastify.get('/read/:cid', serveTorArticle);
  fastify.get('/ipfs/:cid', serveTorArticle);
}
