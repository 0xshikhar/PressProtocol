import * as cheerio from "cheerio";
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

const CID_REGEX = /^[a-zA-Z0-9]{40,128}$/;

function cleanExcerpt(content: unknown, maxLen = 170): string {
  if (!content || typeof content !== "string") return "";
  try {
    const $ = cheerio.load(content);
    $("script, style, noscript").remove();
    const text = $.text()
      .replace(/[#*`_~\[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen - 3)}...`;
  } catch {
    const fallback = content.replace(/\s+/g, " ").trim();
    if (fallback.length <= maxLen) return fallback;
    return `${fallback.slice(0, maxLen - 3)}...`;
  }
}

export async function fetchArticleMetadata(cid: string): Promise<ResolvedArticleMeta> {
  const cleanCid = cid ? cid.trim() : "";
  if (!CID_REGEX.test(cleanCid)) {
    throw new Error(`Invalid IPFS CID: '${cid}'`);
  }

  const backendUrl = getBackendUrl();

  // 1. Try internal backend daemon first (fastest if running)
  try {
    const res = await fetch(`${backendUrl}/api/content/${encodeURIComponent(cleanCid)}`, {
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
    const res = await fetch(`${gw}/${encodeURIComponent(cleanCid)}`, {
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
