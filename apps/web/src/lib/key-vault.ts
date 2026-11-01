/**
 * At-rest protection for browser-held signing keys.
 * Secrets are sealed with AES-GCM under a non-extractable CryptoKey persisted in IndexedDB,
 * so raw key material never sits in localStorage and cannot be read back as bytes.
 */

const DB_NAME = "pressprotocol-keyvault";
const STORE = "keys";
const WRAP_KEY_ID = "burner-wrap-v1";

export interface SealedSecret {
  iv: string;
  ct: string;
}

const toB64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export function isKeyVaultSupported(): boolean {
  return typeof window !== "undefined" && !!window.indexedDB && !!window.crypto?.subtle;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbRequest<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let wrapKeyPromise: Promise<CryptoKey> | null = null;

function getWrappingKey(): Promise<CryptoKey> {
  wrapKeyPromise ??= (async () => {
    const db = await openDb();
    const existing = await idbRequest<CryptoKey | undefined>(db, "readonly", (s) => s.get(WRAP_KEY_ID));
    if (existing) return existing;
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    await idbRequest(db, "readwrite", (s) => s.put(key, WRAP_KEY_ID));
    return key;
  })().catch((err) => {
    wrapKeyPromise = null;
    throw err;
  });
  return wrapKeyPromise;
}

export async function sealSecret(plain: string): Promise<SealedSecret> {
  const key = await getWrappingKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  return { iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
}

export async function openSecret(sealed: SealedSecret): Promise<string> {
  const key = await getWrappingKey();
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(sealed.iv) }, key, fromB64(sealed.ct));
  return new TextDecoder().decode(pt);
}
