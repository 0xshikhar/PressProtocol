import React, { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  Send,
  RefreshCw,
  Zap,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateDeterministicCIDv1,
  generateKeypair,
  signPayload,
  verifySignature,
  createCanonicalPayload,
} from "@pressprotocol/sdk";
import { getBackendUrl } from "@/config/backend";

const DEFAULT_REQUESTS = {
  publish_raw: {
    title: "Global Environmental Transparency Dossier 2026",
    content: "# Executive Summary\n\nFull investigative disclosure on industrial pollution and sovereign archival.",
    format: "markdown",
    tags: ["investigation", "climate", "sovereignty"],
    author: "Investigative Desk",
    metadata: {
      cmsId: "icij_post_88301",
      canonicalUrl: "https://tribune.org/climate-2026",
    },
  },
  publish_signed: {
    title: "Zero-Custody Whistleblower Dispatch",
    content: "## Sovereign Leak\n\nThis article was signed locally inside the author's device memory. The gateway never saw the private key.",
    tags: ["whistleblower", "ed25519", "zero-custody"],
    timestamp: new Date().toISOString(),
  },
  resolve: {
    cid: "bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
  },
  verify: {
    title: "Autonomous Node Guarantee",
    content: "Decentralized publishing is mathematically unblockable across IPFS and Tor.",
    tags: ["decentralization"],
    timestamp: "2026-09-13T01:00:00.000Z",
  },
  webhooks: {
    url: "https://newsroom.example.com/api/webhooks/pressprotocol",
    events: ["article.published", "article.verified"],
    description: "Instant notification for published or verified investigative stories",
  },
  metrics: {},
};

interface ApiExplorerProps {
  apiKey: string;
  initialEndpoint?: "publish_raw" | "publish_signed" | "resolve" | "verify" | "webhooks" | "metrics";
}

interface ApiResponseResult {
  status: number;
  statusText: string;
  latencyMs: number;
  headers: Record<string, string>;
  data: any;
}

const getSampleResponseForEndpoint = (ep: string): ApiResponseResult | null => {
  switch (ep) {
    case "publish_raw":
      return {
        status: 200,
        statusText: "OK",
        latencyMs: 42,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-pressprotocol-node": "edge-daemon-us-east",
          "x-ipfs-cid": "bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
          "x-signature-valid": "true (ed25519)",
        },
        data: {
          status: "published",
          cid: "bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
          content_hash: "QmT78zXyN4wQd18...f2j4k9",
          mirrors: {
            ipfs: "ipfs://bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
            gateway: "https://ipfs.io/ipfs/bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
            tor: "http://pressprotocol7x2q...onion/content/bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4"
          },
          verification: {
            verified: true,
            algorithm: "Ed25519",
            pubkey: "8fa3c019284719284...e81928374910293847192039481726"
          },
          timestamp: 1620000000
        }
      };
    case "publish_signed":
      return {
        status: 200,
        statusText: "OK",
        latencyMs: 38,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-signature-valid": "true (ed25519)",
          "x-zero-custody": "enforced",
        },
        data: {
          status: "broadcast_confirmed",
          cid: "bafkreib6u4...9z3k",
          swarm_announcement: {
            dht_peers_notified: 48,
            tor_circuits_active: 3,
          },
          timestamp: new Date().toISOString(),
        }
      };
    case "resolve":
      return {
        status: 200,
        statusText: "OK",
        latencyMs: 51,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-cache": "HIT (edge-node)",
        },
        data: {
          cid: "bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4",
          title: "Global Environmental Transparency Dossier 2026",
          body: "Full investigative disclosure on industrial pollution...",
          author: "Investigative Desk",
          verified: true,
        }
      };
    case "verify":
      return {
        status: 200,
        statusText: "OK",
        latencyMs: 24,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-crypto-suite": "RFC-8032-Ed25519",
        },
        data: {
          valid: true,
          pubkey: "8fa3c019284719284...e81928374910293847192039481726",
          canonical_hash: "3d4f8a...9c21",
        }
      };
    case "webhooks":
      return {
        status: 201,
        statusText: "Created",
        latencyMs: 65,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
        data: {
          webhook_id: "wh_live_89174912",
          url: "https://newsroom.example.com/api/webhooks/pressprotocol",
          events: ["article.published", "article.verified"],
          status: "active",
        }
      };
    case "metrics":
      return {
        status: 200,
        statusText: "OK",
        latencyMs: 19,
        headers: { "content-type": "application/json" },
        data: {
          dht_peers: 318,
          active_tor_onion_mirrors: 42,
          avg_resolution_ms: 42.4,
          uptime_sla: "99.98%",
        }
      };
    default:
      return null;
  }
};

export default function ApiExplorer({ apiKey, initialEndpoint }: ApiExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<"publish_raw" | "publish_signed" | "resolve" | "verify" | "webhooks" | "metrics">(
    initialEndpoint || "publish_raw"
  );
  const [targetMode, setTargetMode] = useState<"sandbox" | "local" | "production">("sandbox");
  const [customNodeUrl, setCustomNodeUrl] = useState<string>("");
  const [requestBodyText, setRequestBodyText] = useState<string>("");
  const [resolveCidInput, setResolveCidInput] = useState<string>(DEFAULT_REQUESTS.resolve.cid);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [responseResult, setResponseResult] = useState<ApiResponseResult | null>(
    getSampleResponseForEndpoint("publish_raw")
  );

  useEffect(() => {
    if (initialEndpoint) {
      setSelectedEndpoint(initialEndpoint);
    }
  }, [initialEndpoint]);

  useEffect(() => {
    if (selectedEndpoint === "publish_raw") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_raw, null, 2));
    } else if (selectedEndpoint === "publish_signed") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_signed, null, 2));
    } else if (selectedEndpoint === "verify") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.verify, null, 2));
    } else if (selectedEndpoint === "webhooks") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.webhooks, null, 2));
    } else {
      setRequestBodyText("");
    }
    setResponseResult(getSampleResponseForEndpoint(selectedEndpoint));
  }, [selectedEndpoint]);

  const getActiveGatewayUrl = () => {
    if (customNodeUrl.trim()) return customNodeUrl.trim().replace(/\/$/, "");
    if (targetMode === "local") return "http://127.0.0.1:4000";
    if (targetMode === "production") return getBackendUrl().replace(/\/$/, "");
    return "in-browser-sandbox";
  };

  const executeApiRequest = async () => {
    setIsExecuting(true);
    setResponseResult(null);
    const startTime = performance.now();

    try {
      const activeUrl = getActiveGatewayUrl();

      // IN-BROWSER CRYPTOGRAPHIC SANDBOX MODE
      if (targetMode === "sandbox" || activeUrl === "in-browser-sandbox") {
        await new Promise((resolve) => setTimeout(resolve, 35));

        if (selectedEndpoint === "publish_raw") {
          const parsed = JSON.parse(requestBodyText || "{}");
          const cid = calculateDeterministicCIDv1(parsed.content || "sample content");
          const kp = await generateKeypair();
          const timestamp = new Date().toISOString();
          const canonical = createCanonicalPayload(parsed.title || "Untitled", parsed.tags || [], timestamp);
          const signature = await signPayload(canonical, kp.privateKey);

          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 201,
            statusText: "Created",
            latencyMs,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-ratelimit-limit": "120",
              "x-ratelimit-remaining": "119",
              "x-gateway-engine": "pressprotocol-in-browser-sandbox/v1",
            },
            data: {
              success: true,
              cid,
              title: parsed.title,
              tags: parsed.tags || [],
              timestamp,
              publisher: {
                publicKey: kp.publicKey,
                signature,
                username: parsed.author || "Sandbox Publisher",
              },
              urls: {
                ipfs: `https://ipfs.io/ipfs/${cid}`,
                gateway: `http://127.0.0.1:4000/read/${cid}`,
                tor: `http://pressp42x7a6sover.onion/read/${cid}`,
              },
              proof: {
                protocol: "PressProtocol",
                version: "1.0.0-sovereign",
                standard: "RFC-8032-CIDv1",
                cid,
              },
            },
          });
        } else if (selectedEndpoint === "publish_signed") {
          const parsed = JSON.parse(requestBodyText || "{}");
          const kp = await generateKeypair();
          const timestamp = parsed.timestamp || new Date().toISOString();
          const canonical = createCanonicalPayload(parsed.title, parsed.tags || [], timestamp);
          const signature = await signPayload(canonical, kp.privateKey);
          const cid = calculateDeterministicCIDv1(parsed.content || "");

          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 201,
            statusText: "Created (Zero-Custody)",
            latencyMs,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-ratelimit-limit": "120",
              "x-ratelimit-remaining": "119",
              "x-custody-mode": "client-signed-zero-custody",
            },
            data: {
              success: true,
              cid,
              verified: true,
              algorithm: "Ed25519 (RFC 8032)",
              multihash: "sha2-256-raw-cidv1",
              publisher: {
                publicKey: kp.publicKey,
                signature,
              },
              transports: {
                ipfs: `https://ipfs.io/ipfs/${cid}`,
                tor: `http://pressp42x7a6sover.onion/read/${cid}`,
                local: `http://127.0.0.1:4000/read/${cid}`,
              },
            },
          });
        } else if (selectedEndpoint === "resolve") {
          const cid = resolveCidInput.trim() || DEFAULT_REQUESTS.resolve.cid;
          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 200,
            statusText: "OK",
            latencyMs,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-ratelimit-limit": "120",
              "x-ratelimit-remaining": "118",
            },
            data: {
              success: true,
              cid,
              data: {
                title: "Decentralized Whistleblower Dossier",
                content: "# Verified Document\n\nPreserved permanently without single point of failure.",
                tags: ["investigation", "sovereign", "tor"],
                timestamp: "2026-09-13T01:00:00.000Z",
                publisher: {
                  publicKey: "7f2a89b0c1d2e3f4a5b6c7d8e9f0123456789abcdef0123456789abcdef01234",
                  signature: "e5f93f123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                  username: "Autonomous Newsroom",
                },
              },
              mirrors: [
                { type: "local-daemon", url: `http://127.0.0.1:4000/read/${cid}`, online: true, latencyMs: 8 },
                { type: "tor-onion", url: `http://pressp42x7a6sover.onion/read/${cid}`, online: true, latencyMs: 84 },
                { type: "public-ipfs", url: `https://ipfs.io/ipfs/${cid}`, online: true, latencyMs: 142 },
              ],
            },
          });
        } else if (selectedEndpoint === "verify") {
          const parsed = JSON.parse(requestBodyText || "{}");
          const kp = await generateKeypair();
          const canonical = createCanonicalPayload(parsed.title, parsed.tags || [], parsed.timestamp);
          const sig = await signPayload(canonical, kp.privateKey);
          const isSigValid = await verifySignature(canonical, sig, kp.publicKey);
          const cid = calculateDeterministicCIDv1(parsed.content || "");

          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 200,
            statusText: "OK",
            latencyMs,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-verification-engine": "rfc-8032-ed25519",
            },
            data: {
              isValid: isSigValid,
              cidMatches: true,
              signatureValid: isSigValid,
              computedCID: cid,
              algorithm: "Ed25519 (RFC 8032)",
              latencyMs,
              auditTimestamp: new Date().toISOString(),
            },
          });
        } else if (selectedEndpoint === "webhooks") {
          const parsed = JSON.parse(requestBodyText || "{}");
          const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          const subId = `sub_${Date.now().toString(36)}_${randomHex.slice(0, 4)}`;
          const secret = parsed.secret || `whsec_${randomHex}`;
          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 201,
            statusText: "Created",
            latencyMs,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "x-ratelimit-limit": "120",
              "x-ratelimit-remaining": "119",
              "x-webhook-id": subId,
            },
            data: {
              success: true,
              subscription: {
                id: subId,
                url: parsed.url || "https://newsroom.example.com/api/webhooks/pressprotocol",
                events: parsed.events || ["article.published", "article.verified"],
                secret,
                description: parsed.description || "Production Outbound Webhook",
                status: "active",
                createdAt: new Date().toISOString(),
                stats: {
                  deliveredCount: 0,
                  failureCount: 0,
                },
              },
              instructions: "Store the secret securely. Incoming webhooks will be signed with HMAC-SHA256 in the X-PressProtocol-Signature header.",
            },
          });
        } else if (selectedEndpoint === "metrics") {
          const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
          setResponseResult({
            status: 200,
            statusText: "OK",
            latencyMs,
            headers: { "content-type": "application/json; charset=utf-8" },
            data: {
              totalRequests: 14820,
              totalBytesRelayed: 84210940,
              totalBytesPinned: 53201400,
              activeKeysCount: 42,
              uptimeSeconds: 864200,
              connectedPeers: 18,
              torCircuitsActive: 6,
              averageResponseMs: 14.8,
            },
          });
        }
      } else {
        // LIVE HTTP REQUEST
        let url = "";
        let method = "GET";
        let body: any = null;

        if (selectedEndpoint === "publish_raw") {
          url = `${activeUrl}/api/v1/publish/raw`;
          method = "POST";
          body = requestBodyText;
        } else if (selectedEndpoint === "publish_signed") {
          url = `${activeUrl}/api/v1/publish/signed`;
          method = "POST";
          body = requestBodyText;
        } else if (selectedEndpoint === "resolve") {
          const cid = resolveCidInput.trim() || DEFAULT_REQUESTS.resolve.cid;
          url = `${activeUrl}/api/v1/resolve/${cid}`;
          method = "GET";
        } else if (selectedEndpoint === "verify") {
          url = `${activeUrl}/api/v1/verify`;
          method = "POST";
          body = requestBodyText;
        } else if (selectedEndpoint === "webhooks") {
          url = `${activeUrl}/api/v1/webhooks/subscriptions`;
          method = "POST";
          body = requestBodyText;
        } else if (selectedEndpoint === "metrics") {
          url = `${activeUrl}/api/v1/metrics`;
          method = "GET";
        }

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-API-Key": apiKey,
          },
          body: method === "POST" ? body : undefined,
        });

        const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
        const resHeaders: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        const data = await res.json().catch(() => ({ raw: "Non-JSON response" }));

        setResponseResult({
          status: res.status,
          statusText: res.statusText || (res.status === 200 ? "OK" : res.status === 201 ? "Created" : "Error"),
          latencyMs,
          headers: resHeaders,
          data,
        });
      }
    } catch (err: any) {
      const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
      setResponseResult({
        status: 500,
        statusText: "Network / Execution Error",
        latencyMs,
        headers: { "error-type": "client-side-catch" },
        data: {
          error: err.message || "Failed to execute request",
          hint: "If using a local node, ensure `http://127.0.0.1:4000` is running or switch to 'In-Browser Sandbox' for instant simulation.",
        },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyResponseJson = () => {
    if (!responseResult?.data) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult.data, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <section id="api-explorer" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-accent-ribbon" />
            <h2 className="text-2xl font-medium tracking-tight text-text-primary font-sans">Interactive API Explorer</h2>
          </div>
          <p className="text-sm text-text-muted mt-1 font-sans">
            Send live requests to PressProtocol endpoints directly from your browser.
          </p>
        </div>

        {/* Target Environment Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-overlay p-1 rounded-[6px] border border-hairline text-xs font-mono w-full sm:w-auto">
          <span className="text-text-muted font-medium pl-1.5 hidden sm:inline">Target:</span>
          <button
            onClick={() => setTargetMode("sandbox")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[4px] transition-all flex-1 sm:flex-initial text-center text-xs ${
              targetMode === "sandbox"
                ? "bg-elevated text-text-primary border border-hairline shadow-sm font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Sandbox
          </button>
          <button
            onClick={() => setTargetMode("local")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[4px] transition-all flex-1 sm:flex-initial text-center text-xs ${
              targetMode === "local"
                ? "bg-elevated text-text-primary border border-hairline shadow-sm font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Local (4000)
          </button>
          <button
            onClick={() => setTargetMode("production")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[4px] transition-all flex-1 sm:flex-initial text-center text-xs ${
              targetMode === "production"
                ? "bg-elevated text-text-primary border border-hairline shadow-sm font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Production
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Navigator & Request Form */}
        <div className="lg:col-span-6 space-y-4">
          {/* Endpoint Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedEndpoint("publish_raw")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "publish_raw"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-accent-ribbon border-hairline">POST</Badge>
                <span className="font-mono truncate">/publish/raw</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">Server-Signed Ingest</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("publish_signed")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "publish_signed"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-accent-ribbon border-hairline">POST</Badge>
                <span className="font-mono truncate">/publish/signed</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">Zero-Custody Distribute</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("resolve")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "resolve"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-verified border-hairline">GET</Badge>
                <span className="font-mono truncate">/resolve/:cid</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">Multi-Transport Query</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("verify")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "verify"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-accent-ribbon border-hairline">POST</Badge>
                <span className="font-mono truncate">/verify</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">RFC 8032 Signature Audit</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("webhooks")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "webhooks"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-accent-ribbon border-hairline">POST</Badge>
                <span className="font-mono truncate">/webhooks</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">Outbound Events</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("metrics")}
              className={`p-3 text-left rounded-[6px] border text-xs transition-all ${
                selectedEndpoint === "metrics"
                  ? "border-hairline bg-elevated text-text-primary font-medium shadow-sm"
                  : "border-hairline bg-surface hover:bg-overlay text-text-secondary"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono bg-overlay text-verified border-hairline">GET</Badge>
                <span className="font-mono truncate">/metrics</span>
              </div>
              <div className="text-[11px] text-text-muted truncate mt-1.5">Node Telemetry</div>
            </button>
          </div>

          {/* Request Builder Card */}
          <Card elevation="card">
            <CardHeader className="pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium font-mono flex items-center gap-2">
                  <span className={selectedEndpoint === "resolve" || selectedEndpoint === "metrics" ? "text-verified font-bold" : "text-accent-ribbon font-bold"}>
                    {selectedEndpoint === "resolve" || selectedEndpoint === "metrics" ? "GET" : "POST"}
                  </span>
                  <span className="text-text-primary">
                    /api/v1/{selectedEndpoint === "resolve" ? "resolve/{cid}" : selectedEndpoint === "webhooks" ? "webhooks/subscriptions" : selectedEndpoint.replace("_", "/")}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-text-muted font-sans">
                  {selectedEndpoint === "publish_raw" && "Accepts raw payload, computes deterministic CIDv1 in-memory, signs with Ed25519."}
                  {selectedEndpoint === "publish_signed" && "Zero-custody distributor. Accepts client-signed payload without receiving private key."}
                  {selectedEndpoint === "resolve" && "Resolves content and queries live latency from Tor, IPFS, and local gateways."}
                  {selectedEndpoint === "verify" && "Audits any arbitrary text against signature and CID under RFC 8032."}
                  {selectedEndpoint === "webhooks" && "Registers an HTTP endpoint to receive real-time signed event callbacks (article.published, article.verified)."}
                  {selectedEndpoint === "metrics" && "Queries node throughput, active keys, pinned bytes, and circuit telemetry."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Headers Preview */}
              <div className="rounded-[6px] bg-canvas p-3 font-mono text-xs space-y-1 text-text-muted border border-hairline">
                <div>Authorization: Bearer <span className="text-text-primary font-medium">{apiKey}</span></div>
                <div>Content-Type: <span className="text-text-secondary">application/json</span></div>
              </div>

              {/* Specific Parameter Inputs */}
              {selectedEndpoint === "resolve" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-secondary">Target IPFS CIDv1</label>
                  <Input
                    value={resolveCidInput}
                    onChange={(e) => setResolveCidInput(e.target.value)}
                    placeholder="bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4"
                    className="font-mono text-xs bg-canvas border-hairline text-text-primary rounded-[6px] focus-visible:ring-accent-primary/40"
                  />
                </div>
              )}

              {/* JSON Body Editor */}
              {selectedEndpoint !== "resolve" && selectedEndpoint !== "metrics" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="text-text-secondary">Request Payload (JSON)</label>
                    <button
                      onClick={() => {
                        if (selectedEndpoint === "publish_raw") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_raw, null, 2));
                        if (selectedEndpoint === "publish_signed") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_signed, null, 2));
                        if (selectedEndpoint === "verify") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.verify, null, 2));
                        if (selectedEndpoint === "webhooks") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.webhooks, null, 2));
                      }}
                      className="text-text-secondary hover:text-text-primary text-[11px]"
                    >
                      Reset to Sample
                    </button>
                  </div>
                  <Textarea
                    rows={8}
                    value={requestBodyText}
                    onChange={(e) => setRequestBodyText(e.target.value)}
                    className="font-mono text-xs leading-relaxed resize-y bg-canvas border-hairline text-text-secondary rounded-[6px] focus-visible:ring-accent-primary/40"
                  />
                </div>
              )}

              {/* Execute Button */}
              <Button
                onClick={executeApiRequest}
                disabled={isExecuting}
                className="w-full gap-2 bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium text-xs h-10 rounded-[6px] shadow-none transition-all"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Executing Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 fill-current" /> Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Response Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <Card elevation="card" className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-hairline">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-accent-ribbon" />
                  <CardTitle className="text-base font-medium text-text-primary font-sans">Response Inspector</CardTitle>
                </div>
                {responseResult && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Badge
                      variant="outline"
                      className={
                        responseResult.status >= 200 && responseResult.status < 300
                          ? "border-verified/30 bg-verified/10 text-verified font-bold"
                          : "border-error/30 bg-error/10 text-error font-bold"
                      }
                    >
                      {responseResult.status} {responseResult.statusText}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-mono border-hairline bg-overlay text-text-secondary tnum">
                      <Zap className="h-3 w-3 text-warning" />
                      {responseResult.latencyMs}ms
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
              {responseResult ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Clickable Quick Action Shortcut if CID exists */}
                  {responseResult.data?.cid && (
                    <div className="p-3 rounded-[6px] bg-overlay border border-hairline text-xs flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-text-primary font-medium truncate max-w-[260px] sm:max-w-xs">
                        📦 CID: {responseResult.data.cid}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedEndpoint("resolve");
                            setResolveCidInput(responseResult.data.cid);
                          }}
                          className="text-text-secondary hover:text-text-primary font-mono text-[11px]"
                        >
                          Resolve in API
                        </button>
                        <a
                          href={`https://ipfs.io/ipfs/${responseResult.data.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary hover:text-text-primary font-mono text-[11px] flex items-center gap-0.5"
                        >
                          IPFS Mirror <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Response Body JSON */}
                  <div className="relative flex-1 rounded-[6px] bg-canvas p-4 font-mono text-xs overflow-x-auto border border-hairline">
                    <button
                      onClick={copyResponseJson}
                      className="absolute top-2.5 right-2.5 px-2 py-1 rounded-[4px] bg-overlay hover:bg-elevated border border-hairline text-text-secondary hover:text-text-primary text-[10px] flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedResponse ? <Check className="h-3 w-3 text-verified" /> : <Copy className="h-3 w-3" />}
                      {copiedResponse ? "Copied" : "Copy"}
                    </button>
                    <pre className="text-text-secondary leading-relaxed whitespace-pre">
                      {JSON.stringify(responseResult.data, null, 2)}
                    </pre>
                  </div>

                  {/* Response Headers */}
                  <div className="text-[11px] font-mono text-text-muted">
                    <div className="font-medium text-text-secondary mb-1">Response Headers:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(responseResult.headers).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-text-muted">{k}:</span> <span className="text-text-secondary">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted space-y-3">
                  <div className="h-12 w-12 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-accent-ribbon" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-text-primary font-sans">No Request Sent Yet</div>
                    <div className="text-xs max-w-xs text-text-muted font-sans">
                      Configure the parameters on the left and click &ldquo;Send Request&rdquo; to test the gateway response.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
