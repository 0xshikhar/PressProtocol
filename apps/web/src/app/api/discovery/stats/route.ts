import { NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

export const dynamic = "force-dynamic";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET() {
  const backendUrl = getBackendUrl();
  const candidateUrls = [
    `${backendUrl}/api/content?limit=100`,
    `https://api.pressprotocol.com/api/content?limit=100`,
  ];

  let items: any[] = [];

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) {
        const json = await response.json();
        items = Array.isArray(json.data) ? json.data : [];
        if (items.length > 0) break;
      }
    } catch (e) {
      // ignore
    }
  }

  const categoryCounts: Record<string, number> = {};
  for (const item of items) {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    for (const tag of tags) {
      const normalized = typeof tag === "string" ? tag.toLowerCase().trim() : "";
      if (normalized) {
        categoryCounts[normalized] = (categoryCounts[normalized] || 0) + 1;
      }
    }
  }

  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));

  return NextResponse.json({
    success: true,
    data: {
      totalContent: items.length,
      categories,
    },
  });
}
