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
 * Example: "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion" -> "pressproto...5v3.onion"
 */
export function formatOnionDisplay(onionUrl: string): string {
  const host = extractOnionAddress(onionUrl);
  if (!host) return 'tor.onion';
  if (host.length <= 20) return host;
  const base = host.replace(/\.onion$/i, '');
  return `${base.slice(0, 10)}...${base.slice(-6)}.onion`;
}

/**
 * Opens the link directly if in Tor Browser or displays instruction
 */
export function openInTorBrowser(onionUrl: string): void {
  if (typeof window === 'undefined') return;
  if (isAccessingViaOnion()) {
    window.open(onionUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Attempt standard navigation while copying to clipboard
    copyOnionUrl(onionUrl);
    window.open(onionUrl, '_blank', 'noopener,noreferrer');
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
