/**
 * @pressprotocol/sdk
 * Standalone Headless Publishing & Multi-Transport Resolution SDK
 */

export {
  PressProtocolClient,
  PressProtocolClient as PressProtocol,
} from "./client.js";

export {
  generateKeypair,
  generateKeypairSync,
  getPublicKey,
  signPayload,
  verifySignature,
  verifyArticle,
  createCanonicalPayload,
  bytesToHex,
  hexToBytes,
  isValidHex,
  calculateDeterministicCIDv1,
  validateTorV3Address,
  deriveTorV3Address,
  base32Decode,
  type VerificationResult,
  type TorV3ValidationResult,
} from "./crypto.js";

export {
  signWebhookPayload,
  verifyWebhookSignature,
} from "./webhooks.js";

export type {
  ClientConfig,
  PublishOptions,
  PublishResult,
  ResolveOptions,
  ResolveResult,
  HealthResult,
  MirrorProbe,
  MirrorStatus,
  ArticlePublisher,
  KeyPair,
  WebhookEventType,
  WebhookSubscriptionStats,
  WebhookSubscription,
  CreateWebhookOptions,
  WebhookVerificationResult,
} from "./types.js";

