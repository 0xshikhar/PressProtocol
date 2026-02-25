import * as ed from "@noble/ed25519";

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

/**
 * Retrieves the existing persistent burner wallet from localStorage,
 * or generates a fresh cryptographic Ed25519 keypair if none exists.
 */
export async function getOrCreateBurnerWallet(): Promise<BurnerWallet> {
  if (typeof window === "undefined") {
    return createFreshBurnerWallet();
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as BurnerWallet;
      if (parsed.publicKey && parsed.privateKey) {
        return parsed;
      }
    } catch (e) {
      console.warn("Corrupted burner wallet in storage, generating fresh identity...");
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

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }

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
