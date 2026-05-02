import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cid, targetUrl } = body;

    if (!cid && !targetUrl) {
      return NextResponse.json(
        { error: "Either 'cid' or 'targetUrl' must be provided for archival preservation" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pressprotocol.com";
    const canonicalTargetUrl = targetUrl || `${baseUrl}/read/${cid}`;

    const waybackSaveUrl = `https://web.archive.org/save/${canonicalTargetUrl}`;
    const waybackLookupUrl = `https://web.archive.org/web/*/${canonicalTargetUrl}`;

    let status: "saved" | "queued" | "fallback" = "queued";
    let snapshotUrl: string | undefined;

    // Dispatch non-blocking snapshot request to the Wayback Machine
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(waybackSaveUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "PressProtocol-DualPreservation/1.0 (https://pressprotocol.com; info@pressprotocol.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      clearTimeout(timeoutId);

      // Check Wayback response headers
      const contentLocation = response.headers.get("content-location");
      const waybackLocation = response.headers.get("location");

      if (contentLocation) {
        snapshotUrl = `https://web.archive.org${contentLocation}`;
        status = "saved";
      } else if (waybackLocation) {
        snapshotUrl = waybackLocation.startsWith("http")
          ? waybackLocation
          : `https://web.archive.org${waybackLocation}`;
        status = "saved";
      } else if (response.ok || response.status === 302) {
        status = "saved";
      }
    } catch (archiveErr: any) {
      // If Wayback Machine times out or rate limits, gracefully queue fallback
      console.warn("Wayback Machine archival capture note:", archiveErr?.name || archiveErr);
      status = "fallback";
    }

    return NextResponse.json({
      success: true,
      cid,
      targetUrl: canonicalTargetUrl,
      waybackSaveUrl,
      waybackLookupUrl,
      snapshotUrl: snapshotUrl || waybackLookupUrl,
      status,
      timestamp: new Date().toISOString(),
      message:
        status === "saved"
          ? "Archival snapshot captured on Wayback Machine"
          : "Archival snapshot request queued on Wayback Machine",
    });
  } catch (err: any) {
    console.error("Error in Wayback preservation hook:", err);
    return NextResponse.json(
      { error: err.message || "Failed to dispatch archival preservation" },
      { status: 500 }
    );
  }
}
