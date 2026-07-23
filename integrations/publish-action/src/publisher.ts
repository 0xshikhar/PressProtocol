import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { sha256 } from "@noble/hashes/sha256";
import type { MarkdownArticle, PublishResultItem } from "./types.js";

// Bind SHA-512 for @noble/ed25519
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(sha512(ed.etc.concatBytes(...m)));

// RFC 4648 Base32 alphabet for IPFS CIDv1
const BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

function base32Encode(bytes: Uint8Array): string {
  let result = "";
  let bits = 0;
  let value = 0;
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return result;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Deterministically computes an IPFS CIDv1 (raw-codec, sha2-256, base32) in-memory.
 */
export function calculateCIDv1(content: string | Uint8Array): string {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const digest = sha256(bytes);

  // Multicodec CIDv1 binary: [0x01 (CIDv1), 0x55 (raw), 0x12 (sha2-256), 0x20 (32 bytes), ...digest]
  const cidBytes = new Uint8Array(4 + digest.length);
  cidBytes[0] = 0x01;
  cidBytes[1] = 0x55;
  cidBytes[2] = 0x12;
  cidBytes[3] = 0x20;
  cidBytes.set(digest, 4);

  return "b" + base32Encode(cidBytes);
}

/**
 * Derives public key from Ed25519 private key hex.
 */
export async function getPublicKey(privKeyHex: string): Promise<string> {
  const privBytes = hexToBytes(privKeyHex);
  const pubBytes = await ed.getPublicKeyAsync(privBytes);
  return bytesToHex(pubBytes);
}

/**
 * Generates an ephemeral Ed25519 keypair in hex format.
 */
export async function generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
  const privBytes = ed.utils.randomPrivateKey();
  const pubBytes = await ed.getPublicKeyAsync(privBytes);
  return {
    publicKey: bytesToHex(pubBytes),
    privateKey: bytesToHex(privBytes),
  };
}

/**
 * Creates canonical deterministic signing payload.
 */
export function createCanonicalPayload(title: string, tags: string[], timestamp: string): string {
  return JSON.stringify({
    title,
    tags,
    timestamp,
  });
}

/**
 * Signs message payload with Ed25519 private key.
 */
export async function signPayload(payload: string, privateKeyHex: string): Promise<string> {
  const privBytes = hexToBytes(privateKeyHex);
  const msgBytes = new TextEncoder().encode(payload);
  const sigBytes = await ed.signAsync(msgBytes, privBytes);
  return bytesToHex(sigBytes);
}

/**
 * Transpiles markdown to clean semantic HTML5, converts callouts, and purges tracking scripts.
 */
export function transpileMarkdown(markdown: string): { html: string; wordCount: number; readingTimeMinutes: number } {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code fence
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim() || "text";
        codeBuffer = [];
      } else {
        inCodeBlock = false;
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

    if (!trimmed) {
      continue;
    }

    // Callouts: `> 💡 ...` or `> ⚠️ ...` or `> 🚨 ...` or `> 🛡️ ...`
    if (/^>\s*([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|💡|⚠️|🚨|🔥|🛡️)\s*/.test(trimmed)) {
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
          <div class="leading-relaxed text-sm">${renderInlineMarkdown(content)}</div>
        </div>
      `);
    }
    // Blockquote: `> ...`
    else if (trimmed.startsWith("> ")) {
      htmlParts.push(`
        <blockquote class="my-5 pl-4 border-l-4 border-cyan-400 italic text-zinc-300 font-serif">
          ${renderInlineMarkdown(trimmed.slice(2).trim())}
        </blockquote>
      `);
    }
    // Headings
    else if (trimmed.startsWith("# ")) {
      htmlParts.push(`<h1 class="text-3xl font-serif font-bold text-white mt-8 mb-4">${renderInlineMarkdown(trimmed.slice(2).trim())}</h1>`);
    } else if (trimmed.startsWith("## ")) {
      htmlParts.push(`<h2 class="text-2xl font-serif font-bold text-white mt-6 mb-3">${renderInlineMarkdown(trimmed.slice(3).trim())}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      htmlParts.push(`<h3 class="text-xl font-serif font-semibold text-zinc-200 mt-5 mb-2">${renderInlineMarkdown(trimmed.slice(4).trim())}</h3>`);
    }
    // Horizontal divider
    else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      htmlParts.push(`<hr class="my-8 border-white/10" />`);
    }
    // List item
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      htmlParts.push(`<li class="my-1 ml-4 list-disc text-zinc-300">${renderInlineMarkdown(trimmed.slice(2).trim())}</li>`);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, "");
      htmlParts.push(`<li class="my-1 ml-4 list-decimal text-zinc-300">${renderInlineMarkdown(content)}</li>`);
    }
    // Paragraph
    else {
      htmlParts.push(`<p class="my-3 leading-relaxed text-zinc-300">${renderInlineMarkdown(trimmed)}</p>`);
    }
  }

  const rawHtml = htmlParts.join("\n");
  const sanitized = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|&quot;.*?&quot;|[^\s>]+)/gi, "")
    .replace(/\b(onload|onclick|onerror|onmouseover|onfocus)\b\s*=\s*(?:"[^"]*"|'[^']*'|&quot;.*?&quot;|[^\s>]+)/gi, "");

  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    html: sanitized,
    wordCount: words,
    readingTimeMinutes,
  };
}

/**
 * Handles inline formatting: bold, italic, code, links.
 */
function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class=\"px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs\">$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline hover:text-cyan-300">$1</a>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Publishes or dry-runs a single markdown article.
 */
export async function publishArticle(
  article: MarkdownArticle,
  options: {
    privateKeyHex?: string;
    gatewayUrl: string;
    authorPseudonym: string;
    extraTags: string[];
    dryRun: boolean;
  }
): Promise<PublishResultItem> {
  const { html, wordCount, readingTimeMinutes } = transpileMarkdown(article.bodyMarkdown);

  // Determine keypair
  let privKey = options.privateKeyHex?.trim();
  let pubKey = "";

  if (privKey && privKey.length === 64) {
    pubKey = await getPublicKey(privKey);
  } else {
    // Generate burner keypair
    const generated = await generateKeypair();
    privKey = generated.privateKey;
    pubKey = generated.publicKey;
  }

  const mergedTags = Array.from(new Set([...article.tags, ...options.extraTags]));
  const timestamp = article.date || new Date().toISOString();

  // Canonical payload & Ed25519 signature
  const canonicalPayload = createCanonicalPayload(article.title, mergedTags, timestamp);
  const signature = await signPayload(canonicalPayload, privKey);

  // Compute deterministic CIDv1
  const fullArticleBundle = JSON.stringify({
    title: article.title,
    content: html,
    tags: mergedTags,
    author: article.author || options.authorPseudonym,
    date: timestamp,
    publicKey: pubKey,
    signature,
  });
  const cid = calculateCIDv1(fullArticleBundle);

  const cleanGateway = options.gatewayUrl.replace(/\/$/, "");
  const shareUrl = `${cleanGateway}/read/${cid}`;
  const mirrors = {
    ipfs: `https://gateway.pinata.cloud/ipfs/${cid}`,
    gateway: `https://cloudflare-ipfs.com/ipfs/${cid}`,
    tor: `http://pressp42x7a6sover.onion/read/${cid}`,
  };

  // If not dry-run, broadcast to node gateway
  if (!options.dryRun) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(`${cleanGateway}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          content: html,
          tags: mergedTags,
          publicKey: pubKey,
          signature,
          timestamp,
          author: article.author || options.authorPseudonym,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn(`⚠️ Gateway returned status ${resp.status} for "${article.title}". Using deterministic CID.`);
      }
    } catch (err: any) {
      console.warn(`⚠️ Gateway broadcast skipped/unreachable (${err.message}). Using deterministic CID.`);
    }
  }

  return {
    filePath: article.relativePath,
    slug: article.slug,
    title: article.title,
    date: timestamp,
    author: article.author || options.authorPseudonym,
    tags: mergedTags,
    cid,
    signature,
    publicKey: pubKey,
    readingTimeMinutes,
    wordCount,
    shareUrl,
    mirrors,
    publishedAt: new Date().toISOString(),
  };
}
