/**
 * PressProtocol Notion Block Tree Parser & Sovereign Converter
 * Converts public Notion block trees and Notion Markdown exports into semantic HTML5
 * with native PressProtocol callouts, editorial typography, and cryptographic telemetry.
 */
import * as cheerio from "cheerio";
import { calculateReadingTime } from "./reading-time";
import { scrubArticleHtml } from "./scrubber";

export interface NotionBlockStats {
  headingsConverted: number;
  calloutsConverted: number;
  quotesConverted: number;
  codeBlocksConverted: number;
  listsConverted: number;
  imagesPreserved: number;
  totalBlocks: number;
}

export interface ConvertedNotionArticle {
  title: string;
  author: string;
  excerpt: string;
  cleanHtml: string;
  wordCount: number;
  readingTimeMinutes: number;
  sourceUrl?: string;
  pageId?: string;
  coverImage?: string;
  icon?: string;
  stats: NotionBlockStats;
}

/**
 * Normalizes and extracts a 32-character Notion Page ID from any format.
 * Supports:
 * - standard URLs: https://www.notion.so/workspace/My-Page-Title-3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d
 * - notion.site URLs: https://workspace.notion.site/My-Page-Title-3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d
 * - short URLs: https://notion.so/3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d
 * - raw UUIDs: 3b1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d or 3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d
 */
export function extractNotionPageId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;

  const trimmed = urlOrId.trim();

  // If already a 32-char hex string
  const cleanHex = trimmed.replace(/-/g, "");
  if (/^[0-9a-fA-F]{32}$/.test(cleanHex)) {
    return cleanHex;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const pathname = url.pathname;

    // Match 32 hex chars at the end of the pathname (with or without dashes)
    const match = pathname.match(/([0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/);
    if (match) {
      return match[1].replace(/-/g, "");
    }

    // Match any 32 continuous hex string in path
    const matchAnywhere = pathname.match(/[0-9a-fA-F]{32}/);
    if (matchAnywhere) {
      return matchAnywhere[0];
    }
  } catch {
    // If URL parsing fails, test regex directly
    const fallbackMatch = trimmed.match(/[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}/);
    if (fallbackMatch) {
      return fallbackMatch[0].replace(/-/g, "");
    }
  }

  return null;
}

/**
 * Formats a raw 32-character hex ID into standard UUID hyphenated format.
 */
export function formatUuid(rawId: string): string {
  const clean = rawId.replace(/-/g, "");
  if (clean.length !== 32) return rawId;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

/**
 * Renders Notion rich text array into HTML.
 * Notion rich text format: [ ["plain text", [ ["b"], ["i"], ["a", "url"], ["c"] ]] ]
 */
export function renderNotionRichText(richText: any[]): string {
  if (!Array.isArray(richText) || richText.length === 0) {
    return "";
  }

  return richText
    .map((chunk) => {
      if (!Array.isArray(chunk)) return "";
      const text = String(chunk[0] || "");
      const modifiers = chunk[1];

      let escaped = escapeHtml(text);

      if (!modifiers || !Array.isArray(modifiers)) {
        return escaped;
      }

      // Apply modifiers
      for (const mod of modifiers) {
        if (!Array.isArray(mod)) continue;
        const type = mod[0];
        if (type === "b") {
          escaped = `<strong>${escaped}</strong>`;
        } else if (type === "i") {
          escaped = `<em>${escaped}</em>`;
        } else if (type === "s") {
          escaped = `<s>${escaped}</s>`;
        } else if (type === "c") {
          escaped = `<code class="bg-white/10 px-1.5 py-0.5 rounded font-mono text-cyan-300 text-xs">${escaped}</code>`;
        } else if (type === "a" && mod[1]) {
          const href = escapeHtml(String(mod[1]));
          escaped = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline decoration-cyan-400/50 hover:decoration-cyan-400">${escaped}</a>`;
        }
      }

      return escaped;
    })
    .join("");
}

/**
 * Fetches public Notion block record map using Notion's public web client endpoint.
 */
export async function fetchPublicNotionBlocks(pageId: string): Promise<any> {
  const formattedId = formatUuid(pageId);

  const response = await fetch("https://www.notion.so/api/v3/loadPageChunk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PressProtocol/1.0",
    },
    body: JSON.stringify({
      pageId: formattedId,
      limit: 100,
      cursor: { stack: [] },
      chunkNumber: 0,
      verticalColumns: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Notion public API returned HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.recordMap || !data.recordMap.block) {
    throw new Error("Invalid Notion recordMap received. Ensure the page is publicly shared.");
  }

  return data.recordMap;
}

/**
 * Converts a Notion recordMap block tree into semantic HTML5.
 */
export function convertNotionBlocksToHtml(recordMap: any, rootPageId: string): ConvertedNotionArticle {
  const formattedId = formatUuid(rootPageId);
  const blocks = recordMap.block || {};

  // Find root page block
  let rootBlock = blocks[formattedId]?.value;
  if (!rootBlock) {
    // Try raw unformatted key
    const rawKey = Object.keys(blocks).find((k) => k.replace(/-/g, "") === rootPageId.replace(/-/g, ""));
    if (rawKey) {
      rootBlock = blocks[rawKey]?.value;
    }
  }

  const pageTitle = rootBlock?.properties?.title
    ? renderNotionRichText(rootBlock.properties.title)
    : "Untitled Notion Document";

  const pageIcon = rootBlock?.format?.page_icon || "📝";
  const pageCover = rootBlock?.format?.page_cover || "";

  const stats: NotionBlockStats = {
    headingsConverted: 0,
    calloutsConverted: 0,
    quotesConverted: 0,
    codeBlocksConverted: 0,
    listsConverted: 0,
    imagesPreserved: 0,
    totalBlocks: 0,
  };

  const contentOrder: string[] = rootBlock?.content || [];
  const htmlParts: string[] = [];
  let currentListType: "ul" | "ol" | null = null;

  const closeListIfOpen = () => {
    if (currentListType) {
      htmlParts.push(`</${currentListType}>`);
      currentListType = null;
    }
  };

  for (const blockId of contentOrder) {
    const block = blocks[blockId]?.value;
    if (!block) continue;

    stats.totalBlocks++;
    const type = block.type;
    const properties = block.properties || {};
    const textHtml = renderNotionRichText(properties.title || []);

    // Handle list continuity
    if (type === "bulleted_list") {
      if (currentListType !== "ul") {
        closeListIfOpen();
        htmlParts.push(`<ul class="list-disc list-inside space-y-1 my-3 text-zinc-300">`);
        currentListType = "ul";
      }
      htmlParts.push(`<li>${textHtml}</li>`);
      stats.listsConverted++;
      continue;
    } else if (type === "numbered_list") {
      if (currentListType !== "ol") {
        closeListIfOpen();
        htmlParts.push(`<ol class="list-decimal list-inside space-y-1 my-3 text-zinc-300">`);
        currentListType = "ol";
      }
      htmlParts.push(`<li>${textHtml}</li>`);
      stats.listsConverted++;
      continue;
    } else {
      closeListIfOpen();
    }

    switch (type) {
      case "header":
        stats.headingsConverted++;
        htmlParts.push(`<h1 class="text-3xl font-serif font-bold text-white mt-8 mb-4">${textHtml}</h1>`);
        break;

      case "sub_header":
        stats.headingsConverted++;
        htmlParts.push(`<h2 class="text-2xl font-serif font-bold text-white mt-6 mb-3">${textHtml}</h2>`);
        break;

      case "sub_sub_header":
        stats.headingsConverted++;
        htmlParts.push(`<h3 class="text-xl font-serif font-semibold text-zinc-200 mt-5 mb-2">${textHtml}</h3>`);
        break;

      case "text":
        if (textHtml.trim()) {
          htmlParts.push(`<p class="my-3 leading-relaxed text-zinc-300">${textHtml}</p>`);
        }
        break;

      case "callout": {
        stats.calloutsConverted++;
        const icon = block.format?.page_icon || "💡";
        let calloutType = "info";
        if (icon === "⚠️" || icon === "🚨" || icon === "🔥") {
          calloutType = "warning";
        } else if (icon === "🛡️" || icon === "🕵️" || icon === "🔒") {
          calloutType = "whistleblower";
        }

        htmlParts.push(`
          <div data-type="callout" data-callout-type="${calloutType}" class="my-5 p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3 text-zinc-200">
            <span class="text-xl flex-shrink-0 select-none">${icon}</span>
            <div class="leading-relaxed text-sm">${textHtml}</div>
          </div>
        `);
        break;
      }

      case "quote":
        stats.quotesConverted++;
        htmlParts.push(`
          <blockquote class="my-5 pl-4 border-l-4 border-cyan-400 italic text-zinc-300 font-serif">
            ${textHtml}
          </blockquote>
        `);
        break;

      case "to_do": {
        stats.listsConverted++;
        const checked = properties.checked?.[0]?.[0] === "Yes";
        htmlParts.push(`
          <div class="flex items-center gap-2 my-1.5 text-zinc-300 text-sm">
            <input type="checkbox" ${checked ? "checked" : ""} disabled class="rounded border-white/20 bg-zinc-900 text-cyan-500" />
            <span class="${checked ? "line-through text-zinc-500" : ""}">${textHtml}</span>
          </div>
        `);
        break;
      }

      case "code": {
        stats.codeBlocksConverted++;
        const language = properties.language?.[0]?.[0] || "text";
        const codeText = properties.title?.[0]?.[0] || "";
        htmlParts.push(`
          <div class="my-5 rounded-xl border border-white/10 bg-black/80 overflow-hidden">
            <div class="px-4 py-1.5 bg-white/5 border-b border-white/5 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              ${escapeHtml(language)}
            </div>
            <pre class="p-4 overflow-x-auto text-xs font-mono text-cyan-200 leading-relaxed"><code>${escapeHtml(codeText)}</code></pre>
          </div>
        `);
        break;
      }

      case "image": {
        stats.imagesPreserved++;
        const src = block.format?.display_source || block.properties?.source?.[0]?.[0] || "";
        if (src) {
          const caption = properties.caption ? renderNotionRichText(properties.caption) : "";
          htmlParts.push(`
            <figure class="my-6">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(caption || pageTitle)}" loading="lazy" class="w-full rounded-xl border border-white/10" />
              ${caption ? `<figcaption class="text-center text-xs text-zinc-500 mt-2 font-mono">${caption}</figcaption>` : ""}
            </figure>
          `);
        }
        break;
      }

      case "divider":
        htmlParts.push(`<hr class="my-8 border-white/10" />`);
        break;

      case "toggle": {
        htmlParts.push(`
          <details class="my-3 p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <summary class="cursor-pointer font-medium text-white">${textHtml}</summary>
            <div class="mt-2 text-zinc-300 pl-4 border-l border-white/10">
              <!-- Nested toggle content handled if present -->
            </div>
          </details>
        `);
        break;
      }

      default:
        if (textHtml.trim()) {
          htmlParts.push(`<p class="my-3 leading-relaxed text-zinc-300">${textHtml}</p>`);
        }
    }
  }

  closeListIfOpen();

  const rawHtml = htmlParts.join("\n");
  const { cleanHtml } = scrubArticleHtml(rawHtml);
  const readingStats = calculateReadingTime(cleanHtml);

  // Derive an excerpt from the first paragraph
  const $ = cheerio.load(cleanHtml);
  const firstP = $("p").first().text().trim();
  const excerpt = firstP ? firstP.slice(0, 200) : pageTitle;

  return {
    title: pageTitle.replace(/<[^>]*>/g, "").trim(),
    author: "Notion Author",
    excerpt,
    cleanHtml,
    wordCount: readingStats.words,
    readingTimeMinutes: readingStats.minutes,
    pageId: rootPageId,
    icon: pageIcon,
    coverImage: pageCover,
    stats,
  };
}

/**
 * Fallback parser for Notion Markdown exports.
 * Transforms Notion Callouts, Quotes, Headings, Code blocks into semantic HTML.
 */
export function parseNotionMarkdown(markdownText: string): ConvertedNotionArticle {
  if (!markdownText || !markdownText.trim()) {
    throw new Error("Empty Notion Markdown provided");
  }

  const lines = markdownText.split("\n");
  let title = "Untitled Notion Document";
  const htmlParts: string[] = [];

  const stats: NotionBlockStats = {
    headingsConverted: 0,
    calloutsConverted: 0,
    quotesConverted: 0,
    codeBlocksConverted: 0,
    listsConverted: 0,
    imagesPreserved: 0,
    totalBlocks: 0,
  };

  let inCodeBlock = false;
  let codeLang = "";
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block fences
    if (trimmed.startsWith("```")) {
      stats.totalBlocks++;
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim() || "text";
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        stats.codeBlocksConverted++;
        htmlParts.push(`
          <div class="my-5 rounded-xl border border-white/10 bg-black/80 overflow-hidden">
            <div class="px-4 py-1.5 bg-white/5 border-b border-white/5 text-[11px] font-mono text-zinc-400 uppercase">
              ${escapeHtml(codeLang)}
            </div>
            <pre class="p-4 overflow-x-auto text-xs font-mono text-cyan-200 leading-relaxed"><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>
          </div>
        `);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) continue;

    stats.totalBlocks++;

    // Headings
    if (trimmed.startsWith("# ")) {
      stats.headingsConverted++;
      const text = trimmed.slice(2).trim();
      if (title === "Untitled Notion Document") {
        title = text;
      }
      htmlParts.push(`<h1 class="text-3xl font-serif font-bold text-white mt-8 mb-4">${escapeHtml(text)}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      stats.headingsConverted++;
      htmlParts.push(`<h2 class="text-2xl font-serif font-bold text-white mt-6 mb-3">${escapeHtml(trimmed.slice(3).trim())}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      stats.headingsConverted++;
      htmlParts.push(`<h3 class="text-xl font-serif font-semibold text-zinc-200 mt-5 mb-2">${escapeHtml(trimmed.slice(4).trim())}</h3>`);
    }
    // Notion Callouts formatted as `> 💡 ...` or `> ⚠️ ...` or `> 🚨 ...`
    else if (/^>\s*([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|💡|⚠️|🚨|🔥|🛡️)\s*/.test(trimmed)) {
      stats.calloutsConverted++;
      const match = trimmed.match(/^>\s*([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|💡|⚠️|🚨|🔥|🛡️)\s*(.*)$/);
      const icon = match ? match[1] : "💡";
      const content = match ? match[2] : trimmed.slice(1).trim();

      let calloutType = "info";
      if (icon === "⚠️" || icon === "🚨" || icon === "🔥") {
        calloutType = "warning";
      } else if (icon === "🛡️") {
        calloutType = "whistleblower";
      }

      htmlParts.push(`
        <div data-type="callout" data-callout-type="${calloutType}" class="my-5 p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3 text-zinc-200">
          <span class="text-xl flex-shrink-0 select-none">${icon}</span>
          <div class="leading-relaxed text-sm">${escapeHtml(content)}</div>
        </div>
      `);
    }
    // Standard Quote
    else if (trimmed.startsWith("> ")) {
      stats.quotesConverted++;
      htmlParts.push(`
        <blockquote class="my-5 pl-4 border-l-4 border-cyan-400 italic text-zinc-300 font-serif">
          ${escapeHtml(trimmed.slice(2).trim())}
        </blockquote>
      `);
    }
    // Checkbox / Todo
    else if (/^-\s*\[([ xX])\]\s*/.test(trimmed)) {
      stats.listsConverted++;
      const isChecked = /-\s*\[[xX]\]/.test(trimmed);
      const text = trimmed.replace(/^-\s*\[([ xX])\]\s*/, "");
      htmlParts.push(`
        <div class="flex items-center gap-2 my-1.5 text-zinc-300 text-sm">
          <input type="checkbox" ${isChecked ? "checked" : ""} disabled class="rounded border-white/20 bg-zinc-900 text-cyan-500" />
          <span class="${isChecked ? "line-through text-zinc-500" : ""}">${escapeHtml(text)}</span>
        </div>
      `);
    }
    // List item
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      stats.listsConverted++;
      htmlParts.push(`<li class="my-1 ml-4 list-disc text-zinc-300">${escapeHtml(trimmed.slice(2).trim())}</li>`);
    }
    // Divider
    else if (trimmed === "---" || trimmed === "***") {
      htmlParts.push(`<hr class="my-8 border-white/10" />`);
    }
    // Image
    else if (/^!\[(.*?)\]\((.*?)\)/.test(trimmed)) {
      stats.imagesPreserved++;
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1] || title;
        const src = match[2];
        htmlParts.push(`
          <figure class="my-6">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" class="w-full rounded-xl border border-white/10" />
            ${alt ? `<figcaption class="text-center text-xs text-zinc-500 mt-2 font-mono">${escapeHtml(alt)}</figcaption>` : ""}
          </figure>
        `);
      }
    }
    // Regular paragraph
    else {
      htmlParts.push(`<p class="my-3 leading-relaxed text-zinc-300">${escapeHtml(trimmed)}</p>`);
    }
  }

  const rawHtml = htmlParts.join("\n");
  const { cleanHtml } = scrubArticleHtml(rawHtml);
  const readingStats = calculateReadingTime(cleanHtml);

  return {
    title,
    author: "Notion Author",
    excerpt: cleanHtml.replace(/<[^>]*>/g, "").slice(0, 200).trim(),
    cleanHtml,
    wordCount: readingStats.words,
    readingTimeMinutes: readingStats.minutes,
    stats,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
