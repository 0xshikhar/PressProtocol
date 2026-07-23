import path from "path";
import type { ParsedFrontmatter, MarkdownArticle } from "./types.js";

/**
 * Extracts and parses YAML frontmatter and body markdown from raw file content.
 * Compatible with Hugo, Astro, Jekyll, Nextra, and Docusaurus content files.
 */
export function parseMarkdownFile(
  filePath: string,
  rawContent: string,
  baseDir: string = ""
): MarkdownArticle {
  const relativePath = baseDir ? path.relative(baseDir, filePath) : filePath;
  const { frontmatter, bodyMarkdown } = splitFrontmatter(rawContent);

  // Derive title from frontmatter, or fallback to first H1 in body, or filename
  let title = frontmatter.title;
  if (!title) {
    const h1Match = bodyMarkdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    } else {
      const baseName = path.basename(filePath, path.extname(filePath));
      title = cleanSlugToTitle(baseName);
    }
  }

  // Derive date
  let date = frontmatter.date || frontmatter.pubDate || frontmatter.timestamp;
  if (!date) {
    date = new Date().toISOString();
  } else if (date instanceof Date) {
    date = date.toISOString();
  } else {
    date = String(date).trim();
  }

  // Derive author (fallback to empty string so publisher options can set authorPseudonym)
  const author =
    frontmatter.author || frontmatter.byline || "";

  // Derive tags (support array, YAML multi-line, or comma-separated string)
  const tags = normalizeTags(
    frontmatter.tags || frontmatter.categories || frontmatter.keywords
  );

  // Derive slug
  let slug = frontmatter.slug || frontmatter.permalink;
  if (!slug) {
    const baseName = path.basename(filePath, path.extname(filePath));
    // Strip leading date if Jekyll/Hugo pattern like 2026-09-12-post-name
    slug = baseName.replace(/^\d{4}-\d{2}-\d{2}-/, "").toLowerCase();
  } else {
    slug = String(slug).replace(/^\/|\/$/g, "").toLowerCase();
  }

  // Derive excerpt
  let excerpt =
    frontmatter.excerpt || frontmatter.description || frontmatter.summary;
  if (!excerpt) {
    const firstParagraph = bodyMarkdown
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p.length > 0 && !p.startsWith("#") && !p.startsWith("!")) || "";
    excerpt = firstParagraph
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .slice(0, 220);
  }

  // Derive draft status
  const isDraft =
    frontmatter.draft === true ||
    frontmatter.draft === "true" ||
    frontmatter.published === false ||
    frontmatter.published === "false";

  const coverImage = frontmatter.coverImage || frontmatter.image || frontmatter.banner;

  return {
    filePath,
    relativePath,
    frontmatter,
    rawContent,
    bodyMarkdown,
    title: String(title).trim(),
    date,
    author: String(author).trim(),
    tags,
    slug,
    excerpt: String(excerpt).trim(),
    isDraft,
    coverImage: coverImage ? String(coverImage).trim() : undefined,
  };
}

/**
 * Splits frontmatter from markdown body using `---` delimiter boundaries.
 */
export function splitFrontmatter(rawContent: string): {
  frontmatter: ParsedFrontmatter;
  bodyMarkdown: string;
} {
  const content = rawContent.replace(/\r\n/g, "\n");
  if (!content.startsWith("---")) {
    return { frontmatter: {}, bodyMarkdown: content.trim() };
  }

  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { frontmatter: {}, bodyMarkdown: content.trim() };
  }

  const yamlBlock = content.slice(3, endIdx).trim();
  const bodyMarkdown = content.slice(endIdx + 4).trim();
  const frontmatter = parseYamlBlock(yamlBlock);

  return { frontmatter, bodyMarkdown };
}

/**
 * Lightweight, zero-dependency YAML parser for common frontmatter keys.
 */
export function parseYamlBlock(yaml: string): ParsedFrontmatter {
  const result: ParsedFrontmatter = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Check for list item under current key: `  - item` or `- item`
    if (trimmed.startsWith("-") && currentKey) {
      const val = trimmed.slice(1).trim().replace(/^["']|["']$/g, "");
      if (!currentList) {
        currentList = [];
        result[currentKey] = currentList;
      }
      currentList.push(val);
      continue;
    }

    // Key-value pair
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const rawKey = line.slice(0, colonIdx).trim();
      const rawValue = line.slice(colonIdx + 1).trim();

      // Reset list context
      currentKey = rawKey;
      currentList = null;

      if (!rawValue) {
        // Might be followed by list items
        result[rawKey] = [];
        currentList = result[rawKey] as string[];
        continue;
      }

      // Parse inline array: `[a, b, c]`
      if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        const inner = rawValue.slice(1, -1).trim();
        if (!inner) {
          result[rawKey] = [];
        } else {
          result[rawKey] = inner
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        }
        continue;
      }

      // Boolean
      if (rawValue.toLowerCase() === "true") {
        result[rawKey] = true;
        continue;
      }
      if (rawValue.toLowerCase() === "false") {
        result[rawKey] = false;
        continue;
      }

      // Number
      if (!isNaN(Number(rawValue)) && !rawValue.startsWith("0x")) {
        result[rawKey] = Number(rawValue);
        continue;
      }

      // Clean quoted string
      const cleanString = rawValue.replace(/^["']|["']$/g, "");
      result[rawKey] = cleanString;
    }
  }

  return result;
}

/**
 * Normalizes tags from string, array, or comma-separated list into string[].
 */
export function normalizeTags(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Turns a slug filename into a human readable title.
 */
function cleanSlugToTitle(slug: string): string {
  return slug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
