import * as ed from "@noble/ed25519";
import { sha512, sha256 } from "@noble/hashes/sha2.js";
import type { KeyPair } from "./types.js";
import { verifyPublication, type SignatureStatus } from "./protocol.js";

// Bind SHA-512 for @noble/ed25519 v2
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(sha512(ed.etc.concatBytes(...m)));

/**
 * Converts a Uint8Array to a hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts a hex string to a Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Validates if a string is a valid hex of expected byte length.
 */
export function isValidHex(str: string, expectedByteLength: number): boolean {
  if (typeof str !== "string") return false;
  const clean = str.startsWith("0x") ? str.slice(2) : str;
  if (clean.length !== expectedByteLength * 2) return false;
  return /^[0-9a-fA-F]+$/.test(clean);
}

/**
 * Generates an authentic RFC 8032 Ed25519 keypair in hex format.
 */
export async function generateKeypair(): Promise<KeyPair> {
  const privateKeyBytes = ed.utils.randomPrivateKey();
  const publicKeyBytes = await ed.getPublicKeyAsync(privateKeyBytes);

  return {
    publicKey: bytesToHex(publicKeyBytes),
    privateKey: bytesToHex(privateKeyBytes),
  };
}

/**
 * Synchronous Ed25519 keypair generator.
 */
export function generateKeypairSync(): KeyPair {
  const privateKeyBytes = ed.utils.randomPrivateKey();
  const publicKeyBytes = ed.getPublicKey(privateKeyBytes);

  return {
    publicKey: bytesToHex(publicKeyBytes),
    privateKey: bytesToHex(privateKeyBytes),
  };
}

/**
 * Derives public key from an existing private key hex.
 */
export async function getPublicKey(privateKeyHex: string): Promise<string> {
  const privBytes = hexToBytes(privateKeyHex);
  const pubBytes = await ed.getPublicKeyAsync(privBytes);
  return bytesToHex(pubBytes);
}

/**
 * Constructs the legacy v1 signing payload ({ title, tags, timestamp }).
 * @deprecated v1 signatures do not cover the article body. Use signArticleV2 / buildSigningPayloadV2.
 */
export function createCanonicalPayload(
  title: string,
  tags: string[] = [],
  timestamp?: string | number | Date
): string {
  const isoTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
  return JSON.stringify({
    title,
    tags,
    timestamp: isoTimestamp,
  });
}

/**
 * Cryptographically signs a message payload using an Ed25519 private key.
 */
export async function signPayload(
  payload: string,
  privateKeyHex: string
): Promise<string> {
  const privBytes = hexToBytes(privateKeyHex);
  const msgBytes = new TextEncoder().encode(payload);
  const sigBytes = await ed.signAsync(msgBytes, privBytes);
  return bytesToHex(sigBytes);
}

/**
 * Verifies an Ed25519 signature against a string payload.
 */
export async function verifySignature(
  payload: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    if (!isValidHex(publicKeyHex, 32) || !isValidHex(signatureHex, 64)) {
      return false;
    }
    const pubBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signatureHex);
    const msgBytes = new TextEncoder().encode(payload);
    return await ed.verifyAsync(sigBytes, msgBytes, pubBytes);
  } catch {
    return false;
  }
}

export interface VerificationResult {
  /** True only for content-bound (protocol v2) signatures. */
  isValid: boolean;
  status: SignatureStatus;
  algorithm: string;
  publicKey: string;
  signature: string;
  version?: 1 | 2 | null;
  latencyMs: number;
  error?: string;
}

/**
 * Verifies an article's Ed25519 signature using the shared PressProtocol signature protocol.
 * Only v2 (content-bound) signatures are "verified"; v1 metadata-only signatures are "legacy".
 */
export async function verifyArticle(article: {
  title: string;
  content?: string;
  tags?: string[];
  createdAt?: string | number | Date;
  timestamp?: string;
  publisher?: {
    pubkey?: string;
    publicKey?: string;
    signature?: string;
    sigVersion?: number;
  };
  signature?: string;
}): Promise<VerificationResult> {
  const start = performance.now();
  const rawTimestamp = article.timestamp ?? article.createdAt;
  const timestamp =
    typeof rawTimestamp === "string"
      ? rawTimestamp
      : rawTimestamp !== undefined
        ? new Date(rawTimestamp).toISOString()
        : undefined;

  const result = await verifyPublication({
    title: article.title,
    tags: Array.isArray(article.tags) ? article.tags : [],
    timestamp,
    content: article.content,
    publicKey: article.publisher?.pubkey || article.publisher?.publicKey,
    signature: article.signature || article.publisher?.signature,
    sigVersion: article.publisher?.sigVersion,
  });

  return {
    isValid: result.isValid,
    status: result.status,
    algorithm: result.algorithm,
    publicKey: result.publicKey,
    signature: result.signature || "unsigned",
    version: result.version,
    latencyMs: Math.round((performance.now() - start) * 100) / 100,
    error: result.error,
  };
}

// RFC 4648 Base32 alphabet (lowercase for IPFS multibase 'b')
const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

export function base32Encode(bytes: Uint8Array): string {
  let result = "";
  let bits = 0;
  let value = 0;

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 31];
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return result;
}

/**
 * Deterministically computes an authentic IPFS CIDv1 (raw-codec, sha2-256, base32)
 * completely in-memory without contacting any external IPFS daemon or gateway.
 */
export function calculateDeterministicCIDv1(content: string | Uint8Array): string {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const digest = sha256(bytes);

  // Construct binary CIDv1 structure: [0x01, 0x55, 0x12, 0x20, ...digest]
  const cidBytes = new Uint8Array(4 + digest.length);
  cidBytes[0] = 0x01; // CIDv1
  cidBytes[1] = 0x55; // multicodec: raw
  cidBytes[2] = 0x12; // multihash: sha2-256
  cidBytes[3] = 0x20; // digest length: 32 bytes
  cidBytes.set(digest, 4);

  return "b" + base32Encode(cidBytes);
}

