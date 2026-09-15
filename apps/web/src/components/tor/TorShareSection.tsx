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
} from "@/components/ui/dialog";
import { Copy, Check, Share2, ExternalLink, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { copyOnionUrl, openInTorBrowser, isAccessingViaOnion, formatOnionDisplay } from "@/lib/tor-utils";

interface TorShareSectionProps {
  onionUrl: string;
  contentTitle?: string;
  className?: string;
}

export function TorShareSection({ onionUrl, contentTitle, className }: TorShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isOnionActive = isAccessingViaOnion();

  const handleCopy = async () => {
    const success = await copyOnionUrl(onionUrl);
    if (success) {
      setCopied(true);
      toast.success("Tor v3 Onion URL copied to clipboard");
      setTimeout(() => setCopied(false), 2200);
    } else {
      toast.error("Unable to copy to clipboard");
    }
  };

  const handleOpenInTor = () => {
    openInTorBrowser(onionUrl);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: contentTitle ? `${contentTitle} — PressProtocol (Tor)` : "PressProtocol Dispatch (Tor)",
          text: "Access this sovereign dispatch anonymously via Tor Browser:",
          url: onionUrl,
        })
        .then(() => toast.success("Shared successfully"))
        .catch((err) => {
          if (err.name !== "AbortError") {
            setShareDialogOpen(true);
          }
        });
    } else {
      setShareDialogOpen(true);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-primary font-sans">
          <Shield className="h-3.5 w-3.5 text-anonymous" />
          <span>Tor v3 Onion Hidden Circuit</span>
        </Label>
        {isOnionActive ? (
          <span className="text-[11px] font-mono text-verified flex items-center gap-1">
            <Check className="h-3 w-3" />
            Active Tor Circuit
          </span>
        ) : (
          <span className="text-[11px] font-mono text-muted">
            {formatOnionDisplay(onionUrl)}
          </span>
        )}
      </div>

      <div className="p-3 rounded-[6px] bg-surface border border-hairline mb-3 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-anonymous shrink-0 mt-0.5" />
        <div className="text-xs text-secondary leading-relaxed">
          Dual-pinned to persistent Tor v3 onion services. If state-level ISPs censor clearnet DNS, readers seamlessly access this dispatch via Tor Browser.
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Onion URL Display */}
        <div className="flex gap-2">
          <Input
            value={onionUrl}
            readOnly
            className="font-mono text-xs bg-canvas border-hairline text-primary focus-visible:ring-0 focus-visible:border-focus"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary shrink-0 h-9 w-9 rounded-[6px]"
            title="Copy .onion URL"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-verified" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInTor}
            className="h-8 text-xs font-sans border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary flex items-center justify-center gap-1.5 rounded-[6px]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open in Tor</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 text-xs font-sans border-hairline bg-surface hover:bg-overlay text-secondary hover:text-primary flex items-center justify-center gap-1.5 rounded-[6px]"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Onion</span>
          </Button>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="bg-elevated border-hairline text-primary max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-sans font-semibold text-primary flex items-center gap-2">
                <Shield className="h-4 w-4 text-anonymous" />
                Sovereign Tor Access
              </DialogTitle>
              <DialogDescription className="text-xs text-secondary">
                Share this cryptographic .onion address with colleagues using Tor Browser.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs text-muted">Tor v3 Address</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={onionUrl}
                    readOnly
                    className="font-mono text-xs bg-canvas border-hairline text-primary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="border-hairline bg-surface hover:bg-overlay h-9 w-9 shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-verified" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-canvas border border-hairline text-xs space-y-2">
                <div className="font-medium text-primary">How to open:</div>
                <ol className="list-decimal list-inside space-y-1 text-secondary text-[11px] leading-relaxed">
                  <li>Install Tor Browser from <span className="font-mono text-primary">torproject.org</span></li>
                  <li>Copy the sovereign .onion URL above</li>
                  <li>Paste into Tor Browser URL bar to view directly over onion circuits</li>
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Tor Browser Link */}
        <div className="text-center pt-1">
          <a
            href="https://www.torproject.org/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-sans text-muted hover:text-secondary underline underline-offset-2 transition-colors"
          >
            Don&apos;t have Tor Browser? Download from torproject.org
          </a>
        </div>
      </div>
    </div>
  );
}
