/**
 * PressProtocol In-Extension Cryptography & Burner Identity Engine
 * Provides sovereign Ed25519 keypair generation, storage, and deterministic RFC 8785 payload signing.
 */
import * as ed from "@noble/ed25519";
import { isKeyVaultSupported, openSecret, sealSecret, type SealedSecret } from "./key-vault";

export interface BurnerIdentity {
  publicKey: string;
  privateKey: string;
  pseudonym: string;
  createdAt: number;
}

const STORAGE_KEY = "pressprotocol_burner_identity";

/**
 * Deterministically sorts object keys according to RFC 8785 (JSON Canonicalization Scheme).
 */
export function canonicalizeJson(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map((item) => canonicalizeJson(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(value).sort();
  const pairs = sortedKeys.map((key) => {
    return JSON.stringify(key) + ":" + canonicalizeJson(value[key]);
  });

  return "{" + pairs.join(",") + "}";
}

interface StoredBurnerIdentity {
  v: 2;
  publicKey: string;
  pseudonym: string;
  createdAt: number;
  sealedPrivateKey: SealedSecret;
}

async function persistIdentity(identity: BurnerIdentity): Promise<void> {
  const value = isKeyVaultSupported()
    ? ({
        v: 2,
        publicKey: identity.publicKey,
        pseudonym: identity.pseudonym,
        createdAt: identity.createdAt,
        sealedPrivateKey: await sealSecret(identity.privateKey),
      } satisfies StoredBurnerIdentity)
    : identity;
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: value }, () => resolve());
  });
}

/**
 * Retrieves the stored burner identity, or generates a fresh one if missing.
 * Legacy plaintext identities are transparently re-sealed.
 */
export async function getOrCreateBurnerIdentity(): Promise<BurnerIdentity> {
  const result = await new Promise<Record<string, any>>((resolve) => chrome.storage.local.get([STORAGE_KEY], resolve));
  const stored = result[STORAGE_KEY] as Partial<BurnerIdentity & StoredBurnerIdentity> | undefined;

  try {
    if (stored?.v === 2 && stored.publicKey && stored.sealedPrivateKey) {
      return {
        publicKey: stored.publicKey,
        privateKey: await openSecret(stored.sealedPrivateKey),
        pseudonym: stored.pseudonym || `Anon-${stored.publicKey.slice(0, 4)}...${stored.publicKey.slice(-4)}`,
        createdAt: stored.createdAt || Date.now(),
      };
    }
    if (stored?.publicKey && stored.privateKey) {
      const legacy = stored as BurnerIdentity;
      await persistIdentity(legacy);
      return legacy;
    }
  } catch (err) {
    console.warn("Stored burner identity could not be opened; generating a fresh one.", err);
  }

  return createFreshBurnerIdentity();
}

/**
 * Generates an in-memory cryptographic Ed25519 keypair and persists to local extension storage.
 */
export async function createFreshBurnerIdentity(): Promise<BurnerIdentity> {
  const privKeyBytes = ed.utils.randomPrivateKey();
  const pubKeyBytes = await ed.getPublicKeyAsync(privKeyBytes);

  const privateKey = ed.etc.bytesToHex(privKeyBytes);
  const publicKey = ed.etc.bytesToHex(pubKeyBytes);
  const pseudonym = `Anon-${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;

  const identity: BurnerIdentity = {
    publicKey,
    privateKey,
    pseudonym,
    createdAt: Date.now(),
  };

  await persistIdentity(identity);

  return identity;
}

/**
 * Cryptographically discards the current burner identity and generates a new one.
 */
export async function burnCurrentIdentity(): Promise<BurnerIdentity> {
  await new Promise<void>((resolve) => {
    chrome.storage.local.remove([STORAGE_KEY], () => resolve());
  });
  return createFreshBurnerIdentity();
}

/**
 * Signs a canonical representation of a payload using the Ed25519 burner private key.
 */
export async function signPayload(
  payload: Record<string, any>,
  privateKeyHex: string
): Promise<{ signature: string; canonicalPayload: string }> {
  const canonicalPayload = canonicalizeJson(payload);
  const msgBytes = new TextEncoder().encode(canonicalPayload);
  const sigBytes = await ed.signAsync(msgBytes, privateKeyHex);
  const signature = ed.etc.bytesToHex(sigBytes);

  return { signature, canonicalPayload };
}

/**
 * Cryptographically verifies an Ed25519 signature over a payload.
 */
export async function verifyPayloadSignature(
  payload: Record<string, any>,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const canonical = canonicalizeJson(payload);
    const msgBytes = new TextEncoder().encode(canonical);
    return await ed.verifyAsync(signatureHex, msgBytes, publicKeyHex);
  } catch (err) {
    console.error("Failed to verify Ed25519 signature:", err);
    return false;
  }
}
