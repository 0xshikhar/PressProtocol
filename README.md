# PressProtocol

<p align="center">
  <img src="https://raw.githubusercontent.com/0xshikhar/PressProtocol/main/apps/web/public/pressprotocol-logo.svg" alt="PressProtocol Logo" width="120" height="120" onerror="this.style.display='none'"/>
</p>

<h1 align="center">PressProtocol</h1>

<p align="center">
  <strong>Universal Sovereign Publishing Rails & Multi-Transport Resolution for the Decentralized Web</strong><br>
  <em>Censorship-Resistant, Zero-Custody, Multi-Transport (IPFS + Tor v3 + Clearnet), and Non-Custodial Cryptographic Identity</em>
</p>

<p align="center">
  <a href="https://pressprotocol.com"><img src="https://img.shields.io/badge/Web%20App-pressprotocol.com-000000.svg?style=flat-square&logo=vercel" alt="Vercel Live"/></a>
  <a href="https://api.pressprotocol.com/health"><img src="https://img.shields.io/badge/Edge%20API-api.pressprotocol.com-f38020.svg?style=flat-square&logo=cloudflare" alt="Cloudflare Edge Live"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/main/scripts/test.sh"><img src="https://img.shields.io/badge/Tests-16%2F16%20Passing%20(100%25)-10b981.svg?style=flat-square" alt="Tests Passing"/></a>
  <a href="#-octant--public-goods-alignment"><img src="https://img.shields.io/badge/Octant-Epoch%2013%20Privacy%20Round-6366f1.svg?style=flat-square" alt="Octant Epoch 13"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/main/ARCHITECTURE.md"><img src="https://img.shields.io/badge/Spec-RFC--8032%20%7C%20OpenAPI%203.1-3b82f6.svg?style=flat-square" alt="Specifications"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square" alt="License: MIT"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/blob/main/pnpm-workspace.yaml"><img src="https://img.shields.io/badge/Monorepo-pnpm%20workspace-f59e0b.svg?style=flat-square" alt="pnpm workspace"/></a>
  <a href="https://github.com/0xshikhar/PressProtocol/tree/main/packages/sdk"><img src="https://img.shields.io/badge/TypeScript-100%25%20Strict-blue.svg?style=flat-square" alt="TypeScript"/></a>
</p>

> ### 🌐 Live Production Infrastructure & Public Goods Rail
> - **Production Web Application**: [`https://pressprotocol.com`](https://pressprotocol.com) *(Next.js 15 on Vercel)*
> - **Canonical Edge API Gateway**: [`https://api.pressprotocol.com`](https://api.pressprotocol.com) *(Cloudflare Workers across 300+ Edge PoPs)*
> - **Public Goods Alignment**: Engineered for **Octant Epoch 13 (Privacy & Censorship Resistance Round)**
> - **Zero-Custody Guarantee**: Zero gas, zero seed phrases, no wallets, no KYC. Authors sign content in-browser with RFC 8032 Ed25519 keys.
> - **Multi-Transport Racing**: Sub-100ms clearnet IPFS resolution + automatic failover to Tor v3 `.onion` hidden services.

---

## 🧭 Table of Contents

- [Protocol Philosophy & Architectural Thesis](#-protocol-philosophy--architectural-thesis)
- [Distribution Rails Overview: Everything We Have Built](#-distribution-rails-overview-everything-we-have-built)
- [Ecosystem Matrix: Production Monorepo Overview](#-ecosystem-matrix-production-monorepo-overview)
- [System Architecture & Multi-Transport Resolution Flow](#-system-architecture--multi-transport-resolution-flow)
- [Core Protocol Subsystems & Specifications](#-core-protocol-subsystems--specifications)
  - [1. Multi-Transport Resolution & Parallel Racing Engine](#1-multi-transport-resolution--parallel-racing-engine)
  - [2. Zero-Custody Client-Side Ed25519 Cryptographic Identity](#2-zero-custody-client-side-ed25519-cryptographic-identity)
  - [3. Open Infrastructure Gateway & OpenAPI 3.1.0 REST API](#3-open-infrastructure-gateway--openapi-310-rest-api)
  - [4. Outbound Real-Time Webhooks & HMAC-SHA256 Event Bus](#4-outbound-real-time-webhooks--hmac-sha256-event-bus)
  - [5. Drop-In `<pressprotocol-publish>` Universal Widget & 7 Editor Connectors](#5-drop-in-pressprotocol-publish-universal-widget--7-editor-connectors)
  - [6. Air-Gapped Sovereign Proof (`.pressproof.json`) & Optical QR Codec (`PPQR:1:*`)](#6-air-gapped-sovereign-proof-pressproofjson--optical-qr-codec-ppqr1)
  - [7. Commercial Surveillance Stripper & CMS Sanitizer](#7-commercial-surveillance-stripper--cms-sanitizer)
- [Monorepo Repository Map](#-monorepo-repository-map)
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
- [Octant & Public Goods Alignment](#-octant--public-goods-alignment)
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

### The Architectural Design: Resilient Sovereign Publishing Rails

PressProtocol resolves these challenges by providing **neutral, un-cancellable publishing rails combining the sub-150ms speed of clearnet CDNs, content addressing via IPFS, and privacy routing via Tor v3 onion services—without requiring cryptocurrency or financial transactions**:

* **Zero Wallets, Zero Gas, Zero KYC**: Publishers generate RFC 8032 Ed25519 keypairs in ephemeral client memory. The public key provides a permanent cryptographic pseudonym; the private key signs the canonical content payload in browser RAM.
* **Zero Financial Footprint**: Without on-chain transaction fees, publishing leaves zero ledger trails. There are no wallets to trace, no token purchases, and no gas volatility.
* **Multi-Transport Racing with Automatic Failover**: When resolving an article, the protocol queries IPFS gateways, P2P DHT swarms, and Tor v3 `.onion` hidden services concurrently. If an ISP blocks clearnet IPFS gateways, content automatically resolves over Tor with zero manual intervention.
* **Zero Telemetry & Surveillance Stripping**: Built-in ingest pipelines scrub Google Analytics, Meta Pixels, tracking beacons, UTM query strings, and fingerprinting scripts before content hashing occurs.
* **Extensible Distribution Rails Across Existing Platforms**: Rather than requiring publishers to migrate to a proprietary interface, PressProtocol provides native integrations for widely adopted workflows: a **WordPress Plugin**, an **Obsidian Plugin**, a **Chromium MV3 Extension**, a **GitHub Action**, a **Universal Web Component**, and native **SDKs in TypeScript, Python, Go, and Rust**.

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

| Distribution Surface | Direct Repository Link | Description | Target Users |
| :--- | :--- | :--- | :--- |
| **WordPress Plugin** | [**`integrations/wordpress-plugin`**](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/wordpress-plugin) | Native WordPress plugin for Gutenberg & Classic editors. 1-click sovereign publishing to IPFS & Tor. | WordPress web publishers (Gutenberg & Classic) |
| **Universal Web Component** | [**`packages/widget`**](https://github.com/0xshikhar/PressProtocol/tree/main/packages/widget) | 2-line drop-in `<pressprotocol-publish>` widget. Connectors for TipTap, Lexical, Quill, TinyMCE, ProseMirror, Markdown, and HTML. | Any web developer, blog, or CMS |
| **Chromium Extension** | [**`integrations/browser-extension`**](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/browser-extension) | Manifest V3 extension. Intercepts `pressprotocol://` URIs, clips web articles into sovereign Markdown, and verifies signatures. | Readers, researchers, whistleblowers |
| **Official GitHub Action** | [**`integrations/publish-action`**](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/publish-action) | CI/CD GitHub Action (`pressprotocol/publish-action`) for continuous sovereign archival on `git push`. | Developers, docs sites, civic archives |
| **Obsidian Plugin** | [**`integrations/obsidian-plugin`**](https://github.com/0xshikhar/PressProtocol/tree/main/integrations/obsidian-plugin) | Personal knowledge management plugin. Publishes local Markdown notes and investigative dossiers to IPFS/Tor. | Journalists, researchers, analysts |
| **TypeScript / Node SDK** | [**`packages/sdk`**](https://github.com/0xshikhar/PressProtocol/tree/main/packages/sdk) | `@pressprotocol/sdk` with Ed25519 signing, deterministic in-memory CIDv1 multihashes, parallel resolver, and CLI. | Node.js, Next.js, Bun, Edge runtime |
| **Python SDK** | [**`sdks/python`**](https://github.com/0xshikhar/PressProtocol/tree/main/sdks/python) | Native Python library for automated archival scripts, newsroom scrapers, and data pipelines. | Data scientists, backend engineers |
| **Go SDK** | [**`sdks/go`**](https://github.com/0xshikhar/PressProtocol/tree/main/sdks/go) | High-concurrency Go client for enterprise microservices and backend ingest nodes. | Infrastructure engineers, DevOps |
| **Rust SDK** | [**`sdks/rust`**](https://github.com/0xshikhar/PressProtocol/tree/main/sdks/rust) | Memory-safe, zero-allocation asynchronous client for decentralized network daemons. | Systems programmers, node operators |
| **Enterprise REST Gateway** | [**`core/node/src/routes/v1.ts`**](https://github.com/0xshikhar/PressProtocol/blob/main/core/node/src/routes/v1.ts) | OpenAPI 3.1.0 gateway endpoints, token-bucket rate limiting, and SHA-256 API key security. | Enterprise newsrooms, bots, platforms |
| **Outbound Webhooks Bus** | [**`core/node/src/services/WebhookSubscriptionService.ts`**](https://github.com/0xshikhar/PressProtocol/blob/main/core/node/src/services/WebhookSubscriptionService.ts) | Real-time event bus with HMAC-SHA256 signatures, replay protection, and exponential retry delivery. | Ghost, Strapi, WordPress webhooks |
| **Air-Gap Proof & QR Mesh**| [**`packages/proof`**](https://github.com/0xshikhar/PressProtocol/tree/main/packages/proof) | Standalone `.pressproof.json` specification & `PPQR:1:*` high-density animated QR streaming codec. | Internet blackouts, air-gapped devices |
| **Offline-First Local Vault** | [**`apps/web/src/app/vault`**](https://github.com/0xshikhar/PressProtocol/tree/main/apps/web/src/app/vault) | Zero-telemetry client-side IndexedDB vault for encrypted local reading and offline verification. | Privacy-conscious readers, field reporters |
| **Web Portal & Dev Hub** | [**`apps/web`**](https://github.com/0xshikhar/PressProtocol/tree/main/apps/web) | Next.js 15 web application with 1-click sandbox keys (`pp_test_*`) and in-browser cryptographic simulator. | General public, developers |
| **Sovereign Node Daemon** | [**`core/node`**](https://github.com/0xshikhar/PressProtocol/tree/main/core/node) | Self-sovereign private micro-daemon with Tor v3 hidden services, in-memory IPFS blockstore, and P2P federation. | Node runners, self-hosters |
| **Content Ingestion Rails** | [**`apps/web/src/app/import`**](https://github.com/0xshikhar/PressProtocol/tree/main/apps/web/src/app/import) | Migration importers for Notion, Substack, Medium, and bulk RSS/Atom feeds with surveillance scrubbing. | Migrating publishers, media outlets |

---

## 📦 Ecosystem Matrix: Production Monorepo Overview

The PressProtocol monorepo is organized cleanly using `pnpm` workspaces:

```
pressprotocol/
├── apps/
│   └── web/                         # Next.js 15 Web Portal & Interactive Dev Hub
│       ├── src/app/developers/      # /developers Interactive Playground & Sandbox Keys
│       ├── src/app/import/          # Notion & RSS Bulk Migration Rails
│       ├── src/app/vault/           # Offline-First Encrypted Reading Vault
│       └── src/components/          # UI Component Suite & Live Widget Sandbox
├── core/
│   ├── worker/                      # High-Availability Cloudflare Edge API (api.pressprotocol.com)
│   │   ├── src/index.ts             # Hono Edge Router & Multi-Gateway Race Resolver
│   │   ├── src/services/pinata.ts   # Edge IPFS Pinning Engine
│   │   └── wrangler.toml            # Edge Routing & Observability Config
│   └── node/                        # Self-Sovereign Private Node Daemon
│       ├── src/routes/v1.ts         # OpenAPI 3.1.0 Enterprise Gateway ("Stripe for Publishing")
│       ├── src/services/            # ApiKey, Identity, Storage, Tor, Webhook Services
│       └── src/lib/                 # Deterministic CIDv1, Webhook Crypto, Proof Engine
├── packages/
│   ├── sdk/                         # @pressprotocol/sdk (Headless TS SDK & CLI)
│   ├── widget/                      # @pressprotocol/widget (Universal Web Component)
│   └── proof/                       # @pressprotocol/proof (.pressproof.json & QR Codec)
├── integrations/
│   ├── wordpress-plugin/            # Native WordPress Plugin (43% of the Web)
│   ├── browser-extension/           # Chromium MV3 Sovereign Web Clipper & Handler
│   ├── publish-action/              # Official GitHub Action for CI/CD Archival
│   └── obsidian-plugin/             # Native Obsidian Vault Plugin
├── sdks/
│   ├── python/                      # Official Python Client Library
│   ├── go/                          # Official Go Client Library
│   └── rust/                        # Official Rust Client Library
├── scripts/
│   ├── test.sh                      # Master Verification Test Harness (14 Suites / 100% Pass)
│   └── install-node.sh              # 1-Command Sovereign Node Installer
├── ARCHITECTURE.md                  # Comprehensive Protocol Architecture Specification
├── INTEGRATIONS.md                  # Distribution Rails & Integrations Reference Guide
└── CONTRIBUTING.md                  # Open Source Contribution Guidelines & Code of Conduct
```

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
- **Transport 1 (Local Node)**: `http://127.0.0.1:4000/api/content/:cid` (sub-20ms latency).
- **Transport 2 (Clearnet IPFS Gateway Swarm)**: Races Pinata, Cloudflare, IPFS.io, and dweb.link (typical latency ~120ms).
- **Transport 3 (Tor v3 Onion Services)**: Directly queries `.onion` hidden services via SOCKS5 proxy (~1800ms).
- **Automatic Failover**: If an ISP deep-packet inspection (DPI) filter blocks IPFS gateways, the request seamlessly resolves via Tor. In-memory Ed25519 verification guarantees that no intermediary gateway can tamper with article content.

### 2. Zero-Custody Client-Side Ed25519 Cryptographic Identity
- Authors are identified by a 32-byte RFC 8032 Ed25519 public key.
- Keypairs are generated in-browser via `@pressprotocol/sdk` or the Web Crypto API.
- The author's private key signs the canonical JSON payload (`title`, `tags`, `timestamp`).
- In the zero-custody flow (`POST /api/v1/publish/signed`), the gateway receives only the public key and signature. **The private key never leaves the author's device.**

### 3. Open Infrastructure Gateway & OpenAPI 3.1.0 REST API
High-performance REST API served globally via Cloudflare Workers (`https://api.pressprotocol.com`) and autonomous private daemons (`core/node` on `http://127.0.0.1:4000` / `.onion`):

```bash
# 1. Probe Edge Health & Global PoP Connectivity
curl -s https://api.pressprotocol.com/health | jq

# 2. Publish Article (Custodial Node-Signed or Edge Ingest)
curl -X POST https://api.pressprotocol.com/api/v1/publish/raw \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investigative Leak 2026",
    "content": "# Classified Memo\n\nPreserved across decentralized swarms.",
    "tags": ["whistleblower", "transparency"]
  }'

# 3. Resolve & Stream Article across IPFS Gateways
curl -s https://api.pressprotocol.com/api/v1/resolve/bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4 | jq

# 4. Instant Cryptographic Verification (RFC 8032 Ed25519)
curl -X POST https://api.pressprotocol.com/api/v1/verify \
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

## 🗺️ Monorepo Repository Map

```
PressProtocol/
├── apps/
│   └── web/                         # Next.js 15 Web Portal & Interactive Dev Hub
│       ├── src/app/developers/      # /developers Interactive Playground & Sandbox Keys
│       ├── src/app/import/          # Notion & RSS Bulk Importers
│       ├── src/app/vault/           # Offline-First Encrypted Vault
│       └── src/components/          # UI Component Suite & Widgets
├── core/
│   ├── worker/                      # High-Availability Cloudflare Edge API (api.pressprotocol.com)
│   │   ├── src/index.ts             # Hono Edge Router & Multi-Gateway Race Resolver
│   │   ├── src/services/pinata.ts   # Edge IPFS Pinning Engine
│   │   └── wrangler.toml            # Edge Routing & Observability Config
│   └── node/                        # Self-Sovereign Private Node Daemon
│       ├── src/routes/v1.ts         # OpenAPI 3.1.0 Gateway & Ingest Pipeline
│       ├── src/services/            # ApiKey, Identity, Storage, Tor, Webhook Services
│       └── src/lib/                 # Deterministic CID, Webhook Crypto, Proof Engine
├── packages/
│   ├── sdk/                         # @pressprotocol/sdk (Headless TS SDK & CLI)
│   ├── widget/                      # @pressprotocol/widget (Universal Web Component)
│   └── proof/                       # @pressprotocol/proof (.pressproof.json & QR Codec)
├── integrations/
│   ├── wordpress-plugin/            # Native WordPress Plugin (Gutenberg & Classic)
│   ├── browser-extension/           # Chromium MV3 Sovereign Web Clipper & Handler
│   ├── publish-action/              # Official GitHub Action for CI/CD Archival
│   └── obsidian-plugin/             # Native Obsidian Vault Plugin
├── sdks/
│   ├── python/                      # Official Python Client Library
│   ├── go/                          # Official Go Client Library
│   └── rust/                        # Official Rust Client Library
├── scripts/
│   ├── test.sh                      # Master Verification Test Harness (14 Suites)
│   └── install-node.sh              # 1-Command Sovereign Node Installer
├── ARCHITECTURE.md                  # Comprehensive Protocol Architecture Specification
├── INTEGRATIONS.md                  # Distribution Rails & Integrations Reference
└── CONTRIBUTING.md                  # Contribution Guidelines & Monorepo Rules
```

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

### TypeScript / Node.js SDK

```typescript
import { PressProtocolClient, verifyWebhookSignature } from "@pressprotocol/sdk";

const client = new PressProtocolClient({
  apiKey: "pp_live_...",
  endpoint: "https://api.pressprotocol.com", // or "http://localhost:4000" for local node
});

// 1. Publish Article with Client-Side Ed25519 Signing
const result = await client.publish({
  title: "Investigative Disclosure 2026",
  content: "# Findings\n\nFull whistleblowing document...",
  tags: ["investigation", "whistleblower"],
});

console.log("Immutable CID:", result.cid);
console.log("IPFS Clearnet:", result.mirrors.ipfs);
console.log("Tor v3 Onion:", result.mirrors.tor);

// 2. Resolve with Multi-Transport Racing & In-Memory Verification
const article = await client.resolve(result.cid, { verify: true });
console.log("Cryptographically Verified:", article.verified);

// 3. Register Outbound Webhook Subscription
const webhook = await client.createWebhookSubscription({
  url: "https://newsroom.example.com/api/webhooks/pressprotocol",
  events: ["article.published", "article.verified"],
  description: "Ghost CMS Newsroom Auto-Sync",
});
console.log("Shared Secret:", webhook.subscription.secret);
```

### Python SDK

```python
from pressprotocol import PressProtocolClient

client = PressProtocolClient(api_key="pp_live_...")

# Sovereign publish
result = client.publish(
    title="Environmental Transparency Report",
    content="# Findings\n\nPreserved across decentralized swarms...",
    tags=["climate", "transparency"]
)

print("CID:", result.cid)
print("IPFS URL:", result.mirrors.ipfs)
print("Tor Onion:", result.mirrors.tor)
```

### Go SDK

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
        Title:   "Public Financial Audit 2026",
        Content: "Immutable disclosure records...",
        Tags:    []string{"transparency", "audit"},
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Anchored CID: %s\n", result.CID)
}
```

### Rust SDK

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

Every commit is verified through the master test harness ([`scripts/test.sh`](https://github.com/0xshikhar/PressProtocol/blob/main/scripts/test.sh)), executing **14 automated subsystem test suites** and **413+ assertions**:

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
Passed: 16 (14/14 Subsystem Test Suites + 2 Typechecks)
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

---

## 🏛️ Octant & Public Goods Alignment

PressProtocol is engineered from first principles as a sovereign, non-extractive digital public good designed for the **Octant Epoch 13 Privacy & Censorship Resistance Round**:

1. **Zero Financial Friction & Anti-Sybil Without KYC**: Unlike platforms that require gas tokens or wallets (which create financial surveillance trails and exclusion), PressProtocol uses client-side Ed25519 cryptography. Anyone with internet access can publish without spending a cent.
2. **Zero Commercial Surveillance**: True to the Cypherpunk and Octant ethos, the protocol enforces a strict zero-telemetry policy. The built-in ingestion pipeline strips tracking beacons, Meta Pixels, Google Analytics, and UTM parameters prior to cryptographic hashing.
3. **Public Infrastructure Redundancy**: By pairing Cloudflare Workers global edge nodes (`https://api.pressprotocol.com`) with the decentralized IPFS swarm and Tor v3 hidden services, PressProtocol guarantees that no single infrastructure provider, ISP, or authoritarian regime can extinguish published dispatches.
4. **100% Free & Open-Source**: All code is released under the permissive MIT license for open-source auditability and global community stewardship.

---

## 📚 Reference Documents

- **[`octant improvements.md`](https://github.com/0xshikhar/PressProtocol/blob/main/octant%20improvements.md)**: Comprehensive ecosystem roadmap, UI/UX opportunities, technical parity audit, and Octant evaluator readiness matrix.
- **[`status.md`](https://github.com/0xshikhar/PressProtocol/blob/main/status.md)**: Live system status, production deployment registry, and component completion matrix.
- **[`PUBLISHING_GUIDE.md`](https://github.com/0xshikhar/PressProtocol/blob/main/PUBLISHING_GUIDE.md)**: Step-by-step registry publishing guide for NPM, PyPI, Crates.io, Chrome Web Store, and WordPress.org.
- **[`ARCHITECTURE.md`](https://github.com/0xshikhar/PressProtocol/blob/main/ARCHITECTURE.md)**: Comprehensive protocol architecture, cryptographic specifications, multi-transport failover algorithms, and wire schemas.
- **[`INTEGRATIONS.md`](https://github.com/0xshikhar/PressProtocol/blob/main/INTEGRATIONS.md)**: Complete guide to the WordPress plugin, Chromium MV3 extension, GitHub Action, Obsidian plugin, and Universal Widget.
- **[`CONTRIBUTING.md`](https://github.com/0xshikhar/PressProtocol/blob/main/CONTRIBUTING.md)**: Monorepo contribution guidelines, code standards, and PR workflows.

---

## 📄 License & Open Source Commitment

PressProtocol is 100% free, open-source software released under the **[MIT License](https://github.com/0xshikhar/PressProtocol/blob/main/LICENSE)**. It is built as a neutral public good for journalists, whistleblowers, researchers, and citizens worldwide.

