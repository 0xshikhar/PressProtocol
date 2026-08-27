import React, { useState } from "react";
import { Layers, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface SdkCodeSnippetsProps {
  apiKey: string;
}

export default function SdkCodeSnippets({ apiKey }: SdkCodeSnippetsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeKeyDisplay = apiKey || "pp_test_your_sandbox_api_key";
  const defaultEndpoint = "https://node.pressprotocol.com";

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const snippets = {
    typescript: `import { PressProtocolClient } from '@pressprotocol/sdk';

// Initialize with your sandbox or production API key
const client = new PressProtocolClient({
  endpoint: '${defaultEndpoint}',
  apiKey: '${activeKeyDisplay}',
});

// 1-Line Server-Signed Ingest
const result = await client.publishRaw({
  title: 'Investigative Transparency Report',
  content: '# Confidential Memo\\n\\nFull disclosure preserved on IPFS and Tor.',
  tags: ['whistleblower', 'sovereignty'],
  author: 'Newsroom Bureau',
});

console.log('✅ Anchored CID:', result.cid);
console.log('🌐 IPFS Mirror:', result.urls.ipfs);
console.log('🧅 Tor Mirror:', result.urls.tor);`,

    python: `from pressprotocol import PressProtocol

# Initialize client with sandbox key
client = PressProtocol(
    endpoint="${defaultEndpoint}",
    api_key="${activeKeyDisplay}"
)

# Publish article directly from Python
post = client.publish_raw(
    title="Data Science Pipeline Audit",
    content="# Methodology & Findings\\n\\nVerifiable cryptographic dataset.",
    tags=["science", "reproducibility"]
)

print(f"✅ Published CID: {post.cid}")
print(f"📦 IPFS Gateway: {post.ipfs_url}")
print(f"🧅 Tor Mirror: {post.tor_url}")`,

    go: `package main

import (
    "fmt"
    "github.com/pressprotocol/pressprotocol-go"
)

func main() {
    client := pressprotocol.NewClient(
        "${defaultEndpoint}",
        "${activeKeyDisplay}",
    )

    result, err := client.PublishRaw(&pressprotocol.PublishRequest{
        Title:   "Microservice System Heartbeat",
        Content: "# System Log\\nAll zero-trust nodes operational.",
        Tags:    []string{"infrastructure", "security"},
    })
    if err != nil {
        panic(err)
    }

    fmt.Printf("✅ Published CID: %s\\n", result.CID)
}`,

    rust: `use pressprotocol::{Client, PublishRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(
        "${defaultEndpoint}",
        "${activeKeyDisplay}",
    )?;

    let res = client.publish_raw(PublishRequest {
        title: "Security Advisory Bulletin".into(),
        content: "# Zero-Day Mitigation\\nDeterministic archival.".into(),
        tags: vec!["security".into(), "bulletin".into()],
    }).await?;

    println!("✅ Anchored CID: {}", res.cid);
    Ok(())
}`,

    curl: `curl -X POST "${defaultEndpoint}/api/v1/publish/raw" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -d '{
    "title": "Decentralized Wire Dispatch",
    "content": "# Emergency Bulletin\\nCritical updates preserved across swarms.",
    "tags": ["news", "wire"]
  }'`,
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold tracking-tight">Multi-Language SDK Ecosystem</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Native, idiomatic libraries with embedded cryptographic multihashing and automatic failover.
        </p>
      </div>

      <Tabs defaultValue="typescript" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto h-auto p-1 bg-muted/60">
          <TabsTrigger value="typescript" className="text-xs font-medium py-2">TypeScript / JS</TabsTrigger>
          <TabsTrigger value="python" className="text-xs font-medium py-2">Python</TabsTrigger>
          <TabsTrigger value="go" className="text-xs font-medium py-2">Go</TabsTrigger>
          <TabsTrigger value="rust" className="text-xs font-medium py-2">Rust</TabsTrigger>
          <TabsTrigger value="curl" className="text-xs font-medium py-2">cURL</TabsTrigger>
        </TabsList>

        {/* TypeScript */}
        <TabsContent value="typescript" className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs font-mono">
            <span>pnpm add @pressprotocol/sdk</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyText("pnpm add @pressprotocol/sdk", "ts-install")}
              className="h-6 px-2 text-xs"
            >
              {copiedId === "ts-install" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="relative rounded-lg bg-muted/60 p-4 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(snippets.typescript, "ts-code")}
              className="absolute top-3 right-3 h-7 gap-1 text-xs"
            >
              {copiedId === "ts-code" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId === "ts-code" ? "Copied" : "Copy"}
            </Button>
            {snippets.typescript}
          </div>
        </TabsContent>

        {/* Python */}
        <TabsContent value="python" className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs font-mono">
            <span>pip install pressprotocol</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyText("pip install pressprotocol", "py-install")}
              className="h-6 px-2 text-xs"
            >
              {copiedId === "py-install" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="relative rounded-lg bg-muted/60 p-4 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(snippets.python, "py-code")}
              className="absolute top-3 right-3 h-7 gap-1 text-xs"
            >
              {copiedId === "py-code" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId === "py-code" ? "Copied" : "Copy"}
            </Button>
            {snippets.python}
          </div>
        </TabsContent>

        {/* Go */}
        <TabsContent value="go" className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs font-mono">
            <span>go get github.com/pressprotocol/pressprotocol-go</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyText("go get github.com/pressprotocol/pressprotocol-go", "go-install")}
              className="h-6 px-2 text-xs"
            >
              {copiedId === "go-install" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="relative rounded-lg bg-muted/60 p-4 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(snippets.go, "go-code")}
              className="absolute top-3 right-3 h-7 gap-1 text-xs"
            >
              {copiedId === "go-code" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId === "go-code" ? "Copied" : "Copy"}
            </Button>
            {snippets.go}
          </div>
        </TabsContent>

        {/* Rust */}
        <TabsContent value="rust" className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs font-mono">
            <span>cargo add pressprotocol</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyText("cargo add pressprotocol", "rs-install")}
              className="h-6 px-2 text-xs"
            >
              {copiedId === "rs-install" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="relative rounded-lg bg-muted/60 p-4 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(snippets.rust, "rs-code")}
              className="absolute top-3 right-3 h-7 gap-1 text-xs"
            >
              {copiedId === "rs-code" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId === "rs-code" ? "Copied" : "Copy"}
            </Button>
            {snippets.rust}
          </div>
        </TabsContent>

        {/* cURL */}
        <TabsContent value="curl" className="space-y-3">
          <div className="relative rounded-lg bg-muted/60 p-4 font-mono text-xs overflow-x-auto border text-foreground leading-relaxed whitespace-pre">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyText(snippets.curl, "curl-code")}
              className="absolute top-3 right-3 h-7 gap-1 text-xs"
            >
              {copiedId === "curl-code" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId === "curl-code" ? "Copied" : "Copy"}
            </Button>
            {snippets.curl}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
