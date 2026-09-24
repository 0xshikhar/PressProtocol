import { validateTorV3Address, deriveTorV3Address, type TorV3ValidationResult } from "@pressprotocol/sdk";

export { validateTorV3Address, deriveTorV3Address, type TorV3ValidationResult };

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
 * Example: "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion" -> "jcqyihxqjo...m3jnqd.onion"
 */
export function formatOnionDisplay(onionUrl: string): string {
  const host = extractOnionAddress(onionUrl);
  if (!host) return 'tor.onion';
  if (host.length <= 20) return host;
  const base = host.replace(/\.onion$/i, '');
  return `${base.slice(0, 10)}...${base.slice(-6)}.onion`;
}

/**
 * Resolves a canonical Tor v3 onion URL for a given CID with cryptographic v3 validation
 */
export function getCanonicalOnionUrl(cid: string, configuredUrl?: string): string {
  // 1. Check configured URL from API / mirror probe
  if (configuredUrl && configuredUrl.includes(".onion")) {
    const rawHost = extractOnionAddress(configuredUrl);
    const validation = validateTorV3Address(rawHost);
    if (validation.isValid) {
      const normalizedHost = rawHost.endsWith(".onion") ? rawHost : `${rawHost}.onion`;
      return `http://${normalizedHost}/read/${cid}`;
    }
  }

  // 2. Check dynamic environment host
  const envHost = process.env.NEXT_PUBLIC_TOR_ONION_HOST;
  if (envHost) {
    const rawHost = extractOnionAddress(envHost);
    const validation = validateTorV3Address(rawHost);
    if (validation.isValid) {
      const normalizedHost = rawHost.endsWith(".onion") ? rawHost : `${rawHost}.onion`;
      return `http://${normalizedHost}/read/${cid}`;
    }
  }

  // 3. Fallback to verified canonical Ed25519 Tor v3 address seed
  const canonicalSeedHost = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion";
  return `http://${canonicalSeedHost}/read/${cid}`;
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
