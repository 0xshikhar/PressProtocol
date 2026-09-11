"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
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
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 rounded-[4px]" />
          <Skeleton className="h-4 w-3/4 mt-2 rounded-[4px]" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full rounded-[4px]" />
          <Skeleton className="h-4 w-full mt-2 rounded-[4px]" />
          <Skeleton className="h-4 w-2/3 mt-2 rounded-[4px]" />
        </CardContent>
      </Card>
    );
  }

  if (error || !manifest) {
    return (
      <Alert variant="destructive" className="border-error/40 bg-error/10 text-primary rounded-[6px]">
        <AlertDescription>
          <div className="space-y-2 text-xs font-sans">
            <p className="font-semibold text-error">{error || "Manifest not found"}</p>
            <p className="text-secondary">
              Common issues:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted">
              <li>You entered a Content CID instead of a Manifest CID</li>
              <li>When you publish, you receive a Content CID (article) and a Manifest CID (metadata)</li>
              <li>Use the Manifest CID here, not the Content CID</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Main Manifest Card */}
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-secondary" />
                <Badge variant="outline" className="border-border/60 bg-surface-raised font-mono text-[10px] rounded-[4px]">v{manifest.version}</Badge>
              </div>
              <CardTitle className="text-2xl font-sans font-semibold text-primary">{manifest.title}</CardTitle>
              <CardDescription className="mt-2 text-xs text-muted">
                {manifest.excerpt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 p-3 bg-surface-raised border border-border/60 rounded-[6px]">
              <div className="text-[11px] font-mono uppercase text-muted">Word Count</div>
              <div className="text-xl font-bold font-mono text-primary tnum">{manifest.wordCount || 0}</div>
            </div>
            <div className="space-y-1 p-3 bg-surface-raised border border-border/60 rounded-[6px]">
              <div className="text-[11px] font-mono uppercase text-muted">Reading Time</div>
              <div className="text-xl font-bold font-mono text-primary tnum">{manifest.readingTime || 0} min</div>
            </div>
            <div className="space-y-1 p-3 bg-surface-raised border border-border/60 rounded-[6px]">
              <div className="text-[11px] font-mono uppercase text-muted">Tags</div>
              <div className="text-xl font-bold font-mono text-primary tnum">{manifest.tags.length}</div>
            </div>
            <div className="space-y-1 p-3 bg-surface-raised border border-border/60 rounded-[6px]">
              <div className="text-[11px] font-mono uppercase text-muted">Published</div>
              <div className="text-sm font-medium font-mono text-primary">
                {new Date(manifest.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Tags */}
          {manifest.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-mono font-medium text-secondary">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {manifest.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="border-border/60 bg-surface-raised text-muted font-mono text-[11px] rounded-[4px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Publisher */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-mono font-medium text-secondary">Publisher Key</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background border border-border/70 px-2 py-1 rounded-[4px] font-mono text-primary">
                {manifest.publisher.pubkey.slice(0, 32)}...
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-[4px]"
                onClick={() => copyToClipboard(manifest.publisher.pubkey, "Public Key")}
              >
                {copied === "Public Key" ? (
                  <CheckCircle className="h-3.5 w-3.5 text-verified" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted" />
                )}
              </Button>
            </div>
          </div>

          {/* CIDs */}
          <div className="space-y-3">
            <div>
              <div className="text-xs font-mono text-muted mb-1">Content CID</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background border border-border/70 text-primary px-2 py-1 rounded-[4px] flex-1 break-all font-mono">
                  {manifest.cid}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-[4px]"
                  onClick={() => copyToClipboard(manifest.cid, "Content CID")}
                >
                  {copied === "Content CID" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-verified" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted" />
                  )}
                </Button>
              </div>
            </div>
            {manifest.manifestCid && (
              <div>
                <div className="text-xs font-mono text-muted mb-1">Manifest CID</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background border border-border/70 text-primary px-2 py-1 rounded-[4px] flex-1 break-all font-mono">
                    {manifest.manifestCid}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-[4px]"
                    onClick={() => copyToClipboard(manifest.manifestCid!, "Manifest CID")}
                  >
                    {copied === "Manifest CID" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-verified" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mirrors */}
          <div>
            <div className="text-xs font-mono text-muted mb-2">Content Mirrors</div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-border/70 bg-surface hover:bg-surface-raised text-primary text-xs font-mono rounded-[6px]"
                onClick={() => window.open(manifest.mirrors.ipfs, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-2 text-secondary" />
                IPFS Gateway
              </Button>
              {manifest.mirrors.tor && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border/50 bg-surface text-muted text-xs font-mono rounded-[6px]"
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
                  className="w-full justify-start border-border/70 bg-surface hover:bg-surface-raised text-primary text-xs font-mono rounded-[6px]"
                  onClick={() => window.open(manifest.mirrors.gateway, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-2 text-secondary" />
                  Web Gateway
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/60">
            <Button
              className="w-full bg-accent-primary hover:bg-accent-hover text-primary font-semibold font-mono text-xs rounded-[6px] h-10"
              onClick={() => window.location.href = `/read/${manifest.cid}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Read Full Article
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="border-border/60 bg-surface rounded-[6px]">
        <CardHeader>
          <CardTitle className="text-base font-sans font-semibold text-primary">Technical Details</CardTitle>
          <CardDescription className="text-xs text-muted">
            Manifest structure and metadata for developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-background border border-border/70 p-4 rounded-[6px] overflow-x-auto text-secondary font-mono leading-relaxed">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
