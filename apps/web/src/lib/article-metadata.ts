import { getBackendUrl } from "@/config/backend";

export interface ResolvedArticleMeta {
  title: string;
  excerpt: string;
  tags: string[];
  pubkey: string;
  createdAt?: string;
  sourceUrl?: string;
}

const PUBLIC_GATEWAYS = [
  "https://ipfs.filebase.io/ipfs",
  "https://4everland.io/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
  "https://gateway.pinata.cloud/ipfs",
];

function cleanExcerpt(content: unknown, maxLen = 170): string {
  if (!content || typeof content !== "string") return "";
  const stripped = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*`_~\[\]()]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length <= maxLen) return stripped;
  return `${stripped.slice(0, maxLen - 3)}...`;
}

export async function fetchArticleMetadata(cid: string): Promise<ResolvedArticleMeta> {
  const backendUrl = getBackendUrl();

  // 1. Try internal backend daemon first (fastest if running)
  try {
    const res = await fetch(`${backendUrl}/api/content/${cid}`, {
      signal: AbortSignal.timeout(1800),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        return {
          title: d.title || "Sovereign Publication",
          excerpt: cleanExcerpt(d.content || d.excerpt || ""),
          tags: Array.isArray(d.tags) ? d.tags : [],
          pubkey: d.publisher?.pubkey || d.publisher?.publicKey || "",
          createdAt: d.timestamp || d.createdAt,
          sourceUrl: d.sourceUrl,
        };
      }
    }
  } catch {
    // Fall back to public gateways
  }

  // 2. Race public gateways concurrently
  const gatewayPromises = PUBLIC_GATEWAYS.map(async (gw) => {
    const res = await fetch(`${gw}/${cid}`, {
      signal: AbortSignal.timeout(3500),
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "PressProtocol-Metadata/1.0 (+https://pressprotocol.com)",
      },
    });

    if (!res.ok) {
      throw new Error(`Gateway ${gw} returned status ${res.status}`);
    }

    const text = await res.text();
    let raw: any;
    try {
      raw = JSON.parse(text);
    } catch {
      raw = { title: "Preserved Sovereign Document", content: text };
    }

    return {
      title: raw.title || "Sovereign Publication",
      excerpt: cleanExcerpt(raw.content || raw.excerpt || ""),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      pubkey: raw.publisher?.pubkey || raw.publisher?.publicKey || "",
      createdAt: raw.timestamp || raw.createdAt,
      sourceUrl: raw.sourceUrl,
    };
  });

  try {
    return await Promise.any(gatewayPromises);
  } catch {
    return {
      title: "Sovereign Document",
      excerpt: "Immutable, cryptographically verified publication preserved on PressProtocol decentralized infrastructure.",
      tags: ["sovereign", "ipfs"],
      pubkey: "",
    };
  }
}
