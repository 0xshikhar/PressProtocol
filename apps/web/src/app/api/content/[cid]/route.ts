// Proxy to backend API - web app is frontend only
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/config/backend";

const BACKEND_URL = getBackendUrl();

export async function GET(
  req: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;

    // Forward to backend API
    const response = await fetch(`${BACKEND_URL}/api/content/${cid}`);
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Failed to communicate with backend" },
      { status: 500 }
    );
  }
}
