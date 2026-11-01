import { env } from '../config/env.js';

const trim = (url: string) => url.replace(/\/+$/, '');

/** Public base URL of this node's HTTP API (PUBLIC_NODE_URL, falling back to the local listener). */
export function publicNodeUrl(): string {
  return trim(env.PUBLIC_NODE_URL || `http://127.0.0.1:${env.PORT}`);
}

/** Public base URL of the reader web app (PUBLIC_APP_URL). */
export function publicAppUrl(): string {
  return trim(env.PUBLIC_APP_URL);
}

export function contentUrls(cid: string, onionAddress: string | null) {
  return {
    ipfs: `https://ipfs.io/ipfs/${cid}`,
    node: `${publicNodeUrl()}/read/${cid}`,
    reader: `${publicAppUrl()}/read/${cid}`,
    tor: onionAddress ? `http://${onionAddress}/read/${cid}` : undefined,
  };
}
