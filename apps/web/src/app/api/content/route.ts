// This API route is a proxy to the backend API
// The web app should not have its own database - it's frontend only
// All database operations happen in the backend (anonpress-backend)

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BACKEND_URL = getBackendUrl();
const CANONICAL_EDGE_URL = "https://api.pressprotocol.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateUrls = [
      `${BACKEND_URL}/api/content`,
      `${CANONICAL_EDGE_URL}/api/content`,
    ];

    let lastError: any = null;
    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(req.headers.get("Authorization") && {
              Authorization: req.headers.get("Authorization")!,
            }),
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { status: response.status });
        }
      } catch (err) {
        lastError = err;
      }
    }
  } catch (error) {
    console.warn("Backend proxy unavailable, attempting direct IPFS failover:", error);

    // Resilient Edge Failover: Direct Pinata Pinning
    const pinataJwt = process.env.PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMjFhNjM0YS1hNTkwLTQzYTktYjcxNy1jYjc2MDAxMDc2ZjUiLCJlbWFpbCI6InNoaWtoYXJAaWlpdG1hbmlwdXIuYWMuaW4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODUwYWYzZThhZmI2Y2MzN2JjODAiLCJzY29wZWRLZXlTZWNyZXQiOiI2MTE3NTg0N2I4NWNhOGM5YzE5MTE5NjRiZGFmMTg5MmJhNjI4NDFjMmI4NmY2MTNkMTIxNjdhYjQxZjcwZTI4IiwiZXhwIjoxNzc0OTMzMzI4fQ.v1Zw4o6hHVsL9SpH9QvQDFgpcm6MxYSE0EbrazI83R8";

    try {
      const body = await req.clone().json().catch(() => null) || {};
      const title = body.title || "Untitled Dispatch";
      const content = body.content || "";
      const tags = Array.isArray(body.tags) ? body.tags : [];
      const timestamp = body.timestamp || new Date().toISOString();

      const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: {
            title,
            content,
            tags,
            timestamp,
            publisher: {
              pubkey: body.publicKey || "sovereign-anonymous-publisher",
              signature: body.signature || "unsigned",
            },
          },
          pinataMetadata: {
            name: `PressProtocol - ${title.slice(0, 48)}`,
          },
        }),
      });

      if (pinataRes.ok) {
        const pinData = await pinataRes.json();
        const cid = pinData.IpfsHash;

        return NextResponse.json({
          success: true,
          data: {
            cid,
            ipfsUrl: `ipfs://${cid}`,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
            shareUrl: `https://pressprotocol.com/read/${cid}`,
            title,
            tags,
            createdAt: timestamp,
            publisher: {
              pubkey: body.publicKey || "sovereign-anonymous-publisher",
              signature: body.signature || "unsigned",
              walletAddress: body.walletAddress,
            },
            mirrors: {
              ipfs: `https://gateway.pinata.cloud/ipfs/${cid}`,
              tor: (() => {
                const onionHost = process.env.TOR_ONION_GATEWAY || process.env.NEXT_PUBLIC_TOR_ONION_HOST;
                if (!onionHost) return "";
                const normalized = onionHost.startsWith("http") ? onionHost : `http://${onionHost}`;
                return `${normalized.replace(/\/+$/, "")}/read/${cid}`;
              })(),
              gateway: `https://cloudflare-ipfs.com/ipfs/${cid}`,
            },
            source: "nextjs-direct-ipfs-failover",
          },
        });
      }
    } catch (pinErr) {
      console.error("Direct IPFS failover also failed:", pinErr);
    }

    return NextResponse.json(
      { error: "Failed to communicate with backend or IPFS pinning gateway" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const candidateUrls = [
    `${BACKEND_URL}/api/content?${searchParams.toString()}`,
    `${CANONICAL_EDGE_URL}/api/content?${searchParams.toString()}`,
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
