import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const openapiSpec = {
    openapi: "3.1.0",
    info: {
      title: "PressProtocol Open Infrastructure API",
      version: "1.0.0",
      description:
        "High-performance REST API and sovereign distribution rails for PressProtocol. The Stripe for Decentralized Publishing.",
      contact: {
        name: "PressProtocol Core Architecture",
        url: "https://pressprotocol.com",
      },
    },
    servers: [
      { url: "http://127.0.0.1:4000", description: "Local Headless Micro-Daemon" },
      { url: "https://anonpress-production.up.railway.app", description: "Global Community Gateway" },
      { url: "https://pressprotocol.com", description: "Production Web Gateway" },
    ],
    paths: {
      "/api/v1/publish/raw": {
        post: {
          summary: "Publish and sign content via node identity (Custodial Ingest)",
          description: "Ingests raw text, calculates deterministic CIDv1 in-memory, signs with Ed25519, and pins across IPFS and Tor.",
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string", example: "Global Transparency Report 2026" },
                    content: { type: "string", example: "# Executive Summary\n\nFull investigative disclosure." },
                    tags: { type: "array", items: { type: "string" }, example: ["investigation", "sovereignty"] },
                    author: { type: "string", example: "Whistleblower Desk" },
                    format: { type: "string", enum: ["markdown", "html", "json"], default: "markdown" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Content successfully anchored to IPFS/Tor" },
            "401": { description: "Missing or invalid API key or insufficient scope" },
            "429": { description: "Rate limit exceeded (Token bucket empty)" },
          },
        },
      },
      "/api/v1/publish/signed": {
        post: {
          summary: "Relay pre-signed sovereign content (Zero-Custody Swarm Distributor)",
          description: "Accepts client-side Ed25519 signed payloads. Node validates the mathematical signature and multihash without possessing private keys.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content", "publicKey", "signature", "timestamp"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    timestamp: { type: "string" },
                    publicKey: { type: "string", description: "32-byte hex Ed25519 public key" },
                    signature: { type: "string", description: "64-byte hex Ed25519 signature" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Pre-signed content distributed across swarm" },
            "401": { description: "Cryptographic signature or multihash mismatch" },
          },
        },
      },
      "/api/v1/resolve/{cid}": {
        get: {
          summary: "Resolve content and multi-transport mirror status by CID",
          parameters: [{ name: "cid", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Resolved content and active mirrors (IPFS, Tor v3, Local)" },
            "404": { description: "Content not found in local or federated swarm" },
          },
        },
      },
      "/api/v1/verify": {
        post: {
          summary: "Instant Mathematical Cryptographic Verification Audit",
          description: "Audits an arbitrary text string against a candidate CID and Ed25519 signature under RFC 8032 without mutating state.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content", "publicKey", "signature"],
                  properties: {
                    content: { type: "string" },
                    publicKey: { type: "string" },
                    signature: { type: "string" },
                    cid: { type: "string" },
                    title: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Cryptographic validity audit result" },
          },
        },
      },
      "/api/v1/webhooks/subscriptions": {
        post: {
          summary: "Register outbound webhook subscription",
          description: "Registers an HTTP endpoint to receive real-time signed event callbacks (article.published, article.verified) with HMAC-SHA256 signatures.",
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["url"],
                  properties: {
                    url: { type: "string", format: "uri", example: "https://my-cms.example.com/api/pressprotocol-webhook" },
                    events: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["article.published", "article.verified", "mirror.health_changed", "*"],
                      },
                      example: ["article.published", "article.verified"],
                    },
                    secret: { type: "string", description: "Optional custom secret; auto-generated if omitted" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Webhook subscription registered with shared secret" },
            "400": { description: "Invalid URL or event parameters" },
          },
        },
        get: {
          summary: "List active webhook subscriptions",
          security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
          responses: {
            "200": { description: "Array of registered webhook subscriptions and delivery statistics" },
          },
        },
      },
      "/api/v1/metrics": {
        get: {
          summary: "Enterprise node throughput and health metrics",
          responses: {
            "200": { description: "Node metrics report (total requests, bytes relayed, active keys)" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "PressProtocol API Key (pp_live_* or pp_test_*)",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Bearer token containing PressProtocol API Key",
        },
      },
    },
  };

  return NextResponse.json(openapiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
