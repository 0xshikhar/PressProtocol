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
    `${backendUrl}/api/discovery?${searchParams.toString()}`,
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
      // Continue to next fallback
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
