import { FastifyInstance } from 'fastify';
import { PinataService } from '../services/PinataService';
import multipart from '@fastify/multipart';

export async function uploadRoutes(fastify: FastifyInstance) {
  // Register multipart support for file uploads
  fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 1, // Only one file at a time
    },
  });

  const pinataService = new PinataService(
    process.env.PINATA_JWT || '',
    process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs'
  );

  /**
   * POST /api/upload/image
   * Upload an image to IPFS via Pinata
   */
  fastify.post('/api/upload/image', async (request, reply) => {
    try {
      // Get uploaded file
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'No file uploaded',
        });
      }

      // Validate file is an image
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)',
        });
      }

      // Convert stream to buffer
      const buffer = await data.toBuffer();

      // Upload to Pinata
      const result = await pinataService.uploadFile(buffer, {
        name: data.filename || 'image.jpg',
        keyvalues: {
          type: 'image',
          uploadedAt: new Date().toISOString(),
        },
      });

      const cid = result.IpfsHash;
      const url = `${pinataService.gatewayUrl}/${cid}`;

      return reply.send({
        success: true,
        data: {
          cid,
          url,
          size: buffer.length,
          filename: data.filename,
          mimetype: data.mimetype,
        },
      });
    } catch (error) {
      console.error('Image upload error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      });
    }
  });

  /**
   * POST /api/upload/json
   * Upload JSON data to IPFS (for manifests, comments, etc.)
   */
  fastify.post('/api/upload/json', async (request, reply) => {
    try {
      const { data: jsonData } = request.body as { data: any };

      if (!jsonData) {
        return reply.status(400).send({
          success: false,
          error: 'No data provided',
        });
      }

      const result = await pinataService.uploadJSON(jsonData);
      const cid = result.IpfsHash;
      const url = `${pinataService.gatewayUrl}/${cid}`;

      return reply.send({
        success: true,
        data: {
          cid,
          url,
        },
      });
    } catch (error) {
      console.error('JSON upload error:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload JSON',
      });
    }
  });
}
