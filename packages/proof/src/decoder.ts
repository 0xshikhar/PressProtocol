import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, verifyArticle, verifySignature, createCanonicalPayload } from "@pressprotocol/sdk";
import { calculateDeterministicCIDv1, type PressProofManifest } from "./encoder.js";

export interface PressProofVerificationResult {
  valid: boolean;
  cidMatches: boolean;
  checksumMatches: boolean;
  signatureValid: boolean;
  latencyMs: number;
  status: "verified" | "checksum_mismatch" | "cid_mismatch" | "signature_invalid" | "unsigned" | "malformed";
  details: {
    computedCid: string;
    manifestCid: string;
    computedSha256: string;
    manifestSha256: string;
    authorPublicKey: string;
    contentByteSize: number;
  };
  error?: string;
}

/**
 * Validates a standalone .pressproof.json offline package with zero network access.
 * Cryptographically checks:
 * 1. Byte-level SHA-256 payload integrity
 * 2. Deterministic CIDv1 multihash match
 * 3. Author Ed25519 signature verification over canonical payload
 */
export async function verifyPressProof(proof: PressProofManifest): Promise<PressProofVerificationResult> {
  const start = performance.now();

  if (!proof || typeof proof !== "object" || proof.protocol !== "PressProtocol") {
    return {
      valid: false,
      cidMatches: false,
      checksumMatches: false,
      signatureValid: false,
      latencyMs: Math.round(performance.now() - start),
      status: "malformed",
      details: {
        computedCid: "",
        manifestCid: proof?.cid || "",
        computedSha256: "",
        manifestSha256: proof?.checksum?.sha256 || "",
        authorPublicKey: proof?.publisher?.publicKey || "",
        contentByteSize: 0,
      },
      error: "Malformed proof manifest or unrecognized protocol header",
    };
  }

  // 1. Recompute SHA-256 checksum over content bytes
  const contentBytes = new TextEncoder().encode(proof.content || "");
  const computedSha256 = bytesToHex(sha256(contentBytes));
  const checksumMatches = computedSha256.toLowerCase() === (proof.checksum?.sha256 || "").toLowerCase();

  if (!checksumMatches) {
    return {
      valid: false,
      cidMatches: false,
      checksumMatches: false,
      signatureValid: false,
      latencyMs: Math.round(performance.now() - start),
      status: "checksum_mismatch",
      details: {
        computedCid: "",
        manifestCid: proof.cid,
        computedSha256,
        manifestSha256: proof.checksum?.sha256 || "",
        authorPublicKey: proof.publisher?.publicKey || "",
        contentByteSize: contentBytes.length,
      },
      error: "Content payload hash mismatch: Document has been tampered with offline",
    };
  }

  // 2. Recompute deterministic CIDv1 multihash
  const computedCid = calculateDeterministicCIDv1(contentBytes);
  const cidMatches = computedCid === proof.cid;

  // 3. Verify RFC 8032 Ed25519 signature
  const pubkey = proof.publisher?.publicKey || "";
  const signature = proof.publisher?.signature || "";

  let signatureValid = false;
  let status: PressProofVerificationResult["status"] = "verified";
  let error: string | undefined;

  if (!signature || signature === "unsigned" || !pubkey) {
    signatureValid = false;
    status = "unsigned";
  } else {
    try {
      // Test signature against canonical payload
      const canonicalPayload = createCanonicalPayload(proof.title, proof.tags || [], proof.timestamp);
      const isCanonicalValid = await verifySignature(canonicalPayload, signature, pubkey);

      if (isCanonicalValid) {
        signatureValid = true;
      } else {
        // Fallback article candidate check
        const articleCheck = await verifyArticle({
          title: proof.title,
          content: proof.content,
          tags: proof.tags,
          createdAt: proof.timestamp,
          publisher: {
            pubkey,
            publicKey: pubkey,
            signature,
          },
          signature,
        });

        signatureValid = articleCheck.isValid;
      }

      if (!signatureValid) {
        status = "signature_invalid";
        error = "Author Ed25519 signature is invalid for the specified content and metadata";
      }
    } catch (err: any) {
      signatureValid = false;
      status = "signature_invalid";
      error = err.message || "Failed to compute cryptographic signature verification";
    }
  }

  const elapsed = Math.round((performance.now() - start) * 100) / 100;

  return {
    valid: checksumMatches && (signatureValid || status === "unsigned"),
    cidMatches,
    checksumMatches,
    signatureValid,
    latencyMs: elapsed,
    status,
    details: {
      computedCid,
      manifestCid: proof.cid,
      computedSha256,
      manifestSha256: proof.checksum?.sha256 || "",
      authorPublicKey: pubkey,
      contentByteSize: contentBytes.length,
    },
    error,
  };
}

/**
 * Extracts and parses content from a .pressproof.json file.
 */
export function extractContentFromProof(proof: PressProofManifest): {
  title: string;
  content: string;
  tags: string[];
  author: string;
  cid: string;
  timestamp: string;
} {
  return {
    title: proof.title || "Untitled Proof",
    content: proof.content || "",
    tags: proof.tags || [],
    author: proof.publisher?.username || proof.publisher?.publicKey?.slice(0, 10) || "Sovereign Author",
    cid: proof.cid,
    timestamp: proof.timestamp,
  };
}
