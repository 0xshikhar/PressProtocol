import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

/**
 * Image Upload API Route
 * Proxies image uploads to backend which uploads to IPFS via Pinata
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be less than 10MB" },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendFormData = new FormData();
    backendFormData.append("file", image);

    const backendUrl = env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000";
    const response = await fetch(`${backendUrl}/api/upload/image`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Backend upload failed:", error);
      return NextResponse.json(
        { error: "Upload to IPFS failed" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Backend returns: { success: true, data: { cid, url, ... } }
    // Return IPFS CID and gateway URL
    return NextResponse.json({
      cid: result.data.cid,
      url: result.data.url || `https://gateway.pinata.cloud/ipfs/${result.data.cid}`,
      success: true,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
