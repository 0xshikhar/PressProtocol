// Proxy to backend API - web app is frontend only
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward to backend API
    const response = await fetch(`${BACKEND_URL}/api/identity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    // Forward to backend API
    const response = await fetch(`${BACKEND_URL}/api/identity`, {
      headers: {
        ...(req.headers.get("Authorization") && {
          Authorization: req.headers.get("Authorization")!,
        }),
      },
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
