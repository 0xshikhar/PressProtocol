import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { calculateDeterministicCIDv1 } from '../lib/cid.js';

export interface PinataUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface UploadContentResult {
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
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
}

export class StorageService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;
  private gatewayUrl: string;

  constructor() {
    this.pinataApiKey = env.PINATA_API_KEY;
    this.pinataSecretKey = env.PINATA_SECRET_KEY;
    this.pinataJWT = env.PINATA_JWT;
    this.gatewayUrl = env.IPFS_GATEWAY_URL;
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
    timestamp?: string
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
      };

      // If no Pinata credentials configured (Pure Sovereign / CI / Offline Mode), store directly in local blockstore
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        const deterministicCid = calculateDeterministicCIDv1(content);
        try {
          const cacheDir = path.resolve(process.cwd(), '.data/content-cache');
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          const cacheFile = path.join(cacheDir, `${deterministicCid}.json`);
          fs.writeFileSync(cacheFile, JSON.stringify(contentData, null, 2), 'utf-8');
          console.log(`💾 Sovereign local blockstore stored article at ${cacheFile}`);
        } catch (cacheErr) {
          console.warn('Could not write to local disk cache:', cacheErr);
        }

        return {
          cid: deterministicCid,
          ipfsUrl: `ipfs://${deterministicCid}`,
          gatewayUrl: `${this.gatewayUrl}/${deterministicCid}`,
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
        try {
          const cacheDir = path.resolve(process.cwd(), '.data/content-cache');
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          const cacheFile = path.join(cacheDir, `${deterministicCid}.json`);
          fs.writeFileSync(cacheFile, JSON.stringify(contentData, null, 2), 'utf-8');
        } catch {}

        return {
          cid: deterministicCid,
          ipfsUrl: `ipfs://${deterministicCid}`,
          gatewayUrl: `${this.gatewayUrl}/${deterministicCid}`,
        };
      }

      const result = await response.json() as PinataUploadResult;

      console.log(`✅ Content uploaded to IPFS: ${result.IpfsHash}`);
      console.log(`📦 Size: ${result.PinSize} bytes`);
      console.log(`🔗 Gateway URL: ${this.gatewayUrl}/${result.IpfsHash}`);

      // Persist to local disk cache for instant zero-latency retrieval & offline resilience
      try {
        const cacheDir = path.resolve(process.cwd(), '.data/content-cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        const cacheFile = path.join(cacheDir, `${result.IpfsHash}.json`);
        fs.writeFileSync(cacheFile, JSON.stringify(contentData, null, 2), 'utf-8');
        console.log(`💾 Cached article locally at ${cacheFile}`);
      } catch (cacheErr) {
        console.warn('Could not write to local disk cache:', cacheErr);
      }

      return {
        cid: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `${this.gatewayUrl}/${result.IpfsHash}`,
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
    // 1. Check local disk cache first (sub-millisecond instant hit)
    try {
      const cacheDir = path.resolve(process.env.DATA_DIR || process.cwd(), '.data/content-cache');
      const cacheFile = path.join(cacheDir, `${cid}.json`);
      if (fs.existsSync(cacheFile)) {
        const raw = fs.readFileSync(cacheFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.content || parsed.title)) {
          console.log(`⚡ [CACHE HIT] Loaded content locally: ${cid}`);
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
      let targetUrl = `${gw}/${cid}`;
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
      try {
        const cacheDir = path.resolve(process.env.DATA_DIR || process.cwd(), '.data/content-cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(path.join(cacheDir, `${cid}.json`), JSON.stringify(contentData, null, 2), 'utf-8');
      } catch {}

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
      const response = await fetch(`${this.gatewayUrl}/${cid}`);
      
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
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
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
