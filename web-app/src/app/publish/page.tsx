"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function PublishPage() {
  const { authenticated, login } = usePrivy();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedContent, setPublishedContent] = useState<{
    shareUrl: string;
    cid: string;
    mirrors: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    setIsPublishing(true);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the publishing process
      const response = await apiClient.publishContent({
        title,
        content,
        tags,
      });

      setPublishedContent(response);
      toast.success("Content published successfully!");
      
      // Reset form
      setTitle("");
      setContent("");
      setTags([]);
    } catch (error) {
      console.error("Publishing error:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Publish to AnonPress</CardTitle>
            <CardDescription>
              Connect your wallet to start publishing censorship-resistant content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (publishedContent) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Content Published Successfully!
            </CardTitle>
            <CardDescription>
              Your content is now available across multiple networks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Share Link</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={publishedContent.shareUrl}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(publishedContent.shareUrl)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label>Content ID (CID)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={publishedContent.cid}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(publishedContent.cid)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Mirror Status</Label>
              <div className="space-y-2">
                {publishedContent.mirrors?.ipfs && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium">IPFS</span>
                    </div>
                    <a
                      href={publishedContent.mirrors.ipfs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {publishedContent.mirrors?.tor && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium">Tor</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {publishedContent.mirrors.tor.url}
                    </span>
                  </div>
                )}
                {publishedContent.mirrors?.gateway && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium">Gateway</span>
                    </div>
                    <a
                      href={publishedContent.mirrors.gateway.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setPublishedContent(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Publish Another
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/read/${publishedContent.cid}`;
                }}
                className="flex-1"
              >
                View Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Publish to AnonPress</CardTitle>
          <CardDescription>
            Create censorship-resistant content distributed across IPFS, Tor, and gateway mirrors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <div className="mt-2">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your content here..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
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
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handlePublish}
            disabled={isPublishing || !title.trim() || !content.trim()}
            size="lg"
            className="w-full"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish to AnonPress"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
