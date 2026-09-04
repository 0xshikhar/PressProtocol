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
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Search Header (Etherscan Style) */}
      <div className="border-b border-white/10 bg-[#0B0D14] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-12">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-6">
            PressProtocol <span className="text-cyan-400">Network Explorer</span>
          </h1>
          
          <div className="max-w-3xl flex items-center bg-white/5 border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
            <div className="pl-3 pr-2 text-white/40">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IPFS CID / Author Signature / Tags..."
              className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 h-12 text-base w-full shadow-none"
            />
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#050508] font-bold rounded-lg px-8 h-10">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Network Status</p>
              <div className="text-xl font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                DHT Synced
              </div>
            </div>
          </div>
          
          <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Total Manifests</p>
              <div className="text-xl font-bold font-mono">
                {loading ? <Skeleton className="h-7 w-20 bg-white/10" /> : (stats?.manifestCount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">DHT Peers (Helia)</p>
              <div className="text-xl font-bold font-mono">
                {loading ? <Skeleton className="h-7 w-12 bg-white/10" /> : (stats?.heliaNode?.peers || 0)}
              </div>
            </div>
          </div>

          <div className="bg-[#0B0D14] border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Unique Tags</p>
              <div className="text-xl font-bold font-mono">
                {loading ? <Skeleton className="h-7 w-16 bg-white/10" /> : (stats?.tagCount || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Ledger Feed (Table) */}
        <div className="bg-[#0B0D14] border border-white/10 rounded-xl overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Live Publication Ledger
            </h2>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-mono text-xs">
              Auto-updating
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 font-mono uppercase bg-white/[0.02] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Manifest Hash (CID)</th>
                  <th className="px-6 py-4 font-semibold">Age</th>
                  <th className="px-6 py-4 font-semibold">Author (Burner ID)</th>
                  <th className="px-6 py-4 font-semibold">Tags</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-40 bg-white/5" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-white/5" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32 bg-white/5" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-48 bg-white/5" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 bg-white/5 rounded-md" /></td>
                    </tr>
                  ))
                ) : manifests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      No recent publications found on the network.
                    </td>
                  </tr>
                ) : (
                  manifests.map((manifest) => (
                    <tr key={manifest.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/read/${manifest.id}`} className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          {manifest.id.slice(0, 16)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-white/40" />
                          {formatDistanceToNow(new Date(manifest.created_at || Date.now()), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[10px]">
                            {manifest.publisher?.slice(0,2) || 'An'}
                          </div>
                          <span className="font-mono text-xs text-white/80">
                            {manifest.publisher ? `${manifest.publisher.slice(0, 12)}...` : 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {(manifest.tags || []).slice(0,3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="border-white/10 bg-white/5 text-white/60 font-mono text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {(manifest.tags || []).length > 3 && (
                            <span className="text-[10px] text-white/40 font-mono">+{manifest.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/read/${manifest.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 font-mono">
                            Read <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-white/10 bg-white/[0.01] p-4 text-center">
            <Button variant="ghost" className="text-white/50 hover:text-white text-xs font-mono uppercase tracking-wider">
              Load More Network Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
