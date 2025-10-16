/**
 * Tor Browser Detection and Utilities
 */

export function isTorBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Tor Browser user agent
  const ua = window.navigator.userAgent;
  return ua.includes('Tor Browser');
}

export function openInTorBrowser(onionUrl: string): void {
  if (isTorBrowser()) {
    // Already in Tor Browser, just open
    window.open(onionUrl, '_blank');
  } else {
    // Not in Tor Browser, show instructions
    const message = `To access this .onion address, you need Tor Browser.\n\n` +
      `1. Download Tor Browser: https://www.torproject.org/download/\n` +
      `2. Copy this URL: ${onionUrl}\n` +
      `3. Paste and open it in Tor Browser`;
    
    alert(message);
  }
}

export function copyOnionUrl(onionUrl: string): Promise<void> {
  return navigator.clipboard.writeText(onionUrl);
}

export function generateTor2webUrl(onionUrl: string): string {
  // Convert .onion to tor2web gateway for non-Tor users
  // Note: tor2web gateways are less secure but allow clearnet access
  const onionAddress = onionUrl.replace('http://', '').replace('https://', '').split('/')[0];
  return `https://${onionAddress}.tor2web.io`;
}

export function extractOnionAddress(onionUrl: string): string {
  // Extract just the .onion address from full URL
  return onionUrl.replace('http://', '').replace('https://', '').split('/')[0];
}

export function shareOnionUrl(onionUrl: string, title: string): void {
  if (navigator.share) {
    navigator.share({
      title: `${title} - AnonPress (Tor)`,
      text: `Access this content securely via Tor Browser: ${onionUrl}`,
      url: onionUrl,
    }).catch(err => console.log('Share cancelled', err));
  } else {
    // Fallback: copy to clipboard
    copyOnionUrl(onionUrl);
  }
}
