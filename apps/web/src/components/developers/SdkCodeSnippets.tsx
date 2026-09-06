import React, { useState } from "react";
import { Layers, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface SdkCodeSnippetsProps {
  apiKey: string;
}

export default function SdkCodeSnippets({ apiKey }: SdkCodeSnippetsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [installMethod, setInstallMethod] = useState<"registry" | "git">("registry");

  const activeKeyDisplay = apiKey || "pp_test_your_sandbox_api_key";
  const defaultEndpoint = "https://node.pressprotocol.com";

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const installCommands = {
    typescript: {
      registry: "pnpm add @pressprotocol/sdk",
      git: "pnpm add git+https://github.com/0xshikhar/PressProtocol.git#packages/sdk",
    },
    python: {
      registry: "pip install pressprotocol-py",
      git: 'pip install "git+https://github.com/0xshikhar/PressProtocol.git#subdirectory=sdks/python"',
    },
    go: {
      registry: "go get github.com/0xshikhar/PressProtocol/sdks/go@v1.0.6",
      git: "go get github.com/0xshikhar/PressProtocol/sdks/go@master",
    },
    rust: {
      registry: "cargo add pressprotocol-rs",
      git: 'pressprotocol-rs = { git = "https://github.com/0xshikhar/PressProtocol.git", branch = "master" }',
    },
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

print(f"✅ Published CID: {post['cid']}")
print(f"📦 IPFS Gateway: {post.get('urls', {}).get('ipfs')}")
print(f"🧅 Tor Mirror: {post.get('urls', {}).get('tor')}")`,

    go: `package main

import (
    "fmt"
    "github.com/0xshikhar/PressProtocol/sdks/go"
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
    fmt.Printf("📦 IPFS Mirror: %s\\n", result.URLs["ipfs"])
    fmt.Printf("🧅 Tor Mirror: %s\\n", result.URLs["tor"])
}`,

    rust: `use pressprotocol_rs::{Client, PublishRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(
        "${defaultEndpoint}",
        "${activeKeyDisplay}",
    )?;

    let res = client.publish_raw(PublishRequest {
        title: "Security Advisory Bulletin".into(),
        content: "# Zero-Day Mitigation\\nDeterministic archival.".into(),
        format: Some("markdown".into()),
        tags: vec!["security".into(), "bulletin".into()],
        author: Some("Security Council".into()),
    }).await?;

    println!("✅ Anchored CID: {}", res.cid);
    println!("🌐 IPFS Mirror: {:?}", res.urls.get("ipfs"));
    println!("🧅 Tor Mirror: {:?}", res.urls.get("tor"));
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

  const renderTerminalWindow = (lang: "typescript" | "python" | "go" | "rust" | "curl", title: string) => {
    const installCmd = lang !== "curl" ? installCommands[lang][installMethod] : null;
    const code = snippets[lang];

    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0D14] overflow-hidden shadow-2xl space-y-0">
        {/* macOS Terminal Window Titlebar Chrome */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111420] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            <span className="ml-2 font-mono text-xs text-white/50">{title}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => copyText(code, `${lang}-code`)}
            className="h-7 text-xs font-mono border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg gap-1.5"
          >
            {copiedId === `${lang}-code` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId === `${lang}-code` ? "Copied Snippet" : "Copy Code"}</span>
          </Button>
        </div>

        {/* 1-Line Installation Header if applicable */}
        {installCmd && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/5 text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-2 truncate">
              <span className="text-white/40 select-none">$</span>
              <span className="truncate">{installCmd}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyText(installCmd, `${lang}-install`)}
              className="h-6 px-2 text-xs font-mono text-white/60 hover:text-white shrink-0 ml-2"
              title="Copy install command"
            >
              {copiedId === `${lang}-install` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}

        {/* Code Content */}
        <div className="p-4 font-mono text-xs overflow-x-auto text-cyan-100/90 leading-relaxed whitespace-pre selection:bg-cyan-500/30">
          {code}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Multi-Language SDK Ecosystem</h2>
          </div>
          <p className="text-sm text-white/60 mt-1 font-sans">
            Native, idiomatic libraries with embedded cryptographic multihashing and automatic failover.
          </p>
        </div>

        {/* Public Registry vs Direct Git Install Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInstallMethod("registry")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${installMethod === "registry"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
              : "text-white/60 hover:text-white"
              }`}
          >
            Public Registry
          </button>
          <button
            type="button"
            onClick={() => setInstallMethod("git")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${installMethod === "git"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
              : "text-white/60 hover:text-white"
              }`}
          >
            Direct Git Install
          </button>
        </div>
      </div>

      <Tabs defaultValue="typescript" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto h-auto p-1 bg-white/5 border border-white/10 rounded-xl">
          <TabsTrigger value="typescript" className="text-xs font-mono py-2 text-white/70 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">TypeScript / JS</TabsTrigger>
          <TabsTrigger value="python" className="text-xs font-mono py-2 text-white/70 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">Python</TabsTrigger>
          <TabsTrigger value="go" className="text-xs font-mono py-2 text-white/70 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">Go</TabsTrigger>
          <TabsTrigger value="rust" className="text-xs font-mono py-2 text-white/70 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">Rust</TabsTrigger>
          <TabsTrigger value="curl" className="text-xs font-mono py-2 text-white/70 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg">cURL</TabsTrigger>
        </TabsList>

        <TabsContent value="typescript">
          {renderTerminalWindow("typescript", "node - pressprotocol-sdk v1.0.6")}
        </TabsContent>

        <TabsContent value="python">
          {renderTerminalWindow("python", "python3 - pressprotocol v1.0.6")}
        </TabsContent>

        <TabsContent value="go">
          {renderTerminalWindow("go", "go run - main.go")}
        </TabsContent>

        <TabsContent value="rust">
          {renderTerminalWindow("rust", "cargo run - main.rs")}
        </TabsContent>

        <TabsContent value="curl">
          {renderTerminalWindow("curl", "bash - curl rest gateway")}
        </TabsContent>
      </Tabs>
    </section>
  );
}
