import { sha256 } from '@noble/hashes/sha2.js';

const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

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
