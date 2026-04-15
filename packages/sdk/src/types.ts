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
  privateKey?: string; // Default sovereign signing key
  gateways?: string[]; // Fallback public IPFS gateways
  timeoutMs?: number;
}
