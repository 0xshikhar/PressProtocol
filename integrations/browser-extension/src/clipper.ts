/**
 * PressProtocol Sovereign Web Clipper - In-Browser Readability & De-Surveillance Engine
 * Extracts clean article metadata and body from any webpage, purges tracking beacons,
 * paywall blockers, and ads, and yields pristine HTML ready for IPFS preservation.
 */

export interface ClipperTelemetry {
  scriptsPurged: number;
  trackingPixelsPurged: number;
  trackingParamsPurged: number;
  inlineHandlersPurged: number;
  surveillanceElementsPurged: number;
  totalPurged: number;
  originalByteSize: number;
  cleanedByteSize: number;
  wordCount: number;
  readingTimeMinutes: number;
  purgedTrackersSummary: string[];
}

export interface ClippedArticle {
  title: string;
  author: string;
  excerpt: string;
  contentHtml: string;
  textContent: string;
  canonicalUrl: string;
  publishedAt: string;
  siteName: string;
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  telemetry: ClipperTelemetry;
}

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
];

const KNOWN_TRACKER_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.com/tr",
  "facebook.net",
  "connect.facebook.net",
  "pixel.facebook.com",
  "analytics.twitter.com",
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
  "scorecardresearch.com",
  "quantserve.com",
  "chartbeat.com",
  "parsely.com",
  "crazyegg.com",
  "intercom.io",
  "hubspot.com",
];

/**
 * Removes tracking parameters from URLs.
 */
export function sanitizeUrl(urlStr: string, base: string = window.location.href): { cleanedUrl: string; purged: number } {
  if (!urlStr || urlStr.startsWith("#") || urlStr.startsWith("mailto:") || urlStr.startsWith("tel:")) {
    return { cleanedUrl: urlStr || "", purged: 0 };
  }

  try {
    const url = new URL(urlStr, base);
    let purged = 0;

    for (const param of TRACKING_URL_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        purged++;
      }
    }

    const allKeys = Array.from(url.searchParams.keys());
    for (const key of allKeys) {
      if (key.startsWith("utm_") || key.startsWith("track_") || key.startsWith("analytics_")) {
        url.searchParams.delete(key);
        purged++;
      }
    }

    return { cleanedUrl: url.toString(), purged };
  } catch {
    return { cleanedUrl: urlStr, purged: 0 };
  }
}

/**
 * Executes inside the target tab context to extract and sanitize the article.
 * Self-contained so Function.toString serialization in chrome.scripting.executeScript works flawlessly.
 */
export function extractPageContent(): ClippedArticle {
  const TRACKING_PARAMS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
    "fbclid", "gclid", "gclsrc", "dclid", "msclkid", "twclid", "ttclid", "mc_cid", "mc_eid",
    "si", "ref", "ref_src", "ref_url", "_hsenc", "_hsmi", "wickedid", "igshid", "srsltid", "yclid"
  ];

  const TRACKER_DOMAINS = [
    "google-analytics.com", "googletagmanager.com", "doubleclick.net", "facebook.com/tr",
    "facebook.net", "connect.facebook.net", "pixel.facebook.com", "analytics.twitter.com",
    "segment.com", "segment.io", "hotjar.com", "datadoghq-browser-agent.com", "criteo.com",
    "taboola.com", "outbrain.com", "clarity.ms", "mixpanel.com", "amplitude.com",
    "scorecardresearch.com", "quantserve.com", "chartbeat.com", "parsely.com", "crazyegg.com",
    "intercom.io", "hubspot.com"
  ];

  function cleanUrl(urlStr: string, base: string = window.location.href): { cleanedUrl: string; purged: number } {
    if (!urlStr || urlStr.startsWith("#") || urlStr.startsWith("mailto:") || urlStr.startsWith("tel:") || urlStr.startsWith("javascript:")) {
      return { cleanedUrl: urlStr || "", purged: 0 };
    }
    try {
      const url = new URL(urlStr, base);
      let purged = 0;
      for (const param of TRACKING_PARAMS) {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          purged++;
        }
      }
      for (const key of Array.from(url.searchParams.keys())) {
        if (key.startsWith("utm_") || key.startsWith("track_") || key.startsWith("analytics_")) {
          url.searchParams.delete(key);
          purged++;
        }
      }
      return { cleanedUrl: url.toString(), purged };
    } catch {
      return { cleanedUrl: urlStr, purged: 0 };
    }
  }

  try {
    const originalHtml = document.body ? document.body.innerHTML : "";
    const originalByteSize = new Blob([originalHtml]).size;

    let scriptsPurged = 0;
    let trackingPixelsPurged = 0;
    let trackingParamsPurged = 0;
    let inlineHandlersPurged = 0;
    let surveillanceElementsPurged = 0;
    const purgedTrackersSummary: string[] = [];

    // 1. Metadata Extraction
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute("content");
    const h1Text = document.querySelector("h1")?.textContent?.trim();
    const rawTitle = ogTitle || twitterTitle || h1Text || document.title || "Untitled Article";

    // Clean site suffixes from title (e.g. "Title - The Verge" -> "Title")
    const title = rawTitle.replace(/\s*[|\-–—]\s*[^|\-–—]+$/, "").trim();

    // Author
    const ogAuthor = document.querySelector('meta[name="author"]')?.getAttribute("content") ||
      document.querySelector('meta[property="article:author"]')?.getAttribute("content") ||
      document.querySelector('meta[name="twitter:creator"]')?.getAttribute("content") ||
      document.querySelector('[rel="author"]')?.textContent?.trim() ||
      document.querySelector('.byline, .author-name, .author, .post-author')?.textContent?.trim() ||
      "";
    const author = ogAuthor.replace(/^by\s+/i, "").trim() || window.location.hostname.replace("www.", "");

    // Excerpt
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") ||
      "";
    const excerpt = ogDesc.trim();

    // Canonical URL
    const canonicalTag = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const { cleanedUrl: canonicalUrl } = cleanUrl(canonicalTag || window.location.href);

    // Published Date
    const pubDate = document.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
      document.querySelector("time[datetime]")?.getAttribute("datetime") ||
      document.querySelector("time")?.textContent?.trim() ||
      new Date().toISOString();

    // Site Name
    const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") ||
      window.location.hostname.replace("www.", "");

    // Tags
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
    const tags: string[] = metaKeywords
      ? metaKeywords.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    document.querySelectorAll('a[href*="/tag/"], a[href*="/category/"], a[href*="/topic/"]').forEach((el) => {
      const text = el.textContent?.replace(/^#/, "").trim();
      if (text && text.length < 25 && !tags.includes(text)) {
        tags.push(text);
      }
    });

    // 2. Discover Content Root
    const candidateSelectors = [
      "article",
      '[role="main"]',
      "main",
      ".post-content",
      ".entry-content",
      ".article-body",
      ".article-content",
      ".story-content",
      ".gh-content",
      ".available-content",
      ".markup--post-full",
      ".caas-body",
      "#article-body",
      "#content",
    ];

    let bestContainer: HTMLElement | null = null;
    for (const selector of candidateSelectors) {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const pCount = el.querySelectorAll("p").length;
        if (pCount >= 2 || selector === ".available-content" || selector === ".gh-content") {
          bestContainer = el;
          break;
        }
      }
    }

    // Fallback if no container matched: use document.body
    const sourceNode = bestContainer || document.body;
    const clone = sourceNode.cloneNode(true) as HTMLElement;

    // 3. Purge Surveillance Elements, Scripts, Styles, and Ads
    const removeElements = (selector: string, reason: string) => {
      clone.querySelectorAll(selector).forEach((el) => {
        el.remove();
        surveillanceElementsPurged++;
        if (purgedTrackersSummary.length < 10 && !purgedTrackersSummary.includes(reason)) {
          purgedTrackersSummary.push(reason);
        }
      });
    };

    // Scripts & Styles
    clone.querySelectorAll("script, noscript, style, link[rel='stylesheet']").forEach((el) => {
      el.remove();
      scriptsPurged++;
    });
    if (scriptsPurged > 0) {
      purgedTrackersSummary.push(`Active Scripts & CSS Overlays (${scriptsPurged})`);
    }

    // Obvious non-content sections
    removeElements("nav, header, footer, aside, form, button, dialog, menu", "Page Nav & Interactive Modals");

    // Paywalls and subscription popups
    removeElements(
      ".paywall, .subscription-widget-wrap, .newsletter-signup, .pencraft-dialog, .gate-container, [class*='paywall'], [id*='paywall'], [class*='subscribe-gate'], .tp-modal, .fc-ab-root",
      "Paywall & Subscription Gate Overlays"
    );

    // Ad units and banners
    removeElements(
      ".ad, .ads, .advertisement, .ad-banner, [id*='google_ads'], [class*='taboola'], [class*='outbrain'], .sponsored, .outbrain, .taboola",
      "Third-Party Ad Networks & Sponsored Links"
    );

    // Social share buttons and comments
    removeElements(".share-dialog, .post-ufi, .like-button, .clap-button, .social-share, .comments, #comments", "Social Tracking Widgets");

    // Unsafe iframes (keep only youtube / vimeo)
    clone.querySelectorAll("iframe, object, embed").forEach((frame) => {
      const src = frame.getAttribute("src") || "";
      const isSafe = src.includes("youtube.com") || src.includes("youtube-nocookie.com") || src.includes("vimeo.com");
      if (!isSafe) {
        frame.remove();
        surveillanceElementsPurged++;
        if (!purgedTrackersSummary.includes("Tracking iFrames")) {
          purgedTrackersSummary.push("Tracking iFrames");
        }
      }
    });

    // Tracking Pixels & Telemetry Images
    clone.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      const width = parseInt(img.getAttribute("width") || "100", 10);
      const height = parseInt(img.getAttribute("height") || "100", 10);
      const style = img.getAttribute("style") || "";

      const isPixel = width <= 1 || height <= 1 || style.includes("display:none") || style.includes("visibility:hidden");
      const isTrackerDomain = TRACKER_DOMAINS.some((domain) => src.includes(domain));
      const isBeacon = /\/(tr|collect|pixel|beacon|telemetry|track|event)\b/i.test(src);

      if (isPixel || isTrackerDomain || isBeacon) {
        img.remove();
        trackingPixelsPurged++;
        if (!purgedTrackersSummary.includes("Invisible Tracking Pixels")) {
          purgedTrackersSummary.push("Invisible Tracking Pixels");
        }
      } else {
        // Make image URL absolute and scrub tracking params
        const { cleanedUrl, purged } = cleanUrl(src);
        img.setAttribute("src", cleanedUrl);
        trackingParamsPurged += purged;
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        img.removeAttribute("srcset");
      }
    });

    // Purge Inline Handlers and Data Telemetry Attributes
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on")) {
          el.removeAttribute(attr.name);
          inlineHandlersPurged++;
        } else if (
          name.startsWith("data-track") ||
          name.startsWith("data-analytics") ||
          name.startsWith("data-ga") ||
          name.startsWith("data-amplitude") ||
          name === "ping"
        ) {
          el.removeAttribute(attr.name);
          surveillanceElementsPurged++;
        }
      }
    });

    // Hyperlinks Sanitization
    clone.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href) {
        const { cleanedUrl, purged } = cleanUrl(href);
        a.setAttribute("href", cleanedUrl);
        trackingParamsPurged += purged;
        a.setAttribute("rel", "noopener noreferrer");
        a.setAttribute("target", "_blank");
      }
    });

    // Calculate text metrics
    const textContent = (clone.textContent || "").replace(/\s+/g, " ").trim();
    const wordCount = textContent ? textContent.split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const contentHtml = clone.innerHTML.trim();
    const cleanedByteSize = new Blob([contentHtml]).size;
    const totalPurged = scriptsPurged + trackingPixelsPurged + trackingParamsPurged + inlineHandlersPurged + surveillanceElementsPurged;

    const telemetry: ClipperTelemetry = {
      scriptsPurged,
      trackingPixelsPurged,
      trackingParamsPurged,
      inlineHandlersPurged,
      surveillanceElementsPurged,
      totalPurged,
      originalByteSize,
      cleanedByteSize,
      wordCount,
      readingTimeMinutes,
      purgedTrackersSummary,
    };

    return {
      title,
      author,
      excerpt,
      contentHtml,
      textContent,
      canonicalUrl,
      publishedAt: pubDate,
      siteName,
      tags: tags.slice(0, 6),
      wordCount,
      readingTimeMinutes,
      telemetry,
    };
  } catch (err: any) {
    // Robust fallback: if full DOM tree cleanup fails on dynamic JS app
    const fallbackTitle = document.querySelector("h1")?.textContent?.trim() || document.title || "Untitled Document";
    const fallbackText = (document.body ? document.body.innerText : "").trim();
    const words = fallbackText ? fallbackText.split(/\s+/).length : 0;
    return {
      title: fallbackTitle,
      author: window.location.hostname.replace("www.", ""),
      excerpt: fallbackText.slice(0, 200),
      contentHtml: `<article><h1>${fallbackTitle}</h1><p>${fallbackText.replace(/\n\n+/g, "</p><p>")}</p></article>`,
      textContent: fallbackText,
      canonicalUrl: window.location.href,
      publishedAt: new Date().toISOString(),
      siteName: window.location.hostname.replace("www.", ""),
      tags: ["web-archive"],
      wordCount: words,
      readingTimeMinutes: Math.max(1, Math.ceil(words / 200)),
      telemetry: {
        scriptsPurged: 0,
        trackingPixelsPurged: 0,
        trackingParamsPurged: 0,
        inlineHandlersPurged: 0,
        surveillanceElementsPurged: 0,
        totalPurged: 0,
        originalByteSize: fallbackText.length,
        cleanedByteSize: fallbackText.length,
        wordCount: words,
        readingTimeMinutes: Math.max(1, Math.ceil(words / 200)),
        purgedTrackersSummary: ["Emergency Text Fallback"],
      },
    };
  }
}
