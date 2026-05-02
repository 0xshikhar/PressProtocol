"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Download, Shield, Clock, BookOpen, ShieldCheck, ShieldAlert, Loader2, FileCheck, Archive } from "lucide-react";
import { apiClient, type ResolveContentResponse } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateReadingTime } from "@/lib/reading-time";
import { ReadingProgressBar } from "@/components/reader/ReadingProgressBar";
import { TableOfContents } from "@/components/reader/TableOfContents";
import { BookmarkButton } from "@/components/reader/BookmarkButton";
import { EmbedDialog } from "@/components/reader/EmbedDialog";
import { TorShareSection } from "@/components/tor/TorShareSection";
import { Separator } from "@/components/ui/separator";
import { verifyArticleSignature, type VerificationResult } from "@/lib/signature-verifier";
import { exportPressProof, downloadPressProofFile } from "@pressprotocol/proof";

export default function ReadPage() {
  const params = useParams();
  const cid = params.cid as string;
  const [content, setContent] = useState<ResolveContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const readingStats = content ? calculateReadingTime(content.content) : null;

  const handleExportProof = () => {
    if (!content) return;
    try {
      const proof = exportPressProof({
        cid: content.cid,
        title: content.title,
        content: content.content,
        tags: content.tags,
        timestamp: content.createdAt,
        publisher: {
          publicKey: content.publisher?.pubkey || "",
          signature: content.publisher?.signature || "unsigned",
          walletAddress: content.publisher?.walletAddress,
          username: content.publisher?.username,
        },
        mirrors: {
          ipfs: content.mirrors?.ipfs?.url || `ipfs://${content.cid}`,
          tor: content.mirrors?.tor?.url,
          gateway: content.mirrors?.gateway?.url,
        },
      });

      downloadPressProofFile(proof);
      toast.success("Downloaded offline cryptographic proof (.pressproof.json)");
    } catch (err: any) {
      toast.error(err.message || "Failed to export proof");
    }
  };

  const handleArchiveWayback = async () => {
    if (!content) return;
    setIsArchiving(true);
    try {
      const res = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid: content.cid }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.status === "saved"
            ? "Preserved on Wayback Machine!"
            : "Archival request queued on Wayback Machine!"
        );
        if (data.snapshotUrl) {
          window.open(data.snapshotUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        throw new Error(data.error || "Archival request failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not preserve to Wayback Machine");
    } finally {
      setIsArchiving(false);
    }
  };

  useEffect(() => {
    if (cid) {
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getContent(cid);
      
      // 🔍 DEBUG: Log content data
      console.log('📊 [READ PAGE] Content loaded:', {
        cid: data.cid,
        title: data.title,
        hasMirrors: !!data.mirrors,
        mirrors: data.mirrors,
        hasTor: !!data.mirrors?.tor,
        torAvailable: data.mirrors?.tor?.available,
        torUrl: data.mirrors?.tor?.url,
      });
      
      setContent(data);

      // Perform authentic in-browser Ed25519 signature verification
      setIsVerifying(true);
      verifyArticleSignature(data)
        .then((res) => {
          setVerificationResult(res);
        })
        .catch((vErr) => {
          console.error("❌ [READ PAGE] Cryptographic verification failed:", vErr);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } catch (err) {
      console.error("❌ [READ PAGE] Error loading content:", err);
      setError("Failed to load content. The content may not exist or is temporarily unavailable.");
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Alert variant="destructive">
          <AlertDescription>{error || "Content not found"}</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const getMirrorStatusColor = (available: boolean) => {
    return available ? "bg-green-500" : "bg-red-500";
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      {/* Table of Contents */}
      <TableOfContents contentRef={contentRef} />
      
      <div className="min-h-screen bg-background">
        {/* Extension Install Banner */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4 py-3">
            <Alert className="border-0 bg-transparent">
              <Download className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Install the PressProtocol browser extension for automatic multi-network routing.
                <Button variant="link" className="ml-2 h-auto p-0 text-sm">
                  Install Extension
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Article Content - Medium Style */}
        <article className="mx-auto max-w-[680px] px-6 py-12">
          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-6">
            {content.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {readingStats && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {readingStats.formattedTime}
                </span>
              )}
              <span>•</span>
              <time>{new Date(content.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</time>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isVerifying ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                  </span>
                ) : verificationResult?.isValid ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Ed25519 Verified ({verificationResult.latencyMs}ms)
                  </span>
                ) : verificationResult?.status === "unsigned" ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    Unsigned
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Unverified
                  </span>
                )}
              </span>
            </div>
            
            {/* Actions: Embed, Bookmark, Proof Export & Wayback Archive */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProof}
                className="h-8 gap-1.5 text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
                title="Export offline cryptographic proof (.pressproof.json)"
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export Proof</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveWayback}
                disabled={isArchiving}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Preserve snapshot on Internet Archive / Wayback Machine"
              >
                <Archive className={`h-3.5 w-3.5 ${isArchiving ? "animate-spin text-cyan-500" : ""}`} />
                <span className="hidden sm:inline">Wayback</span>
              </Button>

              <EmbedDialog cid={cid} title={content.title} />
              <BookmarkButton 
                cid={cid} 
                title={content.title}
                tags={content.tags || []}
              />
            </div>
          </div>
          
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {content.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content - Medium Typography */}
          <div
            ref={contentRef}
            className="article-content
                       prose prose-lg max-w-none
                       prose-headings:font-sans prose-headings:font-bold
                       prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-12
                       prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-10
                       prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-8
                       prose-p:text-[21px] prose-p:leading-[1.58] prose-p:mb-8
                       prose-p:font-serif prose-p:text-foreground
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:font-semibold
                       prose-blockquote:border-l-4 prose-blockquote:border-primary
                       prose-blockquote:pl-6 prose-blockquote:italic
                       prose-blockquote:text-muted-foreground
                       prose-img:rounded-lg prose-img:my-8
                       prose-code:bg-muted prose-code:px-2 prose-code:py-1
                       prose-code:rounded prose-code:text-sm
                       prose-pre:bg-muted prose-pre:border
                       prose-li:text-[21px] prose-li:leading-[1.58]
                       prose-li:font-serif prose-li:mb-2
                       dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </article>

        {/* Mirror Status Card - Move inside container */}
        <div className="container mx-auto max-w-4xl px-6 space-y-6 pb-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mirror Status</CardTitle>
          <CardDescription>
            Content is available across multiple networks for maximum resilience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.mirrors.ipfs && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${getMirrorStatusColor(content.mirrors.ipfs.available)}`} />
                  <div>
                    <div className="font-medium">IPFS</div>
                    <div className="text-sm text-muted-foreground">
                      {content.mirrors.ipfs.available ? "Available" : "Unavailable"}
                      {content.mirrors.ipfs.latency && ` • ${content.mirrors.ipfs.latency}ms`}
                    </div>
                  </div>
                </div>
                {content.mirrors.ipfs.available && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(content.mirrors.ipfs.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              </div>
            )}

            {content.mirrors.tor && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${getMirrorStatusColor(content.mirrors.tor.available)}`} />
                  <div>
                    <div className="font-medium">Tor Network</div>
                    <div className="text-sm text-muted-foreground">
                      {content.mirrors.tor.available ? "Available via Tor Browser" : "Unavailable"}
                      {content.mirrors.tor.latency && ` • ${content.mirrors.tor.latency}ms`}
                    </div>
                  </div>
                </div>
                {content.mirrors.tor.available && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    .onion
                  </Badge>
                )}
              </div>
            )}

            {content.mirrors.gateway && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${getMirrorStatusColor(content.mirrors.gateway.available)}`} />
                  <div>
                    <div className="font-medium">Gateway</div>
                    <div className="text-sm text-muted-foreground">
                      {content.mirrors.gateway.available ? "Available" : "Unavailable"}
                      {content.mirrors.gateway.latency && ` • ${content.mirrors.gateway.latency}ms`}
                    </div>
                  </div>
                </div>
                {content.mirrors.gateway.available && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(content.mirrors.gateway.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted">
            <div className="text-sm font-medium mb-1">Recommended Mirror</div>
            <div className="text-sm text-muted-foreground capitalize">
              {content.recommended} (fastest available)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DEBUG CARD - Temporary */}
      {/* <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="text-sm">🔍 DEBUG: Tor Mirror Data</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono space-y-2">
          <div>mirrors.tor exists: {content.mirrors?.tor ? '✅ YES' : '❌ NO'}</div>
          <div>mirrors.tor.available: {content.mirrors?.tor?.available ? '✅ true' : '❌ false'}</div>
          <div>mirrors.tor.url: {content.mirrors?.tor?.url || '❌ NOT SET'}</div>
          <div className="pt-2 border-t">Full mirrors object:</div>
          <pre className="text-[10px] overflow-auto">
            {JSON.stringify(content.mirrors, null, 2)}
          </pre>
        </CardContent>
      </Card> */}

      {/* Tor Onion Access Section */}
      {content.mirrors.tor && content.mirrors.tor.available && content.mirrors.tor.url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Access via Tor Network
            </CardTitle>
            <CardDescription>
              Maximum privacy and censorship resistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TorShareSection
              onionUrl={content.mirrors.tor.url}
              contentTitle={content.title}
            />
          </CardContent>
        </Card>
      )}

      {/* Publisher Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Publisher Information</CardTitle>
            {(!content.publisher.walletAddress || content.publisher.walletAddress === "anonymous" || (content.publisher as any).isAnonymous) ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-mono text-xs">
                <Shield className="h-3 w-3" /> Anonymous Sovereign
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                Verified Author
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!content.publisher.walletAddress || content.publisher.walletAddress === "anonymous" || (content.publisher as any).isAnonymous) ? (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Pseudonym</div>
              <div className="font-mono text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-400">
                {content.publisher.pubkey
                  ? `Anon-${content.publisher.pubkey.slice(0, 4)}...${content.publisher.pubkey.slice(-4)}`
                  : "Anonymous Author"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Published without account linkage. Identity is cryptographically anchored to an Ed25519 keypair.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm mt-1">{content.publisher.walletAddress}</div>
            </div>
          )}
          {content.publisher.username && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Username</div>
              <div className="mt-1">{content.publisher.username}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Ed25519 Public Key</span>
              {content.publisher.pubkey && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(content.publisher.pubkey);
                    toast.success("Public key copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              )}
            </div>
            <div className="font-mono text-xs mt-1 break-all bg-muted/40 p-2 rounded border border-border/40 select-all">
              {content?.publisher?.pubkey || "Unknown"}
            </div>
          </div>
          {/* Cryptographic Provenance Section */}
          <div className="pt-2 border-t border-border/40 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cryptographic Provenance
            </div>
            {isVerifying ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-md bg-muted/30">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Verifying Ed25519 signature in-browser via WebCrypto...</span>
              </div>
            ) : verificationResult?.isValid ? (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Ed25519 Signature Verified</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                    {verificationResult.latencyMs}ms
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified in-browser using RFC 8032 / SHA-512. The author&apos;s sovereign private key signed this payload without intermediary authority.
                </p>
                {verificationResult.signature && (
                  <div className="text-[10px] font-mono text-muted-foreground bg-background/50 p-2 rounded border border-border/30 break-all select-all">
                    <span className="text-foreground/70 font-semibold">SIG:</span> {verificationResult.signature}
                  </div>
                )}
              </div>
            ) : verificationResult?.status === "unsigned" ? (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Unsigned Article</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This document was published without an Ed25519 cryptographic signature.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Signature Mismatch / Untrusted</span>
                </div>
                <p className="text-xs text-destructive/80">
                  {verificationResult?.error || "The cryptographic signature could not be verified against the content payload."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content ID Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Content ID (CID)</div>
            <div className="font-mono text-sm mt-1 break-all">{content.cid}</div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-muted-foreground">Share Link</div>
            <div className="font-mono text-sm mt-1 break-all">anonpress://{content.cid}</div>
          </div>
        </CardContent>
      </Card>

      {/* Standalone Proof & Delay-Tolerant Preservation Card */}
      <Card className="border-cyan-500/20 bg-cyan-950/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-cyan-400">
              <FileCheck className="h-4 w-4" />
              Air-Gapped Cryptographic Proof
            </CardTitle>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
              .pressproof.json
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Export a self-contained, air-gapped cryptographic package verifying this article&apos;s SHA-256 multihash and author Ed25519 signature with zero network dependency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleExportProof}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Export .pressproof.json
            </Button>
            <Button
              onClick={handleArchiveWayback}
              disabled={isArchiving}
              variant="outline"
              size="sm"
              className="border-white/20 text-xs gap-2"
            >
              <Archive className={`h-3.5 w-3.5 ${isArchiving ? "animate-spin text-cyan-400" : ""}`} />
              Snapshot to Wayback Machine
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            Standard: RFC-8032 · Base32 CIDv1 · Offline Verifiable Codec
          </p>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}
