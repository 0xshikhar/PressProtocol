import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@pressprotocol/sdk";

// RFC 4648 Base32 alphabet (lowercase for IPFS multibase 'b')
const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

/**
 * Encodes a Uint8Array into RFC 4648 Base32 lowercase string (no padding).
 */
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
 * Decodes an RFC 4648 Base32 string into a Uint8Array.
 */
export function base32Decode(input: string): Uint8Array {
  const cleanInput = input.toLowerCase().replace(/=/g, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanInput.length; i++) {
    const char = cleanInput[i];
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Deterministically computes an authentic IPFS CIDv1 (raw-codec, sha2-256, base32)
 * completely in-memory without contacting any external IPFS daemon or gateway.
 *
 * Multicodec specification:
 * - Multibase prefix: 'b' (base32)
 * - CID version: 0x01
 * - Raw multicodec: 0x55
 * - SHA2-256 hash function: 0x12
 * - Hash length: 0x20 (32 bytes)
 * - Followed by 32 bytes of SHA-256 digest
 */
export function calculateDeterministicCIDv1(content: string | Uint8Array): string {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;

  // 1. Compute SHA-256 digest
  const digest = sha256(bytes);

  // 2. Construct binary CIDv1 structure: [0x01, 0x55, 0x12, 0x20, ...digest]
  const cidBytes = new Uint8Array(4 + digest.length);
  cidBytes[0] = 0x01; // CIDv1
  cidBytes[1] = 0x55; // multicodec: raw
  cidBytes[2] = 0x12; // multihash: sha2-256
  cidBytes[3] = 0x20; // digest length: 32 bytes
  cidBytes.set(digest, 4);

  // 3. Encode in Base32 with 'b' multibase prefix
  return "b" + base32Encode(cidBytes);
}

export interface PressProofPublisher {
  publicKey: string;
  signature: string;
  walletAddress?: string;
  username?: string;
  isAnonymous?: boolean;
}

export interface PressProofManifest {
  version: "1.0.0";
  protocol: "PressProtocol";
  standard: "RFC-8032-CIDv1";
  cid: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  publisher: PressProofPublisher;
  mirrors: {
    ipfs?: string;
    tor?: string;
    gateway?: string;
  };
  checksum: {
    sha256: string;
    byteSize: number;
  };
  offlinePreservedAt: string;
}

export interface ExportProofInput {
  cid?: string;
  title: string;
  content: string;
  tags?: string[];
  timestamp?: string;
  publisher?: PressProofPublisher;
  mirrors?: {
    ipfs?: string;
    tor?: string;
    gateway?: string;
  };
}

/**
 * Exports a canonical, self-verifying .pressproof.json manifest for air-gapped
 * preservation and delay-tolerant transport.
 */
export function exportPressProof(input: ExportProofInput): PressProofManifest {
  const contentBytes = new TextEncoder().encode(input.content || "");
  const sha256Hash = bytesToHex(sha256(contentBytes));
  const deterministicCid = input.cid || calculateDeterministicCIDv1(contentBytes);
  const timestamp = input.timestamp || new Date().toISOString();

  return {
    version: "1.0.0",
    protocol: "PressProtocol",
    standard: "RFC-8032-CIDv1",
    cid: deterministicCid,
    title: input.title,
    content: input.content,
    tags: input.tags || [],
    timestamp,
    publisher: {
      publicKey: input.publisher?.publicKey || "",
      signature: input.publisher?.signature || "unsigned",
      walletAddress: input.publisher?.walletAddress,
      username: input.publisher?.username,
      isAnonymous: input.publisher?.isAnonymous ?? !input.publisher?.walletAddress,
    },
    mirrors: {
      ipfs: input.mirrors?.ipfs || `ipfs://${deterministicCid}`,
      tor: input.mirrors?.tor,
      gateway: input.mirrors?.gateway || `https://gateway.pinata.cloud/ipfs/${deterministicCid}`,
    },
    checksum: {
      sha256: sha256Hash,
      byteSize: contentBytes.length,
    },
    offlinePreservedAt: new Date().toISOString(),
  };
}

/**
 * Browser helper to trigger a .pressproof.json file download.
 */
export function downloadPressProofFile(proof: PressProofManifest, customFilename?: string): void {
  if (typeof window === "undefined" || !window.document) return;

  const jsonString = JSON.stringify(proof, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const safeTitle = (proof.title || "article")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const filename = customFilename || `${safeTitle}-${proof.cid.slice(-8)}.pressproof.json`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
