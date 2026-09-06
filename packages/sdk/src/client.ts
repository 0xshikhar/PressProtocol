import {
  generateKeypair,
  getPublicKey,
  signPayload,
  createCanonicalPayload,
  verifyArticle,
} from "./crypto.js";
import type {
  ClientConfig,
  PublishOptions,
  PublishResult,
  ResolveOptions,
  ResolveResult,
  HealthResult,
  MirrorProbe,
  KeyPair,
  CreateWebhookOptions,
  WebhookSubscription,
  WebhookVerificationResult,
} from "./types.js";
import { verifyWebhookSignature } from "./webhooks.js";


const DEFAULT_PRODUCTION_ENDPOINT = "https://api.pressprotocol.com";
const DEFAULT_LOCAL_ENDPOINT = "http://localhost:4000";

const DEFAULT_PUBLIC_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
  "https://ipfs.io/ipfs",
  "https://dweb.link/ipfs",
];

export class PressProtocolClient {
  private endpoint: string;
  private apiKey?: string;
  private privateKey?: string;
  private gateways: string[];
  private timeoutMs: number;

  constructor(config: ClientConfig = {}) {
    this.endpoint =
      config.endpoint ||
      (typeof process !== "undefined" && process.env?.PRESSPROTOCOL_ENDPOINT) ||
      (typeof process !== "undefined" && process.env?.NODE_ENV === "production"
        ? DEFAULT_PRODUCTION_ENDPOINT
        : DEFAULT_LOCAL_ENDPOINT);

    this.apiKey = config.apiKey || (typeof process !== "undefined" ? process.env?.PRESSPROTOCOL_API_KEY : undefined);
    this.privateKey = config.privateKey || (typeof process !== "undefined" ? process.env?.PRESSPROTOCOL_PRIVATE_KEY : undefined);
    this.gateways = config.gateways || DEFAULT_PUBLIC_GATEWAYS;
    this.timeoutMs = config.timeoutMs || 10000;
  }

  /**
   * Generates a new sovereign RFC 8032 Ed25519 keypair.
   */
  async generateKeypair(): Promise<KeyPair> {
    return generateKeypair();
  }

  /**
   * Publishes an article anonymously or signed with a sovereign keypair.
   */
  async publish(options: PublishOptions): Promise<PublishResult> {
    const endpoint = (options.endpoint || this.endpoint).replace(/\/$/, "");
    const tags = Array.isArray(options.tags) ? options.tags : [];
    const timestamp = new Date().toISOString();

    // 1. Determine signing keypair
    let privKey = options.privateKey || options.keypair?.privateKey || this.privateKey;
    let pubKey = options.keypair?.publicKey;

    if (!privKey) {
      // Generate ephemeral burner keypair for sovereign publishing
      const keypair = await generateKeypair();
      privKey = keypair.privateKey;
      pubKey = keypair.publicKey;
    } else if (!pubKey) {
      pubKey = await getPublicKey(privKey);
    }

    // 2. Construct canonical payload and sign client-side
    const canonicalPayload = createCanonicalPayload(options.title, tags, timestamp);
    const signature = await signPayload(canonicalPayload, privKey);

    // 3. Post to PressProtocol Node daemon
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${endpoint}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: options.title,
          content: options.content,
          tags,
          publicKey: pubKey,
          signature,
          timestamp,
          walletAddress: options.walletAddress,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Publish failed with status ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const data = json.data;

      return {
        cid: data.cid,
        uri: `ipfs://${data.cid}`,
        shareUrl: data.shareUrl || `${endpoint}/read/${data.cid}`,
        signature,
        publicKey: pubKey,
        mirrors: data.mirrors || {
          ipfs: `https://gateway.pinata.cloud/ipfs/${data.cid}`,
          gateway: `https://cloudflare-ipfs.com/ipfs/${data.cid}`,
        },
        recommended: data.recommended || "ipfs",
        dht: data.dht,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Failed to publish content: ${err.message}`);
    }
  }

  /**
   * Resolves an article across decentralized transports (daemon + global IPFS swarm)
   * and verifies its Ed25519 signature in-memory.
   */
  async resolve(cid: string, options: ResolveOptions = {}): Promise<ResolveResult> {
    const endpoint = (options.endpoint || this.endpoint).replace(/\/$/, "");
    const timeout = options.timeoutMs || this.timeoutMs || 10000;
    const shouldVerify = options.verify !== false;

    let articleRaw: any = null;
    let source = "node-daemon";

    // 1. Primary resolve attempt: PressProtocol node daemon
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Math.min(timeout, 8000));

      const res = await fetch(`${endpoint}/api/content/${cid}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          articleRaw = json.data;
          source = "node-daemon";
        }
      }
    } catch {
      // Node unreachable or timed out, failover to public IPFS gateways
    }

    // 2. Parallel Failover: Race global public IPFS swarm
    if (!articleRaw) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeout);

      const swarmPromises = this.gateways.map(async (gateway) => {
        const res = await fetch(`${gateway}/${cid}`, {
          signal: abortController.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Gateway ${gateway} returned ${res.status}`);
        }

        const raw = await res.json();
        return { raw, gateway };
      });

      try {
        const fastest = await Promise.any(swarmPromises);
        clearTimeout(timeoutId);
        abortController.abort(); // Cancel pending slower requests

        articleRaw = fastest.raw;
        source = `ipfs-gateway (${fastest.gateway})`;
      } catch (swarmErr) {
        clearTimeout(timeoutId);
        throw new Error(
          `Unable to resolve CID ${cid} from node daemon or decentralized IPFS swarms.`
        );
      }
    }

    const title = articleRaw.title || "Untitled Sovereign Document";
    const content = articleRaw.content || "";
    const tags = Array.isArray(articleRaw.tags) ? articleRaw.tags : [];
    const createdAt = articleRaw.createdAt || articleRaw.timestamp || new Date().toISOString();
    const pubkey =
      articleRaw.publisher?.publicKey ||
      articleRaw.publisher?.pubkey ||
      articleRaw.publisherPubKey ||
      "";
    const signature = articleRaw.signature || articleRaw.publisher?.signature || "unsigned";

    // 3. Cryptographic Verification
    let verified = false;
    let verificationLatencyMs = 0;
    let verificationStatus: ResolveResult["verificationStatus"] = "unsigned";
    let verificationAlgorithm = "None";

    if (shouldVerify) {
      const vResult = await verifyArticle({
        title,
        content,
        tags,
        createdAt,
        publisher: { publicKey: pubkey, pubkey, signature },
        signature,
      });

      verified = vResult.isValid;
      verificationLatencyMs = vResult.latencyMs;
      verificationStatus = vResult.status;
      verificationAlgorithm = vResult.algorithm;
    }

    // Format mirrors
    const mirrors: Record<string, { url: string; available: boolean; latency?: number }> = {};
    if (articleRaw.mirrors && typeof articleRaw.mirrors === "object") {
      if (Array.isArray(articleRaw.mirrors)) {
        articleRaw.mirrors.forEach((m: any) => {
          mirrors[m.type] = { url: m.url, available: m.available ?? true, latency: m.latency };
        });
      } else {
        Object.entries(articleRaw.mirrors).forEach(([key, val]: [string, any]) => {
          if (val) {
            mirrors[key] = {
              url: val.url || val,
              available: val.available ?? true,
              latency: val.latency,
            };
          }
        });
      }
    }

    // Ensure IPFS mirror fallback
    if (!mirrors.ipfs) {
      mirrors.ipfs = {
        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
        available: true,
      };
    }

    return {
      cid,
      title,
      content,
      tags,
      createdAt,
      publisher: {
        publicKey: pubkey,
        pubkey,
        signature,
        walletAddress: articleRaw.publisher?.walletAddress,
        username: articleRaw.publisher?.username,
        isAnonymous: !articleRaw.publisher?.walletAddress,
      },
      signature,
      mirrors,
      recommended: articleRaw.recommended || "ipfs",
      verified,
      verificationLatencyMs,
      verificationStatus,
      verificationAlgorithm,
      source,
    };
  }

  /**
   * Performs concurrent health probes against all known mirrors for a CID.
   */
  async health(cid: string): Promise<HealthResult> {
    const probes = [...this.gateways.map((gw) => ({ name: new URL(gw).hostname, url: `${gw}/${cid}` }))];

    if (this.endpoint) {
      probes.unshift({
        name: "PressProtocol Node",
        url: `${this.endpoint.replace(/\/$/, "")}/api/content/${cid}`,
      });
    }

    const results: MirrorProbe[] = await Promise.all(
      probes.map(async (probe) => {
        const start = performance.now();
        try {
          const res = await fetch(probe.url, {
            method: "HEAD",
            signal: AbortSignal.timeout(3500),
          });
          const latencyMs = Math.round(performance.now() - start);
          return {
            name: probe.name,
            url: probe.url,
            available: res.ok,
            latencyMs,
            error: res.ok ? undefined : `HTTP ${res.status}`,
          };
        } catch (e: any) {
          return {
            name: probe.name,
            url: probe.url,
            available: false,
            latencyMs: Math.round(performance.now() - start),
            error: e.message || "Timeout / Unreachable",
          };
        }
      })
    );

    const availableProbes = results.filter((r) => r.available && r.latencyMs !== undefined);
    availableProbes.sort((a, b) => (a.latencyMs || 0) - (b.latencyMs || 0));

    return {
      cid,
      mirrors: results,
      fastest: availableProbes.length > 0
        ? {
            name: availableProbes[0].name,
            url: availableProbes[0].url,
            latencyMs: availableProbes[0].latencyMs!,
          }
        : undefined,
    };
  }

  /**
   * Publishes content via the v1 REST API with node-side signing (POST /api/v1/publish/raw).
   */
  async publishRaw(options: {
    title: string;
    content: string;
    format?: "markdown" | "html" | "json";
    tags?: string[];
    author?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/publish/raw`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: options.title,
        content: options.content,
        format: options.format || "markdown",
        tags: options.tags || [],
        author: options.author,
        metadata: options.metadata,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`publishRaw failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Relays a client-signed article via the v1 REST API (POST /api/v1/publish/signed - Zero-Custody).
   */
  async publishSigned(options: {
    title: string;
    content: string;
    tags?: string[];
    timestamp: string;
    publicKey: string;
    signature: string;
  }): Promise<any> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${endpoint}/api/v1/publish/signed`, {
      method: "POST",
      headers,
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`publishSigned failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Cryptographic verification audit via v1 API (POST /api/v1/verify).
   */
  async verifyContent(options: {
    content: string;
    publicKey: string;
    signature: string;
    cid?: string;
    title?: string;
    tags?: string[];
    timestamp?: string;
  }): Promise<any> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const res = await fetch(`${endpoint}/api/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`verifyContent failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Retrieves enterprise gateway metrics (GET /api/v1/metrics).
   */
  async getMetrics(): Promise<any> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const res = await fetch(`${endpoint}/api/v1/metrics`);
    if (!res.ok) {
      throw new Error(`getMetrics failed: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Registers a new outbound webhook subscription on the PressProtocol gateway.
   */
  async createWebhookSubscription(options: CreateWebhookOptions): Promise<{
    success: boolean;
    subscription: WebhookSubscription;
    instructions: string;
  }> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/webhooks/subscriptions`, {
      method: "POST",
      headers,
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`createWebhookSubscription failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Lists registered webhook subscriptions on the gateway.
   */
  async listWebhookSubscriptions(): Promise<{
    success: boolean;
    subscriptions: WebhookSubscription[];
    count: number;
  }> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/webhooks/subscriptions`, { headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`listWebhookSubscriptions failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Retrieves an individual webhook subscription by ID.
   */
  async getWebhookSubscription(id: string): Promise<{
    success: boolean;
    subscription: WebhookSubscription;
  }> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/webhooks/subscriptions/${id}`, { headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`getWebhookSubscription failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Deletes a registered webhook subscription.
   */
  async deleteWebhookSubscription(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/webhooks/subscriptions/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`deleteWebhookSubscription failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Sends an immediate test ping event to verify webhook connectivity.
   */
  async testWebhookSubscription(id: string): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
    latencyMs?: number;
  }> {
    const endpoint = this.endpoint.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["X-API-Key"] = this.apiKey;
    }

    const res = await fetch(`${endpoint}/api/v1/webhooks/subscriptions/${id}/test`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`testWebhookSubscription failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  /**
   * Helper to verify an incoming webhook payload using the shared secret.
   */
  verifyWebhook(
    payload: string | object,
    signatureHeader: string | null | undefined,
    secret: string,
    toleranceSeconds: number = 300
  ): WebhookVerificationResult {
    return verifyWebhookSignature(payload, signatureHeader, secret, toleranceSeconds);
  }
}

