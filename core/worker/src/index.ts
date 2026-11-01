import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, PublishContentInput, PublishResponseData } from './types';
import { PinataService } from './services/pinata';
import { indexContentInDB, getRecentContentFromDB, getContentStatsFromDB } from './services/db';
import { verifyPublication } from '@pressprotocol/sdk/protocol';
import { attributeSubmission, signWithEdgeKey } from './lib/signing';
import { isValidCID } from './lib/validation';
import { getOnionHost, onionReadUrl } from './lib/tor';
import { bodyLimit } from 'hono/body-limit';
import {
  MAX_JSON_BODY_BYTES,
  MAX_UPLOAD_BYTES,
  publishContentSchema,
  publishRawSchema,
  publishSignedSchema,
  rateLimit,
  validateImageUpload,
  validationError,
} from './lib/limits';

const app = new Hono<{ Bindings: Env }>();

// Global CORS Middleware
app.use('*', async (c, next) => {
  const origin = c.env.CORS_ORIGIN || '*';
  const corsMiddleware = cors({
    origin: origin === '*' ? '*' : origin.split(',').map((o) => o.trim()),
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-PressProtocol-Node'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

const jsonBodyLimit = bodyLimit({
  maxSize: MAX_JSON_BODY_BYTES,
  onError: (c) => c.json({ success: false, error: 'Request body too large' }, 413),
});
const uploadBodyLimit = bodyLimit({
  maxSize: MAX_UPLOAD_BYTES + 64 * 1024,
  onError: (c) => c.json({ success: false, error: 'Upload too large' }, 413),
});

app.use('/api/content', jsonBodyLimit);
app.use('/api/identity', jsonBodyLimit);
app.use('/api/v1/*', jsonBodyLimit);
app.use('/api/upload/*', uploadBodyLimit);

for (const path of ['/api/content', '/api/upload/*', '/api/v1/publish/*']) {
  app.on('POST', path, rateLimit('PUBLISH_LIMITER', 'publish'));
}
for (const path of ['/api/content/*', '/api/resolve/*', '/api/mirrors/*', '/api/v1/resolve/*', '/api/v1/verify']) {
  app.use(path, rateLimit('READ_LIMITER', 'read'));
}

for (const path of ['/api/content/:cid', '/api/resolve/:cid', '/api/mirrors/:cid/health', '/api/v1/resolve/:cid']) {
  app.use(path, async (c, next) => {
    const cid = c.req.param('cid');
    if (!isValidCID(cid)) {
      return c.json({ success: false, error: 'Invalid IPFS CID format', cid }, 400);
    }
    await next();
  });
}

// Root RFC-009 Node Spec Overview
app.get('/', (c) => {
  return c.json({
    name: 'PressProtocol Sovereign Edge API',
    version: '1.0.6-edge',
    runtime: 'cloudflare-workers',
    specification: 'RFC-PP-009-ENTERPRISE-GATEWAY-AND-API',
    description: 'High-availability global edge backend for PressProtocol publishing and IPFS resolution',
    endpoints: {
      health: '/health',
      nodeStatus: '/api/node/status',
      contentPublish: 'POST /api/content',
      contentRetrieve: 'GET /api/content/:cid',
      contentList: 'GET /api/content',
      resolve: 'GET /api/resolve/:cid',
      mirrors: 'GET /api/mirrors/:cid/health',
      identity: 'POST /api/identity',
      uploadImage: 'POST /api/upload/image',
    },
    docs: 'https://pressprotocol.com/docs',
  });
});

// Healthchecks
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'pressprotocol-edge-worker',
    environment: c.env.ENVIRONMENT || 'production',
  });
});

app.get('/health/live', (c) => c.json({ status: 'alive', timestamp: new Date().toISOString() }));
app.get('/health/ready', (c) => c.json({ status: 'ready', timestamp: new Date().toISOString() }));

// Node Status
app.get('/api/node/status', (c) => {
  return c.json({
    status: 'online',
    mode: 'edge-serverless',
    substrate: 'Cloudflare Workers',
    ipfsMode: 'Pinata Gateway + Swarm Race',
    database: c.env.DATABASE_URL ? 'Prisma Postgres Accelerate' : 'stateless',
    timestamp: new Date().toISOString(),
  });
});

// 1. POST /api/content - Publish Content to IPFS & Index
app.post('/api/content', async (c) => {
  try {
    const parsed = publishContentSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return validationError(c, parsed.error);
    const body: PublishContentInput = parsed.data;

    const title = body.title;
    const content = body.content;
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = body.timestamp || new Date().toISOString();
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    const attributed = await attributeSubmission({
      title,
      tags,
      timestamp,
      content,
      publicKey: body.publicKey,
      signature: body.signature,
    });
    if (!attributed.ok) {
      return c.json(
        { success: false, error: 'Signature verification failed', verification: attributed.verification },
        401
      );
    }
    const { pubkey: publisherPubKey, signature, sigVersion, status: signatureStatus } = attributed.attribution;

    // Pin to Pinata IPFS
    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(
      title,
      content,
      tags,
      { pubkey: publisherPubKey, signature, ...(sigVersion ? { sigVersion } : {}) },
      timestamp
    );

    const shareUrl = `${appBaseUrl.replace(/\/+$/, '')}/read/${pinResult.cid}`;
    const gatewayMirror = `https://cloudflare-ipfs.com/ipfs/${pinResult.cid}`;
    const torMirror = onionReadUrl(getOnionHost(c.env.TOR_ONION_GATEWAY), pinResult.cid) || '';

    const mirrors = {
      ipfs: pinResult.gatewayUrl,
      tor: torMirror,
      gateway: gatewayMirror,
    };

    // Asynchronously record in Prisma Postgres Accelerate (non-blocking)
    if (c.env.DATABASE_URL) {
      c.executionCtx.waitUntil(
        indexContentInDB(c.env, {
          cid: pinResult.cid,
          title,
          tags,
          publisherPubKey,
          signature,
          mirrors: [
            { type: 'ipfs', url: pinResult.gatewayUrl, available: true },
            { type: 'gateway', url: gatewayMirror, available: true },
            ...(torMirror ? [{ type: 'tor', url: torMirror, available: true }] : []),
          ],
        })
      );
    }

    const responseData: PublishResponseData = {
      cid: pinResult.cid,
      ipfsUrl: pinResult.ipfsUrl,
      gatewayUrl: pinResult.gatewayUrl,
      shareUrl,
      title,
      tags,
      createdAt: timestamp,
      publisher: {
        pubkey: publisherPubKey,
        signature,
        walletAddress: body.walletAddress,
      },
      signatureStatus,
      mirrors,
    };

    return c.json({
      success: true,
      data: responseData,
    });
  } catch (err: any) {
    console.error('Error publishing content in Cloudflare Worker:', err);
    return c.json(
      {
        success: false,
        error: err.message || 'Failed to publish content to decentralized network',
      },
      500
    );
  }
});

// 2. GET /api/content/:cid - Parallel Swarm Gateway Race
const PUBLIC_GATEWAYS = [
  'https://ipfs.filebase.io/ipfs',
  'https://4everland.io/ipfs',
  'https://nftstorage.link/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://dweb.link/ipfs',
];

async function raceIPFSGateways(cid: string, env: Env): Promise<{ raw: any; gateway: string }> {
  const dedicatedGateway = env.PINATA_GATEWAY_URL?.replace(/\/+$/, '');
  const gateways = Array.from(
    new Set(
      [
        dedicatedGateway,
        env.IPFS_GATEWAY_URL ? env.IPFS_GATEWAY_URL.replace(/\/+$/, '') : null,
        ...PUBLIC_GATEWAYS,
      ].filter(Boolean) as string[]
    )
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const fetchPromises = gateways.map(async (gw) => {
    const targetUrl = `${gw}/${cid}`;
    const headers: Record<string, string> = {
      Accept: 'application/json, text/html, text/plain, */*',
      'User-Agent': 'PressProtocol-Edge/1.0.6 (Decentralized Publishing Gateway; +https://pressprotocol.com)',
    };

    if (gw === dedicatedGateway && env.PINATA_GATEWAY_TOKEN) {
      headers['x-pinata-gateway-token'] = env.PINATA_GATEWAY_TOKEN;
    }

    if (env.PINATA_JWT && gw.includes('pinata.cloud')) {
      headers['Authorization'] = `Bearer ${env.PINATA_JWT}`;
    }

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers,
    });

    if (!res.ok) {
      throw new Error(`Gateway ${gw} returned HTTP ${res.status}`);
    }

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If the IPFS node stored raw HTML or text instead of JSON payload
      parsed = {
        title: 'Preserved Sovereign Document',
        content: text,
        tags: ['ipfs-raw'],
        timestamp: new Date().toISOString(),
        publisher: {
          pubkey: '',
          signature: 'unsigned',
        },
      };
    }

    return { raw: parsed, gateway: gw };
  });

  try {
    const result = await Promise.any(fetchPromises);
    clearTimeout(timeoutId);
    controller.abort();
    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    const details = err?.errors?.map((e: any) => e.message || String(e)).join('; ') || err.message;
    throw new Error(`All IPFS gateways failed to resolve CID ${cid}: ${details}`);
  }
}

app.get('/api/content/:cid', async (c) => {
  const cid = c.req.param('cid');

  try {
    const { raw, gateway } = await raceIPFSGateways(cid, c.env);
    const torUrl = onionReadUrl(getOnionHost(c.env.TOR_ONION_GATEWAY), cid);
    if (torUrl) c.header('Onion-Location', torUrl);

    return c.json({
      success: true,
      data: {
        cid,
        title: raw.title || 'Untitled Dispatch',
        content: raw.content || '',
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        createdAt: raw.timestamp || new Date().toISOString(),
        publisher: {
          publicKey: raw.publisher?.pubkey || raw.publisher?.publicKey || '',
          walletAddress: raw.publisher?.walletAddress || '',
          username: raw.publisher?.username || '',
          pubkey: raw.publisher?.pubkey || raw.publisher?.publicKey || '',
          signature: raw.publisher?.signature || 'unsigned',
          sigVersion: raw.publisher?.sigVersion,
          isAnonymous: !raw.publisher?.walletAddress,
        },
        signature: raw.publisher?.signature || 'unsigned',
        mirrors: {
          ipfs: {
            url: `${gateway}/${cid}`,
            available: true,
          },
          tor: torUrl ? { url: torUrl, available: true } : { url: null, available: false, status: 'disabled' },
          gateway: {
            url: `https://cloudflare-ipfs.com/ipfs/${cid}`,
            available: true,
          },
        },
        recommended: 'ipfs',
        source: 'cloudflare-worker-edge-race',
        failoverGateway: gateway,
      },
    });
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: err.message || `Content with CID ${cid} could not be resolved across IPFS swarm.`,
        cid,
      },
      504
    );
  }
});

// 3. GET /api/content - List Recent Content
app.get('/api/content', async (c) => {
  const limitParam = c.req.query('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

  try {
    if (c.env.DATABASE_URL) {
      const records = await getRecentContentFromDB(c.env, limit);
      return c.json({
        success: true,
        data: records,
      });
    }

    return c.json({
      success: true,
      data: [],
      message: 'Database not attached; content discovery is decentralized via IPFS hashes.',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/discovery - Alias for Discovery Feed
app.get('/api/discovery', async (c) => {
  const limitParam = c.req.query('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

  try {
    if (c.env.DATABASE_URL) {
      const records = await getRecentContentFromDB(c.env, limit);
      return c.json({
        success: true,
        data: records,
      });
    }

    return c.json({
      success: true,
      data: [],
      message: 'Database not attached; content discovery is decentralized via IPFS hashes.',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/discovery/stats - Live Discovery Statistics
app.get('/api/discovery/stats', async (c) => {
  try {
    if (c.env.DATABASE_URL) {
      const records = await getRecentContentFromDB(c.env, 100);
      const categoryCounts: Record<string, number> = {};
      for (const item of records) {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        for (const tag of tags) {
          const normalized = typeof tag === 'string' ? tag.toLowerCase().trim() : '';
          if (normalized) {
            categoryCounts[normalized] = (categoryCounts[normalized] || 0) + 1;
          }
        }
      }
      const categories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

      return c.json({
        success: true,
        data: {
          totalContent: records.length,
          categories,
        },
      });
    }

    return c.json({
      success: true,
      data: { totalContent: 0, categories: [] },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/manifests - Ledger for Network Explorer
app.get('/api/manifests', async (c) => {
  const limitParam = c.req.query('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

  try {
    if (c.env.DATABASE_URL) {
      const records = await getRecentContentFromDB(c.env, limit);
      const mapped = records.map((item: any) => ({
        id: item.cid,
        cid: item.cid,
        title: item.title,
        tags: item.tags || [],
        publisher: item.publisherPubKey || '',
        publisherPubKey: item.publisherPubKey || '',
        createdAt: item.createdAt,
        created_at: item.createdAt,
        mirrors: item.mirrors || [],
      }));
      return c.json({
        success: true,
        data: mapped,
      });
    }

    return c.json({ success: true, data: [] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. GET /api/resolve/:cid - Resolve Metadata
app.get('/api/resolve/:cid', async (c) => {
  const cid = c.req.param('cid');
  return c.json({
    success: true,
    cid,
    resolvedAt: new Date().toISOString(),
    primaryGateway: `https://cloudflare-ipfs.com/ipfs/${cid}`,
    pinataGateway: `https://gateway.pinata.cloud/ipfs/${cid}`,
    ipfsUri: `ipfs://${cid}`,
  });
});

// 5. GET /api/mirrors/:cid/health - Check Mirror Health
app.get('/api/mirrors/:cid/health', async (c) => {
  const cid = c.req.param('cid');
  const results = await Promise.allSettled(
    PUBLIC_GATEWAYS.map(async (gw) => {
      const start = Date.now();
      const res = await fetch(`${gw}/${cid}`, { method: 'HEAD' });
      return {
        gateway: gw,
        available: res.ok,
        status: res.status,
        latencyMs: Date.now() - start,
      };
    })
  );

  const mirrors = results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return r.value;
    }
    return {
      gateway: PUBLIC_GATEWAYS[i],
      available: false,
      status: 0,
      latencyMs: null,
    };
  });

  return c.json({
    success: true,
    cid,
    mirrors,
  });
});

// 6. POST /api/identity - Register Identity
app.post('/api/identity', async (c) => {
  try {
    const body = await c.req.json<{ publicKey?: string; walletAddress?: string }>();
    return c.json({
      success: true,
      data: {
        publicKey: body.publicKey || 'anon',
        registeredAt: new Date().toISOString(),
        network: 'cloudflare-edge',
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// 7. POST /api/upload/image - Image Upload
app.post('/api/upload/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') ?? formData.get('image');
    const invalid = validateImageUpload(file);
    if (invalid) return c.json({ success: false, error: invalid }, 400);
    const upload = new FormData();
    upload.append('file', file as File);
    const pinata = new PinataService(c.env);
    const result = await pinata.pinFile(upload);

    return c.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// v1 REST API Endpoints (SDK & cURL Quickstarts)
// ==========================================

// POST /api/v1/publish/raw - Edge ingest (signed with the operator key when EDGE_SIGNING_KEY is set)
app.post('/api/v1/publish/raw', async (c) => {
  try {
    const parsed = publishRawSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return validationError(c, parsed.error);
    const body = parsed.data;

    const title = body.title;
    const content = body.content;
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = new Date().toISOString();
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    const attribution = await signWithEdgeKey({ title, tags, timestamp, content }, c.env.EDGE_SIGNING_KEY);

    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(
      title,
      content,
      tags,
      { pubkey: attribution.pubkey, signature: attribution.signature, ...(attribution.sigVersion ? { sigVersion: attribution.sigVersion } : {}) },
      timestamp
    );

    const shareUrl = `${appBaseUrl.replace(/\/+$/, '')}/read/${pinResult.cid}`;
    const gatewayUrl = `https://cloudflare-ipfs.com/ipfs/${pinResult.cid}`;

    return c.json(
      {
        success: true,
        cid: pinResult.cid,
        title,
        tags,
        timestamp,
        signatureStatus: attribution.status,
        publisher: {
          publicKey: attribution.pubkey,
          signature: attribution.signature,
        },
        urls: {
          ipfs: pinResult.gatewayUrl,
          gateway: shareUrl,
          cloudflare: gatewayUrl,
        },
        proof: {
          pressprotocol: '1.0.0-sovereign',
          cid: pinResult.cid,
          title,
          tags,
          timestamp,
          publisher: {
            publicKey: attribution.pubkey,
            signature: attribution.signature,
            ...(attribution.sigVersion ? { sigVersion: attribution.sigVersion } : {}),
          },
        },
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to publish raw content' }, 500);
  }
});

// POST /api/v1/publish/signed - Zero-Custody Client-Signed Ingest
app.post('/api/v1/publish/signed', async (c) => {
  try {
    const parsed = publishSignedSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return validationError(c, parsed.error);
    const body = parsed.data;

    const title = body.title;
    const content = body.content;
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = body.timestamp;
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    const attributed = await attributeSubmission({
      title,
      tags,
      timestamp,
      content,
      publicKey: body.publicKey,
      signature: body.signature,
    });
    if (!attributed.ok) {
      return c.json(
        {
          success: false,
          error: 'Cryptographic signature mismatch. Client signature is invalid for the canonical payload.',
          verification: attributed.verification,
        },
        401
      );
    }
    const { pubkey, signature, sigVersion, status } = attributed.attribution;

    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(title, content, tags, { pubkey, signature, sigVersion }, timestamp);

    const shareUrl = `${appBaseUrl.replace(/\/+$/, '')}/read/${pinResult.cid}`;

    return c.json(
      {
        success: true,
        cid: pinResult.cid,
        verified: status === 'verified',
        signatureStatus: status,
        contentBound: status === 'verified',
        algorithm: 'Ed25519 (RFC 8032)',
        transports: {
          ipfs: pinResult.gatewayUrl,
          gateway: shareUrl,
          cloudflare: `https://cloudflare-ipfs.com/ipfs/${pinResult.cid}`,
        },
        proof: {
          pressprotocol: '1.0.0-sovereign',
          cid: pinResult.cid,
          title,
          tags,
          timestamp,
          publisher: {
            publicKey: pubkey,
            signature,
            sigVersion,
          },
        },
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to publish signed content' }, 500);
  }
});

// GET /api/v1/resolve/:cid - Fast Swarm Resolver
app.get('/api/v1/resolve/:cid', async (c) => {
  const cid = c.req.param('cid');
  try {
    const { raw, gateway } = await raceIPFSGateways(cid, c.env);
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';
    const verification = await verifyPublication({
      title: raw.title || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      timestamp: raw.timestamp,
      content: typeof raw.content === 'string' ? raw.content : undefined,
      publicKey: raw.publisher?.pubkey || raw.publisher?.publicKey,
      signature: raw.publisher?.signature,
      sigVersion: raw.publisher?.sigVersion,
    });

    return c.json({
      success: true,
      cid,
      title: raw.title || 'Untitled Dispatch',
      content: raw.content || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      timestamp: raw.timestamp || new Date().toISOString(),
      verified: verification.isValid,
      signatureStatus: verification.status,
      verification,
      resolvedVia: gateway,
      publisher: raw.publisher || {},
      urls: {
        ipfs: `${gateway}/${cid}`,
        gateway: `${appBaseUrl.replace(/\/+$/, '')}/read/${cid}`,
        cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || `Could not resolve CID ${cid}` }, 504);
  }
});

// POST /api/v1/verify - Verify an article signature (inline payload, or fetched by CID)
app.post('/api/v1/verify', async (c) => {
  let body: {
    cid?: string;
    title?: string;
    content?: string;
    tags?: string[];
    timestamp?: string;
    publicKey?: string;
    signature?: string;
    sigVersion?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  let article = body;
  if (body.cid && (body.content === undefined || body.title === undefined)) {
    if (!isValidCID(body.cid)) {
      return c.json({ success: false, error: 'Invalid IPFS CID format' }, 400);
    }
    try {
      const { raw } = await raceIPFSGateways(body.cid, c.env);
      article = {
        cid: body.cid,
        title: raw.title,
        content: raw.content,
        tags: raw.tags,
        timestamp: raw.timestamp,
        publicKey: body.publicKey || raw.publisher?.pubkey || raw.publisher?.publicKey,
        signature: body.signature || raw.publisher?.signature,
        sigVersion: raw.publisher?.sigVersion,
      };
    } catch (err: any) {
      return c.json({ success: false, error: err.message || `Could not resolve CID ${body.cid}` }, 504);
    }
  }

  if (typeof article.title !== 'string') {
    return c.json({ success: false, error: 'title is required (or provide a resolvable cid)' }, 400);
  }

  const verification = await verifyPublication({
    title: article.title,
    tags: Array.isArray(article.tags) ? article.tags : [],
    timestamp: article.timestamp,
    content: article.content,
    publicKey: article.publicKey,
    signature: article.signature,
    sigVersion: article.sigVersion,
  });

  return c.json({
    success: true,
    isValid: verification.isValid,
    verified: verification.isValid,
    signatureValid: verification.signatureValid,
    contentBound: verification.contentBound,
    status: verification.status,
    version: verification.version,
    algorithm: verification.algorithm,
    error: verification.error,
    cid: article.cid,
    checkedAt: new Date().toISOString(),
  });
});

// GET /api/v1/metrics - Edge Telemetry Metrics
app.get('/api/v1/metrics', (c) => {
  return c.json({
    success: true,
    status: 'operational',
    protocol: 'PressProtocol RFC-009',
    gateways: PUBLIC_GATEWAYS,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/manifests/stats - Manifest Statistics (from the content index; null when unavailable)
app.get('/api/manifests/stats', async (c) => {
  const stats = await getContentStatsFromDB(c.env);
  return c.json({
    success: true,
    source: stats ? 'content-index' : 'unavailable',
    totalManifests: stats?.totalManifests ?? null,
    uniqueTags: stats?.uniqueTags ?? null,
    uniquePublishers: stats?.uniquePublishers ?? null,
    totalPeers: null,
    timestamp: new Date().toISOString(),
  });
});

export default app;
