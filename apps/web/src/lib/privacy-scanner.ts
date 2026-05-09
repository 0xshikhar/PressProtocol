/**
 * PressProtocol Privacy & Surveillance Tracker Scanner
 * Fast in-browser scanner detecting tracking parameters, surveillance pixels,
 * and ad-network beacons in drafts before cryptographic signing.
 */

export interface TrackerIssue {
  type: "query_param" | "tracker_domain" | "insecure_http";
  label: string;
  found: string;
  recommendation: string;
}

export interface PrivacyScanResult {
  isClean: boolean;
  score: number; // 0 - 100
  issuesCount: number;
  issues: TrackerIssue[];
  trackerParamsCount: number;
  trackerDomainsCount: number;
}

const INVASIVE_QUERY_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
  "mc_eid",
  "yclid",
  "_hsenc",
  "_openstat",
  "igshid",
  "si",
  "ref_src",
  "twclid",
];

const KNOWN_SURVEILLANCE_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.net",
  "connect.facebook.net",
  "pixel.facebook.com",
  "analytics.twitter.com",
  "segment.com",
  "segment.io",
  "hotjar.com",
  "criteo.com",
  "clarity.ms",
  "mixpanel.com",
  "amplitude.com",
];

/**
 * Scans content for tracking parameters and surveillance elements.
 */
export function scanContentPrivacy(content: string): PrivacyScanResult {
  if (!content || !content.trim()) {
    return {
      isClean: true,
      score: 100,
      issuesCount: 0,
      issues: [],
      trackerParamsCount: 0,
      trackerDomainsCount: 0,
    };
  }

  const issues: TrackerIssue[] = [];
  let trackerParamsCount = 0;
  let trackerDomainsCount = 0;

  // 1. Check for invasive URL query parameters
  for (const param of INVASIVE_QUERY_PARAMS) {
    const regex = new RegExp(`[?&](${param}=[^"\\s&']+)`, "gi");
    let match;
    while ((match = regex.exec(content)) !== null) {
      trackerParamsCount++;
      issues.push({
        type: "query_param",
        label: `Tracking parameter detected: ${param}`,
        found: match[1],
        recommendation: `Strip '?${match[1]}' to preserve reader anonymity`,
      });
    }
  }

  // 2. Check for known surveillance & analytics domains
  for (const domain of KNOWN_SURVEILLANCE_DOMAINS) {
    const regex = new RegExp(`https?://[a-zA-Z0-9.-]*${domain.replace(".", "\\.")}[^"\\s']*`, "gi");
    let match;
    while ((match = regex.exec(content)) !== null) {
      trackerDomainsCount++;
      issues.push({
        type: "tracker_domain",
        label: `Surveillance domain referenced: ${domain}`,
        found: match[0],
        recommendation: `Remove or mirror external surveillance beacons`,
      });
    }
  }

  // Calculate privacy score
  const deductions = trackerParamsCount * 15 + trackerDomainsCount * 25;
  const score = Math.max(0, 100 - deductions);
  const isClean = issues.length === 0;

  return {
    isClean,
    score,
    issuesCount: issues.length,
    issues,
    trackerParamsCount,
    trackerDomainsCount,
  };
}

/**
 * Cleanses tracking query parameters from all URLs in the content string.
 * Preserves the base URL and legitimate content parameters.
 */
export function cleanseTrackersFromContent(content: string): {
  cleanContent: string;
  cleansedCount: number;
} {
  if (!content) return { cleanContent: "", cleansedCount: 0 };

  let cleansedCount = 0;
  let cleanContent = content;

  // Pattern matching URLs inside quotes or whitespace
  const urlPattern = /(https?:\/\/[^\s"'>)]+)/gi;

  cleanContent = cleanContent.replace(urlPattern, (fullUrl) => {
    try {
      // Decode HTML entities if any
      const decodedUrl = fullUrl.replace(/&amp;/g, "&");
      const urlObj = new URL(decodedUrl);
      let changed = false;

      for (const param of INVASIVE_QUERY_PARAMS) {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.delete(param);
          cleansedCount++;
          changed = true;
        }
      }

      if (changed) {
        return urlObj.toString();
      }
    } catch {
      // Fallback regex strip if not a standard parseable URL
      for (const param of INVASIVE_QUERY_PARAMS) {
        const pRegex = new RegExp(`([?&])${param}=[^&\\s"'>)]*(&?)`, "gi");
        if (pRegex.test(fullUrl)) {
          fullUrl = fullUrl.replace(pRegex, (m, prefix, suffix) => {
            cleansedCount++;
            return prefix === "?" && suffix ? "?" : "";
          });
        }
      }
    }
    return fullUrl;
  });

  return {
    cleanContent,
    cleansedCount,
  };
}
