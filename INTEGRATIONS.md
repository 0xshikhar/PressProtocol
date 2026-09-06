# PressProtocol Integrations & Distribution Rails Guide

> **Universal Sovereign Publishing Rails for Any Website, CMS, or Pipeline**

PressProtocol is architected to eliminate technical friction. Rather than forcing journalists, editors, and developers to abandon their existing publishing stacks or learn complex Web3 tooling, PressProtocol integrates directly into the software the world already uses.

---

## 1. Distribution Rails Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PRESSPROTOCOL DISTRIBUTION RAILS                  │
├──────────────────────┬────────────────────────┬────────────────────────┤
│ Content Management   │ Developer & CI/CD      │ Reader & Consumer      │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ • WordPress Plugin   │ • Official GitHub Act. │ • Chromium MV3 Ext.    │
│ • Universal Widget   │ • TypeScript/Node SDK  │ • Offline-First Vault  │
│ • Obsidian Plugin    │ • Python SDK           │ • Optical QR Mesh      │
│ • Substack Importer  │ • Go SDK               │ • P2P Web Reader       │
│ • Notion 1-Click     │ • Rust SDK             │ • Tor v3 Onion Gateway │
│ • RSS Bulk Archive   │ • REST OpenAPI 3.1.0   │ • Air-Gap Proof Viewer │
└──────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 2. Drop-In Universal Web Component (`<pressprotocol-publish>`)

**Package**: [`@pressprotocol/widget`](https://github.com/0xshikhar/PressProtocol/tree/main/packages/widget)  

**Distribution**: Standalone Zero-Dependency Web Component (ES Module & CDN)

The universal widget allows any website developer to add sovereign archival and multi-transport publishing to their existing blog, CMS, or Medium-clone with **two lines of HTML**:

```html
<!-- 1. Include PressProtocol Universal Rails script -->
<script type="module" src="https://cdn.pressprotocol.com/v1/widget.js" async></script>

<!-- 2. Embed 1-Click Sovereign Publishing Button into any form/editor -->
<pressprotocol-publish 
  target-editor="#article-body" 
  target-title="#article-title"
  node-url="https://api.pressprotocol.com"
  badge="compact"
  theme="auto"
  onpublish="console.log('Published to IPFS/Tor:', event.detail.cid)">
</pressprotocol-publish>
```

### Pre-Built Rich Text Editor Connectors

The widget automatically detects and seamlessly extracts content and markup from:

| Editor Stack | Connector Implementation | Target Selector Example |
| :--- | :--- | :--- |
| **TipTap** | Extracts clean HTML or JSON via `editor.getHTML()` / `editor.getJSON()` | `target-editor="#tiptap-editor"` |
| **Lexical** | Serializes state via `editor.getEditorState().read(...)` | `target-editor="#lexical-container"` |
| **Quill** | Reads Delta and HTML via `quill.root.innerHTML` | `target-editor=".ql-editor"` |
| **TinyMCE** | Extracts clean content via `tinymce.activeEditor.getContent()` | `target-editor="#tinymce-editor"` |
| **ProseMirror** | Direct DOM serializer from active EditorView state | `target-editor="#prosemirror-view"` |
| **Plain Text / Markdown** | Native value extraction from standard HTML `<textarea>` | `target-editor="#markdown-body"` |
| **Raw Content** | Direct `innerHTML` / `innerText` traversal from standard HTML elements | `target-editor="#editable-div"` |

### Configuration Attributes

- `target-editor` (string): CSS selector pointing to the content container or textarea.
- `target-title` (string, optional): CSS selector pointing to the article title input.
- `node-url` (string, optional): Gateway or local node URL (defaults to production gateway).
- `badge` (`"full"` | `"compact"` | `"minimal"`): Visual style of the publishing button.
- `theme` (`"auto"` | `"light"` | `"dark"`): Color theme matching the host page.
- `onpublish` (event): Emits `CustomEvent` with `{ cid, signature, mirrors, urls }`.

---

## 3. WordPress Plugin (`pressprotocol-wordpress`)

**Location**: [`integrations/wordpress-plugin`](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/wordpress-plugin)  
**Target Market**: 43% of the internet (180M+ active WordPress websites)

The PressProtocol WordPress plugin brings sovereign, un-cancellable publishing to newsrooms, independent bloggers, and digital publications without changing their editorial workflow.

### Features
- **Seamless Editor Integration**: Custom sidebar panel in the Gutenberg Block Editor and Classic Editor meta box.
- **1-Click Sovereign Publish**: Automatically strips tracking pixels, computes deterministic CIDv1, signs the publication, and pins it across IPFS and Tor hidden services upon publishing a post.
- **Decentralized Verification Badge**: Automatically renders a verified cryptographic stamp with direct links to IPFS and Tor mirrors at the bottom of published articles.
- **Node Flexibility**: Newsrooms can connect to public community gateways or point directly to their own private, self-hosted node daemon (`http://127.0.0.1:4000`).

---

## 4. Sovereign Web Clipper & Protocol Handler (Chromium MV3 Extension)

**Location**: [`integrations/browser-extension`](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/browser-extension)  
**Platform**: Manifest V3 for Chromium (Google Chrome, Brave, Arc, Edge, Opera)

The browser extension bridges the clearnet web with decentralized protocol rails:

### Features
1. **Native Protocol Handler (`pressprotocol://`)**: Intercepts `pressprotocol://<cid>` URIs in the browser URL bar, executing parallel multi-transport resolution across IPFS and Tor with automatic failover.
2. **1-Click Sovereign Web Clipper**:
   - Strips commercial tracking pixels, paywall overlays, and analytics tags.
   - Converts the active webpage to clean sovereign Markdown.
   - Anchors the preserved snapshot to IPFS and Tor with a single click.
3. **Cryptographic Integrity Auditor**:
   - Displays real-time Ed25519 verification status in the browser toolbar.
   - Alerts the reader if an article has been modified or tampered with by an ISP or proxy.
4. **Offline Reading List**: Stores clipped and resolved articles locally in encrypted storage.

---

## 5. Official GitHub Action (`pressprotocol/publish-action`)

**Location**: [`integrations/publish-action`](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/publish-action)  
**Use Case**: Continuous Deployment for developer blogs, technical documentation, GitBook archives, and civic transparency repositories.

Publish any Markdown directory, Hugo site, Astro blog, or documentation site to IPFS and Tor automatically on every `git push`:

```yaml
# .github/workflows/sovereign-publish.yml
name: Publish to PressProtocol
on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Sovereign Rails
        uses: pressprotocol/publish-action@v1
        with:
          path: './docs'
          title: 'Civic Transparency Report 2026'
          api_key: ${{ secrets.PRESSPROTOCOL_API_KEY }}
          generate_proof: true
```

### Outputs
- `steps.publish.outputs.cid`: The immutable IPFS CIDv1.
- `steps.publish.outputs.ipfs_url`: Clearnet IPFS URL.
- `steps.publish.outputs.tor_url`: Tor v3 `.onion` mirror link.
- `steps.publish.outputs.proof_path`: Path to the generated `.pressproof.json` air-gap verification bundle.

---

## 6. Obsidian Vault Plugin (`pressprotocol-obsidian`)

**Location**: [`integrations/obsidian-plugin`](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/obsidian-plugin)  
**Use Case**: Sovereign publishing directly from local personal knowledge management vaults.

Allows researchers, investigative journalists, and writers using Obsidian to publish any note to PressProtocol directly from their local Markdown files. Frontmatter tags, backlinks, and mathematical citations are preserved and anchored to decentralized storage.

---

## 7. Multi-Language SDK Ecosystem

In addition to the primary TypeScript SDK ([`@pressprotocol/sdk`](https://github.com/0xshikhar/PressProtocol/tree/main/packages/sdk)), PressProtocol provides native client libraries for high-performance backend pipelines:


### 7.1 Python SDK (`sdks/python`)
```python
from pressprotocol import PressProtocolClient

client = PressProtocolClient(api_key="pp_live_...")

# Sovereign publish
result = client.publish(
    title="Investigative Report",
    content="# Findings\n\nFull whistleblowing document...",
    tags=["investigation", "leak"]
)
print(f"Anchored CID: {result.cid}")
print(f"IPFS Mirror: {result.mirrors.ipfs}")
print(f"Tor Mirror:  {result.mirrors.tor}")
```

### 7.2 Go SDK (`sdks/go`)
```go
package main

import (
    "context"
    "fmt"
    "github.com/0xshikhar/PressProtocol/sdks/go"
)

func main() {
    client := pressprotocol.NewClient(&pressprotocol.Config{
        ApiKey: "pp_live_...",
    })

    result, err := client.Publish(context.Background(), pressprotocol.PublishOptions{
        Title:   "Civic Record 2026",
        Content: "Official public disclosure...",
        Tags:    []string{"civic", "opendata"},
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Published CID: %s\n", result.CID)
}
```

### 7.3 Rust SDK (`sdks/rust`)
```rust
use pressprotocol::{Client, PublishOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(Some("pp_live_..."));

    let result = client.publish(PublishOptions {
        title: "Immutable Dispatch".into(),
        content: "# Sovereign Log\n\nPreserved forever.".into(),
        tags: vec!["sovereign".into()],
    }).await?;

    println!("CID: {}", result.cid);
    Ok(())
}
```

---

## 8. Content Ingestion Rails & Migration Importers

PressProtocol provides built-in migration tools to import existing clearnet publications in bulk:

1. **Substack & Medium Importers**: Cleans proprietary tracking tags and re-publishes articles with cryptographic provenance.
2. **Notion 1-Click Sovereign Importer** ([`apps/web/src/app/import/notion`](https://github.com/0xshikhar/PressProtocol/tree/main/apps/web/src/app/import/notion)): Directly connects to Notion workspaces and exports databases into decentralized Markdown archives.
3. **Bulk RSS Importer** ([`apps/web/src/app/import/rss`](https://github.com/0xshikhar/PressProtocol/tree/main/apps/web/src/app/import/rss)): Ingests entire publication archives from any standard RSS or Atom feed, creating cryptographically signed snapshots of every historical post.
4. **Commercial Surveillance Stripper**: Automatically runs on all imports to strip tracking pixels (Google Analytics, Meta Pixel, Hotjar), tracking query strings (`utm_*`, `fbclid`, `gclid`), and malicious redirection links.

