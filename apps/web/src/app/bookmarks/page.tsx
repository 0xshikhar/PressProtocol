"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookMarked,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
  Search,
  HardDrive,
  Shield,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllOfflineArticles,
  removeOfflineArticle,
  exportOfflineVault,
  importOfflineVault,
  clearOfflineVault,
  getOfflineStorageMetrics,
  type OfflineArticle,
  type StorageMetrics,
} from "@/lib/offline-storage";
import { exportPressProof, downloadPressProofFile } from "@pressprotocol/proof";

const SOURCE_RAILS = [
  "All Rails",
  "Studio",
  "Notion",
  "Substack/RSS",
  "WordPress",
  "Web Clipper",
  "Git SSG",
];

export default function BookmarksPage() {
  const [articles, setArticles] = useState<OfflineArticle[]>([]);
  const [metrics, setMetrics] = useState<StorageMetrics>({
    count: 0,
    totalBytes: 0,
    formattedSize: "0 KB",
    totalReadTimeMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRail, setSelectedRail] = useState("All Rails");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, m] = await Promise.all([
        getAllOfflineArticles(),
        getOfflineStorageMetrics(),
      ]);
      setArticles(list);
      setMetrics(m);
    } catch (err) {
      console.error("Failed to load bookmarks vault:", err);
      toast.error("Failed to load local offline vault");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cid: string, title: string) => {
    try {
      await removeOfflineArticle(cid);
      toast.success(`Removed "${title}" from offline vault`);
      await loadData();
    } catch (err) {
      toast.error("Failed to remove article");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your local reading vault? This removes all offline cached articles.")) {
      return;
    }
    try {
      await clearOfflineVault();
      toast.success("Offline reading vault cleared");
      await loadData();
    } catch (err) {
      toast.error("Failed to clear vault");
    }
  };

  const handleExportVault = async () => {
    try {
      const json = await exportOfflineVault();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pressprotocol-vault-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Exported sovereign reading vault backup (.json)");
    } catch (err) {
      toast.error("Failed to export vault");
    }
  };

  const handleImportVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importOfflineVault(text);
        toast.success(`Restored vault: ${res.imported} new, ${res.updated} updated`);
        await loadData();
      } catch (err: any) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportProof = (art: OfflineArticle) => {
    try {
      const proof = exportPressProof({
        cid: art.cid,
        title: art.title,
        content: art.content,
        tags: art.tags,
        timestamp: art.createdAt,
        publisher: {
          publicKey: art.publicKey || "",
          signature: art.signature || "unsigned",
          walletAddress: art.walletAddress,
          username: art.author,
        },
        mirrors: {
          ipfs: art.mirrors?.ipfs?.url || `ipfs://${art.cid}`,
          tor: art.mirrors?.tor?.url,
          gateway: art.mirrors?.gateway?.url,
        },
      });
      downloadPressProofFile(proof);
      toast.success(`Exported cryptographic proof for "${art.title}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export proof");
    }
  };

  const copyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    setCopiedCid(cid);
    toast.success("CID copied to clipboard");
    setTimeout(() => setCopiedCid(null), 2000);
  };

  const filteredArticles = articles.filter((art) => {
    if (verifiedOnly && !art.isVerified) return false;
    if (selectedRail !== "All Rails" && art.sourceRail !== selectedRail) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchAuthor = (art.author || "").toLowerCase().includes(q);
      const matchTags = art.tags.some((t) => t.toLowerCase().includes(q));
      const matchExcerpt = (art.excerpt || "").toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchTags || matchExcerpt;
    }

    return true;
  });

  const getRailBadgeStyle = (rail: string) => {
    switch (rail) {
      case "Notion":
        return "border-cyan-200 bg-cyan-50 text-cyan-800";
      case "Substack/RSS":
        return "border-orange-200 bg-orange-50 text-orange-800";
      case "WordPress":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "Web Clipper":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      case "Git SSG":
        return "border-purple-200 bg-purple-50 text-purple-800";
      case "Studio":
        return "border-teal-200 bg-teal-50 text-teal-800";
      default:
        return "border-border bg-muted/40 text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Banner & Header */}
      <div className="border-b bg-gradient-to-b from-emerald-50/40 via-white to-background">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <BookMarked className="h-4 w-4" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                  Zero-Telemetry Local Vault
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
                Offline Reading List & Bookmarks
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Censorship-resistant reading vault stored strictly inside your browser storage. Read full text and imagery anytime, even when completely offline.
              </p>
            </div>

            {/* Vault Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportVault}
                className="gap-2 border-border bg-background hover:bg-muted text-foreground text-xs h-9 shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                Backup Vault (.json)
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportVault}
                accept=".json"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-border bg-background hover:bg-muted text-foreground text-xs h-9 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                Restore Vault
              </Button>

              {articles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Telemetry Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm text-card-foreground">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Articles Saved</span>
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">{metrics.count}</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm text-card-foreground">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Reading Time</span>
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">{metrics.totalReadTimeMinutes} min</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm text-card-foreground">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Local Storage</span>
                <HardDrive className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">{metrics.formattedSize}</div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                <span>Privacy Hygiene</span>
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="text-xs font-mono font-medium text-emerald-800 mt-1">
                Zero Server Telemetry
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Controls */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search saved articles by title, author, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`text-xs h-9 gap-1.5 rounded-lg border transition-all ${
                verifiedOnly
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-sm"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Ed25519 Only
            </Button>
          </div>
        </div>

        {/* Source Rail Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {SOURCE_RAILS.map((rail) => (
            <button
              key={rail}
              onClick={() => setSelectedRail(rail)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedRail === rail
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {rail}
            </button>
          ))}
        </div>

        {/* Article Grid / List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-12 text-center max-w-xl mx-auto my-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border text-muted-foreground mb-4">
              <BookMarked className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-foreground mb-2">
              {searchQuery || selectedRail !== "All Rails" || verifiedOnly
                ? "No matching articles in local vault"
                : "Your offline reading vault is empty"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || selectedRail !== "All Rails" || verifiedOnly
                ? "Try clearing filters or search queries to view all saved items."
                : "Browse the discovery feed or read any article on PressProtocol and click 'Bookmark' to preserve it locally for offline reading."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/explore">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 shadow-sm">
                  Explore Discover Feed
                </Button>
              </Link>
              <Link href="/write">
                <Button variant="outline" className="text-xs h-9">
                  Open Sovereign Studio
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredArticles.map((art) => (
              <div
                key={art.cid}
                className="group rounded-2xl border border-border/60 bg-card hover:border-emerald-500/40 hover:shadow-md p-5 transition-all text-card-foreground shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${getRailBadgeStyle(art.sourceRail)}`}>
                        {art.sourceRail}
                      </Badge>

                      {art.isVerified ? (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Ed25519 Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md font-mono border-border bg-muted/40 text-muted-foreground">
                          Community Mirror
                        </Badge>
                      )}

                      <span className="text-[11px] font-mono text-muted-foreground">
                        {new Date(art.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/read/${art.cid}`}>
                      <h2 className="text-lg font-serif font-bold text-foreground group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {art.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    {art.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}

                    {/* Meta Footer */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground font-mono">
                      <span>By {art.author || "Sovereign Author"}</span>
                      <span>•</span>
                      <span>{art.wordCount} words</span>
                      <span>•</span>
                      <span>{art.readingTimeMinutes} min read</span>

                      {art.tags && art.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {art.tags.slice(0, 3).map((t) => (
                              <span key={t} className="text-muted-foreground hover:text-foreground">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    <Link href={`/read/${art.cid}`}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-3 gap-1.5 shadow-sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Read Offline
                      </Button>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportProof(art)}
                        title="Download Cryptographic Proof (.pressproof.json)"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCid(art.cid)}
                        title="Copy IPFS CID"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                      >
                        {copiedCid === art.cid ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(art.cid, art.title)}
                        title="Remove from Local Vault"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
