import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { calculateDeterministicCIDv1, isValidCID, assertValidCID } from '../lib/cid.js';

export interface PinataUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface UploadContentResult {
  cid: string;
  /** Canonical ipfs:// URI — only set when the content was actually pinned to IPFS. */
  ipfsUrl: string | null;
  /** HTTP gateway URL — only set when the content was actually pinned to IPFS. */
  gatewayUrl: string | null;
  /** Where the content actually ended up: the public IPFS swarm or the local sovereign store. */
  storage: 'ipfs' | 'local';
  pinned: boolean;
}

export interface ContentData {
  title: string;
  content: string; // Full HTML content
  tags: string[];
  timestamp: string;
  publisher?: {
    pubkey: string;
    signature: string;
  };
  author?: string;
  sourceUrl?: string;
  excerpt?: string;
  readingTime?: number;
  wordCount?: number;
}

export class StorageService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;
  private gatewayUrl: string;

  private readonly cacheDir: string;

  constructor() {
    this.pinataApiKey = env.PINATA_API_KEY;
    this.pinataSecretKey = env.PINATA_SECRET_KEY;
    this.pinataJWT = env.PINATA_JWT;
    this.gatewayUrl = env.IPFS_GATEWAY_URL;
    this.cacheDir = path.join(env.DATA_DIR, 'content-cache');
  }

  private cachePath(cid: string): string {
    const safe = path.resolve(this.cacheDir, path.basename(`${cid}.json`));
    if (!safe.startsWith(path.resolve(this.cacheDir) + path.sep)) {
      throw new Error('Unsafe cache path');
    }
    return safe;
  }

  private writeCache(cid: string, data: ContentData): void {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      fs.writeFileSync(this.cachePath(cid), JSON.stringify(data, null, 2), 'utf-8');
    } catch (cacheErr) {
      console.warn('Could not write to local disk cache:', cacheErr);
    }
  }

  /**
   * Upload content to IPFS via Pinata or Sovereign Local Blockstore
   * Content is stored as immutable JSON on IPFS - this is the source of truth
   * Database only stores CID for discovery acceleration
   */
  async uploadContent(
    title: string,
    content: string,
    tags: string[],
    publisher?: { pubkey: string; signature: string },
    timestamp?: string,
    metadata?: {
      author?: string;
      sourceUrl?: string;
      excerpt?: string;
      readingTime?: number;
      wordCount?: number;
    }
  ): Promise<UploadContentResult> {
    try {
      // Create a JSON object with the FULL content
      // This is the SOURCE OF TRUTH - stored on IPFS
      const contentData: ContentData = {
        title,
        content, // Full HTML content stored on IPFS
        tags,
        timestamp: timestamp || new Date().toISOString(),
        publisher,
        ...(metadata?.author ? { author: metadata.author } : {}),
        ...(metadata?.sourceUrl ? { sourceUrl: metadata.sourceUrl } : {}),
        ...(metadata?.excerpt ? { excerpt: metadata.excerpt } : {}),
        ...(metadata?.readingTime !== undefined ? { readingTime: metadata.readingTime } : {}),
        ...(metadata?.wordCount !== undefined ? { wordCount: metadata.wordCount } : {}),
      };

      // If no Pinata credentials configured (Pure Sovereign / CI / Offline Mode), store directly in local blockstore
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        const deterministicCid = calculateDeterministicCIDv1(content);
        this.writeCache(deterministicCid, contentData);
        console.log(`💾 Sovereign local store wrote article ${deterministicCid} (not pinned to IPFS)`);

        return {
          cid: deterministicCid,
          ipfsUrl: null,
          gatewayUrl: null,
          storage: 'local',
          pinned: false,
        };
      }

      // Pin JSON to IPFS
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: contentData,
          pinataMetadata: {
            name: `${title.substring(0, 50)}...`,
            keyvalues: {
              type: 'anonpress-content',
              tags: tags.join(','),
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Pinata upload returned ${response.status} (${errorText}); falling back to local sovereign blockstore.`);
        const deterministicCid = calculateDeterministicCIDv1(content);
        this.writeCache(deterministicCid, contentData);

        return {
          cid: deterministicCid,
          ipfsUrl: null,
          gatewayUrl: null,
          storage: 'local',
          pinned: false,
        };
      }

      const result = await response.json() as PinataUploadResult;

      console.log(`✅ Content uploaded to IPFS: ${result.IpfsHash}`);
      console.log(`📦 Size: ${result.PinSize} bytes`);
      console.log(`🔗 Gateway URL: ${this.gatewayUrl}/${result.IpfsHash}`);

      // Persist to local disk cache for instant zero-latency retrieval & offline resilience
      this.writeCache(result.IpfsHash, contentData);
      console.log(`💾 Cached article locally under ${this.cacheDir}`);

      return {
        cid: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `${this.gatewayUrl}/${result.IpfsHash}`,
        storage: 'ipfs',
        pinned: true,
      };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error(`Failed to upload content to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch full content from IPFS - THIS is the source of truth
   * Database is just a cache - always fetch from IPFS for authoritative content
   */
  async getContentFromIPFS(cid: string): Promise<ContentData> {
    const safeCid = assertValidCID(cid);

    // 1. Check local disk cache first (sub-millisecond instant hit)
    try {
      const cacheFile = this.cachePath(safeCid);
      if (fs.existsSync(cacheFile)) {
        const parsed = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        if (parsed && (parsed.content || parsed.title)) {
          console.log(`⚡ [CACHE HIT] Loaded content locally: ${safeCid}`);
          return parsed;
        }
      }
    } catch (cacheErr) {
      // Continue to network fetch
    }

    // 2. Fetch from IPFS gateways concurrently
    const gateways = Array.from(
      new Set([
        this.gatewayUrl ? this.gatewayUrl.replace(/\/+$/, '') : null,
        'https://ipfs.filebase.io/ipfs',
        'https://cloudflare-ipfs.com/ipfs',
        'https://ipfs.io/ipfs',
        'https://dweb.link/ipfs',
        'https://4everland.io/ipfs',
        'https://gateway.pinata.cloud/ipfs',
      ].filter(Boolean) as string[])
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const fetchPromises = gateways.map(async (gw) => {
      const baseGw = new URL(gw);
      const targetUrl = new URL(encodeURIComponent(safeCid), baseGw.href.endsWith('/') ? baseGw.href : baseGw.href + '/').toString();
      const headers: Record<string, string> = {
        Accept: 'application/json, text/html, text/plain, */*',
        'User-Agent': 'PressProtocol-Node/1.0.0 (+https://pressprotocol.com)',
      };

      if (this.pinataJWT && gw.includes('pinata.cloud')) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      }

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers,
      });

      if (!res.ok) {
        throw new Error(`Gateway ${gw} returned HTTP ${res.status}`);
      }

      const text = await res.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          title: 'Preserved Sovereign Document',
          content: text,
          tags: ['ipfs-raw'],
          timestamp: new Date().toISOString(),
          publisher: {
            pubkey: '',
            signature: 'unsigned',
          },
        };
      }

      return parsed as ContentData;
    });

    try {
      const contentData = await Promise.any(fetchPromises);
      clearTimeout(timeoutId);
      controller.abort();

      console.log(`✅ Fetched content from IPFS swarm: ${cid}`);

      // Save to cache for subsequent reads
      this.writeCache(safeCid, contentData);

      return contentData;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Failed to fetch content from IPFS gateways for CID ${cid}: ${err.message}`);
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: Buffer, filename: string): Promise<UploadContentResult> {
    try {
      // Pure sovereign mode: no pinning credentials — keep the blob in the local store
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        const deterministicCid = calculateDeterministicCIDv1(file.toString('utf-8'));
        try {
          if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
          fs.writeFileSync(this.cachePath(deterministicCid), file);
        } catch (cacheErr) {
          console.warn('Could not write to local disk cache:', cacheErr);
        }
        return { cid: deterministicCid, ipfsUrl: null, gatewayUrl: null, storage: 'local', pinned: false };
      }

      const formData = new FormData();
      const blob = new Blob([file]);
      formData.append('file', blob, filename);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata file upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as PinataUploadResult;

      return {
        cid: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `${this.gatewayUrl}/${result.IpfsHash}`,
        storage: 'ipfs' as const,
        pinned: true,
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content from IPFS
   */
  async getContent(cid: string): Promise<any> {
    try {
      const safeCid = assertValidCID(cid);
      const gw = (this.gatewayUrl || 'https://ipfs.io/ipfs').replace(/\/+$/, '');
      const targetUrl = new URL(`${gw}/${encodeURIComponent(safeCid)}`);
      const response = await fetch(targetUrl.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content from IPFS: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error(`Failed to fetch content from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if content is pinned
   */
  async isPinned(cid: string): Promise<boolean> {
    try {
      if (!isValidCID(cid)) {
        return false;
      }
      const safeCid = encodeURIComponent(cid.trim());
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?hashContains=${safeCid}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const result = await response.json() as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('Error checking pin status:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
