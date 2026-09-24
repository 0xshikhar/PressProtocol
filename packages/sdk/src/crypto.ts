import * as ed from "@noble/ed25519";
import { sha512, sha256 } from "@noble/hashes/sha2.js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import type { KeyPair } from "./types.js";

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
 * Constructs the canonical deterministic JSON payload for article signing.
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
  isValid: boolean;
  status: "verified" | "invalid" | "unsigned" | "malformed";
  algorithm: string;
  publicKey: string;
  signature: string;
  latencyMs: number;
  matchedPayload?: string;
  error?: string;
}

/**
 * Verifies an article's Ed25519 signature across canonical payload candidates.
 */
export async function verifyArticle(article: {
  title: string;
  content?: string;
  tags?: string[];
  createdAt?: string | number | Date;
  publisher?: {
    pubkey?: string;
    publicKey?: string;
    signature?: string;
  };
  signature?: string;
}): Promise<VerificationResult> {
  const start = performance.now();
  const signatureHex = article.signature || article.publisher?.signature;
  const publicKeyHex = article.publisher?.pubkey || article.publisher?.publicKey;

  if (!signatureHex || signatureHex === "unsigned" || !publicKeyHex) {
    return {
      isValid: false,
      status: "unsigned",
      algorithm: "None (Unsigned)",
      publicKey: publicKeyHex || "",
      signature: signatureHex || "unsigned",
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }

  if (!isValidHex(publicKeyHex, 32) || !isValidHex(signatureHex, 64)) {
    return {
      isValid: false,
      status: "malformed",
      algorithm: "Ed25519 (RFC 8032)",
      publicKey: publicKeyHex,
      signature: signatureHex,
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
      error: "Public key or signature has invalid hex encoding length.",
    };
  }

  const tags = Array.isArray(article.tags) ? article.tags : [];
  const timestamp = article.createdAt ? new Date(article.createdAt).toISOString() : undefined;

  const candidatePayloads: string[] = [];
  if (timestamp) {
    candidatePayloads.push(
      JSON.stringify({
        title: article.title,
        tags,
        timestamp,
      })
    );
  }

  if (article.content) {
    candidatePayloads.push(
      JSON.stringify({
        title: article.title,
        content: article.content,
        tags,
      })
    );
  }

  candidatePayloads.push(
    JSON.stringify({
      title: article.title,
      tags,
    })
  );
  candidatePayloads.push(article.title);

  for (const payload of candidatePayloads) {
    const isMatch = await verifySignature(payload, signatureHex, publicKeyHex);
    if (isMatch) {
      return {
        isValid: true,
        status: "verified",
        algorithm: "Ed25519 (RFC 8032 / SHA-512)",
        publicKey: publicKeyHex,
        signature: signatureHex,
        matchedPayload: payload,
        latencyMs: Math.round((performance.now() - start) * 100) / 100,
      };
    }
  }

  return {
    isValid: false,
    status: "invalid",
    algorithm: "Ed25519 (RFC 8032 / SHA-512)",
    publicKey: publicKeyHex,
    signature: signatureHex,
    latencyMs: Math.round((performance.now() - start) * 100) / 100,
    error: "Signature does not match canonical article content.",
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

/**
 * Decodes an RFC 4648 Base32 string into a Uint8Array.
 */
export function base32Decode(str: string): Uint8Array {
  const clean = str.toLowerCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export interface TorV3ValidationResult {
  isValid: boolean;
  version?: number;
  publicKeyHex?: string;
  checksumHex?: string;
  error?: string;
}

/**
 * Cryptographically verifies a Tor v3 onion address according to the official Tor v3 specification:
 * Address = base32(PUBKEY [32B] + CHECKSUM [2B] + VERSION [1B]) + ".onion"
 * where CHECKSUM = SHA3-256(".onion checksum" + PUBKEY + 0x03)[0..1]
 */
export function validateTorV3Address(address: string): TorV3ValidationResult {
  try {
    let clean = address.toLowerCase().trim();

    // Remove scheme if present
    if (clean.startsWith("http://")) {
      clean = clean.slice(7);
    } else if (clean.startsWith("https://")) {
      clean = clean.slice(8);
    }

    // Remove any path suffix without polynomial regex backtracking
    const slashIdx = clean.indexOf("/");
    if (slashIdx !== -1) {
      clean = clean.slice(0, slashIdx);
    }

    // Strip trailing .onion suffix
    if (clean.endsWith(".onion")) {
      clean = clean.slice(0, -6);
    }

    clean = clean.trim();

    if (clean.length !== 56) {
      return {
        isValid: false,
        error: `Invalid address length: expected exactly 56 base32 characters, got ${clean.length}`,
      };
    }

    const decoded = base32Decode(clean);
    if (decoded.length !== 35) {
      return {
        isValid: false,
        error: `Decoded payload length is ${decoded.length} bytes (expected 35 bytes)`,
      };
    }

    const pubkey = decoded.subarray(0, 32);
    const checksum = decoded.subarray(32, 34);
    const version = decoded[34];

    if (version !== 3) {
      return {
        isValid: false,
        error: `Unsupported Tor onion version: ${version} (expected version 3)`,
      };
    }

    const prefix = new TextEncoder().encode(".onion checksum");
    const toHash = new Uint8Array(prefix.length + 32 + 1);
    toHash.set(prefix, 0);
    toHash.set(pubkey, prefix.length);
    toHash[prefix.length + 32] = version;

    const fullHash = sha3_256(toHash);
    const expectedChecksum = fullHash.subarray(0, 2);

    if (checksum[0] !== expectedChecksum[0] || checksum[1] !== expectedChecksum[1]) {
      return {
        isValid: false,
        error: `Cryptographic checksum mismatch: address public key does not match SHA3-256 checksum`,
      };
    }

    return {
      isValid: true,
      version: 3,
      publicKeyHex: bytesToHex(pubkey),
      checksumHex: bytesToHex(checksum),
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || 'Malformed Tor v3 address',
    };
  }
}

/**
 * Derives a valid Tor v3 onion address from an Ed25519 public key.
 */
export function deriveTorV3Address(publicKey: Uint8Array | string): string {
  let pubkeyBytes: Uint8Array;
  if (typeof publicKey === "string") {
    if (!isValidHex(publicKey, 32)) {
      throw new Error("Invalid Ed25519 public key hex: expected 64 hex characters (32 bytes)");
    }
    pubkeyBytes = hexToBytes(publicKey);
  } else {
    pubkeyBytes = publicKey;
  }

  if (pubkeyBytes.length !== 32) {
    throw new Error(`Invalid Ed25519 public key length: expected 32 bytes, got ${pubkeyBytes.length}`);
  }

  const version = 3;
  const prefix = new TextEncoder().encode(".onion checksum");
  const toHash = new Uint8Array(prefix.length + 32 + 1);
  toHash.set(prefix, 0);
  toHash.set(pubkeyBytes, prefix.length);
  toHash[prefix.length + 32] = version;

  const checksum = sha3_256(toHash).subarray(0, 2);

  const fullBytes = new Uint8Array(35);
  fullBytes.set(pubkeyBytes, 0);
  fullBytes.set(checksum, 32);
  fullBytes[34] = version;

  return `${base32Encode(fullBytes)}.onion`;
}


