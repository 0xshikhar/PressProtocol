import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Share2, ExternalLink, Shield, QrCode, Info } from "lucide-react";
import { toast } from "sonner";
import { copyOnionUrl, openInTorBrowser, isTorBrowser } from "@/lib/tor-utils";

interface TorShareSectionProps {
  onionUrl: string;
  contentTitle?: string;
  className?: string;
}

export function TorShareSection({ onionUrl, contentTitle, className }: TorShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isInTorBrowser = isTorBrowser();

  const handleCopy = async () => {
    try {
      await copyOnionUrl(onionUrl);
      setCopied(true);
      toast.success("Onion URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleOpenInTor = () => {
    openInTorBrowser(onionUrl);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: contentTitle ? `${contentTitle} - AnonPress (Tor)` : "AnonPress Content (Tor)",
          text: "Access this content securely via Tor Browser",
          url: onionUrl,
        })
        .then(() => toast.success("Shared successfully!"))
        .catch((err) => {
          if (err.name !== "AbortError") {
            toast.error("Failed to share");
          }
        });
    } else {
      setShareDialogOpen(true);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-500" />
          <span>Tor Onion Address</span>
        </Label>
        {isInTorBrowser && (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Using Tor Browser
          </span>
        )}
      </div>

      <Alert className="mb-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
        <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <AlertDescription className="text-sm text-purple-900 dark:text-purple-100">
          This content is accessible via the Tor network for maximum privacy and censorship resistance.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {/* Onion URL Display */}
        <div className="flex gap-2">
          <Input
            value={onionUrl}
            readOnly
            className="font-mono text-xs bg-muted"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copy .onion URL"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInTor}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Tor Browser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share via Tor</DialogTitle>
              <DialogDescription>
                Share this .onion address with others who use Tor Browser
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Onion URL</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={onionUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Privacy Tip:</strong> Share this .onion address through secure channels.
                  Recipients will need Tor Browser to access it.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">How to access:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Download Tor Browser from torproject.org</li>
                  <li>Copy the .onion URL above</li>
                  <li>Paste and open it in Tor Browser</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Tor Browser Link */}
        {!isInTorBrowser && (
          <div className="text-center pt-2">
            <a
              href="https://www.torproject.org/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Don&apos;t have Tor Browser? Download it here
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
