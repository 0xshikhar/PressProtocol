import { env } from '../config/env.js';

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
   * Upload content to IPFS via Pinata
   */
  async uploadContent(
    title: string,
    content: string,
    tags: string[]
  ): Promise<UploadContentResult> {
    try {
      // Create a JSON object with the content
      const contentData = {
        title,
        content,
        tags,
        timestamp: new Date().toISOString(),
      };

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
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result: PinataUploadResult = await response.json();

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

      const result: PinataUploadResult = await response.json();

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

      const result = await response.json();
      return result.count > 0;
    } catch (error) {
      console.error('Error checking pin status:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
