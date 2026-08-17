import crypto from 'node:crypto';
import { storageService } from './StorageService.js';
import { torService } from './TorService.js';
import { identityService } from './IdentityService.js';
import { calculateDeterministicCIDv1 } from '../lib/cid.js';

export interface GhostWebhookPayload {
  post?: {
    current?: {
      id: string;
      uuid?: string;
      title: string;
      slug: string;
      html: string;
      feature_image?: string;
      featured?: boolean;
      custom_excerpt?: string;
      published_at?: string;
      tags?: Array<{ id: string; name: string; slug: string }>;
      primary_author?: { id: string; name: string; slug: string };
    };
    previous?: any;
  };
}

export interface StrapiWebhookPayload {
  event: string; // 'entry.publish' | 'entry.create' | 'entry.update'
  createdAt: string;
  model: string;
  entry: {
    id: string | number;
    title?: string;
    content?: string;
    body?: string;
    description?: string;
    slug?: string;
    tags?: Array<{ name: string } | string>;
    publishedAt?: string;
    [key: string]: any;
  };
}

export interface GenericCmsPayload {
  title: string;
  content: string;
  tags?: string[];
  slug?: string;
  author?: string;
  platform?: string;
  originalUrl?: string;
}

export class CmsBridgeService {
  /**
   * Verifies Ghost CMS HMAC-SHA256 signature with replay attack protection.
   * Header format: "sha256=<hex>, t=<timestamp>"
   */
  public verifyGhostSignature(
    rawBody: string,
    signatureHeader: string | undefined,
    secretKey: string,
    maxTimestampDriftMs = 300000 // 5 minutes
  ): { valid: boolean; reason?: string } {
    if (!signatureHeader) {
      return { valid: false, reason: 'Missing X-Ghost-Signature header' };
    }

    const parts = signatureHeader.split(',').map((p) => p.trim());
    let sigHex = '';
    let timestampStr = '';

    for (const part of parts) {
      if (part.startsWith('sha256=')) {
        sigHex = part.substring(7);
      } else if (part.startsWith('t=')) {
        timestampStr = part.substring(2);
      }
    }

    if (!sigHex || !timestampStr) {
      return { valid: false, reason: 'Malformed X-Ghost-Signature header format' };
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, reason: 'Invalid signature timestamp' };
    }

    // Replay attack prevention
    const now = Date.now();
    if (Math.abs(now - timestamp) > maxTimestampDriftMs) {
      return { valid: false, reason: 'Signature timestamp out of allowed window (replay protection)' };
    }

    // Compute expected HMAC: sha256(rawBody + timestamp, secret)
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${rawBody}${timestampStr}`);
    const expectedSig = hmac.digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(sigHex, 'hex'),
      Buffer.from(expectedSig, 'hex')
    );

    return {
      valid: isValid,
      reason: isValid ? undefined : 'HMAC signature mismatch',
    };
  }

  /**
   * Ingests a verified Ghost CMS post and anchors it into PressProtocol sovereign storage.
   */
  public async ingestGhostPost(
    post: GhostWebhookPayload['post'] | any,
    options?: { privateKey?: string; publicKey?: string }
  ) {
    const current = post?.current || post;
    if (!current || !current.title || !current.html) {
      throw new Error('Invalid Ghost post payload: missing title or html body');
    }

    const title = current.title;
    const content = current.html;
    const tagList: string[] = [];
    if (Array.isArray(current.tags)) {
      for (const t of current.tags) {
        if (typeof t === 'string') tagList.push(t);
        else if (t?.name) tagList.push(t.name);
      }
    }
    tagList.push('ghost-cms', 'sovereign');

    let privKey = options?.privateKey;
    let pubKey = options?.publicKey;
    if (!privKey || !pubKey) {
      const kp = await identityService.generateKeypair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
    }

    const timestamp = current.published_at || new Date().toISOString();
    const canonicalPayload = JSON.stringify({
      title,
      tags: tagList,
      timestamp,
    });
    const signature = await identityService.signContent(canonicalPayload, privKey);
    const deterministicCID = calculateDeterministicCIDv1(content);

    const storageResult = await storageService.uploadContent(
      title,
      content,
      tagList,
      { pubkey: pubKey, signature },
      timestamp
    );

    const finalCID = storageResult.cid || deterministicCID;
    const onionAddress = await torService.getSelfOnionAddress();

    return {
      success: true,
      cid: finalCID,
      title,
      platform: 'ghost',
      slug: current.slug,
      tags: tagList,
      proof: {
        pressprotocol: '1.0.0-sovereign',
        cid: finalCID,
        title,
        tags: tagList,
        timestamp,
        publisher: {
          publicKey: pubKey,
          signature,
        },
        metadata: {
          cms: 'ghost',
          ghostId: current.id,
          slug: current.slug,
        },
      },
      ipfsUrl: `https://ipfs.io/ipfs/${finalCID}`,
      torUrl: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
    };
  }

  /**
   * Ingests a verified Strapi CMS entry.
   */
  public async ingestStrapiEntry(
    payload: StrapiWebhookPayload,
    options?: { privateKey?: string; publicKey?: string }
  ) {
    const entry = payload.entry;
    if (!entry) {
      throw new Error('Invalid Strapi payload: missing entry object');
    }

    const title = entry.title || 'Untitled Strapi Publication';
    const content = entry.content || entry.body || entry.description || '';
    if (!content.trim()) {
      throw new Error('Invalid Strapi entry: content or body field is empty');
    }

    const tagList: string[] = ['strapi-cms', 'sovereign'];
    if (Array.isArray(entry.tags)) {
      for (const t of entry.tags) {
        if (typeof t === 'string') tagList.push(t);
        else if (t?.name) tagList.push(t.name);
      }
    }

    let privKey = options?.privateKey;
    let pubKey = options?.publicKey;
    if (!privKey || !pubKey) {
      const kp = await identityService.generateKeypair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
    }

    const timestamp = entry.publishedAt || new Date().toISOString();
    const canonicalPayload = JSON.stringify({
      title,
      tags: tagList,
      timestamp,
    });
    const signature = await identityService.signContent(canonicalPayload, privKey);
    const deterministicCID = calculateDeterministicCIDv1(content);

    const storageResult = await storageService.uploadContent(
      title,
      content,
      tagList,
      { pubkey: pubKey, signature },
      timestamp
    );

    const finalCID = storageResult.cid || deterministicCID;
    const onionAddress = await torService.getSelfOnionAddress();

    return {
      success: true,
      cid: finalCID,
      title,
      platform: 'strapi',
      model: payload.model,
      event: payload.event,
      tags: tagList,
      proof: {
        pressprotocol: '1.0.0-sovereign',
        cid: finalCID,
        title,
        tags: tagList,
        timestamp,
        publisher: {
          publicKey: pubKey,
          signature,
        },
        metadata: {
          cms: 'strapi',
          strapiId: entry.id,
          model: payload.model,
        },
      },
      ipfsUrl: `https://ipfs.io/ipfs/${finalCID}`,
      torUrl: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
    };
  }

  /**
   * Ingests a generic CMS payload (Sanity / Contentful).
   */
  public async ingestGenericCms(
    payload: GenericCmsPayload,
    options?: { privateKey?: string; publicKey?: string }
  ) {
    if (!payload.title || !payload.content) {
      throw new Error('Invalid CMS payload: title and content are required');
    }

    const platform = payload.platform || 'generic-cms';
    const tagList = payload.tags && payload.tags.length > 0 ? payload.tags : [platform, 'sovereign'];

    let privKey = options?.privateKey;
    let pubKey = options?.publicKey;
    if (!privKey || !pubKey) {
      const kp = await identityService.generateKeypair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
    }

    const timestamp = new Date().toISOString();
    const canonicalPayload = JSON.stringify({
      title: payload.title,
      tags: tagList,
      timestamp,
    });
    const signature = await identityService.signContent(canonicalPayload, privKey);
    const deterministicCID = calculateDeterministicCIDv1(payload.content);

    const storageResult = await storageService.uploadContent(
      payload.title,
      payload.content,
      tagList,
      { pubkey: pubKey, signature },
      timestamp
    );

    const finalCID = storageResult.cid || deterministicCID;
    const onionAddress = await torService.getSelfOnionAddress();

    return {
      success: true,
      cid: finalCID,
      title: payload.title,
      platform,
      tags: tagList,
      proof: {
        pressprotocol: '1.0.0-sovereign',
        cid: finalCID,
        title: payload.title,
        tags: tagList,
        timestamp,
        publisher: {
          publicKey: pubKey,
          signature,
        },
        metadata: {
          cms: platform,
          slug: payload.slug,
          author: payload.author,
        },
      },
      ipfsUrl: `https://ipfs.io/ipfs/${finalCID}`,
      torUrl: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
    };
  }
}

export const cmsBridgeService = new CmsBridgeService();
