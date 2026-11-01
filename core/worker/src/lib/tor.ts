const ONION_V3_HOST = /^[a-z2-7]{56}\.onion$/;

/**
 * Returns the configured Tor v3 onion host, or null when Tor routing is disabled.
 * Tor is served by the PressProtocol node; until a node with a hidden service is deployed,
 * TOR_ONION_GATEWAY stays unset and no Tor mirror or Onion-Location header is advertised.
 */
export function getOnionHost(configured?: string): string | null {
  const host = (configured || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  return ONION_V3_HOST.test(host) ? host : null;
}

export function onionReadUrl(host: string | null, cid: string): string | null {
  return host ? `http://${host}/read/${cid}` : null;
}
