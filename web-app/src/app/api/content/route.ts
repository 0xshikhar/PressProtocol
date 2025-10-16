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
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Failed to communicate with backend" },
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
