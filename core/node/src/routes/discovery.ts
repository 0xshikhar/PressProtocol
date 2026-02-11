import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { discoveryService } from '../services/DiscoveryService.js';

const discoveryQuerySchema = z.object({
  tags: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const searchQuerySchema = z.object({
  q: z.string(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export async function discoveryRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/discovery - Get discovery feed
   */
  fastify.get('/api/discovery', async (request, reply) => {
    try {
      const query = discoveryQuerySchema.parse(request.query);
      const limit = parseInt(query.limit || '20');
      const offset = parseInt(query.offset || '0');

      let content;

      if (query.tags) {
        const tags = query.tags.split(',');
        content = await discoveryService.discoverByTags(tags, limit, offset);
      } else {
        content = await discoveryService.getRecentContent(limit, offset);
      }

      return reply.send({
        success: true,
        data: content,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch discovery feed',
      });
    }
  });

  /**
   * GET /api/discovery/search - Search content
   */
  fastify.get('/api/discovery/search', async (request, reply) => {
    try {
      const query = searchQuerySchema.parse(request.query);
      const limit = parseInt(query.limit || '20');
      const offset = parseInt(query.offset || '0');

      const content = await discoveryService.searchContent(query.q, limit, offset);

      return reply.send({
        success: true,
        data: content,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to search content',
      });
    }
  });

  /**
   * GET /api/discovery/tags - Get trending tags
   */
  fastify.get('/api/discovery/tags', async (request, reply) => {
    try {
      const tags = await discoveryService.getTrendingTags(10);

      return reply.send({
        success: true,
        data: tags,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch trending tags',
      });
    }
  });

  /**
   * GET /api/discovery/stats - Get discovery statistics
   */
  fastify.get('/api/discovery/stats', async (request, reply) => {
    try {
      const stats = await discoveryService.getStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch discovery stats',
      });
    }
  });

  /**
   * GET /api/discovery/publisher/:address - Get content by publisher
   */
  fastify.get('/api/discovery/publisher/:address', async (request, reply) => {
    try {
      const { address } = request.params as { address: string };
      const query = discoveryQuerySchema.parse(request.query);
      const limit = parseInt(query.limit || '20');
      const offset = parseInt(query.offset || '0');

      const content = await discoveryService.getPublisherContent(
        address,
        limit,
        offset
      );

      return reply.send({
        success: true,
        data: content,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch publisher content',
      });
    }
  });
}
