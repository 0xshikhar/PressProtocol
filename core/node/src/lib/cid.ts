import { sha256 } from '@noble/hashes/sha2.js';

const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

/**
 * Encodes a byte array into an RFC 4648 base32 string without padding.
 *
 * @param bytes - Binary byte array to encode
 * @returns Base32 encoded string
 */
export function base32Encode(bytes: Uint8Array): string {
  let result = '';
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
 */
export function calculateDeterministicCIDv1(content: string | Uint8Array): string {
  const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  const digest = sha256(bytes);

  // Construct binary CIDv1 structure: [0x01, 0x55, 0x12, 0x20, ...digest]
  const cidBytes = new Uint8Array(4 + digest.length);
  cidBytes[0] = 0x01; // CIDv1
  cidBytes[1] = 0x55; // multicodec: raw
  cidBytes[2] = 0x12; // multihash: sha2-256
  cidBytes[3] = 0x20; // digest length: 32 bytes
  cidBytes.set(digest, 4);

  return 'b' + base32Encode(cidBytes);
}

/**
 * Strictly validates an IPFS CID format (v0 Base58btc or v1 Base32 multibase).
 * Blocks directory traversal, protocol injection, query params, and non-alphanumeric chars.
 *
 * @param cid - Value to test for valid IPFS CID syntax
 * @returns True if value is a valid CIDv0 or CIDv1 string
 */
export function isValidCID(cid: unknown): cid is string {
  if (!cid || typeof cid !== 'string') return false;
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9a-z]{40,100})$/.test(cid.trim());
}

/**
 * Asserts that a CID string is valid syntax, throwing an error if invalid.
 *
 * @param cid - Value to validate
 * @returns Clean trimmed CID string
 * @throws Error if the CID is not a valid format
 */
export function assertValidCID(cid: unknown): string {
  if (!isValidCID(cid)) {
    throw new Error(`Invalid IPFS CID format: '${cid}'`);
  }
  return cid.trim();
}

