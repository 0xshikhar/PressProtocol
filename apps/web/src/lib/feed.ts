/**
 * PressProtocol Syndication Feed Engine
 * Generates compliant RSS 2.0 and Atom 1.0 feeds enriched with sovereign cryptographic headers:
 * - <press:cid>
 * - <press:publicKey>
 * - <press:signature>
 * - <press:timestamp>
 */

import { getBackendUrl } from "@/config/backend";
import { siteConfig } from "@/config/site";

export interface FeedArticleItem {
  cid: string;
  title: string;
  content?: string;
  tags?: string[];
  createdAt: string | number | Date;
  signature?: string;
  publisher?: {
    publicKey?: string;
    pubkey?: string;
    walletAddress?: string;
    username?: string;
  };
}

export interface FeedOptions {
  tag?: string;
  format?: "rss" | "atom";
  baseUrl?: string;
}

/**
 * Escapes XML entity characters safely.
 */
function escapeXml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Strips HTML tags and sanitizes for RSS description.
 */
function sanitizeDescription(text: string = ""): string {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > 300 ? `${clean.slice(0, 300)}...` : clean;
}

/**
 * Fetches published articles from the backend discovery daemon.
 */
export async function fetchFeedArticles(tag?: string, limit: number = 30): Promise<FeedArticleItem[]> {
  const backendUrl = getBackendUrl();
  const params = new URLSearchParams();
  if (tag) {
    params.set("tags", tag);
  }
  params.set("limit", limit.toString());

  try {
    const res = await fetch(`${backendUrl}/api/discovery?${params.toString()}`, {
      signal: AbortSignal.timeout(4000),
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    }
  } catch (error) {
    console.warn("[Feed Engine] Backend discovery daemon unreachable:", error);
  }

  return [];
}

/**
 * Generates an RSS 2.0 XML string with sovereign cryptographic extensions.
 */
export function generateRssFeed(
  articles: FeedArticleItem[],
  options: FeedOptions = {}
): string {
  const baseUrl = (options.baseUrl || siteConfig.url.base || "https://pressprotocol.com").replace(/\/$/, "");
  const tag = options.tag;
  const feedUrl = tag ? `${baseUrl}/api/feed/tag/${encodeURIComponent(tag)}` : `${baseUrl}/feed.xml`;
  const channelTitle = tag
    ? `${siteConfig.name} - #${tag} Sovereign Feed`
    : `${siteConfig.name} - Sovereign Cryptographic Feed`;
  const channelDesc = tag
    ? `Decentralized, cryptographically verified articles tagged #${tag} syndicated via PressProtocol.`
    : siteConfig.description;

  const lastBuildDate = articles.length > 0
    ? new Date(articles[0].createdAt).toUTCString()
    : new Date().toUTCString();

  const itemsXml = articles
    .map((item) => {
      const itemUrl = `${baseUrl}/read/${item.cid}`;
      const pubDate = new Date(item.createdAt).toUTCString();
      const isoTimestamp = new Date(item.createdAt).toISOString();
      const pubKey = item.publisher?.publicKey || item.publisher?.pubkey || "";
      const signature = item.signature || "";
      const desc = item.content ? sanitizeDescription(item.content) : item.title;
      const tags = Array.isArray(item.tags) ? item.tags : [];

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${desc}]]></description>
${tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
      <author>${escapeXml(pubKey ? `anon@pressprotocol.com (${pubKey.slice(0, 10)}...)` : "Anonymous")}</author>
      <!-- PressProtocol Cryptographic Syndication Headers -->
      <press:cid>${escapeXml(item.cid)}</press:cid>
      <press:publicKey>${escapeXml(pubKey)}</press:publicKey>
      <press:signature>${escapeXml(signature)}</press:signature>
      <press:timestamp>${escapeXml(isoTimestamp)}</press:timestamp>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:press="https://pressprotocol.com/spec/rss/press/1.0/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <generator>PressProtocol Sovereign Syndication Engine v1.0</generator>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generates an Atom 1.0 XML string with sovereign cryptographic extensions.
 */
export function generateAtomFeed(
  articles: FeedArticleItem[],
  options: FeedOptions = {}
): string {
  const baseUrl = (options.baseUrl || siteConfig.url.base || "https://pressprotocol.com").replace(/\/$/, "");
  const tag = options.tag;
  const feedUrl = tag ? `${baseUrl}/api/feed/tag/${encodeURIComponent(tag)}?format=atom` : `${baseUrl}/feed.xml?format=atom`;
  const feedTitle = tag
    ? `${siteConfig.name} - #${tag} Sovereign Atom Feed`
    : `${siteConfig.name} - Sovereign Cryptographic Atom Feed`;

  const updatedDate = articles.length > 0
    ? new Date(articles[0].createdAt).toISOString()
    : new Date().toISOString();

  const entriesXml = articles
    .map((item) => {
      const itemUrl = `${baseUrl}/read/${item.cid}`;
      const isoTimestamp = new Date(item.createdAt).toISOString();
      const pubKey = item.publisher?.publicKey || item.publisher?.pubkey || "";
      const signature = item.signature || "";
      const desc = item.content ? sanitizeDescription(item.content) : item.title;
      const tags = Array.isArray(item.tags) ? item.tags : [];

      return `  <entry>
    <title>${escapeXml(item.title)}</title>
    <link href="${escapeXml(itemUrl)}" rel="alternate" />
    <id>urn:ipfs:cid:${escapeXml(item.cid)}</id>
    <updated>${isoTimestamp}</updated>
    <summary><![CDATA[${desc}]]></summary>
    <author>
      <name>${escapeXml(pubKey ? `Ed25519:${pubKey.slice(0, 10)}...` : "Anonymous Sovereign")}</name>
      <uri>${escapeXml(itemUrl)}</uri>
    </author>
${tags.map((t) => `    <category term="${escapeXml(t)}" />`).join("\n")}
    <!-- PressProtocol Cryptographic Syndication Headers -->
    <press:cid>${escapeXml(item.cid)}</press:cid>
    <press:publicKey>${escapeXml(pubKey)}</press:publicKey>
    <press:signature>${escapeXml(signature)}</press:signature>
    <press:timestamp>${escapeXml(isoTimestamp)}</press:timestamp>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:press="https://pressprotocol.com/spec/rss/press/1.0/">
  <title>${escapeXml(feedTitle)}</title>
  <link href="${escapeXml(baseUrl)}" />
  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml" />
  <id>${escapeXml(baseUrl)}/</id>
  <updated>${updatedDate}</updated>
  <generator uri="https://pressprotocol.com">PressProtocol Atom Engine</generator>
${entriesXml}
</feed>`;
}
