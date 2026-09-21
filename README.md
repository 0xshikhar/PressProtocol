# PressProtocol

<p align="center">
  <img src="apps/web/public/pressprotocol-logo-1.png" alt="PressProtocol Logo" width="120" height="120" style="border-radius: 20px;" onerror="this.src='https://raw.githubusercontent.com/0xshikhar/PressProtocol/master/apps/web/public/pressprotocol-logo-1.png'"/>
</p>

<h1 align="center">PressProtocol</h1>

<p align="center">
  <strong>Universal Sovereign Publishing Infrastructure & Multi-Transport Resolution Rails</strong><br>
  <em>Not a walled-garden platform — neutral infrastructure extending uncensored publishing across WordPress, Ghost, Substack, Medium, Obsidian, and any web application.</em><br>
  <strong>Zero-Custody &bull; Multi-Transport (IPFS + Tor v3 + Clearnet) &bull; Zero Accounts &bull; In-Browser Cryptography</strong>
</p>

<p align="center">
  <a href="https://pressprotocol.com"><img src="https://img.shields.io/badge/Web%20App-pressprotocol.com-000000.svg?style=flat-square&logo=vercel" alt="Vercel Live"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/master/scripts/test.sh"><img src="https://img.shields.io/badge/Tests-419%2F419%20Passing%20(100%25)-10b981.svg?style=flat-square" alt="Tests Passing"/></a>
  <a href="https://www.npmjs.com/search?q=pressprotocol"><img src="https://img.shields.io/badge/npm-@pressprotocol-cb3837.svg?style=flat-square&logo=npm" alt="NPM Packages"/></a>
  <a href="https://pypi.org/project/pressprotocol-py/"><img src="https://img.shields.io/pypi/v/pressprotocol-py.svg?color=3775A9&style=flat-square&logo=pypi&label=pypi" alt="PyPI Package"/></a>
  <a href="https://crates.io/crates/pressprotocol-rs/1.0.7"><img src="https://img.shields.io/crates/v/pressprotocol-rs.svg?color=DEA584&style=flat-square&logo=rust&label=crates.io" alt="Crates.io Package"/></a>
  <a href="https://pkg.go.dev/github.com/0xshikhar/PressProtocol/sdks/go"><img src="https://pkg.go.dev/badge/github.com/0xshikhar/PressProtocol/sdks/go.svg" alt="Go Reference"/></a>
  <a href="https://pressprotocol.com/support"><img src="https://img.shields.io/badge/Support-Donate%20%26%20Underwrite-rose.svg?style=flat-square&logo=heart" alt="Support PressProtocol"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square" alt="License: MIT"/></a>
</p>

> ### 🌐 Sovereign Digital Infrastructure — Not a Closed Platform
> - **Pure Infrastructure Layer**: PressProtocol is not a closed blogging platform or proprietary app. It is a universal, open protocol layer that extends unstoppable publishing capabilities to existing content management systems across the web.
> - **Universal Reach & Compatibility**: Natively integrates into **WordPress** (powering 43% of the internet), **Medium**, **Substack**, **Ghost**, **Obsidian**, and static site pipelines, or any custom CMS via a 2-line Web Component.
> - **Zero-Custody Architecture**: Zero gas, zero seed phrases, no wallets, no KYC. Authors sign content in-browser with RFC 8032 Ed25519 keys before transmission.
> - **Multi-Transport Racing**: Sub-100ms clearnet IPFS resolution + automatic failover to Tor v3 `.onion` hidden services.
> - **Self-Sovereign Node Stack**: Deploy a dedicated node with 1-click Docker Compose (`core/node`) including embedded Tor v3 hidden services and IPFS DHT.
> - **Sovereign Support**: 100% free and open-source public good. Underwrite infrastructure at [`pressprotocol.com/support`](https://pressprotocol.com/support).

---

## 📦 Official Packages, Extensions & Distribution Downloads

All core developer libraries, client SDKs, and offline browser/CMS integrations are verified and ready to install or download:

### 1. Published Language Registries & SDKs

| Language / Target | Published Registry Link | Package Identifier | Installation Command |
| :--- | :--- | :--- | :--- |
| **Python** | [**PyPI Registry**](https://pypi.org/project/pressprotocol-py/) | `pressprotocol-py` | `pip install pressprotocol-py` |
| **NPM (TypeScript)** | [**NPM Packages (View All 3)**](https://www.npmjs.com/search?q=pressprotocol) | [`@pressprotocol/sdk`](https://www.npmjs.com/package/@pressprotocol/sdk) | `pnpm add @pressprotocol/sdk` |
| **NPM (Proof Codec)** | [**NPM Packages (View All 3)**](https://www.npmjs.com/search?q=pressprotocol) | [`@pressprotocol/proof`](https://www.npmjs.com/package/@pressprotocol/proof) | `pnpm add @pressprotocol/proof` |
| **NPM (Web Widget)** | [**NPM Packages (View All 3)**](https://www.npmjs.com/search?q=pressprotocol) | [`@pressprotocol/widget`](https://www.npmjs.com/package/@pressprotocol/widget) | `pnpm add @pressprotocol/widget` |
| **Rust** | [**Crates.io Registry**](https://crates.io/crates/pressprotocol-rs/1.0.7) | `pressprotocol-rs` (v1.0.7) | `cargo add pressprotocol-rs` |
| **Go** | [**Go Packages (pkg.go.dev)**](https://pkg.go.dev/github.com/0xshikhar/PressProtocol/sdks/go) | `github.com/0xshikhar/PressProtocol/sdks/go` | `go get github.com/0xshikhar/PressProtocol/sdks/go@v1.0.8` |
| **Docker (GHCR)** | [**GitHub Packages (GHCR)**](https://github.com/0xshikhar/PressProtocol/pkgs/container/pressprotocol-node) | `ghcr.io/0xshikhar/pressprotocol-node` | `docker pull ghcr.io/0xshikhar/pressprotocol-node:latest` |

### 2. Ready-to-Use Native Extensions & Standalone Downloads

Download and install client extensions and publishing plugins directly without compiling:

| Integration | Distribution Artifact | Download / Source Link | Description |
| :--- | :--- | :--- | :--- |
| **Chromium Extension** | Zip Package | [**Download Extension Zip**](https://pressprotocol.com/downloads/PressProtocol_Browser_Extension.zip) | Manifest V3 clipper. Intercepts `pressprotocol://` URIs and clips articles directly to IPFS/Tor. |
| **WordPress Plugin** | Zip Package | [**Download WordPress Zip**](https://pressprotocol.com/downloads/PressProtocol_Wordpress_Plugin.zip) | 1-click sovereign publishing directly from Gutenberg and Classic editors to decentralized swarms. |
| **Obsidian Plugin** | Zip Package | [**Download Obsidian Zip**](https://pressprotocol.com/downloads/PressProtocol_Obsidian_Plugin.zip) | Publish investigative notes, research vaults, and dossiers directly to IPFS and Tor from Obsidian. |
| **Sovereign Node Stack** | Docker Compose | [**Download docker-compose.yml**](https://pressprotocol.com/downloads/docker-compose.yml) | 1-click self-hosted node daemon with embedded Tor v3 hidden service and IPFS DHT. |
| **GitHub Action** | Marketplace Action | [**`pressprotocol/publish-action`**](https://github.com/0xshikhar/PressProtocol/tree/master/integrations/publish-action) | CI/CD automation action for continuous documentation archival and repository sync on git push. |

> 💡 **Interactive Portal**: You can also inspect setup guides, SHA-256 checksums, and release notes at [**pressprotocol.com/downloads**](https://pressprotocol.com/downloads).

---



## 🧭 Table of Contents

- [Protocol Philosophy & Architectural Thesis](#-protocol-philosophy--architectural-thesis)
- [Distribution Rails Overview: Everything We Have Built](#-distribution-rails-overview-everything-we-have-built)
- [System Architecture & Multi-Transport Resolution Flow](#-system-architecture--multi-transport-resolution-flow)
- [Core Protocol Subsystems & Specifications](#-core-protocol-subsystems--specifications)
  - [1. Multi-Transport Resolution & Parallel Racing Engine](#1-multi-transport-resolution--parallel-racing-engine)
  - [2. Zero-Custody Client-Side Ed25519 Cryptographic Identity](#2-zero-custody-client-side-ed25519-cryptographic-identity)
  - [3. Open Infrastructure Gateway & OpenAPI 3.1.0 REST API](#3-open-infrastructure-gateway--openapi-310-rest-api)
  - [4. Outbound Real-Time Webhooks & HMAC-SHA256 Event Bus](#4-outbound-real-time-webhooks--hmac-sha256-event-bus)
  - [5. Drop-In `<pressprotocol-publish>` Universal Widget & 7 Editor Connectors](#5-drop-in-pressprotocol-publish-universal-widget--7-editor-connectors)
  - [6. Air-Gapped Sovereign Proof (`.pressproof.json`) & Optical QR Codec (`PPQR:1:*`)](#6-air-gapped-sovereign-proof-pressproofjson--optical-qr-codec-ppqr1)
  - [7. Commercial Surveillance Stripper & CMS Sanitizer](#7-commercial-surveillance-stripper--cms-sanitizer)
- [Quick Start Guide](#-quick-start-guide)
- [SDK Ecosystem & Usage Examples](#-sdk-ecosystem--usage-examples)
  - [TypeScript / Node.js SDK](#typescript--nodejs-sdk)
  - [Python SDK](#python-sdk)
  - [Go SDK](#go-sdk)
  - [Rust SDK](#rust-sdk)
  - [Universal HTML Widget (2 Lines)](#universal-html-widget-2-lines)
  - [Terminal CLI (`pressprotocol`)](#terminal-cli-pressprotocol)
- [Verification Test Harness (100% Pass)](#-verification-test-harness-100-pass)
- [Threat Model & Adversarial Defense](#-threat-model--adversarial-defense)
- [Sovereign Public Good & Community Support](#-sovereign-public-good--community-support)
- [Reference Documents](#-reference-documents)
- [License & Open Source Commitment](#-license--open-source-commitment)


---

## 🌐 Protocol Philosophy & Architectural Thesis

### The Problem: The Fragility of Digital Free Expression

Centralized publishing platforms (Medium, Substack, WordPress.com, standard shared web hosts) suffer from critical single points of failure: **DNS takedowns, ISP-level domain filtering, cloud hosting deplatforming, payment processor account freezing, and physical server seizures**. When independent journalists, whistleblowers, or researchers report on sensitive civic issues, they frequently encounter domain blacklisting, denial-of-service, or unilateral platform censorship.

First-generation decentralized publishing attempts introduced other practical obstacles:

1. **Cryptocurrency Barrier**: Systems requiring on-chain gas fees (Arweave, Mirror) impose browser wallet extensions, seed phrases, and token purchases on non-technical journalists and newsroom editors.
2. **On-Chain Deanonymization**: Public blockchain transactions create an immutable financial ledger trail, allowing adversaries to correlate publishing identity with exchange KYC records via transaction graph analysis.
3. **Single-Gateway Dependency**: Many decentralized tools rely on a single public HTTP gateway (e.g. `ipfs.io`). When state firewalls block that specific domain, access to the entire publication is severed.
4. **Tor Performance Friction**: Standalone Tor `.onion` websites experience significant latency (3 to 10 seconds) and cannot be reached by standard web readers without the Tor Browser.

### The Architectural Design: Privacy Infrastructure for the Open Web

PressProtocol is architected from first principles as **pure, neutral infrastructure rather than an isolated consumer blogging platform**. Instead of asking content creators and newsrooms to abandon their established audiences and CMS workflows, PressProtocol serves as the **universal substrate and decentralized transport rail that attaches directly into the tools the web already runs on**:

* **Universal CMS & Web Extensibility**: Rather than forcing migration, PressProtocol brings sovereign capabilities to existing systems. With a **native WordPress Plugin** (empowering 43% of the world's web), **Obsidian Plugin**, **Chromium MV3 Extension**, **bulk Notion/Substack/Medium/RSS migration pipelines**, and a **2-line drop-in `<pressprotocol-publish>` universal widget**, any website, blog, or CMS can inherit censorship-resistant IPFS/Tor distribution instantly.
* **Zero Wallets, Zero Gas, Zero KYC**: Publishers generate RFC 8032 Ed25519 keypairs in ephemeral client memory. The public key provides a permanent cryptographic pseudonym; the private key signs the canonical content payload in browser RAM.
* **Zero Financial Footprint**: Without on-chain transaction fees, publishing leaves zero ledger trails. There are no wallets to trace, no token purchases, and no gas volatility.
* **Multi-Transport Racing with Automatic Failover**: When resolving an article, the protocol queries IPFS gateways, P2P DHT swarms, and Tor v3 `.onion` hidden services concurrently. If an ISP blocks clearnet IPFS gateways, content automatically resolves over Tor with zero manual intervention.
* **Zero Telemetry & Surveillance Stripping**: Built-in ingest pipelines scrub Google Analytics, Meta Pixels, tracking beacons, UTM query strings, and fingerprinting scripts before content hashing occurs.
* **Multi-Language Developer Foundation**: Production-grade SDKs in **TypeScript, Python, Go, and Rust**, backed by an OpenAPI 3.1.0 gateway and real-time HMAC-SHA256 webhook event bus.

---

## 🗺️ Distribution Rails Overview: Everything We Have Built

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESSPROTOCOL DISTRIBUTION RAILS                                     │
├───────────────────────────────┬───────────────────────────────┬────────────────────────────────────────┤
│ Content Management Rails      │ Developer & Automation Rails  │ Reader, Consumer & Air-Gap Rails       │
├───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────┤
│ • WordPress Plugin            │ • Official GitHub Action      │ • Chromium MV3 Extension               │
│ • Universal Widget (<embed>)  │ • TypeScript / Node.js SDK    │ • Offline-First Encrypted Vault        │
│ • Obsidian Vault Plugin       │ • Python SDK                  │ • Optical QR Delay-Tolerant Mesh       │
│ • Substack & Medium Importer  │ • Go SDK                      │ • P2P Web Reader & Content Portal      │
│ • Notion 1-Click Importer     │ • Rust SDK                    │ • Tor v3 Onion Gateway Services        │
│ • RSS Bulk Archive Importer   │ • REST OpenAPI 3.1.0 Gateway  │ • Air-Gapped Proof Viewer (.pressproof)│
└───────────────────────────────┴───────────────────────────────┴────────────────────────────────────────┘
```

### Direct Component Directory Links

| Distribution Surface | Description | Target Users |
| :--- | :--- | :--- |
| **WordPress Plugin** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/integrations/wordpress-plugin)) | Native WordPress plugin for Gutenberg & Classic editors. 1-click sovereign publishing to IPFS & Tor. | WordPress web publishers (Gutenberg & Classic) |
| **Universal Web Component** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/packages/widget)) | 2-line drop-in `<pressprotocol-publish>` widget. Connectors for TipTap, Lexical, Quill, TinyMCE, ProseMirror, Markdown, and HTML. | Any web developer, blog, or CMS |
| **Chromium Extension** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/integrations/browser-extension)) | Manifest V3 extension. Intercepts `pressprotocol://` URIs, clips web articles into sovereign Markdown, and verifies signatures. | Readers, researchers, whistleblowers |
| **Official GitHub Action** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/integrations/publish-action)) | CI/CD GitHub Action (`pressprotocol/publish-action`) for continuous sovereign archival on `git push`. | Developers, docs sites, civic archives |
| **Obsidian Plugin** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/integrations/obsidian-plugin)) | Personal knowledge management plugin. Publishes local Markdown notes and investigative dossiers to IPFS/Tor. | Journalists, researchers, analysts |
| **TypeScript / Node SDK** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/packages/sdk)) | `@pressprotocol/sdk` with Ed25519 signing, deterministic in-memory CIDv1 multihashes, parallel resolver, and CLI. | Node.js, Next.js, Bun, Edge runtime |
| **Python SDK** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/sdks/python)) | Native Python library for automated archival scripts, newsroom scrapers, and data pipelines. | Data scientists, backend engineers |
| **Go SDK** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/sdks/go)) | High-concurrency Go client for enterprise microservices and backend ingest nodes. | Infrastructure engineers, DevOps |
| **Rust SDK** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/sdks/rust)) | Memory-safe, zero-allocation asynchronous client for decentralized network daemons. | Systems programmers, node operators |
| **Enterprise REST Gateway** ([source](https://github.com/0xshikhar/PressProtocol/blob/master/core/node/src/routes/v1.ts)) | OpenAPI 3.1.0 gateway endpoints, token-bucket rate limiting, and SHA-256 API key security. | Enterprise newsrooms, bots, platforms |
| **Outbound Webhooks Bus** ([source](https://github.com/0xshikhar/PressProtocol/blob/master/core/node/src/services/WebhookSubscriptionService.ts)) | Real-time event bus with HMAC-SHA256 signatures, replay protection, and exponential retry delivery. | Ghost, Strapi, WordPress webhooks |
| **Air-Gap Proof & QR Mesh** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/packages/proof)) | Standalone `.pressproof.json` specification & `PPQR:1:*` high-density animated QR streaming codec. | Internet blackouts, air-gapped devices |
| **Offline-First Local Vault** ([source](https://github.com/0xshikhar/PressProtocol/tree/master/apps/web/src/app/vault)) | Zero-telemetry client-side IndexedDB vault for encrypted local reading and offline verification. | Privacy-conscious readers, field reporters |
| **Web Portal & Dev Hub** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/apps/web)) | Next.js 15 web application with interactive developer documentation and in-browser cryptographic simulator. | General public, developers |
| **Sovereign Node Daemon** ([repo](https://github.com/0xshikhar/PressProtocol/tree/master/core/node)) | Self-sovereign private micro-daemon with Tor v3 hidden services, in-memory IPFS blockstore, and P2P federation. | Node runners, self-hosters |
| **Content Ingestion Rails** ([source](https://github.com/0xshikhar/PressProtocol/tree/master/apps/web/src/app/import)) | Migration importers for Notion, Substack, Medium, and bulk RSS/Atom feeds with surveillance scrubbing. | Migrating publishers, media outlets |

---

## 🏗️ System Architecture & Multi-Transport Resolution Flow

PressProtocol separates publishing into distinct, sovereign layers: content addressing, cryptographic identity, swarm transport, and multi-mirror resolution.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PUBLISHER DISTRIBUTION RAILS                              │
│                                                                                             │
│   ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐   │
│   │ Next.js Web App  │  │ Universal Widget│  │ WordPress Plugin │  │ Chromium Extension │   │
│   │  (apps/web)      │  │ (<pressprotocol-│  │ (integrations/   │  │ (integrations/     │   │
│   │                  │  │  publish>)      │  │  wordpress)      │  │  browser-ext)      │   │
│   └─────────┬────────┘  └────────┬────────┘  └────────┬─────────┘  └─────────┬──────────┘   │
│             │                    │                    │                      │              │
│             │   ┌────────────────┴────────────────────┴──────────────────────┘              │
│             ▼   ▼                                                                           │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                Client-Side Cryptographic Engine (@pressprotocol/sdk)                │   │
│   │  1. Content Sanitization (Strip commercial tracking pixels, UTM, fingerprinting)    │   │
│   │  2. Canonical JSON Serialization & Title/Tag Packaging                              │   │
│   │  3. Deterministic In-Memory CIDv1 Computation (multihash sha2-256 raw-codec Base32) │   │
│   │  4. RFC 8032 Ed25519 Signature Generation (Zero Private Key Transmission)           │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
└──────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            ENTERPRISE GATEWAY & SOVEREIGN NODE                              │
│                                 (core/node - Fastify Engine)                                │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ OpenAPI 3.1.0 REST API & Ingest Pipeline ("Stripe for Publishing")                     │  │
│  │ - POST /api/v1/publish/signed   (Zero-Custody Swarm Distribution)                     │  │
│  │ - POST /api/v1/publish/raw      (Custodial Node-Signed Ingest)                        │  │
│  │ - GET  /api/v1/resolve/:cid     (Multi-Transport Swarm Resolver)                      │  │
│  │ - POST /api/v1/verify           (Mathematical Cryptographic Verification)             │  │
│  │ - GET  /api/v1/metrics          (Telemetry, Throughput & Circuit Health)              │  │
│  │ - Token-Bucket Rate Limiter     (Per-Key & Per-IP Quotas)                             │  │
│  └───────────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                              │                                              │
│        ┌─────────────────────────────────────┼─────────────────────────────────────┐        │
│        ▼                                     ▼                                     ▼        │
│  ┌───────────┐                        ┌───────────┐                         ┌───────────┐   │
│  │ Blockstore│                        │ Tor v3    │                         │ Webhooks  │   │
│  │  Storage  │                        │ Hidden    │                         │ Event Bus │   │
│  │ (Memory + │                        │ Service   │                         │ (HMAC-    │   │
│  │  IPFS DHT)│                        │ Daemon    │                         │  SHA256)  │   │
│  └─────┬─────┘                        └─────┬─────┘                         └─────┬─────┘   │
└────────┼────────────────────────────────────┼─────────────────────────────────────┼─────────┘
         │                                    │                                     │
         ▼                                    ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐                  ┌───────────────────┐
│ Global IPFS     │                  │ The Onion       │                  │ Subscribed        │
│ Swarm & DHT     │                  │ Router (Tor)    │                  │ Newsrooms, Bots,  │
│ - Pinata        │                  │ - .onion hidden │                  │ Ghost, WordPress, │
│ - Cloudflare    │                  │   services      │                  │ & Webhook Hooks   │
│ - IPFS.io       │                  │ - Uncancellable │                  │ - Replay protected│
│ - Public nodes  │                  │   darknet mirror│                  │ - Signed headers  │
└────────┬────────┘                  └────────┬────────┘                  └───────────────────┘
         │                                    │
         └──────────────────┬─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    READER & RESOLUTION SURFACES                             │
│                                                                                             │
│   ┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────┐   │
│   │ Multi-Transport Parallel  │  │ Air-Gapped Sovereign      │  │ Delay-Tolerant        │   │
│   │ Resolver (Browser / Ext)  │  │ Proofs (.pressproof.json) │  │ Optical QR Mesh       │   │
│   │ - Races IPFS vs Tor vs CDN│  │ - Offline cryptographic   │  │ - PPQR:1:* streaming  │   │
│   │ - Sub-150ms typical read  │  │   audit verification      │  │   chunk reassembly    │   │
│   │ - Auto-failover on ISP cut│  │ - Wayback Machine &       │  │ - Camera scanner for  │   │
│   │ - In-memory Ed25519 check │  │   Archive.today sync      │  │   air-gapped transfer │   │
│   └───────────────────────────┘  └───────────────────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Protocol Subsystems & Specifications

### 1. Multi-Transport Resolution & Parallel Racing Engine
Rather than relying on a single centralized gateway or single network protocol, PressProtocol clients execute an adaptive parallel race across independent transports:
- **Transport 1 (Node Daemon & Edge Gateway)**: Query local sovereign daemon at `http://127.0.0.1:4000` (sub-20ms) or public edge gateway at `https://api.pressprotocol.com`.
- **Transport 2 (Clearnet IPFS Gateway Swarm)**: Races Pinata, Cloudflare, IPFS.io, and dweb.link (typical latency ~120ms).
- **Transport 3 (Tor v3 Onion Services)**: Directly queries `.onion` hidden services via SOCKS5 proxy (~1800ms).
- **Automatic Failover**: If an ISP deep-packet inspection (DPI) filter blocks IPFS gateways, the request seamlessly resolves via Tor. In-memory Ed25519 verification guarantees that no intermediary gateway can tamper with article content.

### 2. Zero-Custody Client-Side Ed25519 Cryptographic Identity
- Authors are identified by a 32-byte RFC 8032 Ed25519 public key.
- Keypairs are generated in-browser via `@pressprotocol/sdk` or the Web Crypto API.
- The author's private key signs the canonical JSON payload (`title`, `tags`, `timestamp`).
- In the zero-custody flow (`POST /api/v1/publish/signed`), the gateway receives only the public key and signature. **The private key never leaves the author's device.**

### 3. Open Infrastructure Gateway & OpenAPI 3.1.0 REST API
PressProtocol provides identical RESTful publishing, verification, and swarm resolution endpoints across both **public edge infrastructure** and **self-hosted sovereign nodes**:
- **Public Edge Gateway**: `https://api.pressprotocol.com` — Zero setup, globally distributed edge endpoints.
- **Self-Hosted Private Daemon**: `http://127.0.0.1:4000` (or local Tor `.onion` service) — 100% autonomous, sovereign private daemon (`core/node`).

```bash
# Choose your gateway target:
# Option A: Public Edge Gateway (Zero Setup)
GATEWAY="https://api.pressprotocol.com"
# Option B: Self-Hosted Sovereign Node (Local / Air-Gapped)
# GATEWAY="http://127.0.0.1:4000"

# 1. Probe Gateway / Node Health & Multi-Transport Circuit Status
curl -s "$GATEWAY/health" | jq

# 2. Publish Article (Direct Ingest to Swarms)
curl -X POST "$GATEWAY/api/v1/publish/raw" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investigative Leak 2026",
    "content": "# Classified Memo\n\nPreserved across decentralized swarms.",
    "tags": ["whistleblower", "transparency"]
  }'

# 3. Resolve & Stream Article across IPFS & Tor Swarms
curl -s "$GATEWAY/api/v1/resolve/bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4" | jq

# 4. Instant Cryptographic Verification (RFC 8032 Ed25519)
curl -X POST "$GATEWAY/api/v1/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "d4a5b6...",
    "signature": "e8f9a0..."
  }'
```

- `POST /api/v1/publish/signed`: Zero-custody ingest for client-signed articles.
- `POST /api/v1/publish/raw`: Custodial ingest with deterministic CIDv1 generation.
- `GET /api/v1/resolve/:cid`: Swarm resolver with active mirror latency telemetry.
- `POST /api/v1/verify`: Instant mathematical cryptographic audit under RFC 8032.
- `GET /api/v1/metrics`: Node health, gateway latency, and bandwidth telemetry.
- **Enterprise Rate Limiting**: In-memory token-bucket rate limiter with configurable quotas and SHA-256 API key hashing (`pp_live_*`, `pp_test_*`).

### 4. Outbound Real-Time Webhooks & HMAC-SHA256 Event Bus
Allows newsrooms, bots, and headless CMSs (Ghost, Strapi, WordPress) to subscribe to real-time signed callbacks:
- **Endpoints**: `POST /api/v1/webhooks/subscriptions`, `GET /api/v1/webhooks/subscriptions`, `DELETE /api/v1/webhooks/subscriptions/:id`, `POST /api/v1/webhooks/subscriptions/:id/test`.
- **Event Bus Topics**: `article.published`, `article.verified`, `mirror.health_changed`, `*`.
- **HMAC-SHA256 Header**: `X-PressProtocol-Signature: t=<timestamp>,v1=<signature>`.
- **Replay Protection**: Strict 300-second timestamp drift tolerance window.
- **Timing-Safe Verification**: Evaluated with `crypto.timingSafeEqual` in Node.js and constant-time byte loops in `@pressprotocol/sdk`.
- **Delivery Resiliency**: 6-second timeout with exponential backoff retry on 5xx or network errors.

### 5. Drop-In `<pressprotocol-publish>` Universal Widget & 7 Editor Connectors
Add sovereign publishing to any web page in **two lines of HTML**:
```html
<script type="module" src="https://cdn.pressprotocol.com/v1/widget.js" async></script>
<pressprotocol-publish target-editor="#article-body" target-title="#article-title"></pressprotocol-publish>
```
Pre-built connectors automatically extract and sanitize content from:
1. **TipTap**: `editor.getHTML()` / `editor.getJSON()`
2. **Lexical**: `editor.getEditorState().read(...)`
3. **Quill**: `quill.root.innerHTML`
4. **TinyMCE**: `tinymce.activeEditor.getContent()`
5. **ProseMirror**: Direct DOM serialization from EditorView
6. **Plain Text / Markdown**: Native `<textarea>` extraction
7. **Raw HTML Elements**: Direct container traversal

### 6. Air-Gapped Sovereign Proof (`.pressproof.json`) & Optical QR Codec (`PPQR:1:*`)
For extreme threat models (internet blackouts, border crossings, active electronic surveillance):
- **`.pressproof.json`**: Standalone cryptographic proof bundle containing the raw multihash, Ed25519 signature proof, and external archive sync links (Wayback Machine, Archive.today). Allows complete offline verification with zero network connection.
- **Optical QR Mesh Codec (`PPQR:1:*`)**: Chunks documents into animated high-density QR frames (`PPQR:1:<seq>:<total>:<cid>:<chunk>`) displayed on-screen and captured by camera on an air-gapped device at 10-15 FPS, reassembling and verifying the document completely off-grid.

### 7. Commercial Surveillance Stripper & CMS Sanitizer
Ingestion pipeline scans and neutralizes surveillance vectors before cryptographic hashing:
- Strips Google Analytics (`ga.js`, `gtag.js`), Meta Pixel, Hotjar, and tracking beacons.
- Strips UTM telemetry (`utm_source`, `utm_medium`, `utm_campaign`, `fbclid`, `gclid`).
- Removes canonical URL hijacking, paywall scripts, and invisible tracking pixels.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **pnpm**: v9.x (`corepack enable && corepack prepare pnpm@latest --activate`)

### 1. Clone & Install
```bash
git clone https://github.com/0xshikhar/PressProtocol.git
cd PressProtocol
pnpm install
```

### 2. Run the Verification Test Harness (14/14 Suites)
Verify the complete protocol and all subsystems locally in seconds:
```bash
bash scripts/test.sh
```

### 3. Run the Sovereign Node Daemon Locally
```bash
pnpm --dir core/node dev
# Micro-daemon starts at http://127.0.0.1:4000
# Tor v3 .onion address initialized automatically
```

### 4. Run the Web Portal & Interactive Developer Hub
```bash
pnpm --dir apps/web dev
# Web app runs at http://localhost:3000
# Interactive Developer Portal: http://localhost:3000/developers
```

---

## 💻 SDK Ecosystem & Usage Examples

### TypeScript / Node.js SDK (`@pressprotocol/sdk`)

[![npm version](https://img.shields.io/npm/v/@pressprotocol/sdk.svg?color=4F46E5&style=flat-square)](https://www.npmjs.com/package/@pressprotocol/sdk)

Install via [NPM](https://www.npmjs.com/package/@pressprotocol/sdk):
```bash
pnpm add @pressprotocol/sdk
```

```typescript
import { PressProtocol, generateKeypair, createCanonicalPayload, signPayload } from "@pressprotocol/sdk";

// 1. Initialize client (Use public edge or local sovereign node: "http://127.0.0.1:4000")
const client = new PressProtocol({
  endpoint: "https://pressprotocol.com",
});

// 2. Generate sovereign Ed25519 keypair locally
const keypair = await generateKeypair();

// 3. Prepare article & sign in-browser (Zero-Custody)
const title = "Investigative Disclosure 2026";
const content = "# Classified Dossier\n\nPreserved across decentralized swarms.";
const tags = ["investigation", "whistleblower"];
const timestamp = new Date().toISOString();

const canonical = createCanonicalPayload(title, tags, timestamp);
const signature = await signPayload(canonical, keypair.privateKey);

// 4. Publish to IPFS & Tor
const result = await client.publishSigned({
  title,
  content,
  tags,
  timestamp,
  publicKey: keypair.publicKey,
  signature,
});

console.log("Published CID:", result.cid);
console.log("IPFS Gateway:", result.urls.ipfs);
console.log("Tor Mirror:", result.urls.tor);
```

---

### Python SDK (`pressprotocol-py`)

[![PyPI version](https://img.shields.io/pypi/v/pressprotocol-py.svg?color=3775A9&style=flat-square)](https://pypi.org/project/pressprotocol-py/)

Install via [PyPI](https://pypi.org/project/pressprotocol-py/):
```bash
pip install pressprotocol-py
```

```python
from pressprotocol import PressProtocol
from pressprotocol.crypto import calculate_deterministic_cidv1

# Initialize client (Use public edge or local sovereign node: "http://127.0.0.1:4000")
client = PressProtocol(endpoint="https://pressprotocol.com")

# 1. Publish article directly to decentralized swarms
post = client.publish_raw(
    title="Data Science Transparency Audit",
    content="# Methodology & Findings\n\nVerifiable cryptographic dataset preserved across swarms.",
    tags=["science", "reproducibility", "whistleblower"]
)

print(f"✅ Published CID: {post['cid']}")
print(f"📦 IPFS Gateway: {post.get('urls', {}).get('ipfs')}")
print(f"🧅 Tor Mirror: {post.get('urls', {}).get('tor')}")

# 2. In-Memory Deterministic CIDv1 calculation
cid = calculate_deterministic_cidv1("Hello, Sovereign Cyberspace!")
print("Deterministic CID:", cid)
```

---

### Go SDK (`github.com/0xshikhar/PressProtocol/sdks/go`)

[![Go Reference](https://pkg.go.dev/badge/github.com/0xshikhar/PressProtocol/sdks/go.svg)](https://pkg.go.dev/github.com/0xshikhar/PressProtocol/sdks/go)

Install via [Go Modules](https://pkg.go.dev/github.com/0xshikhar/PressProtocol/sdks/go):
```bash
go get github.com/0xshikhar/PressProtocol/sdks/go@v1.0.7
```

```go
package main

import (
	"fmt"
	"log"

	pressprotocol "github.com/0xshikhar/PressProtocol/sdks/go"
)

func main() {
	// 1. Initialize client (Use public edge or local sovereign node: "http://127.0.0.1:4000")
	client := pressprotocol.NewClient("https://pressprotocol.com", "")

	// 1. Publish article
	res, err := client.PublishRaw(&pressprotocol.PublishRawRequest{
		Title:   "Public Financial Audit 2026",
		Content: "Immutable disclosure records preserved across swarms.",
		Tags:    []string{"transparency", "audit"},
	})
	if err != nil {
		log.Fatalf("Publish error: %v", err)
	}

	fmt.Printf("✅ Published CID: %s\n", res.CID)
	fmt.Printf("📦 URLs: %+v\n", res.URLs)

	// 2. In-Memory CIDv1 without IPFS daemon
	cid := pressprotocol.CalculateDeterministicCIDv1([]byte("Immutable Content"))
	fmt.Printf("🧮 Computed CID: %s\n", cid)
}
```

---

### Rust SDK (`pressprotocol-rs`)

[![Crates.io](https://img.shields.io/crates/v/pressprotocol-rs.svg?color=DEA584&style=flat-square)](https://crates.io/crates/pressprotocol-rs/1.0.7)

Add via [Cargo / Crates.io](https://crates.io/crates/pressprotocol-rs/1.0.7):
```bash
cargo add pressprotocol-rs
```

```rust
use pressprotocol_rs::{Client, PublishRequest, calculate_deterministic_cidv1};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client (Use public edge or local sovereign node: "http://127.0.0.1:4000")
    let client = Client::new("https://pressprotocol.com");

    let req = PublishRequest {
        title: "Sovereign Dispatch 2026".into(),
        content: "# Immutable Log\n\nPreserved forever across decentralized swarms.".into(),
        tags: vec!["sovereign".into(), "cryptography".into()],
        format: Some("markdown".into()),
        author: Some("0xShikhar".into()),
    };

    let res = client.publish(&req).await?;
    println!("✅ Published CID: {}", res.cid);
    println!("📦 IPFS URL: {:?}", res.urls.get("ipfs"));
    println!("🧅 Tor URL: {:?}", res.urls.get("tor"));

    let cid = calculate_deterministic_cidv1(b"Hello, Sovereign Cyberspace!");
    println!("In-Memory CID: {}", cid);

    Ok(())
}
```


### Universal HTML Widget (2 Lines)

```html
<!-- Drop this into any blog, Hugo site, or custom CMS -->
<script type="module" src="https://cdn.pressprotocol.com/v1/widget.js" async></script>
<pressprotocol-publish 
  target-editor="#article-body" 
  target-title="#article-title"
  badge="compact"
  theme="auto">
</pressprotocol-publish>
```

### Terminal CLI (`pressprotocol`)

```bash
# Generate sovereign Ed25519 keypair
pressprotocol keygen

# Publish markdown file directly to IPFS & Tor
pressprotocol publish ./disclosure.md --title "Civic Audit" --tags civic,audit

# Resolve and cryptographically verify CID
pressprotocol resolve bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4
```

---

## 🧪 Verification Test Harness (100% Pass)

Every commit is verified through the master test harness ([`scripts/test.sh`](https://github.com/0xshikhar/PressProtocol/blob/master/scripts/test.sh)), executing **14 automated subsystem test suites** and **419 individual tests**:

```text
🧪 PressProtocol Verification Harness
=====================================

1️⃣  TypeScript Verification
--------------------------
Typechecking apps/web... ✅ PASS
Typechecking core/node... ✅ PASS

2️⃣  Subsystem Automated Verification Suites
------------------------------------------
Running Surveillance Stripper & CMS Cleaner... ✅ PASS (28/28 tests)
Running Multi-Transport Telemetry & Live Gateway Probes... ✅ PASS (40/40 tests)
Running Air-Gapped Proofs & Offline Verification... ✅ PASS (26/26 tests)
Running Optical QR Codec & Delay-Tolerant Mesh... ✅ PASS (22/22 tests)
Running Sovereign Web Clipper (Chromium MV3 Extension)... ✅ PASS (37/37 tests)
Running Bulk RSS Publication Archive Importer... ✅ PASS (32/32 tests)
Running Notion 1-Click Sovereign Importer... ✅ PASS (32/32 tests)
Running Developer Publishing Rails (GitHub Action)... ✅ PASS (53/53 tests)
Running Offline-First Local Vault & Bookmarks... ✅ PASS (32/32 tests)
Running Autonomous Community Node & P2P Federation... ✅ PASS (34/34 tests)
Running Self-Sovereign Private Node & Zero-Permission Daemon... ✅ PASS (31/31 tests)
Running Universal Publishing Rails for Any Website & CMS... ✅ PASS (23/23 tests)
Running Open Infrastructure API & Enterprise Gateway... ✅ PASS (12/12 tests)
Running Outbound Real-Time Webhook Subscriptions & Event Bus... ✅ PASS (17/17 tests)

📊 Verification Summary
=======================
Passed: 419 (Across 14 Subsystem Test Suites + 2 Typechecks)
Failed: 0
```

> **Verification Scope**: The 14 subsystem verification suites execute 100% in-memory with zero cloud or network dependencies, validating all cryptographic primitives (RFC 8032 Ed25519, SHA-256 HMAC), deterministic content addressing (CIDv1 multihashes), delay-tolerant optical QR codecs, CMS sanitizers, and SDK client logic. Live daemon probes (`core/node`) can optionally be executed against a running local instance via `bash scripts/test.sh --live`.

---

## 🛡️ Threat Model & Adversarial Defense

| Threat Vector | Real-World Scenario | PressProtocol Defense Guarantee |
| :--- | :--- | :--- |
| **DNS Takedown / Domain Seizure** | ICANN or registrar seizes domain under government pressure. | **Immune.** Content is addressed by immutable CID (`pressprotocol://[CID]`) or Tor v3 `.onion` hidden service. Domain name is never part of the content integrity hash. |
| **ISP Deep Packet Inspection (DPI)** | National firewall blocks IPFS gateway domains and clearnet IPs. | **Automatic Failover.** Protocol client detects connection failure and routes through Tor v3 onion service via encrypted multi-hop circuits. |
| **Cloud Hosting Deplatforming** | AWS, Cloudflare, or Vercel terminates host account. | **Decentralized Swarm.** Articles are pinned across multiple independent nodes, local publisher blockstores, and the global IPFS DHT. Any node can serve the content. |
| **Man-In-The-Middle (MITM) Tampering** | Malicious gateway or rogue proxy modifies article text to insert propaganda. | **Mathematical Cryptographic Rejection.** Client recalculates CIDv1 multihash and checks Ed25519 signature. If a single character is modified, verification fails and content is blocked. |
| **Publisher Deanonymization** | State actors analyze on-chain wallet transactions to unmask author. | **Zero-Custody / No Blockchain.** PressProtocol requires no wallet, no gas, and no on-chain ledger entries. Authors generate keys client-side; publishing can route through Tor SOCKS5. |
| **Replay & Timestamp Manipulation** | Attacker intercepts signed webhooks and replays them to trigger duplicate events. | **HMAC Drift Window.** Webhooks include timestamp header `t=...`; payloads drifting $>300$ seconds are discarded. |
| **Commercial Surveillance Tracking** | Third-party tracking scripts, Meta pixels, or Google Analytics identify readers. | **Automated Surveillance Stripper.** Ingest pipeline scans and cleans tracking pixels, redirect wrappers, and UTM parameters prior to cryptographic hashing. |

---

## 🏛️ Sovereign Public Good & Community Support

PressProtocol is engineered from first principles as an autonomous, non-extractive digital public good for the open web.

### Core Public Good Commitments
- **Pure Infrastructure, Not a Walled Garden**: We do not force writers or organizations onto an isolated blogging network. PressProtocol is neutral, permissionless plumbing extending unstoppable cryptographic distribution to WordPress, Ghost, Substack, Medium, Obsidian, and any web application.
- **Zero Venture Capital & Zero Token Gates**: No tokens to buy, no gas fees, and no speculative tokenomics.
- **Zero Commercial Surveillance**: Strict zero-telemetry policy. Built-in ingest pipelines scrub Google Analytics, Meta Pixels, tracking beacons, UTM query strings, and fingerprinting scripts before content hashing occurs.
- **Permanent Open Source**: Released under the permissive MIT license for worldwide public benefit.
- **Autonomous & Censorship-Immune**: Built for independent newsrooms, human rights defenders, whistleblowers, and civic researchers facing state censorship, ISP firewalls, and hosting deplatforming.

---

### Support & Underwrite the Infrastructure

PressProtocol operates with **zero ads, zero tracking, and zero subscription paywalls**. 

100% of community contributions and public good sponsorships directly fund:
1. **Operational Infrastructure**: Maintaining redundant global IPFS pinning nodes, Tor v3 onion relays, and high-availability edge compute across 300+ PoPs.
2. **Cryptographic Audits**: Underwriting independent third-party security audits of our WebCrypto signing engine and payload canonicalization.
3. **Sustainable Maintenance**: Supporting core open-source maintainers across WordPress, Obsidian, Chromium extension, and multi-language SDK surfaces.

**Contribute & Underwrite Operations**:  
👉 [**Support PressProtocol on `pressprotocol.com/support`**](https://pressprotocol.com/support)

We accept sovereign community underwriting via multiple networks:
- **Ethereum & Layer 2s**: Ethereum, Arbitrum, Optimism, Base
- **Privacy & Sovereign Assets**: Monero (XMR), Bitcoin (BTC), Solana (SOL)
- **Traditional Methods**: GitHub Sponsors, Open Collective, and Fiat Sponsorships

---

## 📚 Reference Documents

- **[`ARCHITECTURE.md`](https://github.com/0xshikhar/PressProtocol/blob/master/ARCHITECTURE.md)**: Comprehensive protocol architecture, cryptographic specifications, multi-transport failover algorithms, and wire schemas.
- **[`INTEGRATIONS.md`](https://github.com/0xshikhar/PressProtocol/blob/master/INTEGRATIONS.md)**: Complete guide to the WordPress plugin, Chromium MV3 extension, GitHub Action, Obsidian plugin, and Universal Widget.
- **[`CONTRIBUTING.md`](https://github.com/0xshikhar/PressProtocol/blob/master/CONTRIBUTING.md)**: Monorepo contribution guidelines, code standards, and PR workflows.

---

## 📄 License & Open Source Commitment

PressProtocol is 100% free, open-source software released under the **[MIT License](https://github.com/0xshikhar/PressProtocol/blob/master/LICENSE)**. It is built as a neutral public good for journalists, whistleblowers, researchers, and citizens worldwide.


