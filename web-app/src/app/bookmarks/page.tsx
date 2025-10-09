"use client"

import { useState } from "react";
import { BookMarked, Trash2, Search, Filter, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const bookmarkCollections = [
    { name: "Reading List", count: 12, color: "bg-primary" },
    { name: "Research", count: 8, color: "bg-accent" },
    { name: "Important", count: 5, color: "bg-destructive" },
    { name: "Tech News", count: 15, color: "bg-success" },
  ];

  // Mock bookmarks data
  const bookmarks = [
    {
      id: 1,
      title: "The Future of Decentralized Publishing",
      author: "CryptoJournalist",
      collection: "Reading List",
      savedAt: "2 days ago",
      excerpt: "An in-depth look at how decentralized platforms are reshaping content distribution...",
      tags: ["web3", "ipfs", "publishing"]
    },
    {
      id: 2,
      title: "Privacy in the Digital Age",
      author: "PrivacyAdvocate",
      collection: "Research",
      savedAt: "5 days ago",
      excerpt: "Exploring modern privacy challenges and solutions in an increasingly connected world...",
      tags: ["privacy", "security", "tor"]
    },
    {
      id: 3,
      title: "IPFS: A Deep Dive",
      author: "TechExplorer",
      collection: "Tech News",
      savedAt: "1 week ago",
      excerpt: "Understanding the InterPlanetary File System and its role in Web3...",
      tags: ["ipfs", "technology", "tutorial"]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <BookMarked className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Bookmarks</h1>
              <p className="text-muted-foreground">
                Your saved articles and content collections
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Collections */}
          <aside className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Collections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium"
                >
                  <BookMarked className="h-4 w-4" />
                  All Bookmarks
                  <Badge variant="secondary" className="ml-auto">
                    40
                  </Badge>
                </Button>
                {bookmarkCollections.map((collection) => (
                  <Button
                    key={collection.name}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <div className={`h-3 w-3 rounded-full ${collection.color}`} />
                    {collection.name}
                    <Badge variant="outline" className="ml-auto">
                      {collection.count}
                    </Badge>
                  </Button>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  + New Collection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  All Items
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Unread
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Favorites
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Archived
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6 space-y-4">
                {bookmarks.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm">
                        Start saving articles you want to read later. Click the bookmark icon on any article to save it here.
                      </p>
                      <Button>Explore Content</Button>
                    </CardContent>
                  </Card>
                ) : (
                  bookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{bookmark.collection}</Badge>
                              <span className="text-sm text-muted-foreground">{bookmark.savedAt}</span>
                            </div>
                            <CardTitle className="text-xl mb-2 hover:text-primary cursor-pointer">
                              {bookmark.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              by {bookmark.author}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{bookmark.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {bookmark.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-6 space-y-4">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{bookmark.collection}</Badge>
                            <span className="text-sm text-muted-foreground">{bookmark.savedAt}</span>
                          </div>
                          <CardTitle className="text-xl mb-2 hover:text-primary cursor-pointer">
                            {bookmark.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            by {bookmark.author}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{bookmark.excerpt}</p>
                      <div className="flex flex-wrap gap-2">
                        {bookmark.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="favorites" className="mt-6">
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BookMarked className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Mark your most important bookmarks as favorites to find them quickly.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
