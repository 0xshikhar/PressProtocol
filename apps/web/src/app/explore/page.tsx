"use client"

import { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import { BACKEND_URL } from "@/config/backend";

interface CategoryStats {
  category: string;
  count: number;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<{ value: string; label: string; count: number }[]>([
    { value: "all", label: "All Content", count: 0 },
  ]);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/discovery/stats`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const categoryList = [
          { value: "all", label: "All Content", count: result.data.totalContent },
          ...result.data.categories.map((cat: CategoryStats) => ({
            value: cat.category,
            label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
            count: cat.count,
          })),
        ];
        setCategories(categoryList);
      }
    } catch (error) {
      console.error("Failed to fetch category stats:", error);
    }
  };

  const trendingTags = [
    "decentralization",
    "web3",
    "censorship",
    "ipfs",
    "privacy",
    "blockchain",
    "tor",
    "freedom-of-speech"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Discover Content</h1>
          <p className="text-lg text-muted-foreground">
            Discover censorship-resistant content from publishers worldwide
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar - Filters */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <span>{category.label}</span>
                    <Badge variant={selectedCategory === category.value ? "secondary" : "outline"} className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-primary/50 transition-all"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select defaultValue="recent">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time Range</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and View Controls */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs for content types */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="articles" className="mt-6">
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <DiscoveryFeed />
              </TabsContent>

              <TabsContent value="verified" className="mt-6">
                <DiscoveryFeed />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
