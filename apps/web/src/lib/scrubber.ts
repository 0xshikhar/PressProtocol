import * as cheerio from "cheerio";
import { calculateReadingTime } from "./reading-time";

export interface ScrubberTelemetry {
  scriptsPurged: number;
  trackingPixelsPurged: number;
  trackingParamsPurged: number;
  inlineHandlersPurged: number;
  surveillanceElementsPurged: number;
  totalPurged: number;
  originalByteSize: number;
  cleanedByteSize: number;
  reductionPercentage: number;
  wordCount: number;
  readingTimeMinutes: number;
  purgedTrackersList: string[];
}

export interface ScrubbedArticle {
  title: string;
  author: string;
  excerpt: string;
  cleanHtml: string;
  rawHtmlLength: number;
  cleanHtmlLength: number;
  canonicalUrl: string;
  publishedAt?: string;
  tags: string[];
  telemetry: ScrubberTelemetry;
}

// Known surveillance, tracking, and ad delivery domains
const KNOWN_TRACKER_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.com/tr",
  "facebook.net",
  "connect.facebook.net",
  "pixel.facebook.com",
  "analytics.twitter.com",
  "t.co",
  "segment.com",
  "segment.io",
  "hotjar.com",
  "datadoghq-browser-agent.com",
  "criteo.com",
  "taboola.com",
  "outbrain.com",
  "clarity.ms",
  "mixpanel.com",
  "amplitude.com",
  "branch.io",
  "appsflyer.com",
  "scorecardresearch.com",
  "quantserve.com",
  "chartbeat.com",
  "parsely.com",
  "crazyegg.com",
  "intercom.io",
  "drift.com",
  "hubspot.com",
  "marketo.net",
  "kissmetrics.com",
  "inspectlet.com",
  "luckyorange.com",
  "newrelic.com",
  "nr-data.net",
];

// Tracking URL query parameters to purge
const TRACKING_URL_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gclsrc",
  "dclid",
  "msclkid",
  "twclid",
  "ttclid",
  "mc_cid",
  "mc_eid",
  "si",
  "ref",
  "ref_src",
  "ref_url",
  "_hsenc",
  "_hsmi",
  "wickedid",
  "igshid",
  "srsltid",
  "yclid",
  "_openstat",
  "rb_clickid",
];

/**
 * Purges tracking parameters from a URL while keeping essential functional query params.
 */
export function sanitizeUrl(rawUrl: string): { cleanedUrl: string; paramsPurged: number } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { cleanedUrl: "", paramsPurged: 0 };
  }

  // Preserve relative anchor links or mailto
  if (rawUrl.startsWith("#") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:")) {
    return { cleanedUrl: rawUrl, paramsPurged: 0 };
  }

  try {
    const isRelative = !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://") && !rawUrl.startsWith("//");
    const dummyBase = "https://canonical.pressprotocol.internal";
    const parsed = new URL(rawUrl, dummyBase);

    let paramsPurged = 0;
    for (const param of TRACKING_URL_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.delete(param);
        paramsPurged++;
      }
    }

    // Also remove any parameter starting with utm_ or track_
    const allKeys = Array.from(parsed.searchParams.keys());
    for (const key of allKeys) {
      if (key.startsWith("utm_") || key.startsWith("track_") || key.startsWith("analytics_")) {
        parsed.searchParams.delete(key);
        paramsPurged++;
      }
    }

    if (isRelative) {
      const pathWithSearch = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return { cleanedUrl: pathWithSearch, paramsPurged };
    }

    return { cleanedUrl: parsed.toString(), paramsPurged };
  } catch {
    // If malformed, return as-is
    return { cleanedUrl: rawUrl, paramsPurged: 0 };
  }
}

/**
 * Deep-scrubs raw HTML to strip scripts, tracking pixels, beacons, surveillance iframes,
 * inline handlers, and tracking params, while preserving rich formatting and typography.
 */
export function scrubArticleHtml(rawHtml: string): {
  cleanHtml: string;
  telemetry: ScrubberTelemetry;
} {
  const originalByteSize = Buffer.byteLength(rawHtml || "", "utf8");
  if (!rawHtml || !rawHtml.trim()) {
    return {
      cleanHtml: "",
      telemetry: {
        scriptsPurged: 0,
        trackingPixelsPurged: 0,
        trackingParamsPurged: 0,
        inlineHandlersPurged: 0,
        surveillanceElementsPurged: 0,
        totalPurged: 0,
        originalByteSize: 0,
        cleanedByteSize: 0,
        reductionPercentage: 0,
        wordCount: 0,
        readingTimeMinutes: 0,
        purgedTrackersList: [],
      },
    };
  }

  const $ = cheerio.load(rawHtml, { xml: false });
  const purgedTrackersList: string[] = [];

  let scriptsPurged = 0;
  let trackingPixelsPurged = 0;
  let trackingParamsPurged = 0;
  let inlineHandlersPurged = 0;
  let surveillanceElementsPurged = 0;

  // 1. Remove all executable scripts & noscript tags
  $("script, noscript, style, link[rel='stylesheet'], link[rel='preload'], link[rel='prefetch']").each((_, el) => {
    const tagName = (el as any).tagName?.toLowerCase();
    if (tagName === "script") {
      scriptsPurged++;
      purgedTrackersList.push("JavaScript Execution Sandbox (<script>)");
    } else {
      surveillanceElementsPurged++;
      purgedTrackersList.push(`Head Resource Beacon (<${tagName}>)`);
    }
    $(el).remove();
  });

  // 2. Remove dangerous and surveillance embed objects
  $("iframe, object, embed, applet, base").each((_, el) => {
    const src = $(el).attr("src") || "";
    const isSafeVideo =
      src.includes("youtube.com/embed/") ||
      src.includes("youtube-nocookie.com/embed/") ||
      src.includes("player.vimeo.com/video/");

    if (!isSafeVideo) {
      surveillanceElementsPurged++;
      purgedTrackersList.push(`Third-party Tracking Frame (${src.slice(0, 45)}...)`);
      $(el).remove();
    }
  });

  // 3. Remove 1x1 tracking pixels, beacon images, and images hosted on ad networks
  $("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    const width = parseInt($(el).attr("width") || "100", 10);
    const height = parseInt($(el).attr("height") || "100", 10);
    const style = $(el).attr("style") || "";

    const isPixel =
      width <= 1 ||
      height <= 1 ||
      style.includes("display:none") ||
      style.includes("display: none") ||
      style.includes("visibility:hidden") ||
      style.includes("width:0") ||
      style.includes("height:0");

    const isTrackerDomain = KNOWN_TRACKER_DOMAINS.some((domain) => src.includes(domain));
    const isBeaconPath = /\/(tr|collect|pixel|beacon|telemetry|track|event|stats)\b/i.test(src);

    if (isPixel || isTrackerDomain || isBeaconPath) {
      trackingPixelsPurged++;
      purgedTrackersList.push(`Invisible Tracking Pixel (${src.slice(0, 40)}...)`);
      $(el).remove();
    } else {
      // Clean image src from tracking query parameters
      const { cleanedUrl, paramsPurged } = sanitizeUrl(src);
      $(el).attr("src", cleanedUrl);
      trackingParamsPurged += paramsPurged;

      // Ensure images are responsive and modern
      $(el).attr("loading", "lazy");
      $(el).attr("decoding", "async");
      $(el).removeAttr("srcset"); // strip potential telemetry srcset redirects
    }
  });

  // 4. Strip inline event handlers and data-* tracking telemetry attributes across ALL elements
  $("*").each((_, el) => {
    const attribs = (el as any).attribs || {};
    const attrsToDelete: string[] = [];

    for (const attr of Object.keys(attribs)) {
      const lower = attr.toLowerCase();

      // Inline JS handlers (onclick, onload, onerror, etc.)
      if (lower.startsWith("on")) {
        inlineHandlersPurged++;
        attrsToDelete.push(attr);
      }

      // Tracking and telemetry datasets
      if (
        lower.startsWith("data-track") ||
        lower.startsWith("data-analytics") ||
        lower.startsWith("data-ga") ||
        lower.startsWith("data-amplitude") ||
        lower.startsWith("data-segment") ||
        lower.startsWith("data-component-name") ||
        lower.startsWith("data-testid") ||
        lower === "ping"
      ) {
        surveillanceElementsPurged++;
        attrsToDelete.push(attr);
      }
    }

    for (const attr of attrsToDelete) {
      $(el).removeAttr(attr);
    }
  });

  // 5. Purge tracking parameters from all hyperlinks
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href) {
      const { cleanedUrl, paramsPurged } = sanitizeUrl(href);
      $(el).attr("href", cleanedUrl);
      trackingParamsPurged += paramsPurged;

      // Add secure rel flags to external links
      if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
        $(el).attr("rel", "noopener noreferrer");
        $(el).attr("target", "_blank");
      }
    }
  });

  // 6. Purge Substack/Medium specific ad/subscription banners and paywall upsells
  $(
    ".subscription-widget-wrap, .paywall, .post-ufi, .share-dialog, .pencraft-dialog, .like-button, .comment-widget, .clap-button, .speechify-embed, .post-footer, .side-cta, .author-card-fixed, .newsletter-signup"
  ).each((_, el) => {
    surveillanceElementsPurged++;
    $(el).remove();
  });

  // Extract clean inner HTML or body HTML
  const bodyHtml = $("body").length ? $("body").html() : $.html();
  const cleanHtml = (bodyHtml || "").trim();
  const cleanedByteSize = Buffer.byteLength(cleanHtml, "utf8");

  const totalPurged =
    scriptsPurged + trackingPixelsPurged + trackingParamsPurged + inlineHandlersPurged + surveillanceElementsPurged;

  const reductionPercentage =
    originalByteSize > 0
      ? Math.max(0, Math.round(((originalByteSize - cleanedByteSize) / originalByteSize) * 100))
      : 0;

  const readingStats = calculateReadingTime(cleanHtml);

  // Deduplicate purged trackers list up to 12 items for UI display
  const uniquePurgedList = Array.from(new Set(purgedTrackersList)).slice(0, 15);

  return {
    cleanHtml,
    telemetry: {
      scriptsPurged,
      trackingPixelsPurged,
      trackingParamsPurged,
      inlineHandlersPurged,
      surveillanceElementsPurged,
      totalPurged,
      originalByteSize,
      cleanedByteSize,
      reductionPercentage,
      wordCount: readingStats.words,
      readingTimeMinutes: readingStats.minutes,
      purgedTrackersList: uniquePurgedList,
    },
  };
}

/**
 * Extracts and scrubs article content from a Substack, Medium, Ghost, or blog URL / RSS feed.
 */
export async function extractArticleFromUrl(targetUrl: string): Promise<ScrubbedArticle> {
  const urlObj = new URL(targetUrl);

  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PressProtocol/1.0",
      Accept: "text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article from ${targetUrl}: HTTP ${response.status} ${response.statusText}`);
  }

  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";

  // Check if target is an RSS / Atom feed
  const isXmlFeed =
    contentType.includes("xml") ||
    targetUrl.endsWith(".xml") ||
    targetUrl.endsWith("/feed") ||
    rawText.trim().startsWith("<?xml") ||
    rawText.includes("<rss") ||
    rawText.includes("<feed");

  if (isXmlFeed) {
    return parseRssFeedItem(rawText, targetUrl);
  }

  // Parse HTML webpage
  const $ = cheerio.load(rawText);

  // Extract metadata
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const twitterTitle = $('meta[name="twitter:title"]').attr("content");
  const docTitle = $("title").first().text();
  const h1Title = $("h1").first().text();
  const title = (ogTitle || twitterTitle || h1Title || docTitle || "Untitled Article").trim();

  const author =
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    $('[rel="author"]').first().text() ||
    $(".byline, .author-name, .author").first().text().trim() ||
    urlObj.hostname.replace("www.", "");

  const excerpt =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    "";

  const publishedAt =
    $('meta[property="article:published_time"]').attr("content") ||
    $("time").first().attr("datetime") ||
    new Date().toISOString();

  // Extract tags / keywords
  const metaKeywords = $('meta[name="keywords"]').attr("content") || "";
  const tagList: string[] = metaKeywords
    ? metaKeywords.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  $('a[href*="/tag/"], a[href*="/topic/"], a[href*="/tags/"]').each((_, el) => {
    const text = $(el).text().replace(/^#/, "").trim();
    if (text && text.length < 30 && !tagList.includes(text)) {
      tagList.push(text);
    }
  });

  // Content selector heuristics:
  // Substack: .available-content, .body.markup, .post-content
  // Medium: article section, .markup--post-full, article
  // Ghost: .gh-content, .post-content, article
  // WordPress: .entry-content, .post-content
  // Generic: article, main, [role="main"]
  const candidateSelectors = [
    ".available-content",
    ".body.markup",
    ".gh-content",
    ".entry-content",
    ".post-content",
    ".markup--post-full",
    "article",
    "main",
    '[role="main"]',
    ".content",
    "#content",
  ];

  let rawContentHtml = "";
  for (const selector of candidateSelectors) {
    const match = $(selector);
    if (match.length > 0) {
      // Choose the candidate with substantial paragraphs
      const pCount = match.find("p").length;
      if (pCount >= 2 || selector === ".available-content" || selector === ".gh-content") {
        rawContentHtml = match.html() || "";
        break;
      }
    }
  }

  // Fallback if no container matches: collect all paragraphs
  if (!rawContentHtml) {
    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) {
        paragraphs.push($.html(el));
      }
    });
    rawContentHtml = paragraphs.join("\n");
  }

  // Run through deep surveillance scrubber
  const { cleanHtml, telemetry } = scrubArticleHtml(rawContentHtml);

  return {
    title,
    author: author.trim(),
    excerpt: excerpt.trim(),
    cleanHtml,
    rawHtmlLength: Buffer.byteLength(rawContentHtml, "utf8"),
    cleanHtmlLength: Buffer.byteLength(cleanHtml, "utf8"),
    canonicalUrl: targetUrl,
    publishedAt,
    tags: tagList.slice(0, 6),
    telemetry,
  };
}

/**
 * Helper to parse an RSS / Atom feed string and extract the latest post.
 */
function parseRssFeedItem(xmlString: string, feedUrl: string): ScrubbedArticle {
  const $ = cheerio.load(xmlString, { xmlMode: true });

  // Try RSS <item> first, then Atom <entry>
  const item = $("item").first().length ? $("item").first() : $("entry").first();

  if (!item || item.length === 0) {
    throw new Error("No feed items found in the provided RSS/Atom feed URL");
  }

  const title = item.find("title").first().text().trim() || "Untitled Feed Item";
  const author =
    item.find("author name").first().text().trim() ||
    item.find("dc\\:creator").first().text().trim() ||
    item.find("author").first().text().trim() ||
    "Sovereign Author";

  const contentEncoded = item.find("content\\:encoded").first().text();
  const description = item.find("description").first().text();
  const content = item.find("content").first().text();
  const rawHtml = contentEncoded || content || description || "";

  const link =
    item.find("link").first().text().trim() ||
    item.find("link").attr("href") ||
    feedUrl;

  const pubDate =
    item.find("pubDate").first().text().trim() ||
    item.find("published").first().text().trim() ||
    item.find("updated").first().text().trim() ||
    new Date().toISOString();

  const tags: string[] = [];
  item.find("category").each((_, el) => {
    const tag = $(el).text().trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
  });

  const { cleanHtml, telemetry } = scrubArticleHtml(rawHtml);

  return {
    title,
    author,
    excerpt: description.replace(/<[^>]*>/g, "").slice(0, 200).trim(),
    cleanHtml,
    rawHtmlLength: Buffer.byteLength(rawHtml, "utf8"),
    cleanHtmlLength: Buffer.byteLength(cleanHtml, "utf8"),
    canonicalUrl: link,
    publishedAt: pubDate,
    tags: tags.slice(0, 6),
    telemetry,
  };
}

export interface RssFeedItem {
  id: string;
  title: string;
  author: string;
  link: string;
  publishedAt: string;
  excerpt: string;
  rawContentHtml: string;
  cleanHtml: string;
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  telemetry: ScrubberTelemetry;
}

export interface ParsedRssFeed {
  title: string;
  description: string;
  link: string;
  language: string;
  feedUrl: string;
  totalItems: number;
  items: RssFeedItem[];
}

/**
 * Parses an entire RSS or Atom publication feed, extracting and scrubbing all articles.
 */
export function parseFullRssFeed(xmlString: string, feedUrl: string): ParsedRssFeed {
  const $ = cheerio.load(xmlString, { xmlMode: true });

  const feedTitle =
    $("channel > title").first().text().trim() ||
    $("feed > title").first().text().trim() ||
    "Untitled Publication";

  const feedDescription =
    $("channel > description").first().text().trim() ||
    $("feed > subtitle").first().text().trim() ||
    "";

  const channelLink =
    $("channel > link").first().text().trim() ||
    $("feed > link[rel='alternate']").first().attr("href") ||
    $("feed > link").first().attr("href") ||
    feedUrl;

  const language =
    $("channel > language").first().text().trim() ||
    $("feed").attr("xml:lang") ||
    "en";

  const defaultAuthor =
    $("channel > dc\\:creator, channel > author, feed > author > name").first().text().trim() ||
    feedTitle;

  const rawElements = $("item").length ? $("item").toArray() : $("entry").toArray();
  const items: RssFeedItem[] = [];

  rawElements.forEach((el, index) => {
    const $item = $(el);

    const title = $item.find("title").first().text().trim() || `Article #${index + 1}`;

    const author =
      $item.find("author name").first().text().trim() ||
      $item.find("dc\\:creator").first().text().trim() ||
      $item.find("author").first().text().trim() ||
      defaultAuthor ||
      "Sovereign Author";

    const contentEncoded = $item.find("content\\:encoded").first().text();
    const atomContent = $item.find("content").first().text();
    const description = $item.find("description").first().text();
    const rawContentHtml = contentEncoded || atomContent || description || "";

    const link =
      $item.find("link").first().text().trim() ||
      $item.find("link[rel='alternate']").attr("href") ||
      $item.find("link").attr("href") ||
      feedUrl;

    const pubDate =
      $item.find("pubDate").first().text().trim() ||
      $item.find("published").first().text().trim() ||
      $item.find("updated").first().text().trim() ||
      new Date().toISOString();

    const guid =
      $item.find("guid").first().text().trim() ||
      $item.find("id").first().text().trim() ||
      link ||
      `rss_item_${index}_${Date.now()}`;

    const tags: string[] = [];
    $item.find("category").each((_, cat) => {
      const tagText = $(cat).text().trim() || $(cat).attr("term")?.trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    });

    const excerptText = description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const excerpt = excerptText.slice(0, 240);

    const { cleanHtml, telemetry } = scrubArticleHtml(rawContentHtml);

    items.push({
      id: guid,
      title,
      author,
      link,
      publishedAt: pubDate,
      excerpt,
      rawContentHtml,
      cleanHtml,
      tags: tags.slice(0, 6),
      wordCount: telemetry.wordCount,
      readingTimeMinutes: telemetry.readingTimeMinutes,
      telemetry,
    });
  });

  return {
    title: feedTitle,
    description: feedDescription,
    link: channelLink,
    language,
    feedUrl,
    totalItems: items.length,
    items,
  };
}
