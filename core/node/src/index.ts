// Ensure Promise.withResolvers is available across Node.js versions (e.g. Node 20 LTS) for Helia
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { contentRoutes } from './routes/content.js';
import { resolveRoutes } from './routes/resolve.js';
import { discoveryRoutes } from './routes/discovery.js';
import { identityRoutes } from './routes/identity.js';
import { mirrorsRoutes } from './routes/mirrors.js';
import { uploadRoutes } from './routes/upload.js';
import { manifestRoutes } from './routes/manifest.js';
import { ipfsDHTService } from './services/IPFSDHTService.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
await fastify.register(cors, {
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

await fastify.register(multipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
    headerPairs: 2000,
  },
});

import { nodeRoutes } from './routes/node.js';
import { torService } from './services/TorService.js';
import { federationService } from './services/FederationService.js';

// Health check routes
fastify.get('/health', async (request, reply) => {
  return reply.send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'anonpress-backend',
  });
});

fastify.get('/health/ready', async (request, reply) => {
  try {
    // Check database connection if configured
    if (env.DATABASE_URL) {
      await prisma.$queryRaw`SELECT 1`;
    }
    
    return reply.send({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: env.DATABASE_URL ? 'connected' : 'embedded',
    });
  } catch (error) {
    return reply.status(503).send({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

fastify.get('/health/live', async (request, reply) => {
  return reply.send({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

import { bridgeRoutes } from './routes/bridge.js';

import { v1Routes } from './routes/v1.js';

// Register API routes
await fastify.register(nodeRoutes);
await fastify.register(contentRoutes);
await fastify.register(resolveRoutes);
await fastify.register(discoveryRoutes);
await fastify.register(identityRoutes);
await fastify.register(mirrorsRoutes);
await fastify.register(uploadRoutes);
await fastify.register(manifestRoutes);
await fastify.register(bridgeRoutes);
await fastify.register(v1Routes);

// Root route
fastify.get('/', async (request, reply) => {
  const onionAddress = await torService.getSelfOnionAddress();
  return reply.send({
    name: 'PressProtocol Sovereign Node API',
    version: '1.0.0-sovereign',
    specification: 'RFC-PP-009-ENTERPRISE-GATEWAY-AND-API',
    description: 'Universal decentralized publishing substrate, P2P federation, OpenAPI 3.1 gateway, and multi-tenant publishing engine',
    onionAddress: onionAddress || 'Pending daemon startup',
    endpoints: {
      nodeStatus: '/api/node/status',
      nodeHealth: '/api/node/health',
      federationPeers: '/api/node/federation/peers',
      federationGossip: '/api/node/gossip',
      federationPolicy: '/api/node/federation/policy',
      content: '/api/content',
      resolve: '/api/resolve/:cid',
      discovery: '/api/discovery',
      identity: '/api/identity',
      mirrors: '/api/mirrors/:cid/health',
      uploadImage: '/api/upload/image',
      uploadJson: '/api/upload/json',
      manifest: '/api/manifest/:cid',
      manifestsRecent: '/api/manifests/recent',
      manifestsStats: '/api/manifests/stats',
      bridgeStatus: '/api/bridge/status',
      bridgeMedium: '/api/bridge/medium',
      bridgeSubstack: '/api/bridge/substack',
      bridgeGhost: '/api/bridge/ghost',
      bridgeStrapi: '/api/bridge/strapi',
      bridgeCms: '/api/bridge/cms',
      bridgeCleanse: '/api/bridge/cleanse',
      v1PublishRaw: '/api/v1/publish/raw',
      v1PublishSigned: '/api/v1/publish/signed',
      v1Resolve: '/api/v1/resolve/:cid',
      v1Verify: '/api/v1/verify',
      v1OpenApi: '/api/v1/openapi.json',
      v1AdminKeys: '/api/v1/admin/keys',
      v1Metrics: '/api/v1/metrics',
    },
    docs: 'https://github.com/anonpress/backend',
  });
});

// Error handler
fastify.setErrorHandler((error: any, request, reply) => {
  fastify.log.error(error);
  
  reply.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
  });
});

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing gracefully...`);
    
    try {
      if (env.DATABASE_URL) {
        await prisma.$disconnect();
      }
      await ipfsDHTService.shutdown();
      await fastify.close();
      process.exit(0);
    } catch (error) {
      fastify.log.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  });
});

// Start server
const start = async () => {
  try {
    // Initialize IPFS DHT Service (with Helia if available)
    console.log('🔧 Initializing IPFS DHT Service...');
    await ipfsDHTService.init();
    
    const port = parseInt(env.PORT);
    const host = '0.0.0.0'; // Listen on all interfaces
    
    await fastify.listen({ port, host });
    
    const onionAddress = await torService.getSelfOnionAddress();
    const isSovereign = !env.PINATA_API_KEY;

    console.log('');
    console.log('===============================================================');
    console.log('  🌐 PRESSPROTOCOL AUTONOMOUS COMMUNITY NODE (WAVE 4)');
    console.log('===============================================================');
    console.log(`  🚀 API Gateway:     http://${host}:${port}`);
    console.log(`  🧅 Tor Onion:       ${onionAddress ? `http://${onionAddress}` : 'Initializing v3 key...'}`);
    console.log(`  📦 Node Mode:       ${isSovereign ? '🌱 Pure Sovereign (Helia/Tor)' : '⚡ Hybrid (Pinata/Cloud)'}`);
    console.log(`  📁 Storage Path:    ${env.DATA_DIR}`);
    console.log(`  📡 Node Status:     http://${host}:${port}/api/node/status`);
    console.log('===============================================================');
    console.log('');

    fastify.log.info(`🚀 PressProtocol Node running at http://${host}:${port}`);
    fastify.log.info(`📝 Environment: ${env.NODE_ENV}`);
    fastify.log.info(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
