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
  type VerificationResult,
} from "./crypto.js";

export {
  SIGNATURE_PROTOCOL_V2,
  buildSigningPayloadV2,
  canonicalizeJson,
  sha256Hex,
  signArticleV2,
  verifyPublication,
  type PublicationVerification,
  type SignableArticle,
  type SignatureStatus,
} from "./protocol.js";

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

