/**
 * PressProtocol signature protocol — single source of truth shared by every signer and verifier.
 *
 * v2 (current): the Ed25519 signature covers an RFC 8785 (JCS) canonical JSON object that binds
 * the article body via its SHA-256 digest:
 *   { proto: "pressprotocol/sig/v2", title, tags, timestamp, contentSha256 }
 *
 * v1 (legacy, verify-only): the signature covered only { title, tags, timestamp } and therefore
 * does NOT authenticate the article body. v1 results are reported as "legacy", never "verified".
 */
import * as ed from "@noble/ed25519";
import { sha256, sha512 } from "@noble/hashes/sha2.js";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(sha512(ed.etc.concatBytes(...m)));

export const SIGNATURE_PROTOCOL_V2 = "pressprotocol/sig/v2" as const;
export const SIGNATURE_ALGORITHM = "Ed25519 (RFC 8032)" as const;

export type SignatureStatus = "verified" | "legacy" | "invalid" | "unsigned" | "malformed";

export interface SignableArticle {
  title: string;
  tags?: string[];
  timestamp: string;
  content: string;
}

export interface PublicationVerification {
  status: SignatureStatus;
  /** True only when the signature is valid AND covers the article body (v2). */
  isValid: boolean;
  /** True when the signature is cryptographically valid for some known payload (v1 or v2). */
  signatureValid: boolean;
  contentBound: boolean;
  version: 1 | 2 | null;
  algorithm: string;
  publicKey: string;
  signature: string;
  error?: string;
}

const textEncoder = new TextEncoder();
const HEX_RE = /^[0-9a-f]+$/i;

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || !HEX_RE.test(hex)) throw new Error("Invalid hex string");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function isHexOfLength(value: unknown, byteLength: number): value is string {
  return typeof value === "string" && value.length === byteLength * 2 && HEX_RE.test(value);
}

/**
 * RFC 8785 JSON Canonicalization Scheme for the JSON subset used by the protocol
 * (objects, arrays, strings, booleans, null, finite numbers).
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("JCS: non-finite numbers are not allowed");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    // JCS sorts by UTF-16 code units, which is JavaScript's default string ordering.
    entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalizeJson(v)}`).join(",")}}`;
  }
  throw new Error(`JCS: unsupported value type ${typeof value}`);
}

export function sha256Hex(content: string | Uint8Array): string {
  return toHex(sha256(typeof content === "string" ? textEncoder.encode(content) : content));
}

/** Canonical v2 message string that is signed. */
export function buildSigningPayloadV2(article: SignableArticle): string {
  return canonicalizeJson({
    proto: SIGNATURE_PROTOCOL_V2,
    title: article.title,
    tags: article.tags ?? [],
    timestamp: article.timestamp,
    contentSha256: sha256Hex(article.content),
  });
}

/** Legacy v1 message candidates (insertion-ordered and key-sorted variants were both in use). */
export function buildLegacyPayloadsV1(article: Omit<SignableArticle, "content">): string[] {
  const tags = article.tags ?? [];
  const candidates = [
    JSON.stringify({ title: article.title, tags, timestamp: article.timestamp }),
    canonicalizeJson({ title: article.title, tags, timestamp: article.timestamp }),
  ];
  const iso = Date.parse(article.timestamp);
  if (!Number.isNaN(iso)) {
    const normalized = new Date(iso).toISOString();
    if (normalized !== article.timestamp) {
      candidates.push(JSON.stringify({ title: article.title, tags, timestamp: normalized }));
    }
  }
  return Array.from(new Set(candidates));
}

export async function verifyEd25519(message: string, signatureHex: string, publicKeyHex: string): Promise<boolean> {
  if (!isHexOfLength(signatureHex, 64) || !isHexOfLength(publicKeyHex, 32)) return false;
  try {
    return await ed.verifyAsync(fromHex(signatureHex), textEncoder.encode(message), fromHex(publicKeyHex));
  } catch {
    return false;
  }
}

export async function publicKeyFromPrivate(privateKeyHex: string): Promise<string> {
  if (!isHexOfLength(privateKeyHex, 32)) throw new Error("Private key must be 32-byte hex");
  return toHex(await ed.getPublicKeyAsync(fromHex(privateKeyHex)));
}

export async function signArticleV2(article: SignableArticle, privateKeyHex: string): Promise<string> {
  if (!isHexOfLength(privateKeyHex, 32)) throw new Error("Private key must be 32-byte hex");
  const sig = await ed.signAsync(textEncoder.encode(buildSigningPayloadV2(article)), fromHex(privateKeyHex));
  return toHex(sig);
}

/**
 * Verifies an article publication. Only v2 (content-bound) signatures yield status "verified".
 */
export async function verifyPublication(input: {
  title: string;
  tags?: string[];
  timestamp?: string;
  content?: string;
  publicKey?: string | null;
  signature?: string | null;
  sigVersion?: number;
}): Promise<PublicationVerification> {
  const publicKey = (input.publicKey ?? "").trim();
  const signature = (input.signature ?? "").trim();
  const base = { algorithm: SIGNATURE_ALGORITHM, publicKey, signature };

  if (!publicKey || !signature || signature === "unsigned") {
    return { ...base, status: "unsigned", isValid: false, signatureValid: false, contentBound: false, version: null };
  }
  if (!isHexOfLength(publicKey, 32) || !isHexOfLength(signature, 64)) {
    return {
      ...base,
      status: "malformed",
      isValid: false,
      signatureValid: false,
      contentBound: false,
      version: null,
      error: "Public key must be 32-byte hex and signature 64-byte hex",
    };
  }
  if (!input.timestamp) {
    return { ...base, status: "invalid", isValid: false, signatureValid: false, contentBound: false, version: null, error: "Missing signed timestamp" };
  }

  if (input.sigVersion !== 1 && typeof input.content === "string") {
    const v2 = buildSigningPayloadV2({ title: input.title, tags: input.tags, timestamp: input.timestamp, content: input.content });
    if (await verifyEd25519(v2, signature, publicKey)) {
      return { ...base, status: "verified", isValid: true, signatureValid: true, contentBound: true, version: 2 };
    }
  }

  if (input.sigVersion !== 2) {
    for (const legacy of buildLegacyPayloadsV1({ title: input.title, tags: input.tags, timestamp: input.timestamp })) {
      if (await verifyEd25519(legacy, signature, publicKey)) {
        return {
          ...base,
          status: "legacy",
          isValid: false,
          signatureValid: true,
          contentBound: false,
          version: 1,
          error: "Legacy v1 signature: authenticates title, tags and timestamp only, not the article body",
        };
      }
    }
  }

  return {
    ...base,
    status: "invalid",
    isValid: false,
    signatureValid: false,
    contentBound: false,
    version: null,
    error: "Signature does not match the article",
  };
}
