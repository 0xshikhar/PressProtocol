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

export const CID_REGEX = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9a-z]{40,100})$/;

/**
 * Strictly validates an IPFS CID format (v0 Base58btc or v1 Base32 multibase).
 * Blocks directory traversal, protocol injection, query params, and non-alphanumeric chars.
 *
 * @param cid - Value to test for valid IPFS CID syntax
 * @returns True if value is a valid CIDv0 or CIDv1 string
 */
export function isValidCID(cid: unknown): cid is string {
  if (!cid || typeof cid !== "string") return false;
  return CID_REGEX.test(cid.trim());
}

/**
 * Asserts that a CID string is valid syntax, throwing an error if invalid.
 *
 * @param cid - Value to validate
 * @returns Clean trimmed CID string
 * @throws Error if the CID is not a valid format
 */
export function assertValidCID(cid: unknown): string {
  if (!isValidCID(cid)) {
    throw new Error(`Invalid IPFS CID format: '${cid}'`);
  }
  return cid.trim();
}

/**
 * Extracts and cleans a plain-text excerpt from article HTML or Markdown.
 * Preserves block element spacing and strips executable scripts/styles.
 *
 * @param content - Raw article content string or unknown
 * @param maxLen - Maximum character length of the returned excerpt
 * @returns Cleaned plain-text excerpt string
 */
function cleanExcerpt(content: unknown, maxLen = 170): string {
  if (!content || typeof content !== "string") return "";
  try {
    const $ = cheerio.load(content);
    $("script, style, noscript").remove();

    // Preserve whitespace between block boundaries before text extraction
    $("p, div, h1, h2, h3, h4, h5, h6, li, blockquote, br, hr, article, section").each((_, el) => {
      $(el).append(" ");
    });

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

/**
 * Fetches and resolves article metadata by IPFS CID across local daemon and public gateways.
 *
 * @param cid - IPFS CID string of the article
 * @returns Resolved metadata object including title, excerpt, tags, and publisher info
 * @throws Error if CID format is invalid
 */
export async function fetchArticleMetadata(cid: string): Promise<ResolvedArticleMeta> {
  const cleanCid = assertValidCID(cid);

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
