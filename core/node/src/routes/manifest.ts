import { FastifyInstance } from 'fastify';
import { ipfsDHTService } from '../services/IPFSDHTService.js';

export async function manifestRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/manifest/:cid
   * Fetch a content manifest from IPFS
   */
  fastify.get<{ Params: { cid: string } }>(
    '/api/manifest/:cid',
    async (request, reply) => {
      try {
        const { cid } = request.params;

        // Fetch manifest from IPFS
        const manifest = await ipfsDHTService.fetchManifest(cid);

        if (!manifest) {
          return reply.status(404).send({
            success: false,
            error: 'Manifest not found or invalid',
          });
        }

        return reply.send({
          success: true,
          data: manifest,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch manifest',
        });
      }
    }
  );

  /**
   * GET /api/manifests/recent
   * Get recently published content manifests from DHT cache
   */
  fastify.get<{ Querystring: { limit?: string } }>(
    '/api/manifests/recent',
    async (request, reply) => {
      try {
        const limit = parseInt(request.query.limit || '20');

        const manifests = await ipfsDHTService.discoverRecent(limit);

        return reply.send({
          success: true,
          data: manifests,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to discover manifests',
        });
      }
    }
  );

  /**
   * GET /api/manifests/stats
   * Get DHT service statistics
   */
  fastify.get('/api/manifests/stats', async (request, reply) => {
    try {
      const stats = ipfsDHTService.getStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get stats',
      });
    }
  });
}
