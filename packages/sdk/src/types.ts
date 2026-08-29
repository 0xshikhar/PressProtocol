/**
 * Types and interfaces for PressProtocol SDK
 */

export interface KeyPair {
  publicKey: string; // 32-byte Ed25519 public key in hex (64 chars)
  privateKey: string; // 32-byte Ed25519 private key in hex (64 chars)
}

export interface PublishOptions {
  title: string;
  content: string;
  tags?: string[];
  privateKey?: string;
  keypair?: KeyPair;
  endpoint?: string;
  walletAddress?: string;
}

export interface PublishResult {
  cid: string;
  uri: string; // ipfs://<cid>
  shareUrl: string;
  signature: string;
  publicKey: string;
  mirrors: {
    ipfs?: string;
    tor?: string;
    gateway?: string;
  };
  recommended: "ipfs" | "tor" | "gateway";
  dht?: {
    announced: boolean;
    manifestCid?: string;
  };
}

export interface ResolveOptions {
  verify?: boolean; // Cryptographically verify signature against content (default: true)
  endpoint?: string;
  timeoutMs?: number;
}

export interface ArticlePublisher {
  pubkey: string;
  publicKey: string;
  signature: string;
  walletAddress?: string;
  username?: string;
  isAnonymous: boolean;
}

export interface MirrorStatus {
  url: string;
  available: boolean;
  latency?: number;
}

export interface ResolveResult {
  cid: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  publisher: ArticlePublisher;
  signature: string;
  mirrors: Record<string, MirrorStatus>;
  recommended?: string;
  verified: boolean;
  verificationLatencyMs?: number;
  verificationStatus: "verified" | "invalid" | "unsigned" | "malformed";
  verificationAlgorithm?: string;
  source?: string;
}

export interface MirrorProbe {
  name: string;
  url: string;
  available: boolean;
  latencyMs?: number;
  error?: string;
}

export interface HealthResult {
  cid: string;
  mirrors: MirrorProbe[];
  fastest?: {
    name: string;
    url: string;
    latencyMs: number;
  };
}

export interface ClientConfig {
  endpoint?: string; // Default backend API endpoint
  apiKey?: string; // API Key for authenticated publishing (pp_live_* or pp_test_*)
  privateKey?: string; // Default sovereign signing key
  gateways?: string[]; // Fallback public IPFS gateways
  timeoutMs?: number;
}

export type WebhookEventType =
  | "article.published"
  | "article.verified"
  | "mirror.health_changed"
  | "*";

export interface WebhookSubscriptionStats {
  deliveredCount: number;
  failureCount: number;
  lastDeliveryStatus?: "success" | "failed";
  lastDeliveryAt?: string;
  lastLatencyMs?: number;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  description?: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  stats: WebhookSubscriptionStats;
}

export interface CreateWebhookOptions {
  url: string;
  events?: WebhookEventType[];
  description?: string;
  secret?: string;
  metadata?: Record<string, any>;
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
  timestamp?: number;
}

