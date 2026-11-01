/**
 * Server-side IPFS gateway configuration.
 * An optional dedicated gateway (e.g. Pinata) is read from environment variables only.
 */

export const PUBLIC_IPFS_GATEWAYS = [
  "https://ipfs.filebase.io/ipfs",
  "https://4everland.io/ipfs",
  "https://nftstorage.link/ipfs",
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://dweb.link/ipfs",
] as const;

export interface GatewayCandidate {
  base: string;
  headers: Record<string, string>;
}

export function getIpfsGatewayCandidates(): GatewayCandidate[] {
  const dedicated = process.env.PINATA_GATEWAY_URL?.replace(/\/+$/, "");
  const token = process.env.PINATA_GATEWAY_TOKEN;
  const candidates: GatewayCandidate[] = dedicated
    ? [{ base: dedicated, headers: token ? { "x-pinata-gateway-token": token } : {} }]
    : [];
  return [...candidates, ...PUBLIC_IPFS_GATEWAYS.map((base) => ({ base, headers: {} }))];
}
