import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getBackendUrl } from "@/config/backend";

export const runtime = "edge";

interface ResolvedContent {
  title: string;
  tags?: string[];
  publisher?: {
    pubkey?: string;
    publicKey?: string;
    walletAddress?: string;
  };
  createdAt?: string;
}

async function fetchArticleMetadata(cid: string): Promise<ResolvedContent> {
  const backendUrl = getBackendUrl();

  // 1. Try backend daemon
  try {
    const res = await fetch(`${backendUrl}/api/content/${cid}`, {
      signal: AbortSignal.timeout(2200),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        return json.data;
      }
    }
  } catch (e) {
    // Backend unreachable, fallback to public IPFS gateways
  }

  // 2. Try fast public gateways
  const gateways = [
    "https://gateway.pinata.cloud/ipfs",
    "https://cloudflare-ipfs.com/ipfs",
    "https://ipfs.io/ipfs",
  ];

  for (const gw of gateways) {
    try {
      const res = await fetch(`${gw}/${cid}`, {
        signal: AbortSignal.timeout(2500),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const raw = await res.json();
        return {
          title: raw.title || "Sovereign Document",
          tags: raw.tags || [],
          publisher: raw.publisher || {},
          createdAt: raw.timestamp || raw.createdAt,
        };
      }
    } catch (e) {
      // Try next gateway
    }
  }

  // 3. Fallback placeholder
  return {
    title: "Sovereign Censorship-Resistant Publication",
    tags: ["sovereign", "ipfs", "pressprotocol"],
    publisher: {},
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  const { cid } = params;
  const article = await fetchArticleMetadata(cid);

  const rawTitle = article.title || "Sovereign Document";
  const title = rawTitle.length > 90 ? `${rawTitle.slice(0, 88)}...` : rawTitle;
  const tags = Array.isArray(article.tags) ? article.tags.slice(0, 3) : [];
  const pubkey = article.publisher?.pubkey || article.publisher?.publicKey || "";
  const pubkeySnippet = pubkey
    ? `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`
    : "Sovereign Author";

  const titleFontSize = title.length > 70 ? 42 : title.length > 40 ? 48 : 54;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#060911",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.16), transparent 45%)",
          padding: "54px 60px",
          fontFamily: "sans-serif",
          color: "#ffffff",
          border: "2px solid rgba(255, 255, 255, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1.5px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                }}
              >
                PressProtocol
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#10b981",
                  textTransform: "uppercase",
                }}
              >
                Sovereign Publishing Layer
              </span>
            </div>
          </div>

          {/* Transport Indicator Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#6ee7b7",
                fontFamily: "monospace",
                letterSpacing: "0.02em",
              }}
            >
              IPFS + TOR MULTI-TRANSPORT
            </span>
          </div>
        </div>

        {/* Center Section: Title & Multihash CID Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            margin: "24px 0",
          }}
        >
          {/* Article Title */}
          <div
            style={{
              display: "flex",
              fontSize: `${titleFontSize}px`,
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {title}
          </div>

          {/* CID Multihash Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              borderRadius: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              alignSelf: "flex-start",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "monospace",
                color: "#34d399",
                letterSpacing: "0.01em",
              }}
            >
              ipfs://{cid}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Verification, Author, and Security Specs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "22px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            width: "100%",
          }}
        >
          {/* Sovereign Author Verification Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#10b981",
                  letterSpacing: "0.01em",
                }}
              >
                Verified Sovereign Author
              </span>
            </div>

            {/* Author Key Snippet */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontFamily: "monospace",
                fontSize: "13px",
                color: "#cbd5e1",
              }}
            >
              <span>Ed25519:</span>
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>{pubkeySnippet}</span>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#94a3b8",
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Standard Guarantee */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            <span>Ed25519 RFC 8032</span>
            <span>•</span>
            <span>SHA-512</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
