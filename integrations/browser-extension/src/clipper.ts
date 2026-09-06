/**
 * PressProtocol Sovereign Web Clipper - In-Browser Readability & De-Surveillance Engine
 * Extracts pristine article metadata and editorial body from any webpage, purges tracking beacons,
 * paywall blockers, multi-chapter infinite scroll noise, video overlays, and ads, and yields pristine HTML
 * ready for decentralized IPFS preservation.
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

/**
 * Removes tracking parameters from URLs.
 */
export function sanitizeUrl(
  urlStr: string,
  base: string = typeof window !== "undefined" && window.location?.href ? window.location.href : "https://pressprotocol.com/"
): { cleanedUrl: string; purged: number } {
  if (!urlStr || urlStr.startsWith("#") || urlStr.startsWith("mailto:") || urlStr.startsWith("tel:") || urlStr.startsWith("javascript:")) {
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
 * Completely self-contained so Function.toString serialization in chrome.scripting.executeScript works flawlessly.
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

    // 1. Schema.org JSON-LD Metadata Inspection
    let jsonLdAuthor = "";
    let jsonLdTitle = "";
    let jsonLdDate = "";
    let jsonLdExcerpt = "";
    const jsonLdTags: string[] = [];

    const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldScripts.forEach((script) => {
      try {
        const rawJson = script.textContent ? JSON.parse(script.textContent) : null;
        if (!rawJson) return;
        const items = Array.isArray(rawJson) ? rawJson : (rawJson["@graph"] && Array.isArray(rawJson["@graph"]) ? rawJson["@graph"] : [rawJson]);
        for (const item of items) {
          if (item["@type"] && /Article|Posting|Report|Story|News|Blog|WebPage/i.test(String(item["@type"]))) {
            if (item.headline && !jsonLdTitle) jsonLdTitle = String(item.headline).trim();
            if (item.name && !jsonLdTitle) jsonLdTitle = String(item.name).trim();
            if (item.datePublished && !jsonLdDate) jsonLdDate = String(item.datePublished).trim();
            if (item.description && !jsonLdExcerpt) jsonLdExcerpt = String(item.description).trim();
            if (item.author && !jsonLdAuthor) {
              if (typeof item.author === "string") {
                jsonLdAuthor = item.author.trim();
              } else if (Array.isArray(item.author) && item.author[0]?.name) {
                jsonLdAuthor = String(item.author[0].name).trim();
              } else if (item.author.name) {
                jsonLdAuthor = String(item.author.name).trim();
              }
            }
            if (item.keywords) {
              const kw = Array.isArray(item.keywords) ? item.keywords : String(item.keywords).split(",");
              kw.forEach((k: any) => {
                const cleanK = String(k).trim();
                if (cleanK && cleanK.length < 30 && !jsonLdTags.includes(cleanK)) {
                  jsonLdTags.push(cleanK);
                }
              });
            }
          }
        }
      } catch {}
    });

    // 2. Metadata Extraction Cascade
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute("content");
    const docTitle = document.title || "";

    // Candidate title
    let rawTitle = jsonLdTitle || ogTitle || twitterTitle || "";
    if (!rawTitle) {
      const firstH1 = document.querySelector("h1");
      rawTitle = firstH1?.textContent?.trim() || docTitle || "Untitled Article";
    }

    // Clean publication suffixes
    let title = rawTitle
      .replace(/\s*[|\-–—]\s*(?:by\s+[^|\-–—]+|Gates Notes|Medium|Substack|The Verge|TechCrunch|Wired|Reuters|Bloomberg|Ars Technica|The New York Times|BBC News|The Guardian).*$/i, "")
      .replace(/\s*[|\-–—]\s*[^|\-–—]+$/, "")
      .trim() || rawTitle;

    // Author Cascade
    const ogAuthor = document.querySelector('meta[name="author"]')?.getAttribute("content") ||
      document.querySelector('meta[property="article:author"]')?.getAttribute("content") ||
      document.querySelector('meta[name="twitter:creator"]')?.getAttribute("content") ||
      document.querySelector('.ArtAuthName, [class*="author-name" i], [class*="byline" i], [rel="author"], [data-testid="authorName"]')?.textContent?.trim() ||
      "";

    const titleAuthorMatch = rawTitle.match(/(?:by|author:?)\s+([^|\-–—]+)/i);
    const titleAuthor = titleAuthorMatch ? titleAuthorMatch[1].trim() : "";

    const author = jsonLdAuthor ||
      (ogAuthor ? ogAuthor.replace(/^by\s+/i, "").trim() : "") ||
      titleAuthor ||
      window.location.hostname.replace("www.", "");

    // Excerpt Cascade
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") ||
      document.querySelector('.ArtDesc, .subtitle, .summary, [class*="lead" i]')?.textContent?.trim() ||
      jsonLdExcerpt ||
      "";
    const excerpt = ogDesc.trim();

    // Canonical URL
    const canonicalTag = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const { cleanedUrl: canonicalUrl } = cleanUrl(canonicalTag || window.location.href);

    // Published Date
    const pubDate = jsonLdDate ||
      document.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
      document.querySelector("time[datetime]")?.getAttribute("datetime") ||
      document.querySelector("time")?.textContent?.trim() ||
      new Date().toISOString();

    // Site Name
    const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") ||
      window.location.hostname.replace("www.", "");

    // Tags
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
    const tags: string[] = Array.from(
      new Set([
        ...jsonLdTags,
        ...(metaKeywords ? metaKeywords.split(",").map((t) => t.trim()).filter(Boolean) : []),
      ])
    );
    document.querySelectorAll('a[href*="/tag/"], a[href*="/category/"], a[href*="/topic/"]').forEach((el) => {
      const text = el.textContent?.replace(/^#/, "").trim();
      if (text && text.length < 25 && !tags.includes(text)) {
        tags.push(text);
      }
    });

    // 3. IDENTIFY TARGET HEADLINE & SCOPED CONTAINER (Multi-Chapter / Infinite Scroll aware)
    const currentPath = window.location.pathname;
    const urlSlugMatch = currentPath.match(/\/([^\/?#]+)$/);
    const urlSlug = urlSlugMatch ? urlSlugMatch[1].toLowerCase() : "";
    const urlSlugUnderscore = urlSlug.replace(/-/g, "_");

    // Look for container explicitly bound to current chapter/slug (e.g. GatesNotes reader chapters)
    let scopedRoot: HTMLElement | null = null;
    if (urlSlug && urlSlug.length > 3) {
      const slugElement = document.querySelector<HTMLElement>(
        `[id*="${urlSlug}" i], [id*="${urlSlugUnderscore}" i], [class*="${urlSlug}" i]`
      );
      if (slugElement) {
        const candidateParent = slugElement.closest<HTMLElement>(
          'article, section, .ReaderShift, [class*="chapter" i], [class*="article" i]'
        );
        scopedRoot = candidateParent || slugElement;
      }
    }

    const searchScope = scopedRoot || document.body;

    // Find Target H1
    const allH1s = Array.from(searchScope.querySelectorAll<HTMLElement>("h1"));
    let targetH1: HTMLElement | null = null;
    if (allH1s.length === 1) {
      targetH1 = allH1s[0];
    } else if (allH1s.length > 1) {
      let bestH1Score = -1;
      const normTitleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      allH1s.forEach((h1) => {
        const text = (h1.textContent || "").toLowerCase().replace(/[^a-z0-9\s]/g, "");
        let score = 0;
        normTitleWords.forEach((word) => {
          if (word.length > 2 && text.includes(word)) score += 10;
        });
        if (urlSlug && text.includes(urlSlug.replace(/[-_]/g, " "))) score += 25;
        if (score > bestH1Score) {
          bestH1Score = score;
          targetH1 = h1;
        }
      });
    }

    // 4. FIND ARTICLE BODY CONTAINER
    let bestContainer: HTMLElement | null = null;

    const prioritySelectors = [
      ".ArtBody",
      '[class*="ArtBody" i]',
      ".article-body",
      '[class*="article-body" i]',
      ".post-content",
      '[class*="post-content" i]',
      ".entry-content",
      '[class*="entry-content" i]',
      ".story-content",
      '[class*="story-content" i]',
      ".gh-content",
      ".available-content",
      ".markup--post-full",
      ".caas-body",
      ".articleHolder",
      "article",
      '[role="main"] article',
      "main article",
      '[role="main"]',
      "main",
      "#article-body",
      "#content",
    ];

    let maxScore = 0;
    for (const sel of prioritySelectors) {
      const candidates = searchScope.querySelectorAll<HTMLElement>(sel);
      candidates.forEach((el) => {
        if (el.closest("header, nav, footer, aside, .siteHeader, .expandedMenu, .CommentsHolder, #CommentsHolder")) {
          return;
        }
        const paragraphs = el.querySelectorAll("p");
        let pTextLen = 0;
        paragraphs.forEach((p) => {
          pTextLen += (p.textContent || "").trim().length;
        });
        const links = el.querySelectorAll("a");
        let linkTextLen = 0;
        links.forEach((a) => {
          linkTextLen += (a.textContent || "").trim().length;
        });
        const linkDensity = pTextLen > 0 ? (linkTextLen / pTextLen) : 1;
        if (linkDensity > 0.35) return;

        const score = (paragraphs.length * 20) + Math.min(pTextLen / 20, 800) - (linkDensity * 300);
        if (score > maxScore) {
          maxScore = score;
          bestContainer = el;
        }
      });
      if (bestContainer && maxScore >= 200) break;
    }

    // Ascendant fallback from targetH1
    if (!bestContainer && targetH1) {
      let curr: HTMLElement | null = (targetH1 as HTMLElement).parentElement;
      while (curr && curr !== document.body && curr !== searchScope) {
        const pCount = curr.querySelectorAll("p").length;
        if (pCount >= 3) {
          bestContainer = curr;
          break;
        }
        curr = curr.parentElement;
      }
    }

    const sourceNode = bestContainer || searchScope || document.body;
    const clone = sourceNode.cloneNode(true) as HTMLElement;

    // 5. PURGE SIBLING ARTICLES / INFINITE SCROLL BLEED
    clone.querySelectorAll<HTMLElement>('[id^="reader_"], .ReaderShift, [class*="next-story" i], [class*="infinite-scroll" i], [class*="post-preview" i]').forEach((sibling) => {
      if (sibling !== clone) {
        sibling.remove();
        surveillanceElementsPurged++;
      }
    });

    // 6. TRANSFORM QUOTES AND CALLOUTS INTO SEMANTIC HTML
    // Article Quote Holders
    clone.querySelectorAll<HTMLElement>('.ArticleQuoteHolder, [class*="quote-holder" i], [class*="pullquote" i]').forEach((holder) => {
      const quoteBody = holder.querySelector<HTMLElement>('.ArticleQuoteBody, p, blockquote');
      const text = quoteBody?.textContent?.trim() || holder.textContent?.trim() || "";
      if (text) {
        const bq = document.createElement("blockquote");
        bq.innerHTML = `<p>${text}</p>`;
        holder.replaceWith(bq);
      } else {
        holder.remove();
      }
    });

    // Callout / Note Boxes
    clone.querySelectorAll<HTMLElement>('.NoteItem, [class*="callout" i], [class*="note-box" i]').forEach((box) => {
      const titleEl = box.querySelector<HTMLElement>('.NoteItemTitle, [class*="title" i], [class*="heading" i]');
      const eyebrowEl = box.querySelector<HTMLElement>('.NoteItemEyebrow, [class*="eyebrow" i]');
      const titleText = titleEl?.textContent?.trim() || "";
      const eyebrowText = eyebrowEl?.textContent?.trim() || "";
      const bodyText = box.textContent?.trim() || "";

      if (titleText || eyebrowText) {
        const bq = document.createElement("blockquote");
        const heading = eyebrowText ? `<strong>${eyebrowText}</strong>: ` : "";
        bq.innerHTML = `<p>${heading}${titleText || bodyText}</p>`;
        box.replaceWith(bq);
      }
    });

    // 7. PURGE SURVEILLANCE, SCRIPTS, STYLES, UI CHROME, AND INTERACTIVE OVERLAYS
    const removeElements = (selector: string, reason: string) => {
      clone.querySelectorAll(selector).forEach((el) => {
        const elTextLen = (el.textContent || "").length;
        const totalLen = (clone.textContent || "").length;
        if (totalLen > 0 && elTextLen / totalLen > 0.6) return;

        el.remove();
        surveillanceElementsPurged++;
        if (purgedTrackersSummary.length < 10 && !purgedTrackersSummary.includes(reason)) {
          purgedTrackersSummary.push(reason);
        }
      });
    };

    // Scripts, Styles, and Links
    clone.querySelectorAll("script, noscript, style, link[rel='stylesheet']").forEach((el) => {
      el.remove();
      scriptsPurged++;
    });
    if (scriptsPurged > 0) {
      purgedTrackersSummary.push(`Active Scripts & CSS Overlays (${scriptsPurged})`);
    }

    // Structural Navigation & Interactive Controls
    removeElements(
      "nav, header, footer, aside, form, button, dialog, menu, select, textarea, input",
      "Page Nav & Interactive Modals"
    );

    // Site Headers, Burger Menus & Dropdowns
    removeElements(
      ".siteHeader, .siteHeaderInner, .siteHeaderExpandedDesktop, .siteHeaderExpandedMobile, .expandedMenus, .expandedMenu, .SiteSections, [class*='siteHeader'], [class*='site-header'], [class*='navbar'], [class*='nav-menu'], [class*='drawer']",
      "Site Headers & Navigation Drawers"
    );

    // Comments & Discussion Holders
    removeElements(
      "#CommentsHolder, .CommentsHolder, .CommentsHolderBottomContent, .threaded-comments, [class*='comment-box'], [class*='comments-section'], [id*='disqus'], [class*='disqus']",
      "Comments & Discussion Overlays"
    );

    // Video Players, Lightboxes & Media Controls
    removeElements(
      ".inlineVideoHolder, .LI_VideoHolder, .LI_VideoIcons, .lightBoxControls, .lightBoxProgress, .lightBoxCenter, .lightBoxFullscreen, .lightBoxCaptions, .lightBoxVolume, .video-modal-overlay, [class*='lightbox'], [class*='video-controls'], c4d-video-cta-container, c4d-lightbox-video-player-container",
      "Interactive Video Player Controls & Overlays"
    );

    // Cookie Banners & Consent Modals
    removeElements(
      "#truste_consent_track, #truste_domain_list, #consent_blackbar, [id*='trustarc'], [id*='onetrust'], [class*='cookie-banner'], [id*='cookie-banner'], [class*='consent-modal'], #onetrust-consent-sdk, .cc-window, .didomi-popup-container, [id*='cookie'], [class*='cookie-consent']",
      "Cookie Consent & Tracking Banners"
    );

    // Paywalls, Subscriptions, and Newsletter Signups
    removeElements(
      ".paywall, .subscription-widget-wrap, .newsletter-signup, .pencraft-dialog, .gate-container, [class*='paywall'], [id*='paywall'], [class*='subscribe-gate'], .tp-modal, .fc-ab-root, .MenuCardSU, .SignUpMenuButton, [class*='signup']",
      "Paywall & Newsletter Subscription Overlays"
    );

    // Ads and Sponsored Links
    removeElements(
      ".ad, .ads, .advertisement, .ad-banner, [id*='google_ads'], [class*='taboola'], [class*='outbrain'], .sponsored, .outbrain, .taboola",
      "Third-Party Ad Networks & Sponsored Links"
    );

    // Social Sharing Modals & Buttons
    removeElements(
      ".Share-modal, .buttonShare, .primaryButton, .buttonComments, .articleEnd, .share-dialog, .post-ufi, .like-button, .clap-button, .social-share, [class*='share-modal'], [class*='share-button']",
      "Social Sharing & Interaction Buttons"
    );

    // Empty Placeholders & Spacers
    removeElements(
      ".ItemPlaceHolder, [id^='ph_'], .TopicTimelineSpacer, .ArticleTopSpacer, .ArticleSeperator, .htmlBlockHolder",
      "Empty Layout Placeholders & Spacers"
    );

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

    // Remove all SVGs
    clone.querySelectorAll("svg").forEach((svg) => {
      svg.remove();
      surveillanceElementsPurged++;
    });

    // 8. STRICT IMAGE DE-NOISING & EDITORIAL PRESERVATION
    clone.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      const alt = (img.getAttribute("alt") || "").toLowerCase();
      const cls = (img.className || "").toLowerCase();
      const width = parseInt(img.getAttribute("width") || "100", 10);
      const height = parseInt(img.getAttribute("height") || "100", 10);

      const isIconPattern = /\b(icon|logo|avatar|close|arrow|play|pause|check|quote|search|hamburger|menu|share|comment|btn|button|dot)\b/i;
      const isSvgFile = /\.svg(?:\?|$)/i.test(src);
      const isTiny = (width > 0 && width <= 64) || (height > 0 && height <= 64);
      const isPixel = width <= 1 || height <= 1;
      const isTrackerDomain = TRACKER_DOMAINS.some((d) => src.includes(d));
      const isBeacon = /\/(tr|collect|pixel|beacon|telemetry|track|event)\b/i.test(src);

      if (isPixel || isTrackerDomain || isBeacon) {
        img.remove();
        trackingPixelsPurged++;
        if (!purgedTrackersSummary.includes("Invisible Tracking Pixels")) {
          purgedTrackersSummary.push("Invisible Tracking Pixels");
        }
      } else if (isSvgFile || isIconPattern.test(cls) || isIconPattern.test(alt) || isIconPattern.test(src) || isTiny) {
        img.remove();
        surveillanceElementsPurged++;
      } else {
        const { cleanedUrl, purged } = cleanUrl(src);
        img.setAttribute("src", cleanedUrl);
        trackingParamsPurged += purged;
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.removeAttribute("data-nimg");
      }
    });

    // 9. PURGE INLINE STYLES, HANDLERS, & DATA ATTRIBUTES
    clone.querySelectorAll("*").forEach((el) => {
      if (el.hasAttribute("style")) {
        el.removeAttribute("style");
      }

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
          name.startsWith("data-nimg") ||
          name.startsWith("data-artid") ||
          name.startsWith("data-shown") ||
          name === "ping"
        ) {
          el.removeAttribute(attr.name);
          surveillanceElementsPurged++;
        }
      }
    });

    // 10. HYPERLINKS SANITIZATION & PROMO BLOCK PRUNING
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

    // 11. REMOVE EMPTY TAGS & DEDUPLICATE H1
    clone.querySelectorAll("p, div, span, blockquote").forEach((el) => {
      if (el.children.length === 0 && !el.textContent?.trim()) {
        el.remove();
      }
    });

    const firstChildH1 = clone.querySelector("h1");
    if (firstChildH1) {
      const h1Text = (firstChildH1.textContent || "").trim().toLowerCase();
      const normTitle = title.trim().toLowerCase();
      if (h1Text === normTitle || (normTitle.length > 5 && h1Text.includes(normTitle.slice(0, 20)))) {
        firstChildH1.remove();
      }
    }

    // Calculate text metrics strictly from cleaned article
    const textContent = (clone.textContent || "").replace(/\s+/g, " ").trim();
    const wordCount = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0;
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
    const fallbackTitle = document.querySelector("h1")?.textContent?.trim() || document.title || "Untitled Document";
    const fallbackText = (document.body ? document.body.innerText : "").trim();
    const words = fallbackText ? fallbackText.split(/\s+/).filter(Boolean).length : 0;
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
