# PressProtocol Sovereign Publish Action (`pressprotocol/publish-action@v1`)

> **Automated Decentralized Publishing Rails for Static Site Generators**  
> Automatically sign, syndicate, and pin markdown articles to **IPFS** and **Tor** on `git push`, generating a cryptographic publication manifest (`pressprotocol-manifest.json`).

---

## 🚀 Overview

The **PressProtocol Sovereign Publish Action** bridges modern static site generators into decentralized, censorship-resistant publishing rails. Technical bloggers, researchers, and DAO teams can write naturally in **Hugo**, **Astro**, **Jekyll**, **Nextra**, or **Docusaurus**, and let GitHub Actions handle:

- 📑 **Frontmatter Parsing**: Extracts title, date, author, tags, and automatically respects `draft: true`.
- 🛡️ **De-Surveillance & Transpilation**: Cleans HTML, converts Callouts (`💡`, `⚠️`, `🚨`), and purges tracking scripts.
- 🔑 **In-Memory Ed25519 Signing**: Cryptographically signs every article using the author's private scalar key.
- 📦 **Deterministic CIDv1**: Calculates raw IPFS CIDv1 without relying on third-party hashing daemons.
- 🌐 **Multi-Transport Syndication**: Dispatches to IPFS swarms (Pinata, Cloudflare) and Tor `.onion` gateways.
- 📜 **Provenance Manifest**: Updates `pressprotocol-manifest.json` tracking historical published posts.

---

## 🛠️ Usage Examples

### 1. Hugo Blog Workflow (`.github/workflows/pressprotocol.yml`)

```yaml
name: Sovereign Publish (Hugo)

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Syndicate to PressProtocol
        id: sovereign_press
        uses: pressprotocol/publish-action@v1
        with:
          content_dir: './content/posts'
          private_key: ${{ secrets.PRESSPROTOCOL_PRIVATE_KEY }}
          author_pseudonym: 'Alice Crypto'
          gateway_url: 'https://pressprotocol.com'
          manifest_path: 'pressprotocol-manifest.json'

      - name: Commit Updated Manifest
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add pressprotocol-manifest.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update pressprotocol manifest [skip ci]"
          git push
```

### 2. Astro Content Collections Workflow

```yaml
name: Sovereign Publish (Astro)

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pressprotocol/publish-action@v1
        with:
          content_dir: './src/content/blog'
          private_key: ${{ secrets.PRESSPROTOCOL_PRIVATE_KEY }}
          filter_modified_only: 'true'
```

### 3. Jekyll Workflow

```yaml
name: Sovereign Publish (Jekyll)

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pressprotocol/publish-action@v1
        with:
          content_dir: './_posts'
          private_key: ${{ secrets.PRESSPROTOCOL_PRIVATE_KEY }}
```

---

## ⚙️ Action Inputs

| Input | Description | Required | Default |
|:---|:---|:---|:---|
| `content_dir` | Path to markdown content directory | No | `./content/posts` |
| `private_key` | Ed25519 64-char hex scalar secret key (`secrets.PRESSPROTOCOL_PRIVATE_KEY`) | No | Ephemeral Burner Key |
| `gateway_url` | PressProtocol node daemon or gateway endpoint | No | `https://pressprotocol.com` |
| `author_pseudonym` | Author byline / cryptographic pseudonym | No | `Sovereign Developer` |
| `manifest_path` | Path to save or update publication manifest | No | `pressprotocol-manifest.json` |
| `filter_modified_only` | Only syndicate posts added or changed in the latest commit | No | `false` |
| `dry_run` | Validate, transpile, sign, and calculate CIDs without broadcasting | No | `false` |
| `tags` | Additional comma-separated tags to attach to articles | No | `git-publish,sovereign-doc` |

---

## 📤 Action Outputs

| Output | Description | Example |
|:---|:---|:---|
| `published_count` | Number of articles successfully signed and syndicated | `3` |
| `latest_cid` | IPFS CIDv1 of the most recently published article | `bafybeihdwdcefgh4...` |
| `manifest_path` | Path to the written manifest file | `pressprotocol-manifest.json` |
| `cids` | JSON array containing all generated CIDs | `["bafybeic...","bafybeib..."]` |
| `public_key` | Author Ed25519 public key (64 hex characters) | `9a8b7c6d...` |

---

## 📜 Publication Manifest Format (`pressprotocol-manifest.json`)

The action produces a standardized provenance manifest tracking all published articles:

```json
{
  "manifestVersion": "1.0.0",
  "generator": "pressprotocol/publish-action@v1",
  "updatedAt": "2026-09-12T17:45:00.000Z",
  "publicKey": "a7b8c9d0...",
  "author": "Alice Crypto",
  "totalArticles": 4,
  "articles": [
    {
      "filePath": "posts/2026-09-12-decentralized-publishing.md",
      "slug": "decentralized-publishing",
      "title": "Why Decentralized Publishing Matters",
      "date": "2026-09-12T12:00:00.000Z",
      "author": "Alice Crypto",
      "tags": ["privacy", "cryptography", "tor", "git-publish"],
      "cid": "bafybeic7wxy...",
      "signature": "3f4a...",
      "publicKey": "a7b8c9d0...",
      "readingTimeMinutes": 4,
      "wordCount": 850,
      "shareUrl": "https://pressprotocol.com/read/bafybeic7wxy...",
      "mirrors": {
        "ipfs": "https://gateway.pinata.cloud/ipfs/bafybeic7wxy...",
        "gateway": "https://cloudflare-ipfs.com/ipfs/bafybeic7wxy...",
        "tor": "http://pressp42x7a6sover.onion/read/bafybeic7wxy..."
      },
      "publishedAt": "2026-09-12T17:45:00.000Z"
    }
  ]
}
```

---

## 🔒 Security & Privacy

- **Local Cryptography**: Ed25519 signing occurs strictly in the runner's memory. Private keys are never logged or sent to any remote server.
- **Zero-Telemetry Sanitization**: Removes inline tracking pixels, analytics scripts, and surveillance query tags.
- **Auditable Provenance**: Every reader on `/read/[cid]` can cryptographically verify the signature against the commit author's public key.
