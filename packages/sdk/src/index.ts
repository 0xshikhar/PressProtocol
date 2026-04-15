/**
 * @pressprotocol/sdk
 * Standalone Headless Publishing & Multi-Transport Resolution SDK
 */

export { PressProtocolClient } from "./client.js";

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
  type VerificationResult,
} from "./crypto.js";

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
} from "./types.js";
