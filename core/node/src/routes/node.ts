import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { federationService, AutoPinPolicy, GossipPayload } from '../services/FederationService.js';

const addPeerSchema = z.object({
  peerUrl: z.string().min(1),
  name: z.string().optional(),
});

const removePeerSchema = z.object({
  peerUrl: z.string().min(1),
});

const gossipPayloadSchema = z.object({
  cid: z.string().min(1),
  title: z.string().min(1),
  tags: z.array(z.string()).optional(),
  signature: z.string().optional().default(''),
  publicKey: z.string().optional().default(''),
  timestamp: z.string().optional().default(() => new Date().toISOString()),
  mirrors: z.array(z.any()).optional(),
});

const updatePolicySchema = z.object({
  policy: z.enum(['all', 'followed', 'trending']),
  followedKeys: z.array(z.string()).optional(),
});

export async function nodeRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/node/status
   * Full node status, embedded IPFS, Tor v3 onion, storage, and federation metrics
   */
  fastify.get('/api/node/status', async (request, reply) => {
    try {
      const status = await federationService.getStatus();
      return reply.send({
        success: true,
        ...status,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get node status',
      });
    }
  });

  /**
   * GET /api/node/health
   * Lightweight liveness probe for Docker / K8s
   */
  fastify.get('/api/node/health', async (request, reply) => {
    return reply.send({
      status: 'ok',
      service: 'pressprotocol-node',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/node/federation/peers
   * List known federated peer nodes
   */
  fastify.get('/api/node/federation/peers', async (request, reply) => {
    const peers = federationService.getPeers();
    return reply.send({
      success: true,
      count: peers.length,
      peers,
    });
  });

  /**
   * POST /api/node/federation/peers
   * Register a new federation peer
   */
  fastify.post('/api/node/federation/peers', async (request, reply) => {
    try {
      const body = addPeerSchema.parse(request.body);
      const peer = federationService.addPeer(body.peerUrl, body.name);
      return reply.status(201).send({
        success: true,
        message: 'Federation peer registered',
        peer,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message || 'Invalid peer configuration',
      });
    }
  });

  /**
   * DELETE /api/node/federation/peers
   * Remove a registered peer
   */
  fastify.delete('/api/node/federation/peers', async (request, reply) => {
    try {
      const body = removePeerSchema.parse(request.body);
      const removed = federationService.removePeer(body.peerUrl);
      return reply.send({
        success: true,
        removed,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message || 'Invalid peer deletion request',
      });
    }
  });

  /**
   * POST /api/node/gossip
   * Receive and process a P2P publication gossip broadcast
   */
  fastify.post('/api/node/gossip', async (request, reply) => {
    try {
      const pskHeader = request.headers['x-federation-psk'] as string | undefined;
      const body = gossipPayloadSchema.parse(request.body) as GossipPayload;
      const result = await federationService.handleGossip(body, { psk: pskHeader });
      
      if (!result.accepted && result.reason?.startsWith('Unauthorized')) {
        return reply.status(401).send({
          success: false,
          ...result,
        });
      }
      if (!result.accepted && result.reason?.startsWith('Forbidden')) {
        return reply.status(403).send({
          success: false,
          ...result,
        });
      }

      return reply.send({
        success: true,
        ...result,
        cid: body.cid,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message || 'Invalid gossip payload',
      });
    }
  });

  /**
   * GET /api/node/federation/gated
   * Inspect private consortium swarm security configuration
   */
  fastify.get('/api/node/federation/gated', async (request, reply) => {
    return reply.send({
      success: true,
      pskProtected: Boolean(federationService.getPsk()),
      whitelist: federationService.getPeerWhitelist(),
    });
  });

  /**
   * PUT /api/node/federation/gated
   * Update PSK and peer whitelist for private newsroom swarms
   */
  fastify.put('/api/node/federation/gated', async (request, reply) => {
    try {
      const body = z.object({
        psk: z.string().optional(),
        whitelist: z.array(z.string()).optional(),
      }).parse(request.body);

      if (body.psk !== undefined) {
        federationService.setPsk(body.psk);
      }
      if (body.whitelist !== undefined) {
        federationService.setPeerWhitelist(body.whitelist);
      }

      return reply.send({
        success: true,
        pskProtected: Boolean(federationService.getPsk()),
        whitelist: federationService.getPeerWhitelist(),
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message || 'Invalid gated swarm configuration',
      });
    }
  });

  /**
   * GET /api/node/federation/policy
   * Retrieve current auto-pinning policy
   */
  fastify.get('/api/node/federation/policy', async (request, reply) => {
    const policy = federationService.getAutoPinPolicy();
    return reply.send({
      success: true,
      ...policy,
    });
  });

  /**
   * PUT /api/node/federation/policy
   * Update auto-pinning policy (all, followed, trending)
   */
  fastify.put('/api/node/federation/policy', async (request, reply) => {
    try {
      const body = updatePolicySchema.parse(request.body);
      federationService.setAutoPinPolicy(body.policy as AutoPinPolicy, body.followedKeys);
      return reply.send({
        success: true,
        policy: federationService.getAutoPinPolicy(),
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message || 'Invalid policy configuration',
      });
    }
  });

  /**
   * GET /api/node/pins
   * List all locally pinned CIDs
   */
  fastify.get('/api/node/pins', async (request, reply) => {
    const pins = federationService.getPinnedCids();
    return reply.send({
      success: true,
      count: pins.length,
      pinnedCids: pins,
    });
  });
}
