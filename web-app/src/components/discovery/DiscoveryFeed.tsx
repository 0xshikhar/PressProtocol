"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ExternalLink, Search, Server, Bookmark } from "lucide-react";
import { discoveryService, type DiscoveryContent } from "@/lib/discovery";
import { toast } from "sonner";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

export function DiscoveryFeed() {
  const [items, setItems] = useState<DiscoveryContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTags, setSearchTags] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    loadDiscoveryFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTags]);

  const loadDiscoveryFeed = async () => {
    try {
      setLoading(true);
      setUsingFallback(false);
      const data = await discoveryService.discoverContent(
        filteredTags.length > 0 ? filteredTags : undefined,
        20
      );
      setItems(data);
      
      // Check if we got results - if not, might be using DHT fallback
      if (data.length === 0) {
        setUsingFallback(true);
      }
    } catch (error) {
      console.error("Error loading discovery feed:", error);
      setUsingFallback(true);
      toast.error("All indexers failed - trying DHT fallback");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTags.trim()) {
      const tags = searchTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      setFilteredTags(tags);
    } else {
      setFilteredTags([]);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usingFallback && (
        <Alert>
          <Server className="h-4 w-4" />
          <AlertDescription>
            Using decentralized discovery (DHT fallback). This may be slower but ensures
            censorship-resistance. Consider adding more indexers in settings for better performance.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Search by tags (comma-separated)"
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          {filteredTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => {
                setFilteredTags(filteredTags.filter((t) => t !== tag));
              }}
            >
              {tag} ×
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilteredTags([]);
              setSearchTags("");
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No content found. Be the first to publish!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.cid}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                window.location.href = `/read/${item.cid}`;
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(item.timestamp)}
                    </CardDescription>
                  </div>
                  <Button
                    variant={isBookmarked(item.cid) ? "default" : "ghost"}
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        const added = toggleBookmark({
                          cid: item.cid,
                          title: item.title,
                          tags: item.tags || [],
                        });
                        toast.success(added ? "Bookmarked" : "Removed bookmark");
                      } catch (error: any) {
                        toast.error(error.message);
                      }
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked(item.cid) ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/read/${item.cid}`, "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!filteredTags.includes(tag)) {
                            setFilteredTags([...filteredTags, tag]);
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs">
                    Publisher: {item.publisher?.pubkey?.slice(0, 16)}...
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadDiscoveryFeed}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
