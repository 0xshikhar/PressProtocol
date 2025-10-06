import { env } from "@/env.mjs";

const BACKEND_URL = env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000";

export interface PublishContentRequest {
  title: string;
  content: string;
  tags: string[];
  media?: string[];
}

export interface PublishContentResponse {
  shareUrl: string;
  cid: string;
  mirrors: {
    ipfs: { url: string; available: boolean; latency?: number };
    tor: { url: string; available: boolean; latency?: number };
    gateway: { url: string; available: boolean; latency?: number };
  };
  signature: string;
  publicKey: string;
}

export interface ResolveContentResponse {
  cid: string;
  title: string;
  content: string;
  tags: string[];
  mirrors: {
    ipfs: { url: string; available: boolean; latency?: number };
    tor: { url: string; available: boolean; latency?: number };
    gateway: { url: string; available: boolean; latency?: number };
  };
  recommended: "ipfs" | "tor" | "gateway";
  publisher: {
    walletAddress: string;
    username?: string;
    avatar?: string;
    pubkey: string;
    signature: string;
  };
  createdAt: string;
}

export interface DiscoveryItem {
  cid: string;
  title: string;
  tags: string[];
  timestamp: number;
  publisher: {
    pubkey: string;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  async publishContent(
    data: PublishContentRequest,
    authToken?: string
  ): Promise<PublishContentResponse> {
    const response = await fetch(`${this.baseUrl}/api/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish content: ${response.statusText}`);
    }

    return response.json();
  }

  async resolveContent(cid: string): Promise<ResolveContentResponse> {
    const response = await fetch(`${this.baseUrl}/api/resolve/${cid}`);

    if (!response.ok) {
      throw new Error(`Failed to resolve content: ${response.statusText}`);
    }

    return response.json();
  }

  async getContent(cid: string): Promise<ResolveContentResponse> {
    const response = await fetch(`${this.baseUrl}/api/content/${cid}`);

    if (!response.ok) {
      throw new Error(`Failed to get content: ${response.statusText}`);
    }

    return response.json();
  }

  async discoverContent(
    tags?: string[],
    limit: number = 20
  ): Promise<DiscoveryItem[]> {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }
    params.append("limit", limit.toString());

    const response = await fetch(
      `${this.baseUrl}/api/discovery?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to discover content: ${response.statusText}`);
    }

    return response.json();
  }

  async checkMirrorHealth(cid: string): Promise<{
    ipfs: boolean;
    tor: boolean;
    gateway: boolean;
  }> {
    const response = await fetch(`${this.baseUrl}/api/mirrors/${cid}/health`);

    if (!response.ok) {
      throw new Error(`Failed to check mirror health: ${response.statusText}`);
    }

    return response.json();
  }

  async generateIdentity(
    userId: string,
    authToken: string
  ): Promise<{ publicKey: string; privateKey: string }> {
    const response = await fetch(`${this.baseUrl}/api/identity/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate identity: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
