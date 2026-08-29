import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "./crypto.js";
import type { WebhookVerificationResult } from "./types.js";

/**
 * Constant-time byte array comparison to prevent side-channel timing attacks.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Computes HMAC-SHA256 signature for webhook payload.
 * Signature header standard: t=<timestamp>,v1=<signature>
 */
export function signWebhookPayload(
  payload: string | object,
  secret: string,
  customTimestamp?: number
): { header: string; timestamp: number; signature: string } {
  const timestamp = customTimestamp !== undefined ? customTimestamp : Math.floor(Date.now() / 1000);
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  const signaturePayload = `${timestamp}.${serialized}`;

  const secretBytes = new TextEncoder().encode(secret);
  const payloadBytes = new TextEncoder().encode(signaturePayload);
  const mac = hmac(sha256, secretBytes, payloadBytes);
  const signature = bytesToHex(mac);

  return {
    header: `t=${timestamp},v1=${signature}`,
    timestamp,
    signature,
  };
}

/**
 * Verifies an incoming webhook signature against shared secret and payload.
 * Provides replay protection with configurable tolerance window (default 300s).
 */
export function verifyWebhookSignature(
  payload: string | object,
  signatureHeader: string | null | undefined,
  secret: string,
  toleranceSeconds: number = 300
): WebhookVerificationResult {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    return { valid: false, reason: "Missing or malformed signature header" };
  }

  if (!secret) {
    return { valid: false, reason: "Missing shared webhook secret" };
  }

  // Parse header: t=<timestamp>,v1=<signature>
  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.trim().split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);

  const timestampStr = parts["t"];
  const expectedSigHex = parts["v1"];

  if (!timestampStr || !expectedSigHex) {
    return { valid: false, reason: 'Header missing required "t" or "v1" fields' };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Invalid timestamp in header" };
  }

  // Replay Attack Protection
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return {
      valid: false,
      reason: `Timestamp drifted outside tolerance window of ${toleranceSeconds} seconds`,
      timestamp,
    };
  }

  // Compute expected HMAC-SHA256 signature
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  const signaturePayload = `${timestamp}.${serialized}`;
  const secretBytes = new TextEncoder().encode(secret);
  const payloadBytes = new TextEncoder().encode(signaturePayload);
  const computedMac = hmac(sha256, secretBytes, payloadBytes);

  try {
    const expectedMac = hexToBytes(expectedSigHex);
    const isValid = constantTimeEqual(expectedMac, computedMac);

    if (!isValid) {
      return { valid: false, reason: "HMAC-SHA256 signature mismatch", timestamp };
    }

    return { valid: true, timestamp };
  } catch {
    return { valid: false, reason: "Malformed signature hex sequence", timestamp };
  }
}
