// This API route is a proxy to the backend API
// The web app should not have its own database - it's frontend only
// All database operations happen in the backend (anonpress-backend)

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward to backend API
    const response = await fetch(`${BACKEND_URL}/api/content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward auth headers if present
        ...(req.headers.get("Authorization") && {
          Authorization: req.headers.get("Authorization")!,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
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
              tor: "",
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
  try {
    const { searchParams } = new URL(req.url);
    
    // Forward to backend API
    const response = await fetch(
      `${BACKEND_URL}/api/content?${searchParams.toString()}`
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Failed to communicate with backend" },
      { status: 500 }
    );
  }
}
