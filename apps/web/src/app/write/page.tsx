"use client";

import { useState, useEffect, useRef } from "react";
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
  Maximize2,
  Archive,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Tag,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { calculateDeterministicCIDv1, exportPressProof, downloadPressProofFile } from "@pressprotocol/proof";
import { CryptographicPreFlightHUD } from "@/components/editor/CryptographicPreFlightHUD";
import { ZenModeOverlay } from "@/components/editor/ZenModeOverlay";
import { DraftVaultModal } from "@/components/editor/DraftVaultModal";
import {
  getAllDrafts,
  getActiveDraftId,
  setActiveDraftId,
  getDraft,
  createDraft,
  saveDraft as saveVaultDraft,
  deleteDraft,
  type DraftItem,
} from "@/lib/draft-vault";
import { cleanseTrackersFromContent } from "@/lib/privacy-scanner";
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

export default function WritePage() {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft Vault State
  const [activeDraftId, setActiveDraftIdState] = useState<string | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [draftsCount, setDraftsCount] = useState(0);

  // Dual-Identity State: 'anonymous' (Burner) or 'verified' (Privy)
  const [burnerWallet, setBurnerWallet] = useState<BurnerWallet | null>(null);
  const [identityMode, setIdentityMode] = useState<"anonymous" | "verified">("anonymous");
  const [isZenMode, setIsZenMode] = useState(false);
  const [liveCid, setLiveCid] = useState("");
  const [offlineFallbackModal, setOfflineFallbackModal] = useState<{
    open: boolean;
    cid: string;
    proof: any;
  } | null>(null);

  // Auto-resize headline textarea dynamically
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Calculate real-time in-browser deterministic CIDv1 as content changes
  useEffect(() => {
    if (content && content.trim()) {
      try {
        const computed = calculateDeterministicCIDv1(content);
        setLiveCid(computed);
      } catch {
        setLiveCid("");
      }
    } else {
      setLiveCid("");
    }
  }, [content]);

  // Keyboard shortcut listener for Zen Focus Mode (⌘+Shift+F or Ctrl+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Initialize active draft from multi-draft vault on mount
  useEffect(() => {
    const drafts = getAllDrafts();
    setDraftsCount(drafts.length);

    const savedActiveId = getActiveDraftId();
    let current = savedActiveId ? drafts.find((d) => d.id === savedActiveId) : null;

    if (!current && drafts.length > 0) {
      current = drafts[0];
    }

    if (current) {
      setActiveDraftIdState(current.id);
      setActiveDraftId(current.id);
      setTitle(current.title);
      setContent(current.content);
      setTags(current.tags);
      setLastSaved(current.updatedAt);
    } else {
      const fresh = createDraft();
      setActiveDraftIdState(fresh.id);
      setActiveDraftId(fresh.id);
      setTitle(fresh.title);
      setContent(fresh.content);
      setTags(fresh.tags);
      setLastSaved(fresh.updatedAt);
      setDraftsCount(1);
    }
  }, []);

  // 3-second debounced autosave to local vault
  useEffect(() => {
    if (!activeDraftId) return;

    const timer = setTimeout(() => {
      setAutoSaving(true);
      try {
        const saved = saveVaultDraft(activeDraftId, {
          title,
          content,
          tags,
        });
        setLastSaved(saved.updatedAt);
        const count = getAllDrafts().length;
        setDraftsCount(count);
      } catch (err) {
        console.error("Vault autosave failed:", err);
      } finally {
        setAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, tags, activeDraftId]);

  const handleSelectDraft = (draft: DraftItem) => {
    setActiveDraftIdState(draft.id);
    setActiveDraftId(draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setTags(draft.tags);
    setLastSaved(draft.updatedAt);
    setDraftsCount(getAllDrafts().length);
  };

  const handleNewDraft = () => {
    const fresh = createDraft();
    handleSelectDraft(fresh);
  };

  const handleManualSave = () => {
    if (!activeDraftId) return;
    setAutoSaving(true);
    try {
      const saved = saveVaultDraft(activeDraftId, {
        title,
        content,
        tags,
      });
      setLastSaved(saved.updatedAt);
      setDraftsCount(getAllDrafts().length);
      toast.success("Draft saved to offline vault");
    } catch (err) {
      console.error("Failed to save draft:", err);
      toast.error("Failed to save draft");
    } finally {
      setAutoSaving(false);
    }
  };

  const clearDraft = () => {
    if (activeDraftId) {
      deleteDraft(activeDraftId);
    }
    const fresh = createDraft();
    handleSelectDraft(fresh);
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

  const handleCleanseTrackers = () => {
    const { cleanContent, cleansedCount } = cleanseTrackersFromContent(content);
    if (cleansedCount > 0) {
      setContent(cleanContent);
      toast.success(`Cleanse complete: Stripped ${cleansedCount} tracking parameter(s)`);
    } else {
      toast.info("Content is already clean (zero tracking parameters detected)");
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

      // Sovereign Air-Gapped Fallback: Compute deterministic CIDv1 & seal locally
      try {
        const fallbackCid = calculateDeterministicCIDv1(content);
        const timestamp = new Date().toISOString();
        let pubKey = burnerWallet?.publicKey || "";
        let sig = "unsigned";

        if (burnerWallet?.privateKey) {
          const canonical = JSON.stringify({
            title: title.trim(),
            tags,
            timestamp,
          });
          sig = await signWithBurner(canonical, burnerWallet.privateKey);
        }

        const proof = exportPressProof({
          cid: fallbackCid,
          title: title.trim(),
          content,
          tags,
          timestamp,
          publisher: {
            publicKey: pubKey,
            signature: sig,
            walletAddress: identityMode === "verified" ? user?.wallet?.address : undefined,
            username: identityMode === "anonymous" ? burnerWallet?.pseudonym : user?.email?.address,
          },
        });

        // Ensure current state is saved to the offline vault
        if (activeDraftId) {
          saveVaultDraft(activeDraftId, {
            title: title.trim(),
            content,
            tags,
          });
        }

        setOfflineFallbackModal({
          open: true,
          cid: fallbackCid,
          proof,
        });

        toast.info("Remote gateway unreachable. Sovereign offline fallback activated.");
      } catch (fallbackErr) {
        console.error("Offline fallback processing failed:", fallbackErr);
        toast.error("Failed to publish content to remote gateway.");
      }
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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background subtle lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-indigo-950/20 via-cyan-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT / CENTER COLUMN: Editorial Card Canvas (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0D14]/90 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-2xl space-y-6 relative">
            {/* Top Navigation Row in Canvas: Back + View Toggles */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs -ml-2 gap-1.5 font-medium"
              >
                ← Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-xs h-8 px-3 rounded-lg"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  {showPreview ? "Edit Mode" : "Preview"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsZenMode(true)}
                  className="hidden sm:inline-flex border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-xs h-8 px-3 rounded-lg"
                  title="Zen Focus Mode (⌘+Shift+F)"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                  Zen Mode
                </Button>
              </div>
            </div>

            {/* Article Headline & Subtitle */}
            <div className="space-y-3 pt-1">
              <textarea
                ref={titleTextareaRef}
                rows={1}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Untitled article"
                className="w-full bg-transparent border-0 text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:ring-0 resize-none leading-[1.12] tracking-tight p-0"
              />

              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Add a subtitle to give your article more context..."
                className="w-full bg-transparent border-0 text-base sm:text-lg text-neutral-400 font-sans placeholder:text-neutral-600 focus:outline-none focus:ring-0 p-0"
              />

              {/* Metadata Row: Date/Time + Reading Time */}
              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 font-sans pt-3 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Draft</span>
                  <span>•</span>
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>
                    {readingStats
                      ? `${readingStats.formattedTime} • ${readingStats.words} words`
                      : "0 min read"}
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Body: TipTap or Preview */}
            {showPreview ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none pt-4 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="pt-1">
                <EnhancedEditor
                  content={content}
                  onChange={setContent}
                  placeholder="The digital world is changing faster than most of us can keep up with. What once felt like a distant future is now sovereign reality..."
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Institutional Publishing Sidebar (4 cols, sticky) */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            {/* 1. Live Draft Status Bar */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0B0D14]/90 border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">
                  {autoSaving ? "Saving draft..." : "Draft saved"}
                </span>
              </div>
              <span className="text-neutral-400">
                {lastSaved
                  ? new Date(lastSaved).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
            </div>

            {/* 2. TAGS Section */}
            <div className="p-5 rounded-xl bg-[#0B0D14]/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-cyan-400" /> Tags
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {tags.length} added
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  className="h-8 px-2.5 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs"
                >
                  +
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 hover:border-white/20 transition-colors"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-500 hover:text-red-400 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. PRIVACY & IDENTITY Section */}
            <div className="p-5 rounded-xl bg-[#0B0D14]/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" /> Privacy & Identity
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-950/40 text-emerald-300 border-emerald-500/30 font-mono"
                >
                  {isAnon ? "Ed25519" : "Verified"}
                </Badge>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-emerald-300 font-medium">
                      {isAnon
                        ? burnerWallet?.pseudonym || "Anon Burner"
                        : user?.email?.address || "Verified Author"}
                    </span>
                  </div>
                  {burnerWallet && isAnon && (
                    <button
                      onClick={handleCopyPublicKey}
                      className="text-neutral-400 hover:text-white text-[11px] flex items-center gap-1 font-mono cursor-pointer"
                      title="Copy Ed25519 Public Key"
                    >
                      <Copy className="h-3 w-3" /> Key
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAnon
                    ? "Your article will be visible to everyone on the network, signed cryptographically with in-memory Ed25519 burner keys. Zero KYC or user link."
                    : `Signed under your verified profile (${
                        user?.wallet?.address
                          ? `${user.wallet.address.slice(0, 6)}...`
                          : user?.email?.address
                      }).`}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-white/[0.06]">
                  {isAnon ? (
                    <>
                      <button
                        onClick={handleBurnWallet}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Flame className="h-3 w-3" /> Burn Key
                      </button>
                      <button
                        onClick={login}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Sign in profile →
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIdentityMode("anonymous")}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Switch to anonymous burner
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. PUBLISHING DISPATCH Section */}
            <div className="p-5 rounded-xl bg-[#0B0D14]/90 border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-cyan-400" /> Publishing
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Dual-Pin</span>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-cyan-400">⚡</span> Publish immediately
                </span>
                <span className="text-[10px] font-mono text-neutral-500">IPFS + Tor</span>
              </div>

              {/* Main Publish CTA */}
              <Button
                size="lg"
                onClick={handlePublish}
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="w-full h-12 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing to Swarm...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish {isAnon ? "Anonymously" : "Now"}</span>
                  </>
                )}
              </Button>

              {/* Subtle Save Draft Link */}
              <div className="text-center pt-1">
                <button
                  onClick={handleManualSave}
                  disabled={autoSaving || (!title && !content)}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  Save Draft
                </button>
              </div>
            </div>

            {/* 5. Sovereign Toolkit Utilities */}
            <div className="p-4 rounded-xl bg-[#0B0D14]/60 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-2 border-b border-white/[0.06]">
                <span>SOVEREIGN TOOLKIT</span>
                <span className="text-cyan-400">v1.0</span>
              </div>

              <button
                onClick={() => setIsVaultOpen(true)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-xs text-neutral-300 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Archive className="h-3.5 w-3.5 text-cyan-400" />
                  Offline Drafts Vault
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                  {draftsCount}
                </span>
              </button>

              <button
                onClick={handleExportAirGappedProof}
                disabled={!title.trim() || !content.trim()}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-xs text-neutral-300 transition-colors text-left disabled:opacity-40 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                  Export .pressproof.json
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Air-Gapped</span>
              </button>

              <button
                onClick={handleCleanseTrackers}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-xs text-neutral-300 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Cleanse Trackers & UTM
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Clean</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Cryptographic Pre-Flight Telemetry HUD */}
      <CryptographicPreFlightHUD
        cid={liveCid}
        content={content}
        title={title}
        burnerWallet={burnerWallet}
        onBurnWallet={handleBurnWallet}
        identityMode={identityMode}
        onCleanseTrackers={handleCleanseTrackers}
        onZenToggle={() => setIsZenMode((prev) => !prev)}
        isZenMode={isZenMode}
      />

      {/* Fullscreen Distraction-Free Zen Focus Mode */}
      <ZenModeOverlay
        isOpen={isZenMode}
        onClose={() => setIsZenMode(false)}
        title={title}
        onTitleChange={setTitle}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        isAnon={isAnon}
        autoSaving={autoSaving}
        lastSavedText={getLastSavedText()}
        onOpenVault={() => setIsVaultOpen(true)}
        draftsCount={draftsCount}
      >
        <EnhancedEditor
          content={content}
          onChange={setContent}
          placeholder="Write your story in Zen Mode... (Type '/' for slash commands)"
        />
      </ZenModeOverlay>

      {/* Offline-First Multi-Draft Vault & Version Snapshots Modal */}
      <DraftVaultModal
        open={isVaultOpen}
        onOpenChange={setIsVaultOpen}
        currentDraftId={activeDraftId}
        onSelectDraft={handleSelectDraft}
        onNewDraft={handleNewDraft}
        currentTitle={title}
        currentContent={content}
      />

      {/* Sovereign Air-Gapped Fallback Modal */}
      {offlineFallbackModal && (
        <Dialog
          open={offlineFallbackModal.open}
          onOpenChange={(open) =>
            setOfflineFallbackModal((prev) => (prev ? { ...prev, open } : null))
          }
        >
          <DialogContent className="max-w-md bg-[#0B0D14] border border-white/10 text-white shadow-2xl p-6 sm:p-7">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-sans font-bold text-white tracking-tight">
                    Sovereign Fallback Active
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-400">
                    Remote gateway node unreachable. Content sealed locally on-device.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>DETERMINISTIC IPFS CIDv1</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(offlineFallbackModal.cid);
                      toast.success("CID copied to clipboard");
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-cyan-300 break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                  {offlineFallbackModal.cid}
                </div>
              </div>

              <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Encrypted Vault:</strong> Draft is securely stored in your browser&apos;s IndexedDB offline vault.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Cryptographic Sealing:</strong> Signed with your in-memory Ed25519 identity ({burnerWallet?.pseudonym || "Burner"}).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Air-Gapped Portability:</strong> Export <code className="text-white font-mono">.pressproof.json</code> to syndicate across any IPFS node or CLI later.</span>
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadPressProofFile(offlineFallbackModal.proof);
                  toast.success("Exported .pressproof.json");
                }}
                className="w-full sm:w-auto gap-1.5 border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs h-9"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" /> Export Proof (.pressproof.json)
              </Button>
              <Button
                size="sm"
                onClick={() => router.push(`/read/${offlineFallbackModal.cid}`)}
                className="w-full sm:w-auto gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs h-9"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View in Reader
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

