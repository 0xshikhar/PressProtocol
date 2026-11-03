import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { publicKeyFromPrivate, signArticleV2, type SignableArticle } from '@pressprotocol/sdk/protocol';
import { env } from '../config/env.js';

export interface NodeIdentity {
  publicKey: string;
  privateKey: string;
}

let cached: Promise<NodeIdentity> | null = null;

/**
 * Loads the node's persistent Ed25519 signing identity from DATA_DIR/identity/node.key,
 * creating it (owner-only permissions) on first start. Content the node signs on behalf of
 * custodial/CMS ingestion is attributable to this stable key across restarts.
 */
export function getNodeIdentity(): Promise<NodeIdentity> {
  cached ??= (async () => {
    const keyPath = join(env.DATA_DIR, 'identity', 'node.key');
    let privateKey = existsSync(keyPath) ? readFileSync(keyPath, 'utf-8').trim() : '';
    if (!/^[0-9a-f]{64}$/i.test(privateKey)) {
      privateKey = randomBytes(32).toString('hex');
      mkdirSync(dirname(keyPath), { recursive: true, mode: 0o700 });
      writeFileSync(keyPath, privateKey, { encoding: 'utf-8', mode: 0o600 });
      console.log(`🔑 Generated persistent node signing identity at ${keyPath}`);
    }
    return { privateKey, publicKey: await publicKeyFromPrivate(privateKey) };
  })();
  return cached;
}

/** Signs an article with protocol v2 using the node identity. */
export async function signAsNode(article: SignableArticle): Promise<{ pubkey: string; signature: string; sigVersion: 2 }> {
  const identity = await getNodeIdentity();
  return { pubkey: identity.publicKey, signature: await signArticleV2(article, identity.privateKey), sigVersion: 2 };
}
