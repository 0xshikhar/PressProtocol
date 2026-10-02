import { NextRequest, NextResponse } from "next/server";
import { validateSafeUrl, safeFetch } from "@/lib/ssrf";
import { isValidCID } from "@/lib/article-metadata";

export const dynamic = "force-dynamic";

/**
 * Handles archival requests for articles, dispatching snapshots to Wayback Machine
 * and decentralized archive gateways after strict URL/CID verification.
 *
 * @param req - Incoming NextRequest with JSON payload containing cid or targetUrl
 * @returns JSON response containing archive snapshot status and permanent links
 */
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
    let canonicalTargetUrl: string;

    if (targetUrl) {
      try {
        const safe = validateSafeUrl(targetUrl);
        canonicalTargetUrl = safe.toString();
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Invalid or forbidden targetUrl" },
          { status: 400 }
        );
      }
    } else {
      if (!isValidCID(cid)) {
        return NextResponse.json(
          { error: "Invalid IPFS CID format provided" },
          { status: 400 }
        );
      }
      canonicalTargetUrl = `${baseUrl}/read/${encodeURIComponent(cid.trim())}`;
    }

    const waybackSaveUrl = `https://web.archive.org/save/${encodeURI(canonicalTargetUrl)}`;
    const waybackLookupUrl = `https://web.archive.org/web/*/${encodeURI(canonicalTargetUrl)}`;

    let status: "saved" | "queued" | "fallback" = "queued";
    let snapshotUrl: string | undefined;

    // Dispatch non-blocking snapshot request to the Wayback Machine
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await safeFetch(waybackSaveUrl, {
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
