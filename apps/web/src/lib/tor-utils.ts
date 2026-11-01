/**
 * Sovereign Tor v3 Onion Routing Utilities
 */

/**
 * Checks if the current page was loaded over a native .onion hidden service
 */
export function isAccessingViaOnion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.onion');
}

/**
 * Copies the .onion URL to user clipboard
 */
export async function copyOnionUrl(onionUrl: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(onionUrl);
      return true;
    }
    // Fallback for non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = onionUrl;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy onion URL to clipboard:', err);
    return false;
  }
}

/**
 * Extracts pure .onion address from a full URL
 * Example: "http://pressprotocol...onion/read/bafy..." -> "pressprotocol...onion"
 */
export function extractOnionAddress(onionUrl: string): string {
  if (!onionUrl) return '';
  const cleaned = onionUrl.replace(/^https?:\/\//i, '');
  return cleaned.split('/')[0] || '';
}

/**
 * Formats a 56-character v3 onion address for compact editorial display
 * Example: "<56-char-v3-address>.onion" -> "abcdefghij...uvwxyz.onion"
 */
export function formatOnionDisplay(onionUrl: string): string {
  const host = extractOnionAddress(onionUrl);
  if (!host) return 'tor.onion';
  if (host.length <= 20) return host;
  const base = host.replace(/\.onion$/i, '');
  return `${base.slice(0, 10)}...${base.slice(-6)}.onion`;
}

/** Tor v3 onion hosts are 56 base32 characters followed by ".onion". */
const ONION_V3_HOST = /^[a-z2-7]{56}\.onion$/;

/**
 * Normalizes and validates a configured onion host (with or without scheme/path).
 * Returns null when the value is not a well-formed Tor v3 address.
 */
export function normalizeOnionHost(value?: string | null): string | null {
  if (!value) return null;
  const host = extractOnionAddress(value.trim().toLowerCase());
  return ONION_V3_HOST.test(host) ? host : null;
}

/**
 * Tor routing is served by the PressProtocol node. Until a node with a hidden service is
 * deployed and NEXT_PUBLIC_TOR_ONION_HOST is set, Tor mirrors are reported as unavailable.
 */
export function isTorRoutingEnabled(): boolean {
  return normalizeOnionHost(process.env.NEXT_PUBLIC_TOR_ONION_HOST) !== null;
}

/**
 * Resolves the Tor v3 onion URL for a CID, or null when no real onion service is configured.
 */
export function getCanonicalOnionUrl(cid: string, configuredUrl?: string | null): string | null {
  const configuredHost = normalizeOnionHost(configuredUrl);
  if (configuredHost && configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `http://${configuredUrl.replace(/^\/+/, "")}`;
  }
  const envHost = normalizeOnionHost(process.env.NEXT_PUBLIC_TOR_ONION_HOST);
  return envHost ? `http://${envHost}/read/${encodeURIComponent(cid)}` : null;
}

/**
 * Opens the link directly if in Tor Browser or copies it safely without triggering DNS error tabs in regular browsers
 */
export function openInTorBrowser(onionUrl: string): { openedInNativeTor: boolean; copied: boolean } {
  if (typeof window === 'undefined') return { openedInNativeTor: false, copied: false };
  if (isAccessingViaOnion()) {
    window.open(onionUrl, '_blank', 'noopener,noreferrer');
    return { openedInNativeTor: true, copied: false };
  } else {
    // Standard browsers (Chrome, Safari) cannot resolve .onion TLDs via DNS.
    // Copy to clipboard rather than launching an erroring tab in clearnet browser.
    copyOnionUrl(onionUrl);
    return { openedInNativeTor: false, copied: true };
  }
}

/**
 * Native mobile / desktop Web Share API wrapper
 */
export function shareOnionUrl(onionUrl: string, title: string): void {
  if (typeof window !== 'undefined' && navigator.share) {
    navigator.share({
      title: `${title} — PressProtocol (Tor v3)`,
      text: `Access this dispatch censorship-free via Tor Browser: ${onionUrl}`,
      url: onionUrl,
    }).catch(() => {
      copyOnionUrl(onionUrl);
    });
  } else {
    copyOnionUrl(onionUrl);
  }
}
