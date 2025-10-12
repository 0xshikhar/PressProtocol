"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Download, Shield, Clock, BookOpen } from "lucide-react";
import { apiClient, type ResolveContentResponse } from "@/lib/api-client";
import { toast } from "sonner";
import { calculateReadingTime } from "@/lib/reading-time";
import { ReadingProgressBar } from "@/components/reader/ReadingProgressBar";
import { TableOfContents } from "@/components/reader/TableOfContents";

export default function ReadPage() {
  const params = useParams();
  const cid = params.cid as string;
  const [content, setContent] = useState<ResolveContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const readingStats = content ? calculateReadingTime(content.content) : null;

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
      setContent(data);
    } catch (err) {
      console.error("Error loading content:", err);
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
                Install the AnonPress browser extension for automatic multi-network routing.
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
          <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
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
              <Shield className="h-3 w-3" />
              Verified
            </span>
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
                    <div className="font-medium">Tor</div>
                    <div className="text-sm text-muted-foreground">
                      {content.mirrors.tor.available ? "Available" : "Unavailable"}
                      {content.mirrors.tor.latency && ` • ${content.mirrors.tor.latency}ms`}
                    </div>
                  </div>
                </div>
                {content.mirrors.tor.available && (
                  <div className="text-sm text-muted-foreground font-mono">
                    .onion
                  </div>
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

      {/* Publisher Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Publisher Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Wallet Address</div>
            <div className="font-mono text-sm mt-1">{content.publisher.walletAddress}</div>
          </div>
          {content.publisher.username && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Username</div>
              <div className="mt-1">{content.publisher.username}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground">Public Key</div>
            <div className="font-mono text-xs mt-1 break-all">{content.publisher.pubkey}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield className="h-4 w-4" />
            <span>Content signature verified</span>
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
        </div>
      </div>
    </>
  );
}
