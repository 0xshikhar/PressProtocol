"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Clock, 
  Tag, 
  User, 
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import type { ContentManifest } from "@/lib/discovery";

interface ManifestViewerProps {
  manifestCid: string;
}

export function ManifestViewer({ manifestCid }: ManifestViewerProps) {
  const [manifest, setManifest] = useState<ContentManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest();
  }, [manifestCid]);

  const fetchManifest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:4000/api/manifest/${manifestCid}`);
      
      if (!response.ok) {
        throw new Error("Manifest not found");
      }

      const result = await response.json();
      setManifest(result.data);
    } catch (err) {
      console.error("Error fetching manifest:", err);
      setError("Failed to fetch manifest");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (error || !manifest) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Manifest not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Manifest Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <Badge variant="outline">v{manifest.version}</Badge>
              </div>
              <CardTitle className="text-2xl">{manifest.title}</CardTitle>
              <CardDescription className="mt-2">
                {manifest.excerpt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Word Count</div>
              <div className="text-2xl font-bold">{manifest.wordCount || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Reading Time</div>
              <div className="text-2xl font-bold">{manifest.readingTime || 0} min</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tags</div>
              <div className="text-2xl font-bold">{manifest.tags.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Published</div>
              <div className="text-sm font-medium">
                {new Date(manifest.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Tags */}
          {manifest.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {manifest.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Publisher */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Publisher</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {manifest.publisher.pubkey.slice(0, 32)}...
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(manifest.publisher.pubkey, "Public Key")}
              >
                {copied === "Public Key" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* CIDs */}
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Content CID</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                  {manifest.cid}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(manifest.cid, "Content CID")}
                >
                  {copied === "Content CID" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            {manifest.manifestCid && (
              <div>
                <div className="text-sm font-medium mb-1">Manifest CID</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                    {manifest.manifestCid}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(manifest.manifestCid!, "Manifest CID")}
                  >
                    {copied === "Manifest CID" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mirrors */}
          <div>
            <div className="text-sm font-medium mb-3">Content Mirrors</div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(manifest.mirrors.ipfs, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                IPFS Gateway
              </Button>
              {manifest.mirrors.tor && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Tor (.onion)
                </Button>
              )}
              {manifest.mirrors.gateway && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open(manifest.mirrors.gateway, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Web Gateway
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button
              className="w-full"
              onClick={() => window.location.href = `/read/${manifest.cid}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Read Full Article
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Details</CardTitle>
          <CardDescription>
            Manifest structure and metadata for developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
