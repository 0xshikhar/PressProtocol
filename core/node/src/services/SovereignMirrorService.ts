import { identityService } from './IdentityService.js';
import { storageService } from './StorageService.js';
import { torService } from './TorService.js';
import { calculateDeterministicCIDv1 } from '../lib/cid.js';

export interface MediumIngestInput {
  url?: string;
  title?: string;
  content: string; // HTML or Markdown
  author?: string;
  tags?: string[];
  privateKey?: string;
  publicKey?: string;
}

export interface SubstackIngestInput {
  url?: string;
  title?: string;
  subtitle?: string;
  content: string; // HTML or Markdown
  author?: string;
  tags?: string[];
  audioEnclosureUrl?: string;
  privateKey?: string;
  publicKey?: string;
}

export interface MirrorResult {
  success: boolean;
  cid: string;
  title: string;
  platform: 'medium' | 'substack' | 'generic';
  canonicalUrl?: string;
  cleansedContent: string;
  sanitizedTrackerCount: number;
  wordCount: number;
  tags: string[];
  proof: {
    pressprotocol: string;
    cid: string;
    title: string;
    tags: string[];
    timestamp: string;
    publisher: {
      publicKey: string;
      signature: string;
    };
    metadata: {
      sourcePlatform: string;
      originalUrl?: string;
      cleansedTrackers: number;
    };
  };
  ipfsUrl: string;
  torUrl?: string;
}

export class SovereignMirrorService {
  /**
   * Cleanses commercial surveillance trackers from HTML or Markdown:
   * 1. 1x1 tracking GIFs and beacon pixels (stat?event=..., email_open_tracking)
   * 2. Medium redirect tracking links (/m/global-identity?redirectUrl=...)
   * 3. Surveillance query parameters (utm_*, source=rss-*, gi=*, trackingId=*, token=*)
   * 4. Surveillance script tags and beacons
   */
  public cleanseSurveillanceTrackers(raw: string): { cleansed: string; trackersRemoved: number } {
    let content = raw;
    let trackersRemoved = 0;

    // 1. Remove 1x1 tracking pixels and beacons
    const trackingPixelRegex = /<img[^>]+(?:stat\?event=|open_tracking|tracking_pixel|_stat|_open)[^>]*>/gi;
    const pixelMatches = content.match(trackingPixelRegex);
    if (pixelMatches) {
      trackersRemoved += pixelMatches.length;
      content = content.replace(trackingPixelRegex, '');
    }

    // Also match generic 1x1 images
    const generic1x1Regex = /<img[^>]+(?:width=["']1["']|height=["']1["'])[^>]*>/gi;
    const genericMatches = content.match(generic1x1Regex);
    if (genericMatches) {
      trackersRemoved += genericMatches.length;
      content = content.replace(generic1x1Regex, '');
    }

    // 2. Unwrap Medium redirect tracking URLs: https://medium.com/m/global-identity?redirectUrl=<URL>
    const mediumRedirectRegex = /https?:\/\/medium\.com\/m\/global-identity\?redirectUrl=([^"'\s)>]+)/gi;
    const redirectMatches = content.match(mediumRedirectRegex);
    if (redirectMatches) {
      trackersRemoved += redirectMatches.length;
      content = content.replace(mediumRedirectRegex, (_, encoded) => {
        try {
          return decodeURIComponent(encoded);
        } catch {
          return encoded;
        }
      });
    }

    // 3. Strip surveillance query parameters from links
    // utm_source, utm_medium, utm_campaign, utm_term, utm_content, source=rss-*, gi=*, trackingId=*
    const trackingParamRegex = /([?&])(?:utm_[a-z0-9_]+(?:=[^&"'\s)]*)?|source=rss-[^&"'\s)]*|gi=[^&"'\s)]*|trackingId=[^&"'\s)]*|token=[^&"'\s)]*)(?:&|$)/gi;
    let paramMatches = content.match(trackingParamRegex);
    while (paramMatches && paramMatches.length > 0) {
      trackersRemoved += paramMatches.length;
      content = content.replace(trackingParamRegex, (match, prefix) => {
        return prefix === '?' ? '?' : '';
      });
      content = content.replace(/\?&/g, '?');
      content = content.replace(/[?&](["'\s)>]|$)/g, '$1');
      paramMatches = content.match(trackingParamRegex);
    }

    // 4. Strip commercial tracker scripts
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const scriptMatches = content.match(scriptRegex);
    if (scriptMatches) {
      trackersRemoved += scriptMatches.length;
      content = content.replace(scriptRegex, '');
    }

    return {
      cleansed: content.trim(),
      trackersRemoved,
    };
  }

  /**
   * Mirrors a Medium post into a permanent, tracker-free PressProtocol publication.
   */
  public async mirrorMediumArticle(input: MediumIngestInput): Promise<MirrorResult> {
    const { cleansed, trackersRemoved } = this.cleanseSurveillanceTrackers(input.content);
    
    // Extract title if missing
    let title = input.title;
    if (!title) {
      const h1Match = input.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        title = h1Match[1].replace(/<[^>]+>/g, '').trim();
      } else {
        title = 'Medium Sovereign Archive';
      }
    }

    const tags = input.tags && input.tags.length > 0 ? input.tags : ['medium-mirror', 'sovereign'];
    
    // Determine keypair
    let privKey = input.privateKey;
    let pubKey = input.publicKey;

    if (!privKey || !pubKey) {
      const kp = await identityService.generateKeypair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
    }

    // Cryptographic signing
    const timestamp = new Date().toISOString();
    const canonicalPayload = JSON.stringify({
      title,
      tags,
      timestamp,
    });
    const signature = await identityService.signContent(canonicalPayload, privKey);
    const deterministicCID = calculateDeterministicCIDv1(cleansed);

    // Save to storage
    const storageResult = await storageService.uploadContent(
      title,
      cleansed,
      tags,
      { pubkey: pubKey, signature },
      timestamp
    );

    const finalCID = storageResult.cid || deterministicCID;
    const onionAddress = await torService.getSelfOnionAddress();

    const proof = {
      pressprotocol: '1.0.0-sovereign',
      cid: finalCID,
      title,
      tags,
      timestamp,
      publisher: {
        publicKey: pubKey,
        signature,
      },
      metadata: {
        sourcePlatform: 'medium',
        originalUrl: input.url,
        cleansedTrackers: trackersRemoved,
      },
    };

    const cleanText = cleansed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    return {
      success: true,
      cid: finalCID,
      title,
      platform: 'medium',
      canonicalUrl: input.url,
      cleansedContent: cleansed,
      sanitizedTrackerCount: trackersRemoved,
      wordCount,
      tags,
      proof,
      ipfsUrl: `https://ipfs.io/ipfs/${finalCID}`,
      torUrl: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
    };
  }

  /**
   * Mirrors a Substack post into a permanent, tracker-free PressProtocol publication.
   */
  public async mirrorSubstackPost(input: SubstackIngestInput): Promise<MirrorResult> {
    const { cleansed, trackersRemoved } = this.cleanseSurveillanceTrackers(input.content);

    let title = input.title;
    if (!title) {
      const h1Match = input.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'Substack Sovereign Archive';
    }

    const tags = input.tags && input.tags.length > 0 ? input.tags : ['substack-mirror', 'sovereign'];

    let privKey = input.privateKey;
    let pubKey = input.publicKey;

    if (!privKey || !pubKey) {
      const kp = await identityService.generateKeypair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
    }

    const timestamp = new Date().toISOString();
    const canonicalPayload = JSON.stringify({
      title,
      tags,
      timestamp,
    });
    const signature = await identityService.signContent(canonicalPayload, privKey);
    const deterministicCID = calculateDeterministicCIDv1(cleansed);

    const storageResult = await storageService.uploadContent(
      title,
      cleansed,
      tags,
      { pubkey: pubKey, signature },
      timestamp
    );

    const finalCID = storageResult.cid || deterministicCID;
    const onionAddress = await torService.getSelfOnionAddress();

    const proof = {
      pressprotocol: '1.0.0-sovereign',
      cid: finalCID,
      title,
      tags,
      timestamp,
      publisher: {
        publicKey: pubKey,
        signature,
      },
      metadata: {
        sourcePlatform: 'substack',
        originalUrl: input.url,
        cleansedTrackers: trackersRemoved,
      },
    };

    const cleanText = cleansed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    return {
      success: true,
      cid: finalCID,
      title,
      platform: 'substack',
      canonicalUrl: input.url,
      cleansedContent: cleansed,
      sanitizedTrackerCount: trackersRemoved,
      wordCount,
      tags,
      proof,
      ipfsUrl: `https://ipfs.io/ipfs/${finalCID}`,
      torUrl: onionAddress ? `http://${onionAddress}/read/${finalCID}` : undefined,
    };
  }
}

export const sovereignMirrorService = new SovereignMirrorService();
