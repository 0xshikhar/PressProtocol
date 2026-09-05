import { Env, ContentData } from '../types';

export interface PinataUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class PinataService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.env.PINATA_JWT) {
      return {
        Authorization: `Bearer ${this.env.PINATA_JWT}`,
      };
    }
    if (this.env.PINATA_API_KEY && this.env.PINATA_SECRET_KEY) {
      return {
        pinata_api_key: this.env.PINATA_API_KEY,
        pinata_secret_api_key: this.env.PINATA_SECRET_KEY,
      };
    }
    throw new Error(
      'Missing Pinata credentials: set PINATA_JWT or PINATA_API_KEY/PINATA_SECRET_KEY in Cloudflare Worker environment.'
    );
  }

  /**
   * Pins JSON content to Pinata IPFS.
   * This is the immutable source of truth for dispatches.
   */
  async pinJSON(
    title: string,
    content: string,
    tags: string[],
    publisher?: { pubkey: string; signature: string },
    timestamp?: string
  ): Promise<{ cid: string; ipfsUrl: string; gatewayUrl: string }> {
    const payload: ContentData = {
      title,
      content,
      tags,
      timestamp: timestamp || new Date().toISOString(),
      publisher,
    };

    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pinataContent: payload,
        pinataMetadata: {
          name: `PressProtocol - ${title.slice(0, 48)}`,
          keyvalues: {
            type: 'pressprotocol-content',
            tags: tags.join(','),
            publishedAt: payload.timestamp,
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata IPFS pinning failed [${response.status}]: ${errorText}`);
    }

    const data = (await response.json()) as PinataUploadResult;
    const cid = data.IpfsHash;
    const gateway = this.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

    return {
      cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl: `${gateway.replace(/\/+$/, '')}/${cid}`,
    };
  }

  /**
   * Pins binary files/images directly to Pinata.
   */
  async pinFile(formData: FormData): Promise<{ cid: string; ipfsUrl: string; gatewayUrl: string }> {
    const headers = this.getAuthHeaders();

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata file upload failed [${response.status}]: ${errorText}`);
    }

    const data = (await response.json()) as PinataUploadResult;
    const cid = data.IpfsHash;
    const gateway = this.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

    return {
      cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl: `${gateway.replace(/\/+$/, '')}/${cid}`,
    };
  }
}
