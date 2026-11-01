import { publicKeyFromPrivate, signArticleV2 } from "@pressprotocol/sdk/protocol";

export interface SignedPublishInput {
  title: string;
  content: string;
  tags: string[];
  /** Hex Ed25519 private key; signing happens in the browser and the key is never transmitted. */
  privateKey?: string;
  timestamp?: string;
  extras?: Record<string, unknown>;
}

export interface SignedPublishResult {
  cid: string;
  shareUrl: string;
  embedUrl: string;
  embedCode: string;
  publicKey?: string;
  signature?: string;
  raw: unknown;
}

/**
 * Signs an article client-side with protocol v2 (when a key is available) and publishes it
 * through the web app's /api/content proxy. Only the public key and signature leave the browser.
 */
export async function publishArticleSigned(input: SignedPublishInput): Promise<SignedPublishResult> {
  const timestamp = input.timestamp && !Number.isNaN(Date.parse(input.timestamp)) ? input.timestamp : new Date().toISOString();
  const privateKey = input.privateKey?.trim();

  let publicKey: string | undefined;
  let signature: string | undefined;
  if (privateKey) {
    publicKey = await publicKeyFromPrivate(privateKey);
    signature = await signArticleV2({ title: input.title, tags: input.tags, timestamp, content: input.content }, privateKey);
  }

  const response = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input.extras,
      title: input.title,
      content: input.content,
      tags: input.tags,
      timestamp,
      publicKey,
      signature,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Publishing failed (HTTP ${response.status})`);
  }

  const cid: string = data?.data?.cid || data?.cid;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://pressprotocol.com";
  return {
    cid,
    shareUrl: `${origin}/read/${cid}`,
    embedUrl: `${origin}/embed/${cid}`,
    embedCode: `<iframe src="${origin}/embed/${cid}" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`,
    publicKey,
    signature,
    raw: data,
  };
}
