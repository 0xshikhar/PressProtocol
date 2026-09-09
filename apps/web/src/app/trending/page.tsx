"use client";

import { useState } from "react";
import { TrendingUp, Flame, Clock, Eye, Share2, Award, Shield, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import Link from "next/link";

export default function TrendingPage() {
  const trendingTopics = [
    { name: "Decentralization", growth: "+145%", posts: 234 },
    { name: "Sovereign Cryptography", growth: "+98%", posts: 189 },
    { name: "IPFS & Content Addressing", growth: "+87%", posts: 156 },
    { name: "Censorship Resistance", growth: "+76%", posts: 143 },
    { name: "Tor v3 Hidden Services", growth: "+65%", posts: 128 },
    { name: "Whistleblower Protections", growth: "+54%", posts: 112 },
  ];

  const verifiedSigners = [
    { pubkey: "b47a98cf29e0134f5984719bcae71629857193749bdf83749174910283749210", label: "Core Protocol Dispatches", articles: 45, proofs: 45, verified: true },
    { pubkey: "7a29810ef82c49b1a0e98127364bfa1029384756192837461524395019283746", label: "Civic Whistleblower Bureau", articles: 38, proofs: 38, verified: true },
    { pubkey: "d3e0984127591029384756192837465019283746152439501928374650192837", label: "Autonomous Tech Watchdog", articles: 32, proofs: 32, verified: true },
    { pubkey: "9182736450192837465019283746152439501928374650192837465019283746", label: "Decentralized Wire Service", articles: 29, proofs: 29, verified: true },
  ];

  const weeklyStats = [
    { label: "Verification Suites", value: "14", change: "100% Pass", icon: Shield, color: "text-primary" },
    { label: "Automated Assertions", value: "413+", change: "Passing", icon: CheckCircle2, color: "text-verified" },
    { label: "Native Client SDKs", value: "4", change: "Active", icon: Flame, color: "text-warning" },
    { label: "Server Private Keys", value: "0", change: "Zero-Custody", icon: Share2, color: "text-anonymous" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="border-b border-border/60 bg-surface/50">
        <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-primary/10 border border-primary/20 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary font-mono text-[10px]">
                  LIVE PROTOCOL PULSE
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-hero font-normal tracking-tight text-foreground mt-1">Trending Dispatches</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Most cited and verified cryptographic publications across decentralized storage
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Weekly Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} elevation="card" className="border-border/60 bg-surface">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                      <Badge variant="outline" className="mt-2.5 gap-1 text-[10px] font-mono border-border/60 text-muted-foreground bg-surface-subtle">
                        <TrendingUp className="h-2.5 w-2.5 text-verified" />
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="p-2 rounded-[6px] bg-surface-subtle border border-border/50">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-surface-subtle border border-border/60 p-1 h-10 rounded-[6px]">
                <TabsTrigger value="today" className="text-xs rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70">
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70">
                  This Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70">
                  This Month
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs rounded-[4px] data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:border-border/70">
                  All Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      Hot in Last 24 Hours
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Dispatches with the highest gateway hits and swarm replication
                    </p>
                  </div>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="week" className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Trending This Week
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Top verified articles from the past 7 days
                    </p>
                  </div>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="month" className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      Popular This Month
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Highest resonance over the current calendar month
                    </p>
                  </div>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="all" className="mt-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-anonymous" />
                      All-Time Benchmark Archive
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Foundational dispatches with permanent swarm retention
                    </p>
                  </div>
                </div>
                <DiscoveryFeed />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Top Verified Signers */}
            <Card elevation="card" className="border-border/60 bg-surface">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Verified Signers
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ed25519 identities with 100% cryptographic proof integrity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-3">
                {verifiedSigners.map((signer, index) => (
                  <div
                    key={signer.pubkey}
                    className="p-2.5 rounded-[6px] border border-border/50 bg-surface-subtle hover:border-primary/40 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground w-3">#{index + 1}</span>
                        <p className="text-xs font-semibold text-foreground truncate max-w-[170px]">{signer.label}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono text-verified bg-verified-tint border-verified/30 px-1 py-0">
                        {signer.proofs} Proofs
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pl-5">
                      <span className="truncate max-w-[140px] text-muted-foreground">
                        {signer.pubkey.slice(0, 8)}...{signer.pubkey.slice(-6)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{signer.articles} dispatches</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full mt-2 text-xs border-border/60 bg-surface-subtle hover:bg-surface-elevated text-foreground rounded-[6px]">
                  <Link href="/explore">
                    <span>Explore All Protocol Dispatches</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card elevation="card" className="border-border/60 bg-surface">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Flame className="h-4 w-4 text-primary" />
                  Trending Topics
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Most referenced tag taxonomy in swarm index
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.name}
                    className="flex items-center justify-between p-2.5 rounded-[6px] border border-border/50 bg-surface-subtle hover:border-border/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-muted-foreground w-3">#{index + 1}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{topic.name}</p>
                        <p className="text-[10px] text-muted-foreground">{topic.posts} dispatches</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 text-[10px] font-mono text-verified border-verified/30 bg-verified-tint">
                      <TrendingUp className="h-2.5 w-2.5" />
                      {topic.growth}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
