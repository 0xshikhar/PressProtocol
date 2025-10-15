import { FastifyInstance } from 'fastify';
import { mirrorService } from '../services/MirrorService.js';
import { torService } from '../services/TorService.js';
import { prisma } from '../lib/prisma.js';

export async function mirrorsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/mirrors/:cid/health - Check mirror health for content
   */
  fastify.get('/api/mirrors/:cid/health', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const content = await prisma.content.findUnique({
        where: { cid },
      });

      if (!content) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      const health = await mirrorService.checkMirrorHealth(content.id);

      return reply.send({
        success: true,
        data: health,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to check mirror health',
      });
    }
  });

  /**
   * GET /api/mirrors/:cid/fastest - Get fastest available mirror
   */
  fastify.get('/api/mirrors/:cid/fastest', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const content = await prisma.content.findUnique({
        where: { cid },
      });

      if (!content) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      const fastest = await mirrorService.getFastestMirror(content.id);

      if (!fastest) {
        return reply.status(404).send({
          success: false,
          error: 'No available mirrors found',
        });
      }

      return reply.send({
        success: true,
        data: fastest,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch fastest mirror',
      });
    }
  });

  /**
   * GET /api/mirrors/onion-url - Get the Tor onion URL for WordPress
   */
  fastify.get('/api/mirrors/onion-url', async (request, reply) => {
    try {
      const onionUrl = await torService.getOnionUrl('anonpress-wordpress');
      
      if (!onionUrl) {
        return reply.status(404).send({
          success: false,
          error: 'Onion service not available yet',
          message: 'The onionize container is still generating the .onion address. Please wait a moment and try again.',
        });
      }

      const isAvailable = await torService.checkOnionAvailability('anonpress-wordpress');

      return reply.send({
        success: true,
        onionUrl,
        available: isAvailable,
        message: 'Access this URL using Tor Browser for anonymous access',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get onion URL',
      });
    }
  });
}
