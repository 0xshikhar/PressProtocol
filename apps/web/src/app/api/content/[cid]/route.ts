// Resilient Multi-Transport Gateway with 2.5s Backend Timeout & Parallel IPFS Race
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();
const BACKEND_TIMEOUT_MS = 2500;
const GATEWAY_TIMEOUT_MS = 4000;

const PUBLIC_IPFS_GATEWAYS = [
  "https://ipfs.filebase.io/ipfs",
  "https://tan-awake-wombat-832.mypinata.cloud/ipfs",
  "https://4everland.io/ipfs",
  "https://nftstorage.link/ipfs",
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://dweb.link/ipfs",
];

const PINATA_GATEWAY_TOKEN = "4yPfAllkWi5DUEGZ_qbPGI1faHfyQlq9oNqCt3_jL75CTXseiykewlMr6jGFgOFR";

/**
 * Dispatches concurrent requests across public IPFS gateways.
 * Resolves with the fastest HTTP 200 payload, aborting slower peers.
 */
async function fetchFastestFromIPFSGateways(
  cid: string
): Promise<{ raw: any; gateway: string }> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), GATEWAY_TIMEOUT_MS);

  const fetchPromises = PUBLIC_IPFS_GATEWAYS.map(async (gateway) => {
    let targetUrl = `${gateway}/${cid}`;
    const headers: Record<string, string> = {
      Accept: "application/json, text/html, text/plain, */*",
      "User-Agent": "PressProtocol-Edge/1.0.6 (Decentralized Publishing Gateway; +https://pressprotocol.com)",
    };

    if (gateway.includes("mypinata.cloud")) {
      targetUrl = `${gateway}/${cid}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
      headers["x-pinata-gateway-token"] = PINATA_GATEWAY_TOKEN;
    }

    const response = await fetch(targetUrl, {
      signal: abortController.signal,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Gateway ${gateway} responded with status ${response.status}`);
    }

    const text = await response.text();
    let raw: any;
    try {
      raw = JSON.parse(text);
    } catch {
      raw = {
        title: "Preserved Sovereign Document",
        content: text,
        tags: ["ipfs-raw"],
        timestamp: new Date().toISOString(),
        publisher: {
          pubkey: "",
          signature: "unsigned",
        },
      };
    }

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
            url: (() => {
              const onionHost = process.env.TOR_ONION_GATEWAY || process.env.NEXT_PUBLIC_TOR_ONION_HOST || "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion";
              const normalized = onionHost.startsWith("http") ? onionHost : `http://${onionHost}`;
              return `${normalized.replace(/\/+$/, "")}/read/${cid}`;
            })(),
            available: true,
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
    }, {
      headers: {
        "Onion-Location": (() => {
          const onionHost = process.env.TOR_ONION_GATEWAY || process.env.NEXT_PUBLIC_TOR_ONION_HOST || "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion";
          const normalized = onionHost.startsWith("http") ? onionHost : `http://${onionHost}`;
          return `${normalized.replace(/\/+$/, "")}/read/${cid}`;
        })(),
      }
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
