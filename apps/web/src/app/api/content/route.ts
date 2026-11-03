// This API route is a proxy to the backend API
// The web app should not have its own database - it's frontend only
// All database operations happen in the backend (anonpress-backend)

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();
const CANONICAL_EDGE_URL = "https://api.pressprotocol.com";
const CANDIDATE_BASES = Array.from(new Set([BACKEND_URL, CANONICAL_EDGE_URL]));

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  let lastError = "No backend reachable";
  for (const base of CANDIDATE_BASES) {
    try {
      const response = await fetch(`${base}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.get("Authorization") && {
            Authorization: req.headers.get("Authorization")!,
          }),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json().catch(() => null);
      // Client errors are authoritative (validation, auth); only retry on 5xx / network failures.
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return NextResponse.json(data ?? { success: false, error: "Empty backend response" }, {
          status: response.status,
        });
      }
      lastError = data?.error || `Backend responded with HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  console.error("Content publish failed on all backends:", lastError);
  return NextResponse.json(
    { success: false, error: "Publishing backend is unavailable. Please try again shortly." },
    { status: 502 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  for (const base of CANDIDATE_BASES) {
    try {
      const response = await fetch(`${base}/api/content?${searchParams.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch {
      // Continue to next candidate
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
