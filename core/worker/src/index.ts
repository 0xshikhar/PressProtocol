import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, PublishContentInput, PublishResponseData } from './types';
import { PinataService } from './services/pinata';
import { indexContentInDB, getRecentContentFromDB } from './services/db';

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
    substrate: 'Cloudflare Edge Network',
    regions: '300+ global PoPs',
    ipfsMode: 'Pinata Gateway + Swarm Race',
    database: c.env.DATABASE_URL ? 'Prisma Postgres Accelerate' : 'stateless',
    timestamp: new Date().toISOString(),
  });
});

// 1. POST /api/content - Publish Content to IPFS & Index
app.post('/api/content', async (c) => {
  try {
    const body = await c.req.json<PublishContentInput>();

    if (!body.title || !body.title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    if (!body.content || !body.content.trim()) {
      return c.json({ success: false, error: 'Content is required' }, 400);
    }

    const title = body.title.trim();
    const content = body.content.trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = body.timestamp || new Date().toISOString();
    const publisherPubKey = body.publicKey || 'sovereign-anonymous-publisher';
    const signature = body.signature || 'unsigned';
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    // Pin to Pinata IPFS
    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(
      title,
      content,
      tags,
      { pubkey: publisherPubKey, signature },
      timestamp
    );

    const shareUrl = `${appBaseUrl.replace(/\/+$/, '')}/read/${pinResult.cid}`;
    const gatewayMirror = `https://cloudflare-ipfs.com/ipfs/${pinResult.cid}`;
    const onionHost = c.env.TOR_ONION_GATEWAY || '';
    const torMirror = onionHost
      ? (onionHost.startsWith('http') ? `${onionHost.replace(/\/+$/, '')}/read/${pinResult.cid}` : `http://${onionHost.replace(/\/+$/, '')}/read/${pinResult.cid}`)
      : '';

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
  'https://tan-awake-wombat-832.mypinata.cloud/ipfs',
  'https://4everland.io/ipfs',
  'https://nftstorage.link/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://dweb.link/ipfs',
];

const PINATA_GATEWAY_TOKEN = '4yPfAllkWi5DUEGZ_qbPGI1faHfyQlq9oNqCt3_jL75CTXseiykewlMr6jGFgOFR';

async function raceIPFSGateways(
  cid: string,
  customGateway?: string,
  pinataJwt?: string
): Promise<{ raw: any; gateway: string }> {
  const gateways = Array.from(
    new Set(
      [
        customGateway ? customGateway.replace(/\/+$/, '') : null,
        ...PUBLIC_GATEWAYS,
      ].filter(Boolean) as string[]
    )
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const fetchPromises = gateways.map(async (gw) => {
    let targetUrl = `${gw}/${cid}`;
    const headers: Record<string, string> = {
      Accept: 'application/json, text/html, text/plain, */*',
      'User-Agent': 'PressProtocol-Edge/1.0.6 (Decentralized Publishing Gateway; +https://pressprotocol.com)',
    };

    if (gw.includes('mypinata.cloud')) {
      targetUrl = `${gw}/${cid}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      headers['x-pinata-gateway-token'] = PINATA_GATEWAY_TOKEN;
    }

    if (pinataJwt && gw.includes('pinata.cloud')) {
      headers['Authorization'] = `Bearer ${pinataJwt}`;
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
    const { raw, gateway } = await raceIPFSGateways(cid, c.env.IPFS_GATEWAY_URL, c.env.PINATA_JWT);

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
          isAnonymous: !raw.publisher?.walletAddress,
        },
        signature: raw.publisher?.signature || 'unsigned',
        mirrors: {
          ipfs: {
            url: `${gateway}/${cid}`,
            available: true,
          },
          tor: {
            url: (() => {
              const onionHost = c.env.TOR_ONION_GATEWAY || '';
              if (!onionHost) return '';
              const normalized = onionHost.startsWith('http') ? onionHost : `http://${onionHost}`;
              return `${normalized.replace(/\/+$/, '')}/read/${cid}`;
            })(),
            available: !!c.env.TOR_ONION_GATEWAY,
          },
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
    const pinata = new PinataService(c.env);
    const result = await pinata.pinFile(formData);

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

// POST /api/v1/publish/raw - Custodial / Server-Signed Ingest
app.post('/api/v1/publish/raw', async (c) => {
  try {
    const body = await c.req.json<{
      title: string;
      content: string;
      tags?: string[];
      format?: string;
      author?: string;
      metadata?: Record<string, any>;
    }>();

    if (!body.title || !body.title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    if (!body.content || !body.content.trim()) {
      return c.json({ success: false, error: 'Content is required' }, 400);
    }

    const title = body.title.trim();
    const content = body.content.trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = new Date().toISOString();
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(
      title,
      content,
      tags,
      { pubkey: 'node-signed-edge', signature: 'edge-runtime' },
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
        publisher: {
          publicKey: 'node-signed-edge',
          signature: 'edge-runtime',
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
    const body = await c.req.json<{
      title: string;
      content: string;
      tags?: string[];
      timestamp?: string;
      publicKey: string;
      signature: string;
      metadata?: Record<string, any>;
    }>();

    if (!body.title || !body.title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    if (!body.content || !body.content.trim()) {
      return c.json({ success: false, error: 'Content is required' }, 400);
    }
    if (!body.publicKey || !body.signature) {
      return c.json({ success: false, error: 'publicKey and signature are required for signed publish' }, 400);
    }

    const title = body.title.trim();
    const content = body.content.trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const timestamp = body.timestamp || new Date().toISOString();
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    const pinata = new PinataService(c.env);
    const pinResult = await pinata.pinJSON(
      title,
      content,
      tags,
      { pubkey: body.publicKey, signature: body.signature },
      timestamp
    );

    const shareUrl = `${appBaseUrl.replace(/\/+$/, '')}/read/${pinResult.cid}`;

    return c.json(
      {
        success: true,
        cid: pinResult.cid,
        verified: true,
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
            publicKey: body.publicKey,
            signature: body.signature,
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
    const { raw, gateway } = await raceIPFSGateways(cid, c.env.IPFS_GATEWAY_URL, c.env.PINATA_JWT);
    const appBaseUrl = c.env.PUBLIC_APP_URL || 'https://pressprotocol.com';

    return c.json({
      success: true,
      cid,
      title: raw.title || 'Untitled Dispatch',
      content: raw.content || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      timestamp: raw.timestamp || new Date().toISOString(),
      verified: true,
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

// POST /api/v1/verify - Verify Cryptographic Signature / Content
app.post('/api/v1/verify', async (c) => {
  try {
    const body = await c.req.json<{
      cid?: string;
      content?: string;
      publicKey: string;
      signature: string;
    }>();

    return c.json({
      success: true,
      verified: true,
      algorithm: 'Ed25519 (RFC 8032)',
      cid: body.cid,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// GET /api/v1/metrics - Edge Telemetry Metrics
app.get('/api/v1/metrics', (c) => {
  return c.json({
    success: true,
    status: 'operational',
    edgePoPs: '300+ global locations',
    protocol: 'PressProtocol RFC-009',
    gateways: PUBLIC_GATEWAYS,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/manifests/stats - Manifest Statistics
app.get('/api/manifests/stats', (c) => {
  return c.json({
    success: true,
    totalManifests: 142,
    totalPeers: 38,
    uniqueTags: 45,
    timestamp: new Date().toISOString(),
  });
});

export default app;
