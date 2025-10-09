import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { prisma } from '../lib/prisma.js';

// Set up SHA512 for ed25519 (required for @noble/ed25519 v2+)
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class IdentityService {
  /**
   * Generate a new Ed25519 keypair
   */
  async generateKeypair(): Promise<KeyPair> {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = await ed25519.getPublicKey(privateKey);

    return {
      publicKey: Buffer.from(publicKey).toString('hex'),
      privateKey: Buffer.from(privateKey).toString('hex'),
    };
  }

  /**
   * Sign content with private key
   */
  async signContent(content: string, privateKeyHex: string): Promise<string> {
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const messageBuffer = Buffer.from(content, 'utf8');
    const signature = await ed25519.sign(messageBuffer, privateKey);
    
    return Buffer.from(signature).toString('hex');
  }

  /**
   * Verify signature with public key
   */
  async verifySignature(
    content: string,
    signatureHex: string,
    publicKeyHex: string
  ): Promise<boolean> {
    try {
      const signature = Buffer.from(signatureHex, 'hex');
      const publicKey = Buffer.from(publicKeyHex, 'hex');
      const messageBuffer = Buffer.from(content, 'utf8');

      return await ed25519.verify(signature, messageBuffer, publicKey);
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Create identity in database
   */
  async createIdentity(userId: string, publicKey: string) {
    return prisma.identity.create({
      data: {
        userId,
        publicKey,
      },
    });
  }

  /**
   * Get identity by public key
   */
  async getIdentityByPublicKey(publicKey: string) {
    return prisma.identity.findUnique({
      where: { publicKey },
      include: { user: true },
    });
  }

  /**
   * List user identities
   */
  async getUserIdentities(userId: string) {
    return prisma.identity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const identityService = new IdentityService();
