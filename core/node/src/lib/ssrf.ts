/**
 * SSRF (Server-Side Request Forgery) Protection Utility
 * Defends against CWE-918 by ensuring user-supplied URLs cannot target
 * internal networks or cloud metadata endpoints unless explicitly operating
 * in sovereign self-host or local development mode.
 *
 * Security Model (Approach 2: Dual Mode with Cloud Invariant):
 * - Cloud metadata (169.254.169.254) and non-HTTP protocols (file://) are UNCONDITIONALLY BLOCKED.
 * - Private subnets (RFC 1918) and localhost are BLOCKED by default on public hosted gateways,
 *   but PERMITTED when ALLOW_PRIVATE_NETWORK_FETCH=true or NODE_ENV=development for sovereign nodes.
 * - Enforces DNS resolution verification to defend against DNS rebinding attacks.
 */

import { isIP } from "node:net";
import dns from "node:dns/promises";

// Cloud metadata and reserved addresses that must NEVER be accessed in any environment
const CLOUD_METADATA_HOSTNAMES = new Set([
  "metadata.google.internal",
  "instance-data",
]);

// Non-link-local cloud metadata endpoints (Alibaba ECS 100.100.100.200, AWS Nitro IPv6 fd00:ec2::254)
const CLOUD_METADATA_IPS = new Set([
  "100.100.100.200",
  "fd00:ec2::254",
]);

// Private and reserved IPv4 address ranges
const IPV4_BLOCKED_RANGES = [
  { prefix: "0.", mask: 8 }, // Current network
  { prefix: "10.", mask: 8 }, // Private Class A
  { prefix: "127.", mask: 8 }, // Loopback
  { prefix: "192.168.", mask: 16 }, // Private Class C
];

const LOCAL_HOSTNAMES = new Set([
  "localhost",
]);

/**
 * Checks whether an IP string is a cloud hypervisor metadata service.
 * Defends against AWS/OpenStack link-local (169.254.x.x), Alibaba Cloud ECS (100.100.100.200),
 * and AWS Nitro IPv6 (fd00:ec2::254).
 *
 * @param ip - IP string to check
 * @returns True if IP matches cloud metadata service endpoints
 */
export function isCloudMetadata(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, "").toLowerCase().trim();
  return clean.startsWith("169.254.") || CLOUD_METADATA_IPS.has(clean);
}

/**
 * Decodes an IPv4-mapped IPv6 address into its standard dotted-decimal IPv4 string.
 * Handles both dotted-quad (::ffff:192.168.1.1) and WHATWG hex pairs (::ffff:a9fe:a9fe).
 *
 * @param host - Host string to test and decode
 * @returns Standard dotted-quad IPv4 string if mapped, or undefined
 */
export function decodeMappedIpv4(host: string): string | undefined {
  const clean = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (isIP(clean) !== 6) return undefined;

  if (clean.includes("::ffff:")) {
    const remainder = clean.split("::ffff:").pop() || "";
    if (isIP(remainder) === 4) return remainder;

    // Handle hex-pair notation serialized by WHATWG URL parser (e.g. a9fe:a9fe)
    const hexMatch = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(remainder);
    if (hexMatch) {
      const high = parseInt(hexMatch[1], 16);
      const low = parseInt(hexMatch[2], 16);
      const val = (high * 0x10000) + low;
      return `${(val >>> 24) & 0xff}.${(val >>> 16) & 0xff}.${(val >>> 8) & 0xff}.${val & 0xff}`;
    }
  }

  return undefined;
}

/**
 * Checks whether an IPv4 string falls within local or private network ranges.
 *
 * @param ip - IPv4 address string to validate
 * @returns True if address belongs to private RFC 1918, loopback, or CGNAT subnets
 */
export function isLocalOrPrivateIpv4(ip: string): boolean {
  for (const range of IPV4_BLOCKED_RANGES) {
    if (ip.startsWith(range.prefix)) return true;
  }

  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }

  // 100.64.0.0/10 (CGNAT)
  if (ip.startsWith("100.")) {
    const parts = ip.split(".");
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 64 && secondOctet <= 127) return true;
    }
  }

  return false;
}

/**
 * Checks whether an IPv6 string falls within blocked local/private/mapped ranges.
 *
 * @param host - IPv6 address string to validate
 * @returns True if address belongs to loopback, link-local, unique-local, or private mapped ranges
 */
export function isLocalOrPrivateIpv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, "").toLowerCase();

  // Loopback & Unspecified
  if (clean === "::1" || clean === "::" || clean === "0:0:0:0:0:0:0:1" || clean === "0:0:0:0:0:0:0:0") {
    return true;
  }

  // Link-local (fe80::/10) & Unique local (fc00::/7)
  if (clean.startsWith("fe8") || clean.startsWith("fe9") || clean.startsWith("fea") || clean.startsWith("feb")) {
    return true;
  }
  if (clean.startsWith("fc") || clean.startsWith("fd")) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or hex)
  const mapped = decodeMappedIpv4(clean);
  if (mapped && (isCloudMetadata(mapped) || isLocalOrPrivateIpv4(mapped))) {
    return true;
  }

  return false;
}

/**
 * Checks whether a hostname targets cloud hypervisor metadata or reserved addresses.
 * These are unconditionally forbidden in ALL environments (hosted or sovereign).
 *
 * @param hostname - Hostname string to check
 * @returns True if host points to cloud hypervisor metadata
 */
export function isCloudMetadataOrForbiddenHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim().replace(/\.+$/, "");

  if (CLOUD_METADATA_HOSTNAMES.has(normalized)) return true;

  // Cloud metadata IPv4
  if (isCloudMetadata(normalized)) return true;

  // Decoded IPv4-mapped IPv6
  const mapped = decodeMappedIpv4(normalized);
  if (mapped && isCloudMetadata(mapped)) return true;

  return false;
}

/**
 * Checks whether a hostname targets private subnets, loopback, or local domains.
 *
 * @param hostname - Hostname string to test
 * @returns True if host belongs to local, loopback, or private subnets
 */
export function isLocalOrPrivateNetworkHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim().replace(/\.+$/, "");

  if (LOCAL_HOSTNAMES.has(normalized)) return true;

  // Local/Internal domain suffixes
  if (
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized.endsWith(".lan") ||
    normalized.endsWith(".home")
  ) {
    return true;
  }

  // Decoded IPv4-mapped IPv6
  const mapped = decodeMappedIpv4(normalized);
  if (mapped && (isCloudMetadata(mapped) || isLocalOrPrivateIpv4(mapped))) {
    return true;
  }

  // IPv6 notation
  if (normalized.startsWith("[") || normalized.includes(":")) {
    return isLocalOrPrivateIpv6(normalized);
  }

  // IPv4 check
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(normalized)) {
    return isLocalOrPrivateIpv4(normalized);
  }

  return false;
}

/**
 * Determines whether a host should be blocked based on the current environment.
 * - Cloud metadata is ALWAYS blocked.
 * - Private subnets & localhost are blocked in public hosted mode (production default),
 *   but permitted if ALLOW_PRIVATE_NETWORK_FETCH=true or NODE_ENV=development.
 *
 * @param hostname - Hostname or IP to evaluate
 * @returns True if host is prohibited in the active environment
 */
export function isPrivateOrBlockedHost(hostname: string): boolean {
  // 1. Invariant: Cloud hypervisor metadata is permanently blocked everywhere
  if (isCloudMetadataOrForbiddenHost(hostname)) {
    return true;
  }

  // 2. Approach 2: Check if local/private network fetch is enabled
  const isPrivateFetchAllowed =
    process.env.ALLOW_PRIVATE_NETWORK_FETCH === "true" ||
    process.env.NODE_ENV === "development";

  if (isPrivateFetchAllowed) {
    return false; // Permitted for sovereign node or local development
  }

  // 3. In production hosted edge mode, block private subnets and localhost
  return isLocalOrPrivateNetworkHost(hostname);
}

/**
 * Validates a target URL against SSRF threats.
 * Returns the parsed URL if safe, or throws an Error if the URL is invalid or targets restricted hosts.
 *
 * @param urlString - Raw URL string provided by caller or user
 * @returns Clean parsed WHATWG URL instance
 * @throws Error if protocol, credentials, destination port, or target host are restricted
 */
export function validateSafeUrl(urlString: string): URL {
  if (!urlString || typeof urlString !== "string") {
    throw new Error("Invalid URL: string expected");
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    throw new Error("Invalid URL syntax provided");
  }

  // Only allow HTTP and HTTPS protocols (never file:, ftp:, gopher:, etc.)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Forbidden protocol '${parsed.protocol}'. Only http: and https: are allowed.`);
  }

  // Disallow credential-bearing URLs (user:pass@host) to prevent authority confusion attacks
  if (parsed.username || parsed.password) {
    throw new Error("URLs containing credentials (user:pass@host) are prohibited.");
  }

  // Enforce valid destination port semantics for HTTP(S)
  if (parsed.port) {
    const portNum = Number(parsed.port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error("Invalid destination port.");
    }
  }

  // Check destination against SSRF boundaries
  if (isPrivateOrBlockedHost(parsed.hostname)) {
    throw new Error("Access to private, loopback, or cloud metadata network addresses is prohibited.");
  }

  return parsed;
}

/**
 * Performs a safe fetch request that follows redirects while strictly enforcing SSRF protection
 * and DNS resolution checks on every redirect target.
 *
 * @param targetUrl - Initial target URL string or URL object
 * @param init - Standard RequestInit options (headers, method, signal, etc.)
 * @param maxRedirects - Maximum allowed redirect hops (default 3)
 * @returns Fetch Response object
 * @throws Error on SSRF violation, resolution to forbidden IP, timeout, or exceeded redirects
 */
export async function safeFetch(
  targetUrl: string | URL,
  init?: RequestInit,
  maxRedirects = 3
): Promise<Response> {
  let currentUrl = typeof targetUrl === "string" ? targetUrl : targetUrl.toString();
  let remainingRedirects = maxRedirects;

  while (true) {
    const validated = validateSafeUrl(currentUrl);

    // Verify DNS resolution if hostname is not already an IP literal (defends against DNS rebinding)
    const rawHost = validated.hostname.replace(/^\[|\]$/g, "");
    if (isIP(rawHost) === 0) {
      try {
        const lookupResults = await dns.lookup(validated.hostname, { all: true });
        for (const entry of lookupResults) {
          if (isPrivateOrBlockedHost(entry.address)) {
            throw new Error(
              `Destination host '${validated.hostname}' resolves to restricted IP: ${entry.address}`
            );
          }
        }
      } catch (dnsErr: any) {
        if (dnsErr.code === "ENOTFOUND") {
          throw new Error(`Could not resolve hostname: ${validated.hostname}`);
        }
        throw dnsErr;
      }
    }

    // Apply 10s deadline timeout if caller has not supplied custom abort signal
    const signal = init?.signal || AbortSignal.timeout(10000);

    const response = await fetch(validated.toString(), {
      ...init,
      signal,
      redirect: "manual",
    });

    // Check for redirect status codes
    const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
    if (isRedirect && remainingRedirects > 0) {
      const location = response.headers.get("location");
      if (!location) {
        return response;
      }

      // Resolve relative redirect against current URL
      const redirectUrl = new URL(location, validated);
      currentUrl = redirectUrl.toString();
      remainingRedirects -= 1;
      continue;
    }

    return response;
  }
}
