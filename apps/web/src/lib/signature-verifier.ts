import * as ed from "@noble/ed25519";

export interface VerificationResult {
  isValid: boolean;
  status: "verified" | "invalid" | "unsigned" | "malformed";
  algorithm: string;
  publicKey: string;
  signature: string;
  matchedPayload?: string;
  latencyMs: number;
  error?: string;
}

/**
 * Validates whether a string is valid hex with expected byte length.
 */
function isValidHex(str: string, expectedByteLength: number): boolean {
  if (typeof str !== "string") return false;
  if (str.length !== expectedByteLength * 2) return false;
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Performs authentic in-browser cryptographic verification of an article's Ed25519 signature
 * using WebCrypto-accelerated @noble/ed25519.
 */
export async function verifyArticleSignature(article: {
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

  // 1. Check if signature or public key is missing or unsigned
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

  // 2. Validate structural formatting (Ed25519 public keys = 32 bytes / 64 hex, signatures = 64 bytes / 128 hex)
  if (!isValidHex(publicKeyHex, 32) || !isValidHex(signatureHex, 64)) {
    return {
      isValid: false,
      status: "malformed",
      algorithm: "Ed25519 (RFC 8032)",
      publicKey: publicKeyHex,
      signature: signatureHex,
      latencyMs: Math.round((performance.now() - start) * 100) / 100,
      error: "Public key (32 bytes) or signature (64 bytes) has invalid hex encoding length.",
    };
  }

  const tags = Array.isArray(article.tags) ? article.tags : [];
  const timestamp = article.createdAt
    ? new Date(article.createdAt).toISOString()
    : undefined;

  // 3. Assemble candidate message payloads
  const candidatePayloads: string[] = [];

  // Candidate A: Canonical title + tags + ISO timestamp
  if (timestamp) {
    candidatePayloads.push(
      JSON.stringify({
        title: article.title,
        tags,
        timestamp,
      })
    );
  }

  // Candidate B: Canonical title + content + tags
  if (article.content) {
    candidatePayloads.push(
      JSON.stringify({
        title: article.title,
        content: article.content,
        tags,
      })
    );
  }

  // Candidate C: Title + tags
  candidatePayloads.push(
    JSON.stringify({
      title: article.title,
      tags,
    })
  );

  // Candidate D: Plain title
  candidatePayloads.push(article.title);

  // 4. Test candidates against the Ed25519 signature
  const encoder = new TextEncoder();

  for (const payload of candidatePayloads) {
    try {
      const msgBytes = encoder.encode(payload);
      const isMatch = await ed.verifyAsync(signatureHex, msgBytes, publicKeyHex);

      if (isMatch) {
        const latencyMs = Math.round((performance.now() - start) * 100) / 100;
        return {
          isValid: true,
          status: "verified",
          algorithm: "Ed25519 (RFC 8032 / SHA-512)",
          publicKey: publicKeyHex,
          signature: signatureHex,
          matchedPayload: payload,
          latencyMs,
        };
      }
    } catch (e: any) {
      console.warn("Ed25519 verification candidate attempt failed:", e?.message);
    }
  }

  // 5. If no candidate payload verified, signature does not match content
  return {
    isValid: false,
    status: "invalid",
    algorithm: "Ed25519 (RFC 8032 / SHA-512)",
    publicKey: publicKeyHex,
    signature: signatureHex,
    latencyMs: Math.round((performance.now() - start) * 100) / 100,
    error: "Cryptographic signature does not match canonical article content.",
  };
}
