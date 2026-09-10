"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Globe, Database, Activity, Clock, FileText, Hash, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function ExplorerPage() {
  const [stats, setStats] = useState<any>(null);
  const [manifests, setManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, manifestsRes] = await Promise.all([
          fetch("/api/manifests/stats").then(res => res.json()),
          fetch("/api/manifests?limit=20").then(res => res.json())
        ]);
        
        setStats(statsRes.data);
        setManifests(manifestsRes.data || []);
      } catch (err) {
        console.error("Error fetching explorer data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    
    // Simulate live feed updates
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans">
      {/* Search Header (Etherscan Style) */}
      <div className="border-b border-hairline bg-surface relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-12">
          <h1 className="text-3xl font-hero text-text-primary tracking-tight mb-6">
            PressProtocol <span className="text-accent-ribbon">Network Explorer</span>
          </h1>
          
          <div className="max-w-3xl flex items-center bg-canvas border border-hairline rounded-[6px] p-2 shadow-sm focus-within:border-focus transition-all">
            <div className="pl-3 pr-2 text-text-muted">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IPFS CID / Author Signature / Tags..."
              className="border-0 bg-transparent text-text-primary placeholder:text-text-muted focus-visible:ring-0 h-12 text-sm sm:text-base w-full shadow-none font-mono"
            />
            <Button className="bg-accent-primary hover:bg-accent-hover text-[#EEE7E1] font-medium rounded-[6px] px-8 h-10 shadow-none font-sans">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-hairline rounded-[6px] p-5 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center text-verified shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Network Status</p>
              <div className="text-xl font-medium font-sans flex items-center gap-2 text-text-primary">
                <span className="h-2 w-2 rounded-full bg-verified" />
                DHT Synced
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-hairline rounded-[6px] p-5 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center text-accent-ribbon shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Total Manifests</p>
              <div className="text-xl font-medium font-mono text-text-primary tnum">
                {loading ? <Skeleton className="h-7 w-20 bg-overlay" /> : (stats?.manifestCount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-hairline rounded-[6px] p-5 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center text-text-secondary shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">DHT Peers (Helia)</p>
              <div className="text-xl font-medium font-mono text-text-primary tnum">
                {loading ? <Skeleton className="h-7 w-12 bg-overlay" /> : (stats?.heliaNode?.peers || 0)}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-hairline rounded-[6px] p-5 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-[6px] bg-overlay border border-hairline flex items-center justify-center text-[#8770C4] shrink-0">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">Unique Tags</p>
              <div className="text-xl font-medium font-mono text-text-primary tnum">
                {loading ? <Skeleton className="h-7 w-16 bg-overlay" /> : (stats?.tagCount || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Ledger Feed (Table) */}
        <div className="bg-surface border border-hairline rounded-[6px] overflow-hidden shadow-sm">
          <div className="border-b border-hairline px-6 py-4 flex items-center justify-between">
            <h2 className="font-medium font-sans text-base flex items-center gap-2 text-text-primary">
              <Activity className="h-5 w-5 text-accent-ribbon" />
              Live Publication Ledger
            </h2>
            <Badge variant="outline" className="border-hairline text-text-secondary bg-overlay font-mono text-xs">
              Auto-updating
            </Badge>
          </div>
          
          {/* Desktop Table View (sm and up) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted font-mono uppercase bg-overlay border-b border-hairline">
                <tr>
                  <th className="px-6 py-4 font-medium">Manifest Hash (CID)</th>
                  <th className="px-6 py-4 font-medium">Age</th>
                  <th className="px-6 py-4 font-medium">Author (Burner ID)</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-40 bg-overlay" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-overlay" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32 bg-overlay" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-48 bg-overlay" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 bg-overlay rounded-[4px]" /></td>
                    </tr>
                  ))
                ) : manifests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20 text-text-muted" />
                      No recent publications found on the network.
                    </td>
                  </tr>
                ) : (
                  manifests.map((manifest) => (
                    <tr key={manifest.id} className="hover:bg-overlay/40 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/read/${manifest.id}`} className="font-mono text-text-primary hover:text-accent-ribbon flex items-center gap-1.5">
                          <FileText className="h-4 w-4 shrink-0 text-text-muted" />
                          <span>{manifest.id.slice(0, 16)}...</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-text-muted whitespace-nowrap font-mono text-xs tnum">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-text-muted" />
                          {formatDistanceToNow(new Date(manifest.created_at || Date.now()), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-[4px] bg-overlay border border-hairline flex items-center justify-center text-[10px] text-text-secondary font-mono">
                            {manifest.publisher?.slice(0,2) || 'An'}
                          </div>
                          <span className="font-mono text-xs text-text-secondary">
                            {manifest.publisher ? `${manifest.publisher.slice(0, 12)}...` : 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {(manifest.tags || []).slice(0,3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="border-hairline bg-overlay text-text-muted font-mono text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {(manifest.tags || []).length > 3 && (
                            <span className="text-[10px] text-text-muted font-mono">+{manifest.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/read/${manifest.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs bg-overlay hover:bg-elevated text-text-secondary hover:text-text-primary border border-hairline font-mono rounded-[6px]">
                            Read
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Feed View (< sm) */}
          <div className="sm:hidden divide-y divide-hairline">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-44 bg-overlay" />
                  <Skeleton className="h-4 w-32 bg-overlay" />
                  <Skeleton className="h-8 w-full bg-overlay rounded-[4px]" />
                </div>
              ))
            ) : manifests.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20 text-text-muted" />
                No recent publications found.
              </div>
            ) : (
              manifests.map((manifest) => (
                <div key={manifest.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/read/${manifest.id}`} className="font-mono text-xs text-text-primary hover:text-accent-ribbon flex items-center gap-1.5 break-all">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                      <span>{manifest.id.slice(0, 18)}...</span>
                    </Link>
                    <div className="flex items-center gap-1 text-[11px] text-text-muted shrink-0 font-mono tnum">
                      <Clock className="h-3 w-3 text-text-muted" />
                      {formatDistanceToNow(new Date(manifest.created_at || Date.now()), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-[4px] bg-overlay border border-hairline flex items-center justify-center text-[9px] text-text-secondary font-mono">
                        {manifest.publisher?.slice(0,2) || 'An'}
                      </div>
                      <span className="font-mono text-[11px] text-text-secondary">
                        {manifest.publisher ? `${manifest.publisher.slice(0, 10)}...` : 'Anonymous'}
                      </span>
                    </div>

                    <div className="flex gap-1 flex-wrap justify-end">
                      {(manifest.tags || []).slice(0,2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-hairline bg-overlay text-text-muted font-mono text-[9px] px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link href={`/read/${manifest.id}`} className="block">
                    <Button size="sm" className="w-full h-8 text-xs bg-overlay hover:bg-elevated text-text-primary font-mono border border-hairline rounded-[6px]">
                      Read Dispatch
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-hairline bg-overlay/50 p-4 text-center">
            <Button variant="ghost" className="text-text-muted hover:text-text-primary text-xs font-mono uppercase tracking-wider">
              Load More Network Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
