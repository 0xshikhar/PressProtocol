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
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
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
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return reply.send({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
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

// Register API routes
await fastify.register(contentRoutes);
await fastify.register(resolveRoutes);
await fastify.register(discoveryRoutes);
await fastify.register(identityRoutes);
await fastify.register(mirrorsRoutes);
await fastify.register(uploadRoutes);
await fastify.register(manifestRoutes);

// Root route
fastify.get('/', async (request, reply) => {
  return reply.send({
    name: 'AnonPress Backend API',
    version: '1.0.0',
    description: 'Decentralized censorship-resistant publishing platform',
    endpoints: {
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
    },
    docs: 'https://github.com/anonpress/backend',
  });
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
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
      await prisma.$disconnect();
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
    const port = parseInt(env.PORT);
    const host = '0.0.0.0'; // Listen on all interfaces
    
    await fastify.listen({ port, host });
    
    fastify.log.info(`🚀 AnonPress Backend running at http://${host}:${port}`);
    fastify.log.info(`📝 Environment: ${env.NODE_ENV}`);
    fastify.log.info(`🗄️  Database: Connected`);
    fastify.log.info(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
