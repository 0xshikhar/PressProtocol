// Resilient Multi-Transport Gateway with 2.5s Backend Timeout & Parallel IPFS Race
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();
const BACKEND_TIMEOUT_MS = 2500;
const GATEWAY_TIMEOUT_MS = 4000;

const PUBLIC_IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
  "https://ipfs.io/ipfs",
  "https://dweb.link/ipfs",
];

/**
 * Dispatches concurrent requests across public IPFS gateways.
 * Resolves with the fastest HTTP 200 JSON payload, aborting slower peers.
 */
async function fetchFastestFromIPFSGateways(
  cid: string
): Promise<{ raw: any; gateway: string }> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), GATEWAY_TIMEOUT_MS);

  const fetchPromises = PUBLIC_IPFS_GATEWAYS.map(async (gateway) => {
    const response = await fetch(`${gateway}/${cid}`, {
      signal: abortController.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway ${gateway} responded with status ${response.status}`);
    }

    const raw = await response.json();
    return { raw, gateway };
  });

  try {
    const fastest = await Promise.any(fetchPromises);
    clearTimeout(timeoutId);
    abortController.abort(); // Cancel any remaining pending gateway requests
    return fastest;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { cid: string } }
) {
  const { cid } = params;

  // 1. Primary Attempt: Query the PressProtocol Node daemon with strict 2.5s timeout
  try {
    const nodeController = new AbortController();
    const timeoutId = setTimeout(() => nodeController.abort(), BACKEND_TIMEOUT_MS);

    const response = await fetch(`${BACKEND_URL}/api/content/${cid}`, {
      signal: nodeController.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    console.warn(
      `⚠️ Node daemon returned status ${response.status} for CID ${cid}. Initiating parallel IPFS fallback...`
    );
  } catch (nodeError: any) {
    console.warn(
      `⚠️ Node daemon unreachable or timed out (>2.5s) for CID ${cid}: ${nodeError.message}. Initiating parallel IPFS swarm race...`
    );
  }

  // 2. Parallel Failover: Race the global IPFS gateway swarm concurrently
  try {
    const { raw, gateway } = await fetchFastestFromIPFSGateways(cid);

    return NextResponse.json({
      success: true,
      data: {
        cid,
        title: raw.title || "Untitled Document",
        content: raw.content || "",
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        createdAt: raw.timestamp || new Date().toISOString(),
        publisher: {
          publicKey: raw.publisher?.pubkey || raw.publisher?.publicKey || "",
          walletAddress: raw.publisher?.walletAddress || "",
          username: raw.publisher?.username || "",
          pubkey: raw.publisher?.pubkey || raw.publisher?.publicKey || "",
          signature: raw.publisher?.signature || "unsigned",
          isAnonymous: !raw.publisher?.walletAddress,
        },
        signature: raw.publisher?.signature || "unsigned",
        mirrors: {
          ipfs: {
            url: `${gateway}/${cid}`,
            available: true,
          },
          tor: {
            url: "",
            available: false,
          },
          gateway: {
            url: `https://cloudflare-ipfs.com/ipfs/${cid}`,
            available: true,
          },
        },
        recommended: "ipfs",
        source: "ipfs-decentralized-gateway-failover",
        failoverGateway: gateway,
      },
    });
  } catch (swarmError) {
    console.error(`❌ All IPFS gateways failed to resolve CID ${cid}:`, swarmError);
  }

  // 3. Complete partition / invalid CID
  return NextResponse.json(
    {
      error: "Content resolution timeout: Node daemon and public IPFS gateways were unable to resolve CID.",
      cid,
    },
    { status: 504 }
  );
}
