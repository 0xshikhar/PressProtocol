import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { identityService } from '../services/IdentityService.js';
import { prisma } from '../lib/prisma.js';

const createIdentitySchema = z.object({
  walletAddress: z.string(),
});

const verifySignatureSchema = z.object({
  content: z.string(),
  signature: z.string(),
  publicKey: z.string(),
});

export async function identityRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/identity - Generate new identity keypair
   */
  fastify.post('/api/identity', async (request, reply) => {
    try {
      const body = createIdentitySchema.parse(request.body);

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: body.walletAddress },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { walletAddress: body.walletAddress },
        });
      }

      // Generate keypair
      const keypair = await identityService.generateKeypair();

      // Store identity
      const identity = await identityService.createIdentity(
        user.id,
        keypair.publicKey
      );

      return reply.status(201).send({
        success: true,
        data: {
          identityId: identity.id,
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey, // Should be stored securely by client
          warning: 'Store private key securely. It cannot be recovered.',
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create identity',
      });
    }
  });

  /**
   * GET /api/identity/:walletAddress - Get identities for wallet
   */
  fastify.get('/api/identity/:walletAddress', async (request, reply) => {
    try {
      const { walletAddress } = request.params as { walletAddress: string };

      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        return reply.send({
          success: true,
          data: [],
        });
      }

      const identities = await identityService.getUserIdentities(user.id);

      return reply.send({
        success: true,
        data: identities.map((id) => ({
          id: id.id,
          publicKey: id.publicKey,
          createdAt: id.createdAt,
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch identities',
      });
    }
  });

  /**
   * POST /api/identity/verify - Verify content signature
   */
  fastify.post('/api/identity/verify', async (request, reply) => {
    try {
      const body = verifySignatureSchema.parse(request.body);

      const isValid = await identityService.verifySignature(
        body.content,
        body.signature,
        body.publicKey
      );

      return reply.send({
        success: true,
        data: {
          valid: isValid,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to verify signature',
      });
    }
  });
}
