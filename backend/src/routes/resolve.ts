import { FastifyInstance } from 'fastify';
import { resolverService } from '../services/ResolverService.js';

export async function resolveRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/resolve/:cid - Resolve content and get best mirror
   */
  fastify.get('/api/resolve/:cid', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const resolved = await resolverService.resolveContent(cid);

      if (!resolved) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      return reply.send({
        success: true,
        data: resolved,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to resolve content',
      });
    }
  });

  /**
   * GET /api/resolve/:cid/mirrors - Get all available mirrors
   */
  fastify.get('/api/resolve/:cid/mirrors', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const mirrors = await resolverService.getAvailableMirrors(cid);

      return reply.send({
        success: true,
        data: mirrors,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch mirrors',
      });
    }
  });

  /**
   * GET /api/resolve/:cid/metadata - Get content metadata only
   */
  fastify.get('/api/resolve/:cid/metadata', async (request, reply) => {
    try {
      const { cid } = request.params as { cid: string };

      const metadata = await resolverService.getContentMetadata(cid);

      if (!metadata) {
        return reply.status(404).send({
          success: false,
          error: 'Content not found',
        });
      }

      return reply.send({
        success: true,
        data: metadata,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch metadata',
      });
    }
  });
}
