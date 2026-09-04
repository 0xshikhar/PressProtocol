import { BACKEND_URL } from "@/config/backend";

export interface PublishContentRequest {
  title: string;
  content: string;
  tags: string[];
  media?: string[];
  publicKey?: string;
  signature?: string;
  timestamp?: string;
}

// Publish response - simple mirror URLs (from POST /api/content)
export interface PublishContentResponse {
  shareUrl: string;
  cid: string;
  mirrors: {
    ipfs?: string;
    tor?: string;
    gateway?: string;
  };
  recommended: "ipfs" | "tor" | "gateway";
  publisher: {
    publicKey: string;
    isAnonymous: boolean;
  };
  dht: {
    announced: boolean;
    manifestCid: string;
  };
}

// Content retrieval response - full mirror objects with status (from GET /api/content/:cid)
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
    walletAddress?: string
  ): Promise<PublishContentResponse> {
    const response = await fetch(`${this.baseUrl}/api/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish content: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async resolveContent(cid: string): Promise<ResolveContentResponse> {
    const response = await fetch(`${this.baseUrl}/api/resolve/${cid}`);

    if (!response.ok) {
      throw new Error(`Failed to resolve content: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getContent(cid: string): Promise<ResolveContentResponse> {
    const cleanBaseUrl = this.baseUrl?.includes("railway.app") ? "" : this.baseUrl;

    // 1. Try configured backend if valid
    if (cleanBaseUrl) {
      try {
        const response = await fetch(`${cleanBaseUrl}/api/content/${cid}`, {
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data) return result.data;
        }
      } catch (e) {
        console.warn(`[ApiClient] Failed to fetch from baseUrl ${cleanBaseUrl}, trying resilient edge fallback...`);
      }
    }

    // 2. Try local daemon (port 4000) if user has local node running
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      try {
        const localDaemonRes = await fetch(`http://localhost:4000/api/content/${cid}`, {
          signal: AbortSignal.timeout(2000),
        });
        if (localDaemonRes.ok) {
          const result = await localDaemonRes.json();
          if (result.data) return result.data;
        }
      } catch (e) {
        // Continue to Next.js proxy route
      }
    }

    // 3. Query local Next.js proxy route
    if (typeof window !== "undefined") {
      try {
        const localResponse = await fetch(`/api/content/${cid}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (localResponse.ok) {
          const result = await localResponse.json();
          if (result.data) return result.data;
        }
      } catch (e) {
        console.warn("[ApiClient] Local proxy route failed, querying public IPFS gateways directly...");
      }
    }

    // 3. Direct browser IPFS gateway query as ultimate safeguard
    const publicGateways = [
      "https://gateway.pinata.cloud/ipfs",
      "https://cloudflare-ipfs.com/ipfs",
      "https://ipfs.io/ipfs",
    ];

    for (const gateway of publicGateways) {
      try {
        const res = await fetch(`${gateway}/${cid}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const raw = await res.json();
          return {
            cid,
            title: raw.title || "Untitled",
            content: raw.content || "",
            tags: raw.tags || [],
            mirrors: {
              ipfs: { url: `${gateway}/${cid}`, available: true },
              tor: { url: "", available: false },
              gateway: { url: `https://cloudflare-ipfs.com/ipfs/${cid}`, available: true },
            },
            recommended: "ipfs",
            publisher: {
              walletAddress: raw.publisher?.walletAddress || "",
              pubkey: raw.publisher?.pubkey || "",
              signature: raw.publisher?.signature || "unsigned",
            },
            createdAt: raw.timestamp || new Date().toISOString(),
          };
        }
      } catch (e) {
        // Continue to next gateway
      }
    }

    throw new Error(`Failed to resolve content: Unable to load CID ${cid} from backend daemon or IPFS swarms.`);
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

    const result = await response.json();
    return result.data || [];
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

    const result = await response.json();
    return result.data;
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

  async getBackendOnionUrl(): Promise<{
    onionUrl: string;
    available: boolean;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/mirrors/onion-url`);

    if (!response.ok) {
      throw new Error(`Failed to get onion URL: ${response.statusText}`);
    }

    return response.json();
  }

  async getFastestMirror(cid: string): Promise<{
    type: "ipfs" | "tor" | "gateway";
    url: string;
    latency: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/mirrors/${cid}/fastest`);

    if (!response.ok) {
      throw new Error(`Failed to get fastest mirror: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

export const apiClient = new ApiClient();
