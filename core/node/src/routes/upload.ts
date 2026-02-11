import { FastifyInstance } from 'fastify';
import { StorageService } from '../services/StorageService.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  const storageService = new StorageService();

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

      // Upload to IPFS
      const result = await storageService.uploadFile(buffer, data.filename || 'image.jpg');

      const cid = result.cid;
      const url = result.gatewayUrl;

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

      // Convert JSON to buffer and upload
      const jsonString = JSON.stringify(jsonData);
      const buffer = Buffer.from(jsonString, 'utf-8');
      const result = await storageService.uploadFile(buffer, 'manifest.json');

      return reply.send({
        success: true,
        data: {
          cid: result.cid,
          url: result.gatewayUrl,
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
