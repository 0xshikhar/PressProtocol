import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchArticleMetadata } from "@/lib/article-metadata";
import { PRESS_LOGO_BASE64 } from "@/config/logo-base64";

export const runtime = "edge";

/**
 * Edge runtime endpoint to dynamically generate high-resolution OpenGraph and Twitter card images.
 * Supports both standard sovereign publication previews and contextual verified quote cards.
 *
 * @param request - Incoming Next.js HTTP request containing URL search params.
 * @param context - Route parameters containing the publication IPFS CID.
 * @returns ImageResponse containing the rendered 1200x630 PNG preview card.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  const { cid } = params;
  const rawQuote = searchParams.get("q") || searchParams.get("quote") || "";
  const quote = rawQuote.replace(/\+/g, " ").trim();

  const article = await fetchArticleMetadata(cid);

  const rawTitle = article.title || "Sovereign Publication";
  const title = rawTitle.length > 80 ? `${rawTitle.slice(0, 77)}...` : rawTitle;
  const excerpt =
    article.excerpt ||
    "Immutable, cryptographically verified publication preserved on PressProtocol decentralized infrastructure.";
  const displayExcerpt =
    excerpt.length > 155 ? `${excerpt.slice(0, 152)}...` : excerpt;

  const tags = Array.isArray(article.tags) ? article.tags.slice(0, 2) : [];
  const pubkey = article.pubkey || "";
  const pubkeySnippet = pubkey
    ? `${pubkey.slice(0, 6)}...${pubkey.slice(-6)}`
    : "Sovereign Author";

  // If a quote parameter is present, render the Verified Quote Card
  if (quote) {
    const displayQuote = quote.length > 220 ? `${quote.slice(0, 217).trim()}...` : quote;
    const quoteCardTitle = rawTitle.length > 55 ? `${rawTitle.slice(0, 52).trim()}...` : rawTitle;
    const quoteFontSize =
      displayQuote.length > 160 ? 28 : displayQuote.length > 100 ? 32 : displayQuote.length > 50 ? 36 : 40;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0B0A0C",
            backgroundImage:
              "radial-gradient(circle at 10% 12%, rgba(124, 39, 51, 0.40), transparent 48%), radial-gradient(circle at 90% 88%, rgba(62, 156, 114, 0.16), transparent 48%)",
            padding: "50px 60px",
            fontFamily: "sans-serif",
            color: "#EEE7E1",
            border: "2px solid rgba(240, 232, 232, 0.08)",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Top Press Burgundy Accent Stripe */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, #7C2733 0%, #B44A54 40%, rgba(62, 156, 114, 0.5) 100%)",
            }}
          />

          {/* 1. Header Bar: Logo, Name, and Verified Citation Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Logo & Brand Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#141216",
                  border: "1.5px solid rgba(240, 232, 232, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "4px",
                }}
              >
                {/* Official Brand Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PRESS_LOGO_BASE64}
                  alt="PressProtocol Logo"
                  width={40}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#EEE7E1",
                    lineHeight: 1.1,
                  }}
                >
                  PressProtocol
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#B44A54",
                    textTransform: "uppercase",
                    marginTop: "3px",
                  }}
                >
                  SOVEREIGN CITATION • VERIFIED ARCHIVE
                </span>
              </div>
            </div>

            {/* Verified Citation Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                borderRadius: "999px",
                backgroundColor: "rgba(20, 18, 22, 0.85)",
                border: "1px solid rgba(124, 39, 51, 0.5)",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#B44A54",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#EEE7E1",
                  fontFamily: "monospace",
                  letterSpacing: "0.04em",
                }}
              >
                VERIFIED QUOTE
              </span>
            </div>
          </div>

          {/* 2. Middle Section: Quotation Card with Integrated Attribution & Multihash */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "28px 34px",
              borderRadius: "16px",
              backgroundColor: "rgba(20, 18, 22, 0.85)",
              border: "1px solid rgba(124, 39, 51, 0.45)",
              margin: "6px 0",
              width: "100%",
              maxHeight: "385px",
              overflow: "hidden",
            }}
          >
            {/* The Quote Text */}
            <div
              style={{
                display: "flex",
                fontSize: `${quoteFontSize}px`,
                fontWeight: 600,
                lineHeight: 1.36,
                letterSpacing: "-0.015em",
                color: "#EEE7E1",
                fontStyle: "italic",
              }}
            >
              &ldquo;{displayQuote}&rdquo;
            </div>

            {/* Integrated Attribution & Decentralized Multihash */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingTop: "16px",
                borderTop: "1px solid rgba(240, 232, 232, 0.08)",
                marginTop: "12px",
              }}
            >
              {/* Attribution */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "17px",
                  color: "#A79E96",
                }}
              >
                <span style={{ color: "#6F675F" }}>—</span>
                <span style={{ color: "#6F675F" }}>From</span>
                <span style={{ color: "#EEE7E1", fontWeight: 600 }}>
                  {quoteCardTitle}
                </span>
              </div>

              {/* IPFS Multihash badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(11, 10, 12, 0.9)",
                  border: "1px solid rgba(240, 232, 232, 0.08)",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#59B98C",
                  }}
                >
                  ipfs://{cid.slice(0, 12)}...{cid.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar: Cryptographic Proof Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "18px",
              borderTop: "1px solid rgba(240, 232, 232, 0.09)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Sealed Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(62, 156, 114, 0.12)",
                  border: "1px solid rgba(62, 156, 114, 0.35)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#59B98C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#59B98C",
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  CRYPTOGRAPHICALLY SEALED
                </span>
              </div>

              {/* Author Key Snippet */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(240, 232, 232, 0.04)",
                  border: "1px solid rgba(240, 232, 232, 0.08)",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#A79E96",
                }}
              >
                <span>Ed25519:</span>
                <span style={{ color: "#EEE7E1", fontWeight: 600 }}>
                  {pubkeySnippet}
                </span>
              </div>

              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(240, 232, 232, 0.04)",
                    border: "1px solid rgba(240, 232, 232, 0.08)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#6F675F",
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>

            {/* Right: Clean Protocol Brand Link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "monospace",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#59B98C",
                }}
              />
              <span style={{ color: "#B44A54", fontWeight: 700, letterSpacing: "0.02em" }}>
                pressprotocol.com
              </span>
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

  // Standard Article Card
  const titleFontSize = title.length > 65 ? 40 : title.length > 35 ? 46 : 52;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B0A0C",
          backgroundImage:
            "radial-gradient(circle at 10% 12%, rgba(124, 39, 51, 0.28), transparent 45%), radial-gradient(circle at 90% 88%, rgba(62, 156, 114, 0.12), transparent 45%)",
          padding: "50px 60px",
          fontFamily: "sans-serif",
          color: "#EEE7E1",
          border: "2px solid rgba(240, 232, 232, 0.08)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Top Press Burgundy Accent Stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, #7C2733 0%, #B44A54 40%, rgba(62, 156, 114, 0.4) 100%)",
          }}
        />

        {/* 1. Header Bar: Logo, Name, and Transport Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo & Brand Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#141216",
                border: "1.5px solid rgba(240, 232, 232, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                padding: "4px",
              }}
            >
              {/* Official Brand Logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PRESS_LOGO_BASE64}
                alt="PressProtocol Logo"
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#EEE7E1",
                  lineHeight: 1.1,
                }}
              >
                PressProtocol
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#B44A54",
                  textTransform: "uppercase",
                  marginTop: "3px",
                }}
              >
                SOVEREIGN JOURNALISM • VERIFIED ARCHIVE
              </span>
            </div>
          </div>

          {/* Transport Indicator Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(20, 18, 22, 0.8)",
              border: "1px solid rgba(62, 156, 114, 0.35)",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#59B98C",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#59B98C",
                fontFamily: "monospace",
                letterSpacing: "0.04em",
              }}
            >
              IPFS + TOR MULTI-TRANSPORT
            </span>
          </div>
        </div>

        {/* 2. Middle Section: Title, Real Excerpt, and Multihash CID Pill */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            margin: "18px 0",
          }}
        >
          {/* Article Title */}
          <div
            style={{
              display: "flex",
              fontSize: `${titleFontSize}px`,
              fontWeight: 800,
              lineHeight: 1.14,
              letterSpacing: "-0.025em",
              color: "#EEE7E1",
            }}
          >
            {title}
          </div>

          {/* Real Article Excerpt */}
          <div
            style={{
              display: "flex",
              fontSize: "19px",
              lineHeight: 1.45,
              fontWeight: 400,
              color: "#A79E96",
              maxHeight: "56px",
              overflow: "hidden",
            }}
          >
            &ldquo;{displayExcerpt}&rdquo;
          </div>

          {/* CID Multihash Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(20, 18, 22, 0.9)",
              border: "1px solid rgba(240, 232, 232, 0.08)",
              alignSelf: "flex-start",
              marginTop: "4px",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#59B98C"
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
                fontSize: "13px",
                fontFamily: "monospace",
                color: "#59B98C",
                letterSpacing: "0.01em",
              }}
            >
              ipfs://{cid}
            </span>
          </div>
        </div>

        {/* 3. Bottom Bar: Cryptographic Proof Badges & Provenance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "20px",
            borderTop: "1px solid rgba(240, 232, 232, 0.09)",
            width: "100%",
          }}
        >
          {/* Left: Verification Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Sealed Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "rgba(62, 156, 114, 0.12)",
                border: "1px solid rgba(62, 156, 114, 0.35)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#59B98C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#59B98C",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                CRYPTOGRAPHICALLY SEALED
              </span>
            </div>

            {/* Author Key Snippet */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(240, 232, 232, 0.04)",
                border: "1px solid rgba(240, 232, 232, 0.08)",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#A79E96",
              }}
            >
              <span>Ed25519:</span>
              <span style={{ color: "#EEE7E1", fontWeight: 600 }}>
                {pubkeySnippet}
              </span>
            </div>

            {/* Tags (if present) */}
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(240, 232, 232, 0.04)",
                  border: "1px solid rgba(240, 232, 232, 0.08)",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#6F675F",
                }}
              >
                #{tag}
              </div>
            ))}
          </div>

          {/* Right: Clean Protocol Brand Link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "monospace",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#59B98C",
              }}
            />
            <span style={{ color: "#B44A54", fontWeight: 700, letterSpacing: "0.02em" }}>
              pressprotocol.com
            </span>
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
