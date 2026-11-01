import * as ed from "@noble/ed25519";
import { isKeyVaultSupported, openSecret, sealSecret, type SealedSecret } from "./key-vault";

export interface BurnerWallet {
  publicKey: string;
  privateKey: string;
  pseudonym: string;
  createdAt: number;
}

export interface BurnerArticle {
  cid: string;
  title: string;
  publishedAt: number;
  pseudonym: string;
}

const STORAGE_KEY = "pressprotocol_burner_identity";
const ARTICLES_STORAGE_KEY = "pressprotocol_burner_articles";

/** Shape persisted in localStorage: public fields in clear, private key sealed. */
interface StoredBurnerWallet {
  v: 2;
  publicKey: string;
  pseudonym: string;
  createdAt: number;
  sealedPrivateKey: SealedSecret;
}

/**
 * Persists a burner wallet with its private key sealed at rest.
 * Falls back to legacy plaintext storage only when WebCrypto/IndexedDB are unavailable.
 */
export async function persistBurnerWallet(wallet: BurnerWallet): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isKeyVaultSupported()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    return;
  }
  const stored: StoredBurnerWallet = {
    v: 2,
    publicKey: wallet.publicKey,
    pseudonym: wallet.pseudonym,
    createdAt: wallet.createdAt,
    sealedPrivateKey: await sealSecret(wallet.privateKey),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * Retrieves the existing persistent burner wallet from localStorage,
 * or generates a fresh cryptographic Ed25519 keypair if none exists.
 * Legacy plaintext entries are transparently re-sealed.
 */
export async function getOrCreateBurnerWallet(): Promise<BurnerWallet> {
  if (typeof window === "undefined") {
    return createFreshBurnerWallet();
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as Partial<BurnerWallet & StoredBurnerWallet>;
      if (parsed.v === 2 && parsed.publicKey && parsed.sealedPrivateKey) {
        const privateKey = await openSecret(parsed.sealedPrivateKey);
        return {
          publicKey: parsed.publicKey,
          privateKey,
          pseudonym: parsed.pseudonym || `Anon-${parsed.publicKey.slice(0, 4)}...${parsed.publicKey.slice(-4)}`,
          createdAt: parsed.createdAt || Date.now(),
        };
      }
      if (parsed.publicKey && parsed.privateKey) {
        const legacy = parsed as BurnerWallet;
        await persistBurnerWallet(legacy);
        return legacy;
      }
    } catch (e) {
      console.warn("Burner wallet in storage could not be opened, generating fresh identity...");
    }
  }

  return createFreshBurnerWallet();
}

/**
 * Generates an in-browser Ed25519 sovereign keypair and stores it locally.
 */
export async function createFreshBurnerWallet(): Promise<BurnerWallet> {
  const privKeyBytes = ed.utils.randomPrivateKey();
  const pubKeyBytes = await ed.getPublicKeyAsync(privKeyBytes);

  const privateKey = ed.etc.bytesToHex(privKeyBytes);
  const publicKey = ed.etc.bytesToHex(pubKeyBytes);
  const pseudonym = `Anon-${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;

  const wallet: BurnerWallet = {
    publicKey,
    privateKey,
    pseudonym,
    createdAt: Date.now(),
  };

  await persistBurnerWallet(wallet);

  return wallet;
}

/**
 * Cryptographically burns the current browser identity and provisions a fresh one.
 */
export async function burnCurrentWallet(wipeHistory: boolean = false): Promise<BurnerWallet> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    if (wipeHistory) {
      localStorage.removeItem(ARTICLES_STORAGE_KEY);
    }
  }
  return createFreshBurnerWallet();
}

/**
 * Signs a message with the Ed25519 burner private key.
 */
export async function signWithBurner(message: string, privateKeyHex: string): Promise<string> {
  const msgBytes = new TextEncoder().encode(message);
  const sigBytes = await ed.signAsync(msgBytes, privateKeyHex);
  return ed.etc.bytesToHex(sigBytes);
}

/**
 * Cryptographically verifies an Ed25519 signature in-browser.
 */
export async function verifyBurnerSignature(
  message: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const msgBytes = new TextEncoder().encode(message);
    return await ed.verifyAsync(signatureHex, msgBytes, publicKeyHex);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Saves a published anonymous article reference to localStorage for the burner user.
 */
export function saveBurnerArticle(article: BurnerArticle): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getBurnerArticles();
    const updated = [article, ...existing.filter((a) => a.cid !== article.cid)];
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save burner article history:", err);
  }
}

/**
 * Retrieves all locally saved burner articles.
 */
export function getBurnerArticles(): BurnerArticle[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BurnerArticle[];
  } catch (err) {
    console.error("Failed to read burner articles history:", err);
    return [];
  }
}

/**
 * Clears all locally stored burner articles.
 */
export function clearBurnerArticles(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ARTICLES_STORAGE_KEY);
  }
}
