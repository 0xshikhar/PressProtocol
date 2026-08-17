import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { 
  sovereignMirrorService, 
  MediumIngestInput, 
  SubstackIngestInput 
} from '../services/SovereignMirrorService.js';
import { 
  cmsBridgeService, 
  GenericCmsPayload 
} from '../services/CmsBridgeService.js';

const mediumIngestSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  privateKey: z.string().optional(),
});

const substackIngestSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().min(1),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  audioEnclosureUrl: z.string().optional(),
  privateKey: z.string().optional(),
});

const genericCmsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  author: z.string().optional(),
  platform: z.string().optional(),
  originalUrl: z.string().optional(),
});

const cleanseSchema = z.object({
  content: z.string(),
});

export async function bridgeRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/bridge/status
   */
  fastify.get('/api/bridge/status', async (request, reply) => {
    return reply.send({
      service: 'PressProtocol Universal Publishing Rails & CMS Bridge',
      version: '1.0.0-sovereign',
      supportedPlatforms: ['medium', 'substack', 'ghost', 'strapi', 'sanity', 'contentful'],
      endpoints: {
        medium: '/api/bridge/medium',
        substack: '/api/bridge/substack',
        ghost: '/api/bridge/ghost',
        strapi: '/api/bridge/strapi',
        cms: '/api/bridge/cms',
        cleanse: '/api/bridge/cleanse',
      },
      activeGuards: {
        ghostSecretConfigured: !!env.GHOST_WEBHOOK_SECRET,
        strapiSecretConfigured: !!env.STRAPI_WEBHOOK_SECRET,
      },
    });
  });

  /**
   * POST /api/bridge/cleanse - Cleanses arbitrary HTML/Markdown of surveillance trackers
   */
  fastify.post('/api/bridge/cleanse', async (request, reply) => {
    try {
      const body = cleanseSchema.parse(request.body);
      const result = sovereignMirrorService.cleanseSurveillanceTrackers(body.content);
      return reply.send({
        success: true,
        ...result,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Invalid cleanse request',
      });
    }
  });

  /**
   * POST /api/bridge/medium - Sovereign Mirroring for Medium Articles
   */
  fastify.post('/api/bridge/medium', async (request, reply) => {
    try {
      const body = mediumIngestSchema.parse(request.body) as MediumIngestInput;
      const result = await sovereignMirrorService.mirrorMediumArticle(body);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Medium mirroring failed',
      });
    }
  });

  /**
   * POST /api/bridge/substack - Sovereign Mirroring for Substack Newsletters
   */
  fastify.post('/api/bridge/substack', async (request, reply) => {
    try {
      const body = substackIngestSchema.parse(request.body) as SubstackIngestInput;
      const result = await sovereignMirrorService.mirrorSubstackPost(body);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Substack mirroring failed',
      });
    }
  });

  /**
   * POST /api/bridge/ghost - Ghost CMS Webhook Ingress with HMAC-SHA256 verification
   */
  fastify.post('/api/bridge/ghost', async (request, reply) => {
    try {
      const secret = env.GHOST_WEBHOOK_SECRET || (request.headers['x-ghost-secret'] as string);
      const signatureHeader = request.headers['x-ghost-signature'] as string | undefined;

      // If secret configured, verify HMAC
      if (secret) {
        const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
        const verification = cmsBridgeService.verifyGhostSignature(rawBody, signatureHeader, secret);
        if (!verification.valid) {
          return reply.status(401).send({
            success: false,
            error: `Ghost webhook signature rejected: ${verification.reason}`,
          });
        }
      }

      const payload = request.body as any;
      const result = await cmsBridgeService.ingestGhostPost(payload);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Ghost ingestion failed',
      });
    }
  });

  /**
   * POST /api/bridge/strapi - Strapi CMS Webhook Ingress
   */
  fastify.post('/api/bridge/strapi', async (request, reply) => {
    try {
      const secret = env.STRAPI_WEBHOOK_SECRET;
      if (secret) {
        const authHeader = request.headers['authorization'];
        const customHeader = request.headers['x-strapi-secret'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : customHeader;
        if (token !== secret) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized: Invalid Strapi webhook secret',
          });
        }
      }

      const payload = request.body as any;
      const result = await cmsBridgeService.ingestStrapiEntry(payload);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'Strapi ingestion failed',
      });
    }
  });

  /**
   * POST /api/bridge/cms - Generic CMS Ingress (Sanity, Contentful, etc.)
   */
  fastify.post('/api/bridge/cms', async (request, reply) => {
    try {
      const body = genericCmsSchema.parse(request.body) as GenericCmsPayload;
      const result = await cmsBridgeService.ingestGenericCms(body);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || 'CMS ingestion failed',
      });
    }
  });
}
