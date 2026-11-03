import { verifyPublication, type SignatureStatus } from "@pressprotocol/sdk/protocol";

export interface VerificationResult {
  /** True only for content-bound (protocol v2) signatures. */
  isValid: boolean;
  status: SignatureStatus;
  algorithm: string;
  publicKey: string;
  signature: string;
  version?: 1 | 2 | null;
  matchedPayload?: string;
  latencyMs: number;
  error?: string;
}

/**
 * Performs in-browser Ed25519 verification of an article using the shared PressProtocol
 * signature protocol. Only v2 signatures (which bind the article body) are reported as
 * "verified"; v1 signatures that cover metadata only are reported as "legacy".
 */
export async function verifyArticleSignature(article: {
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
