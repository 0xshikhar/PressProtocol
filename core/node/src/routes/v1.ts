import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { apiKeyService } from '../services/ApiKeyService.js';
import { identityService } from '../services/IdentityService.js';
import { storageService } from '../services/StorageService.js';
import { torService } from '../services/TorService.js';
import { resolverService } from '../services/ResolverService.js';
import { calculateDeterministicCIDv1 } from '../lib/cid.js';
import { webhookSubscriptionService } from '../services/WebhookSubscriptionService.js';

// Schemas
const publishRawSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  format: z.enum(['markdown', 'html', 'json']).default('markdown'),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const publishSignedSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  timestamp: z.string().min(1),
  publicKey: z.string().min(64).max(64), // 32-byte hex
  signature: z.string().min(128).max(128), // 64-byte hex
  metadata: z.record(z.any()).optional(),
});

const verifySchema = z.object({
  cid: z.string().optional(),
  content: z.string().min(1),
  publicKey: z.string().min(64).max(64),
  signature: z.string().min(128).max(128),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
});

const createKeySchema = z.object({
  name: z.string().min(1),
  owner: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  rateLimitPerMin: z.number().positive().optional(),
  maxBytes: z.number().positive().optional(),
  isTest: z.boolean().optional(),
});

const webhookSubscriptionSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['article.published', 'article.verified', 'mirror.health_changed', '*'])).optional(),
  secret: z.string().optional(),
  description: z.string().optional(),
});


/**
 * Extracts API key from Authorization header ("Bearer <key>") or "x-api-key" header.
 */
function extractApiKey(request: FastifyRequest): string | undefined {
  const authHeader = request.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = request.headers['x-api-key'];
  if (typeof customHeader === 'string') {
    return customHeader.trim();
  }
  return undefined;
}

export async function v1Routes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/publish/raw - Custodial / Server-Signed Publishing
   */
  fastify.post('/api/v1/publish/raw', async (request, reply) => {
    const rawKey = extractApiKey(request);
    let keyRecord = undefined;

    // Validate key if provided
    if (rawKey) {
      const auth = apiKeyService.validateKey(rawKey, 'publish:raw');
      if (!auth.valid) {
        return reply.status(401).send({ success: false, error: auth.error });
      }
      keyRecord = auth.record;
    }

    // Rate limiting (by API key ID or client IP)
    const rateLimitId = keyRecord ? keyRecord.id : request.ip;
    const rateLimit = apiKeyService.checkRateLimit(rateLimitId, keyRecord?.rateLimitPerMin || 60);

    reply.header('X-RateLimit-Limit', rateLimit.limit);
    reply.header('X-RateLimit-Remaining', rateLimit.remaining);
    reply.header('X-RateLimit-Reset', rateLimit.resetTimeMs);

    if (!rateLimit.allowed) {
      reply.header('Retry-After', rateLimit.retryAfterSec);
      return reply.status(429).send({
        success: false,
        error: 'Too Many Requests: Rate limit exceeded. Try again in ' + rateLimit.retryAfterSec + ' seconds.',
      });
    }

    try {
      const body = publishRawSchema.parse(request.body);
      const timestamp = new Date().toISOString();

      // Node signs the content using node identity
      const nodeKeypair = await identityService.generateKeypair();
      const canonicalPayload = JSON.stringify({
        title: body.title,
        tags: body.tags,
        timestamp,
      });
      const signature = await identityService.signContent(canonicalPayload, nodeKeypair.privateKey);
      const deterministicCID = calculateDeterministicCIDv1(body.content);

      // Store in IPFS & local blockstore
      const uploadResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags,
        { pubkey: nodeKeypair.publicKey, signature },
        timestamp
      );

      const finalCID = uploadResult.cid || deterministicCID;
      const onionAddress = await torService.getSelfOnionAddress();

      // Track usage metrics
      if (keyRecord) {
        apiKeyService.recordUsage(keyRecord.id, Buffer.byteLength(body.content, 'utf8'));
      }

      const proof = {
        pressprotocol: '1.0.0-sovereign',
        cid: finalCID,
        title: body.title,
        tags: body.tags,
        timestamp,
        publisher: {
          publicKey: nodeKeypair.publicKey,
          signature,
        },
      };

      // Dispatches real-time outbound webhook event
      webhookSubscriptionService.dispatch('article.published', {
        cid: finalCID,
        title: body.title,
        tags: body.tags,
        author: body.author,
        timestamp,
        publisher: {
          publicKey: nodeKeypair.publicKey,
          signature,
        },
        urls: {
          ipfs: `https://ipfs.io/ipfs/${finalCID}`,
          gateway: `http://127.0.0.1:4000/read/${finalCID}`,
          tor: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
        },
      });

      return reply.status(201).send({
        success: true,
        cid: finalCID,
        title: body.title,
        tags: body.tags,
        timestamp,
        publisher: {
          publicKey: nodeKeypair.publicKey,
          signature,
        },
        urls: {
          ipfs: `https://ipfs.io/ipfs/${finalCID}`,
          gateway: `http://127.0.0.1:4000/read/${finalCID}`,
          tor: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
        },
        proof,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Invalid publish payload',
      });
    }
  });

  /**
   * POST /api/v1/publish/signed - Zero-Custody Client-Signed Swarm Distribution
   */
  fastify.post('/api/v1/publish/signed', async (request, reply) => {
    const rawKey = extractApiKey(request);
    let keyRecord = undefined;

    if (rawKey) {
      const auth = apiKeyService.validateKey(rawKey, 'publish:signed');
      if (!auth.valid) {
        return reply.status(401).send({ success: false, error: auth.error });
      }
      keyRecord = auth.record;
    }

    const rateLimitId = keyRecord ? keyRecord.id : request.ip;
    const rateLimit = apiKeyService.checkRateLimit(rateLimitId, keyRecord?.rateLimitPerMin || 120);

    reply.header('X-RateLimit-Limit', rateLimit.limit);
    reply.header('X-RateLimit-Remaining', rateLimit.remaining);

    if (!rateLimit.allowed) {
      reply.header('Retry-After', rateLimit.retryAfterSec);
      return reply.status(429).send({
        success: false,
        error: 'Too Many Requests: Rate limit exceeded',
      });
    }

    try {
      const body = publishSignedSchema.parse(request.body);

      // 1. Mathematically verify client signature
      const canonicalPayload = JSON.stringify({
        title: body.title,
        tags: body.tags,
        timestamp: body.timestamp,
      });

      const isSignatureValid = await identityService.verifySignature(
        canonicalPayload,
        body.signature,
        body.publicKey
      );

      if (!isSignatureValid) {
        return reply.status(401).send({
          success: false,
          error: 'Cryptographic signature mismatch. Client signature is invalid for canonical payload.',
        });
      }

      // 2. Compute deterministic CIDv1
      const deterministicCID = calculateDeterministicCIDv1(body.content);

      // 3. Swarm Pinning (Zero-Custody: Gateway stores without possessing author private key)
      const uploadResult = await storageService.uploadContent(
        body.title,
        body.content,
        body.tags,
        { pubkey: body.publicKey, signature: body.signature },
        body.timestamp
      );

      const finalCID = uploadResult.cid || deterministicCID;
      const onionAddress = await torService.getSelfOnionAddress();

      if (keyRecord) {
        apiKeyService.recordUsage(keyRecord.id, Buffer.byteLength(body.content, 'utf8'));
      }

      // Dispatches real-time outbound webhook event
      webhookSubscriptionService.dispatch('article.published', {
        cid: finalCID,
        title: body.title,
        tags: body.tags,
        timestamp: body.timestamp,
        publisher: {
          publicKey: body.publicKey,
          signature: body.signature,
        },
        urls: {
          ipfs: `https://ipfs.io/ipfs/${finalCID}`,
          tor: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
          local: `http://127.0.0.1:4000/read/${finalCID}`,
        },
      });

      return reply.status(201).send({
        success: true,
        cid: finalCID,
        verified: true,
        algorithm: 'Ed25519 (RFC 8032)',
        transports: {
          ipfs: `https://ipfs.io/ipfs/${finalCID}`,
          tor: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
          local: `http://127.0.0.1:4000/read/${finalCID}`,
        },
        proof: {
          pressprotocol: '1.0.0-sovereign',
          cid: finalCID,
          title: body.title,
          tags: body.tags,
          timestamp: body.timestamp,
          publisher: {
            publicKey: body.publicKey,
            signature: body.signature,
          },
        },
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Invalid signed publish request',
      });
    }
  });

  /**
   * GET /api/v1/resolve/:cid - Multi-Transport Content & Mirror Resolver
   */
  fastify.get('/api/v1/resolve/:cid', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };
      const resolved = await resolverService.resolveContent(cid);

      if (!resolved) {
        return reply.status(404).send({
          success: false,
          error: `Content with CID "${cid}" not found in local or federated swarm`,
        });
      }

      const mirrors = await resolverService.getAvailableMirrors(cid);
      const onionAddress = await torService.getSelfOnionAddress();

      return reply.send({
        success: true,
        cid,
        data: resolved,
        mirrors,
        transports: {
          ipfs: `https://ipfs.io/ipfs/${cid}`,
          tor: onionAddress ? `http://${onionAddress}/read/${cid}` : undefined,
          local: `http://127.0.0.1:4000/read/${cid}`,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: 'Resolver error: ' + err.message,
      });
    }
  });

  /**
   * POST /api/v1/verify - Instant Cryptographic Audit Endpoint
   */
  fastify.post('/api/v1/verify', async (request, reply) => {
    const start = performance.now();
    try {
      const body = verifySchema.parse(request.body);
      const computedCID = calculateDeterministicCIDv1(body.content);
      const cidMatches = body.cid ? (body.cid === computedCID || body.cid.startsWith('Qm')) : true;

      // Candidate 1: Canonical title + tags + timestamp
      let signatureValid = false;
      if (body.title && body.timestamp) {
        const canonicalPayload = JSON.stringify({
          title: body.title,
          tags: body.tags || [],
          timestamp: body.timestamp,
        });
        signatureValid = await identityService.verifySignature(
          canonicalPayload,
          body.signature,
          body.publicKey
        );
      }

      // Candidate 2: Direct raw content
      if (!signatureValid) {
        signatureValid = await identityService.verifySignature(
          body.content,
          body.signature,
          body.publicKey
        );
      }

      const latencyMs = Math.round((performance.now() - start) * 100) / 100;

      const isValid = signatureValid && cidMatches;

      if (isValid) {
        webhookSubscriptionService.dispatch('article.verified', {
          cid: computedCID,
          title: body.title,
          tags: body.tags,
          timestamp: body.timestamp,
          publicKey: body.publicKey,
          isValid: true,
        });
      }

      return reply.send({
        isValid,
        cidMatches,
        signatureValid,
        algorithm: 'Ed25519 (RFC 8032)',
        computedCID,
        latencyMs,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Verification failed',
      });
    }
  });

  /**
   * GET /api/v1/openapi.json - Self-Documenting OpenAPI 3.1.0 Specification
   */
  fastify.get('/api/v1/openapi.json', async (request, reply) => {
    return reply.send({
      openapi: '3.1.0',
      info: {
        title: 'PressProtocol Open Infrastructure API',
        version: '1.0.0',
        description: 'Universal decentralized publishing substrate, multi-transport resolver, and enterprise gateway',
        contact: {
          name: 'PressProtocol Architecture Team',
          url: 'https://pressprotocol.com',
        },
      },
      servers: [
        { url: 'http://127.0.0.1:4000', description: 'Local Headless Micro-Daemon' },
        { url: 'https://node.pressprotocol.com', description: 'Global Community Gateway' },
      ],
      paths: {
        '/api/v1/publish/raw': {
          post: {
            summary: 'Publish and sign content via node identity',
            security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
            responses: {
              '201': { description: 'Content successfully anchored to IPFS/Tor' },
              '429': { description: 'Rate limit exceeded' },
            },
          },
        },
        '/api/v1/publish/signed': {
          post: {
            summary: 'Relay pre-signed sovereign content (zero-custody)',
            responses: {
              '201': { description: 'Pre-signed content distributed across swarm' },
              '401': { description: 'Cryptographic signature mismatch' },
            },
          },
        },
        '/api/v1/resolve/{cid}': {
          get: {
            summary: 'Resolve content and mirror status by CID',
            parameters: [{ name: 'cid', in: 'path', required: true }],
            responses: {
              '200': { description: 'Resolved content and active mirrors' },
              '404': { description: 'Content not found' },
            },
          },
        },
        '/api/v1/verify': {
          post: {
            summary: 'Cryptographic verification audit',
            responses: {
              '200': { description: 'Mathematical validity report' },
            },
          },
        },
        '/api/v1/webhooks/subscriptions': {
          post: {
            summary: 'Register outbound webhook subscription',
            responses: { '201': { description: 'Subscription created with HMAC secret' } },
          },
          get: {
            summary: 'List active webhook subscriptions',
            responses: { '200': { description: 'List of registered webhooks' } },
          },
        },
        '/api/v1/metrics': {
          get: {
            summary: 'Enterprise node throughput and health metrics',
            responses: { '200': { description: 'Node metrics report' } },
          },
        },
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
          BearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    });
  });

  /**
   * POST /api/v1/admin/keys - Issue API Key (Admin Scope Required)
   */
  fastify.post('/api/v1/admin/keys', async (request, reply) => {
    const rawKey = extractApiKey(request);
    const auth = apiKeyService.validateKey(rawKey || '', 'admin');
    if (!auth.valid) {
      return reply.status(403).send({ success: false, error: 'Admin scope required' });
    }

    try {
      const body = createKeySchema.parse(request.body) as {
        name: string;
        owner?: string;
        scopes?: string[];
        rateLimitPerMin?: number;
        maxBytes?: number;
        isTest?: boolean;
      };
      const generated = apiKeyService.generateKey(body);
      return reply.status(201).send({
        success: true,
        apiKey: generated.key,
        record: generated.record,
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  /**
   * GET /api/v1/admin/keys - List API Keys
   */
  fastify.get('/api/v1/admin/keys', async (request, reply) => {
    const rawKey = extractApiKey(request);
    const auth = apiKeyService.validateKey(rawKey || '', 'admin');
    if (!auth.valid) {
      return reply.status(403).send({ success: false, error: 'Admin scope required' });
    }

    return reply.send({
      success: true,
      keys: apiKeyService.listKeys(),
    });
  });

  /**
   * DELETE /api/v1/admin/keys/:id - Revoke API Key
   */
  fastify.delete('/api/v1/admin/keys/:id', async (request, reply) => {
    const rawKey = extractApiKey(request);
    const auth = apiKeyService.validateKey(rawKey || '', 'admin');
    if (!auth.valid) {
      return reply.status(403).send({ success: false, error: 'Admin scope required' });
    }

    const { id } = request.params as { id: string };
    const success = apiKeyService.revokeKey(id);
    return reply.send({ success, revokedId: id });
  });

  /**
   * POST /api/v1/webhooks/subscriptions - Register Outbound Webhook Subscription
   */
  fastify.post('/api/v1/webhooks/subscriptions', async (request, reply) => {
    const rawKey = extractApiKey(request);
    let owner = 'anonymous';
    if (rawKey) {
      const auth = apiKeyService.validateKey(rawKey);
      if (auth.valid && auth.record) {
        owner = auth.record.id;
      }
    }

    try {
      const body = webhookSubscriptionSchema.parse(request.body);
      const subscription = webhookSubscriptionService.createSubscription({
        url: body.url,
        events: body.events as any,
        secret: body.secret,
        owner,
      });

      return reply.status(201).send({
        success: true,
        subscription,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Invalid webhook subscription payload',
      });
    }
  });

  /**
   * GET /api/v1/webhooks/subscriptions - List Webhook Subscriptions
   */
  fastify.get('/api/v1/webhooks/subscriptions', async (request, reply) => {
    const rawKey = extractApiKey(request);
    let owner: string | undefined = undefined;
    if (rawKey) {
      const auth = apiKeyService.validateKey(rawKey);
      if (auth.valid && auth.record) {
        owner = auth.record.id;
      }
    }

    const subscriptions = webhookSubscriptionService.listSubscriptions(owner);
    return reply.send({
      success: true,
      subscriptions,
    });
  });

  /**
   * GET /api/v1/webhooks/subscriptions/:id - Get Single Subscription Details
   */
  fastify.get('/api/v1/webhooks/subscriptions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const subscription = webhookSubscriptionService.getSubscription(id);
    if (!subscription) {
      return reply.status(404).send({
        success: false,
        error: `Webhook subscription "${id}" not found`,
      });
    }
    return reply.send({
      success: true,
      subscription,
    });
  });

  /**
   * DELETE /api/v1/webhooks/subscriptions/:id - Revoke Webhook Subscription
   */
  fastify.delete('/api/v1/webhooks/subscriptions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const success = webhookSubscriptionService.deleteSubscription(id);
    if (!success) {
      return reply.status(404).send({
        success: false,
        error: `Webhook subscription "${id}" not found`,
      });
    }
    return reply.send({
      success: true,
      revokedId: id,
    });
  });

  /**
   * POST /api/v1/webhooks/subscriptions/:id/test - Trigger Live Test Ping
   */
  fastify.post('/api/v1/webhooks/subscriptions/:id/test', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await webhookSubscriptionService.triggerTestPing(id);
      return reply.send({
        success: result.success,
        statusCode: result.statusCode,
        error: result.error,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        error: err.message || 'Test ping failed',
      });
    }
  });

  /**
   * GET /api/v1/metrics - Node Throughput & Usage Analytics
   */
  fastify.get('/api/v1/metrics', async (request, reply) => {
    return reply.send({
      success: true,
      metrics: apiKeyService.getMetrics(),
    });
  });
}
