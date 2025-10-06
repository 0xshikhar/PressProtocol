import { FastifyInstance } from 'fastify';
import { mirrorService } from '../services/MirrorService.js';
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
}
