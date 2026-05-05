"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { EnhancedEditor } from "@/components/editor/EnhancedEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  Save,
  Eye,
  Shield,
  Flame,
  User,
  ChevronDown,
  Send,
  Copy,
  FileCheck,
} from "lucide-react";
import { calculateDeterministicCIDv1, exportPressProof, downloadPressProofFile } from "@pressprotocol/proof";
import { apiClient } from "@/lib/api-client";
import { calculateReadingTime } from "@/lib/reading-time";
import {
  getOrCreateBurnerWallet,
  burnCurrentWallet,
  saveBurnerArticle,
  signWithBurner,
  type BurnerWallet,
} from "@/lib/burner-wallet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Draft {
  title: string;
  content: string;
  tags: string[];
  lastSaved: number;
}

const DRAFT_KEY = "anonpress_draft";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function WritePage() {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Dual-Identity State: 'anonymous' (Burner) or 'verified' (Privy)
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [identityMode, setIdentityMode] = useState<"anonymous" | "verified">("anonymous");

  // Initialize burner wallet
  useEffect(() => {
    getOrCreateBurnerWallet().then((wallet) => {
      setBurnerWallet(wallet);
    });
  }, []);

  // Sync default mode with authentication state
  useEffect(() => {
    if (authenticated) {
      setIdentityMode("verified");
    } else {
      setIdentityMode("anonymous");
    }
  }, [authenticated]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft: Draft = JSON.parse(savedDraft);
        setTitle(draft.title);
        setContent(draft.content);
        setTags(draft.tags);
        setLastSaved(draft.lastSaved);
        toast.success("Draft loaded from local storage");
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [title, content, tags]);

  const saveDraft = () => {
    setAutoSaving(true);
    try {
      const draft: Draft = {
        title,
        content,
        tags,
        lastSaved: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(Date.now());
      toast.success("Draft saved locally", { duration: 1500 });
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setAutoSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setContent("");
    setTags([]);
    setLastSaved(null);
  };

  const handleExportAirGappedProof = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content before exporting proof.");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const deterministicCid = calculateDeterministicCIDv1(content);

      let pubKey = "";
      let signature = "unsigned";

      if (identityMode === "anonymous" && burnerWallet) {
        pubKey = burnerWallet.publicKey;
        const canonicalPayload = JSON.stringify({
          title: title.trim(),
          tags,
          timestamp,
        });
        signature = await signWithBurner(canonicalPayload, burnerWallet.privateKey);
      }

      const proof = exportPressProof({
        cid: deterministicCid,
        title: title.trim(),
        content,
        tags,
        timestamp,
        publisher: {
          publicKey: pubKey,
          signature,
          walletAddress: identityMode === "verified" ? user?.wallet?.address : undefined,
          username: identityMode === "anonymous" ? burnerWallet?.pseudonym : user?.email?.address,
        },
      });

      downloadPressProofFile(proof);
      toast.success("Exported air-gapped cryptographic proof (.pressproof.json)");
    } catch (err: any) {
      toast.error(err.message || "Failed to export proof");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleBurnWallet = async () => {
    try {
      const fresh = await burnCurrentWallet(false);
      setBurnerWallet(fresh);
      toast.success("Burner identity regenerated. New Ed25519 keypair active.");
    } catch (err) {
      console.error("Failed to burn wallet:", err);
      toast.error("Failed to regenerate burner identity");
    }
  };

  const handleCopyPublicKey = () => {
    if (burnerWallet?.publicKey) {
      navigator.clipboard.writeText(burnerWallet.publicKey);
      toast.success("Public key copied to clipboard");
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    setIsPublishing(true);

    try {
      const isAnonymousPublish = !authenticated || identityMode === "anonymous";
      const walletAddress = isAnonymousPublish ? undefined : user?.wallet?.address;

      let clientSignature: string | undefined = undefined;
      let clientPubKey: string | undefined = undefined;
      const publishedTimestamp = new Date().toISOString();

      if (isAnonymousPublish && burnerWallet?.privateKey) {
        const canonicalPayload = JSON.stringify({
          title: title.trim(),
          tags,
          timestamp: publishedTimestamp,
        });
        clientSignature = await signWithBurner(canonicalPayload, burnerWallet.privateKey);
        clientPubKey = burnerWallet.publicKey;
      }

      const response = await apiClient.publishContent(
        {
          title: title.trim(),
          content,
          tags,
          publicKey: clientPubKey,
          signature: clientSignature,
          timestamp: publishedTimestamp,
        },
        walletAddress
      );

      // Track anonymous article in burner local history
      if (isAnonymousPublish && burnerWallet) {
        saveBurnerArticle({
          cid: response.cid,
          title: title.trim(),
          publishedAt: Date.now(),
          pseudonym: burnerWallet.pseudonym,
        });
      }

      toast.success(
        isAnonymousPublish
          ? "Content published anonymously to IPFS & Tor!"
          : "Content published successfully under your verified profile!"
      );

      // Clear draft after successful publish
      clearDraft();

      // Redirect to published content
      router.push(`/read/${response.cid}`);
    } catch (error) {
      console.error("Publishing error:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const readingStats = content ? calculateReadingTime(content) : null;

  const getLastSavedText = () => {
    if (!lastSaved) return null;

    const secondsAgo = Math.floor((Date.now() - lastSaved) / 1000);

    if (secondsAgo < 60) return "Saved just now";
    if (secondsAgo < 3600) return `Saved ${Math.floor(secondsAgo / 60)} min ago`;
    return `Saved ${Math.floor(secondsAgo / 3600)} hours ago`;
  };

  const isAnon = !authenticated || identityMode === "anonymous";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto max-w-5xl px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Save status */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
              >
                ← Back
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                {autoSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    {getLastSavedText()}
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    Not saved
                  </>
                )}
              </div>
            </div>

            {/* Right: Identity Selector + Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {readingStats && (
                <span className="hidden md:inline text-xs text-muted-foreground mr-1">
                  {readingStats.formattedTime} • {readingStats.words} words
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                {showPreview ? "Edit" : "Preview"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={autoSaving || (!title && !content)}
                className="hidden sm:inline-flex"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save Draft
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAirGappedProof}
                disabled={!title.trim() || !content.trim()}
                className="hidden md:inline-flex gap-1.5 font-mono text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                title="Export offline air-gapped cryptographic proof (.pressproof.json)"
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>Export Proof</span>
              </Button>

              {/* Dual-Identity Selector Dropdown */}
              {!authenticated ? (
                // Unauthenticated visitor: Burner Identity Active by default
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-mono text-xs">
                        {burnerWallet?.pseudonym || "Anon Burner"}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-3 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Burner Identity
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Publishing anonymously with an ephemeral sovereign Ed25519 keypair. No account, tracking, or KYC.
                    </p>
                    {burnerWallet && (
                      <div className="bg-muted p-2 rounded text-[11px] font-mono break-all select-all flex items-center justify-between gap-1">
                        <span className="truncate">{burnerWallet.publicKey}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0"
                          onClick={handleCopyPublicKey}
                          title="Copy public key"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="pt-1 flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleBurnWallet}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        Burn & Regenerate Identity
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={login}
                      >
                        <User className="h-3.5 w-3.5" />
                        Sign in for Verified Profile
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Authenticated user: Switch between Verified and Burner Identity
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {identityMode === "verified" ? (
                        <>
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium max-w-[120px] truncate">
                            {user?.email?.address ||
                              (user?.wallet?.address
                                ? `${user.wallet.address.slice(0, 6)}...`
                                : "Verified Author")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                            {burnerWallet?.pseudonym || "Anon Burner"}
                          </span>
                        </>
                      )}
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 space-y-1">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Author Identity
                    </div>
                    <DropdownMenuItem
                      className={`text-xs gap-2 cursor-pointer ${
                        identityMode === "verified" ? "bg-accent font-medium" : ""
                      }`}
                      onClick={() => setIdentityMode("verified")}
                    >
                      <User className="h-3.5 w-3.5 text-primary" />
                      <div className="flex flex-col">
                        <span>Verified Profile</span>
                        <span className="text-[10px] text-muted-foreground">
                          Linked to your account / wallet
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={`text-xs gap-2 cursor-pointer ${
                        identityMode === "anonymous" ? "bg-accent font-medium" : ""
                      }`}
                      onClick={() => setIdentityMode("anonymous")}
                    >
                      <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex flex-col">
                        <span>Anonymous Burner</span>
                        <span className="text-[10px] text-muted-foreground">
                          Zero user link • Ed25519 key
                        </span>
                      </div>
                    </DropdownMenuItem>
                    {identityMode === "anonymous" && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-7 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleBurnWallet}
                        >
                          <Flame className="h-3.5 w-3.5" />
                          Burn & Regenerate Key
                        </Button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Primary Publish Action */}
              <Button
                size="sm"
                className={
                  isAnon
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-medium"
                    : "gap-2"
                }
                onClick={handlePublish}
                disabled={isPublishing || !title.trim() || !content.trim()}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : isAnon ? (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Publish Anonymously
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {showPreview ? (
          // Preview Mode
          <div className="space-y-6">
            <h1 className="font-serif text-4xl font-bold">{title || "Untitled"}</h1>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="text-3xl sm:text-4xl font-bold border-0 px-0 font-serif placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-sm text-muted-foreground">
                Tags (optional)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Editor */}
            <EnhancedEditor
              content={content}
              onChange={setContent}
              placeholder="Tell your story... (Type '/' for commands, or select text for formatting)"
            />

            {/* Tips & Sovereign Identity Info */}
            <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/30">
                <p className="font-medium text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  PressProtocol Sovereign Studio
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted border border-border/40">
                    <strong className="text-foreground">/</strong> for commands
                  </span>
                  <span className="px-2 py-0.5 rounded bg-muted border border-border/40">
                    Select text to format
                  </span>
                </div>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-muted-foreground">
                <li>Type <span className="font-mono text-foreground font-semibold">/</span> on any line to quickly insert Headings, Pull-Quotes, Code, Images, or Callouts</li>
                <li>Highlight any word or passage to trigger the floating contextual formatting toolbar</li>
                <li>Your draft auto-saves locally in volatile memory every 30 seconds</li>
                <li>Anonymous articles are cryptographically signed with your in-browser Ed25519 key</li>
                <li>Content is permanently addressed via IPFS multihash and distributed to Tor hidden services</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
