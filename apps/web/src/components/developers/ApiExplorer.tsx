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
  metrics: {},
};

interface ApiExplorerProps {
  apiKey: string;
}

export default function ApiExplorer({ apiKey }: ApiExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<"publish_raw" | "publish_signed" | "resolve" | "verify" | "metrics">("publish_raw");
  const [targetMode, setTargetMode] = useState<"sandbox" | "local" | "production">("sandbox");
  const [customNodeUrl, setCustomNodeUrl] = useState<string>("");
  const [requestBodyText, setRequestBodyText] = useState<string>("");
  const [resolveCidInput, setResolveCidInput] = useState<string>(DEFAULT_REQUESTS.resolve.cid);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    data: any;
  } | null>(null);

  useEffect(() => {
    if (selectedEndpoint === "publish_raw") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_raw, null, 2));
    } else if (selectedEndpoint === "publish_signed") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_signed, null, 2));
    } else if (selectedEndpoint === "verify") {
      setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.verify, null, 2));
    } else {
      setRequestBodyText("");
    }
    setResponseResult(null);
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
          <h2 className="text-2xl font-bold tracking-tight">Interactive API Explorer</h2>
          <p className="text-sm text-muted-foreground">
            Send live requests to PressProtocol endpoints directly from your browser.
          </p>
        </div>

        {/* Target Environment Switcher */}
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border text-xs">
          <span className="text-muted-foreground font-medium pl-1">Target:</span>
          <button
            onClick={() => setTargetMode("sandbox")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              targetMode === "sandbox"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            In-Browser Sandbox
          </button>
          <button
            onClick={() => setTargetMode("local")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              targetMode === "local"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Local Node (4000)
          </button>
          <button
            onClick={() => setTargetMode("production")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              targetMode === "production"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Production Gateway
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
              className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                selectedEndpoint === "publish_raw"
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">POST</Badge>
                <span className="font-mono truncate">/publish/raw</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">Custodial Ingest</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("publish_signed")}
              className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                selectedEndpoint === "publish_signed"
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">POST</Badge>
                <span className="font-mono truncate">/publish/signed</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">Zero-Custody</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("resolve")}
              className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                selectedEndpoint === "resolve"
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">GET</Badge>
                <span className="font-mono truncate">/resolve/:cid</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">Multi-Mirror Resolver</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("verify")}
              className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                selectedEndpoint === "verify"
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">POST</Badge>
                <span className="font-mono truncate">/verify</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">Cryptographic Audit</div>
            </button>

            <button
              onClick={() => setSelectedEndpoint("metrics")}
              className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                selectedEndpoint === "metrics"
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "border-border hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">GET</Badge>
                <span className="font-mono truncate">/metrics</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-1">Node Telemetry</div>
            </button>
          </div>

          {/* Request Builder Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold font-mono flex items-center gap-2">
                  <span className={selectedEndpoint === "resolve" || selectedEndpoint === "metrics" ? "text-blue-600 font-bold" : "text-emerald-600 font-bold"}>
                    {selectedEndpoint === "resolve" || selectedEndpoint === "metrics" ? "GET" : "POST"}
                  </span>
                  <span>
                    /api/v1/{selectedEndpoint === "resolve" ? "resolve/{cid}" : selectedEndpoint.replace("_", "/")}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedEndpoint === "publish_raw" && "Accepts raw payload, computes deterministic CIDv1 in-memory, signs with Ed25519."}
                  {selectedEndpoint === "publish_signed" && "Zero-custody distributor. Accepts client-signed payload without receiving private key."}
                  {selectedEndpoint === "resolve" && "Resolves content and queries live latency from Tor, IPFS, and local gateways."}
                  {selectedEndpoint === "verify" && "Audits any arbitrary text against signature and CID under RFC 8032."}
                  {selectedEndpoint === "metrics" && "Queries node throughput, active keys, pinned bytes, and circuit telemetry."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Headers Preview */}
              <div className="rounded-md bg-muted/40 p-2.5 font-mono text-xs space-y-1 text-muted-foreground border">
                <div>Authorization: Bearer <span className="text-foreground">{apiKey}</span></div>
                <div>Content-Type: <span className="text-foreground">application/json</span></div>
              </div>

              {/* Specific Parameter Inputs */}
              {selectedEndpoint === "resolve" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Target IPFS CIDv1</label>
                  <Input
                    value={resolveCidInput}
                    onChange={(e) => setResolveCidInput(e.target.value)}
                    placeholder="bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4"
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* JSON Body Editor */}
              {selectedEndpoint !== "resolve" && selectedEndpoint !== "metrics" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-foreground">Request Payload (JSON)</label>
                    <button
                      onClick={() => {
                        if (selectedEndpoint === "publish_raw") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_raw, null, 2));
                        if (selectedEndpoint === "publish_signed") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.publish_signed, null, 2));
                        if (selectedEndpoint === "verify") setRequestBodyText(JSON.stringify(DEFAULT_REQUESTS.verify, null, 2));
                      }}
                      className="text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      Reset to Sample
                    </button>
                  </div>
                  <Textarea
                    rows={8}
                    value={requestBodyText}
                    onChange={(e) => setRequestBodyText(e.target.value)}
                    className="font-mono text-xs leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* Execute Button */}
              <Button
                onClick={executeApiRequest}
                disabled={isExecuting}
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Executing Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Response Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base font-semibold">Response Inspector</CardTitle>
                </div>
                {responseResult && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Badge
                      variant="outline"
                      className={
                        responseResult.status >= 200 && responseResult.status < 300
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "border-red-500/30 bg-red-500/10 text-red-600 font-bold"
                      }
                    >
                      {responseResult.status} {responseResult.statusText}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 font-mono">
                      <Zap className="h-3 w-3 text-amber-500" />
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
                    <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-blue-700 dark:text-blue-300 font-medium truncate max-w-[260px] sm:max-w-xs">
                        📦 CID: {responseResult.data.cid}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEndpoint("resolve");
                            setResolveCidInput(responseResult.data.cid);
                          }}
                          className="text-blue-600 hover:underline font-medium text-[11px]"
                        >
                          Resolve in API →
                        </button>
                        <a
                          href={`https://ipfs.io/ipfs/${responseResult.data.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium text-[11px] flex items-center gap-0.5"
                        >
                          IPFS Mirror <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Response Body JSON */}
                  <div className="relative flex-1 rounded-md bg-muted/60 p-3 font-mono text-xs overflow-x-auto border">
                    <button
                      onClick={copyResponseJson}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1 shadow-xs"
                    >
                      {copiedResponse ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copiedResponse ? "Copied" : "Copy"}
                    </button>
                    <pre className="text-foreground leading-relaxed whitespace-pre">
                      {JSON.stringify(responseResult.data, null, 2)}
                    </pre>
                  </div>

                  {/* Response Headers */}
                  <div className="text-[11px] font-mono text-muted-foreground">
                    <div className="font-semibold text-foreground mb-1">Response Headers:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(responseResult.headers).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-muted-foreground">{k}:</span> <span className="text-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">No Request Sent Yet</div>
                    <div className="text-xs max-w-xs text-muted-foreground">
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
