"use client"

import { useState } from "react";
import { TrendingUp, Flame, Clock, Eye, Share2, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";

export default function TrendingPage() {
  const trendingTopics = [
    { name: "Decentralization", growth: "+145%", posts: 234 },
    { name: "Web3 Privacy", growth: "+98%", posts: 189 },
    { name: "IPFS Technology", growth: "+87%", posts: 156 },
    { name: "Censorship Resistance", growth: "+76%", posts: 143 },
    { name: "Tor Networks", growth: "+65%", posts: 128 },
    { name: "Blockchain News", growth: "+54%", posts: 112 },
  ];

  const topPublishers = [
    { name: "CryptoJournalist", articles: 45, views: 125000, verified: true },
    { name: "PrivacyAdvocate", articles: 38, views: 98000, verified: true },
    { name: "TechWhistleblower", articles: 32, views: 87000, verified: false },
    { name: "DecentralizedNews", articles: 29, views: 76000, verified: true },
  ];

  const weeklyStats = [
    { label: "Verification Suites", value: "14", change: "100% Pass", icon: Eye },
    { label: "Automated Assertions", value: "413+", change: "Passing", icon: TrendingUp },
    { label: "Native Client SDKs", value: "4", change: "Active", icon: Flame },
    { label: "Server Private Keys", value: "0", change: "Zero-Custody", icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Trending Content</h1>
              <p className="text-muted-foreground">
                What&apos;s hot in decentralized publishing right now
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Weekly Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <Badge variant="outline" className="mt-2 gap-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                        {stat.change}
                      </Badge>
                    </div>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Flame className="h-6 w-6 text-destructive" />
                    Hot Today
                  </h2>
                  <p className="text-muted-foreground">
                    Most popular content in the last 24 hours
                  </p>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="week" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Trending This Week
                  </h2>
                  <p className="text-muted-foreground">
                    Top content from the past 7 days
                  </p>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="month" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="h-6 w-6 text-accent" />
                    Popular This Month
                  </h2>
                  <p className="text-muted-foreground">
                    Best performing content this month
                  </p>
                </div>
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-warning" />
                    All Time Favorites
                  </h2>
                  <p className="text-muted-foreground">
                    Most popular content of all time
                  </p>
                </div>
                <DiscoveryFeed />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-destructive" />
                  Trending Topics
                </CardTitle>
                <CardDescription>
                  Most discussed topics right now
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 text-success border-success/30">
                      <TrendingUp className="h-3 w-3" />
                      {topic.growth}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Publishers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Top Publishers
                </CardTitle>
                <CardDescription>
                  Most influential this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPublishers.map((publisher, index) => (
                  <div
                    key={publisher.name}
                    className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{publisher.name}</p>
                          {publisher.verified && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {publisher.articles} articles • {(publisher.views / 1000).toFixed(1)}K views
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  View All Publishers
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
