import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const backendUrl = getBackendUrl();

  const candidateUrls = [
    `${backendUrl}/api/content?${searchParams.toString()}`,
    `https://api.pressprotocol.com/api/content?${searchParams.toString()}`,
  ];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data.data) ? data.data : [];
        const mapped = items.map((item: any) => ({
          id: item.cid,
          cid: item.cid,
          title: item.title,
          tags: item.tags || [],
          publisher: item.publisherPubKey || item.publisher?.publicKey || item.publisher?.pubkey || "",
          publisherPubKey: item.publisherPubKey || item.publisher?.publicKey || item.publisher?.pubkey || "",
          createdAt: item.createdAt || item.created_at,
          created_at: item.createdAt || item.created_at,
          mirrors: item.mirrors || [],
        }));

        return NextResponse.json({ success: true, data: mapped });
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
