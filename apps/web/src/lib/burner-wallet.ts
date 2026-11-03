import * as ed from "@noble/ed25519";
import {
  decryptVaultValue,
  deleteVaultEntry,
  isKeyVaultSupported,
  loadVaultEntry,
  saveVaultEntry,
  type EncryptedVaultRecord,
} from "./key-vault";

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

/** Public metadata persisted in localStorage; signing key material lives encrypted in IndexedDB. */
interface StoredBurnerMetadata {
  v: 2;
  publicKey: string;
  pseudonym: string;
  createdAt: number;
  sealedPrivateKey?: EncryptedVaultRecord;
}

/**
 * Persists a burner wallet: signing key is encrypted in IndexedDB, and only public metadata
 * (publicKey, pseudonym, createdAt) is written to localStorage.
 */
export async function persistBurnerWallet(wallet: BurnerWallet): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isKeyVaultSupported()) {
    console.warn("Secure key storage is unavailable; burner wallet will not be persisted.");
    return;
  }
  await saveVaultEntry(wallet.publicKey, wallet.privateKey);
  const metadata: StoredBurnerMetadata = {
    v: 2,
    publicKey: wallet.publicKey,
    pseudonym: wallet.pseudonym,
    createdAt: wallet.createdAt,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
}

/**
 * Retrieves the existing persistent burner wallet, or generates a fresh Ed25519 keypair if none exists.
 * Legacy entries are transparently migrated into the IndexedDB vault.
 */
export async function getOrCreateBurnerWallet(): Promise<BurnerWallet> {
  if (typeof window === "undefined") {
    return createFreshBurnerWallet();
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && isKeyVaultSupported()) {
    try {
      const parsed = JSON.parse(existing) as Partial<BurnerWallet & StoredBurnerMetadata>;
      if (parsed.v === 2 && parsed.publicKey) {
        let keyHex = await loadVaultEntry(parsed.publicKey);
        if (!keyHex && parsed.sealedPrivateKey) {
          keyHex = await decryptVaultValue(parsed.sealedPrivateKey);
          await saveVaultEntry(parsed.publicKey, keyHex);
          const cleanMeta: StoredBurnerMetadata = {
            v: 2,
            publicKey: parsed.publicKey,
            pseudonym: parsed.pseudonym || `Anon-${parsed.publicKey.slice(0, 4)}...${parsed.publicKey.slice(-4)}`,
            createdAt: parsed.createdAt || Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanMeta));
        }
        if (keyHex) {
          return {
            publicKey: parsed.publicKey,
            privateKey: keyHex,
            pseudonym: parsed.pseudonym || `Anon-${parsed.publicKey.slice(0, 4)}...${parsed.publicKey.slice(-4)}`,
            createdAt: parsed.createdAt || Date.now(),
          };
        }
      }
      if (parsed.publicKey && parsed.privateKey) {
        const legacy: BurnerWallet = {
          publicKey: parsed.publicKey,
          privateKey: parsed.privateKey,
          pseudonym: parsed.pseudonym || `Anon-${parsed.publicKey.slice(0, 4)}...${parsed.publicKey.slice(-4)}`,
          createdAt: parsed.createdAt || Date.now(),
        };
        await persistBurnerWallet(legacy);
        return legacy;
      }
    } catch {
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
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing && isKeyVaultSupported()) {
        const parsed = JSON.parse(existing) as { publicKey?: string };
        if (parsed?.publicKey) {
          await deleteVaultEntry(parsed.publicKey);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
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
    const sanitized: BurnerArticle = {
      cid: String(article.cid),
      title: String(article.title),
      publishedAt: Number(article.publishedAt),
      pseudonym: String(article.pseudonym),
    };
    const existing = getBurnerArticles();
    const updated = [sanitized, ...existing.filter((a) => a.cid !== sanitized.cid)];
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
