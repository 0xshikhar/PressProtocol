# Contributing to PressProtocol

Thank you for your interest in contributing to PressProtocol! We welcome contributions from developers, cryptographers, designers, technical writers, and journalists.

PressProtocol is dedicated to providing un-cancellable publishing rails for freedom of expression and independent journalism worldwide.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of background, gender, sexual orientation, disability, ethnicity, or religion. Please be respectful and constructive in all communications.

---

## Monorepo Architecture

PressProtocol is organized as a `pnpm` monorepo:

- `apps/web`: Next.js 15 Web Portal & Interactive Developer Hub
- `core/node`: Self-Sovereign Private Node Daemon & OpenAPI 3.1.0 Gateway
- `packages/sdk`: `@pressprotocol/sdk` Headless TypeScript/JavaScript SDK & CLI
- `packages/widget`: `@pressprotocol/widget` Drop-in Universal Web Component
- `packages/proof`: `@pressprotocol/proof` Air-Gapped Proof Specification & Optical QR Codec
- `integrations/wordpress-plugin`: Native WordPress Plugin
- `integrations/browser-extension`: Chromium MV3 Sovereign Web Clipper & Protocol Handler
- `integrations/publish-action`: Official GitHub Action
- `integrations/obsidian-plugin`: Native Obsidian Vault Plugin
- `sdks/python`: Official Python SDK
- `sdks/go`: Official Go SDK
- `sdks/rust`: Official Rust SDK

---

## Development Setup

### Prerequisites

- **Node.js**: v20.x or higher
- **pnpm**: v9.x (`corepack enable && corepack prepare pnpm@latest --activate`)

> **Note**: We exclusively use `pnpm` across this monorepo. Please do not use `npm` or `yarn`.

### Installation

```bash
git clone https://github.com/0xshikhar/PressProtocol.git
cd PressProtocol
pnpm install
```

---

## Running the Automated Test Harness

Before opening a pull request, you must ensure that all 14 automated subsystem test suites pass:

```bash
bash scripts/test.sh
```

This script verifies:
1. TypeScript compilation across `apps/web` and `core/node`
2. Surveillance Stripper & CMS Cleaner (`scripts/test-cms-scrubber.ts`)
3. Multi-Transport Telemetry & Live Gateway Probes (`scripts/test-transport-telemetry.ts`)
4. Air-Gapped Proofs & Offline Verification (`scripts/test-airgap-proof.ts`)
5. Optical QR Codec & Delay-Tolerant Mesh (`scripts/test-optical-qr-mesh.ts`)
6. Sovereign Web Clipper Chromium MV3 Extension (`scripts/test-web-clipper.ts`)
7. Bulk RSS Publication Archive Importer (`scripts/test-bulk-rss.ts`)
8. Notion 1-Click Sovereign Importer (`scripts/test-notion-import.ts`)
9. Developer Publishing Rails GitHub Action (`scripts/test-publish-action.ts`)
10. Offline-First Local Vault & Bookmarks (`scripts/test-offline-vault.ts`)
11. Autonomous Community Node & P2P Federation (`scripts/test-autonomous-node.ts`)
12. Self-Sovereign Private Node & Zero-Permission Daemon (`scripts/test-private-node.ts`)
13. Universal Publishing Rails for Any Website & CMS (`scripts/test-universal-rails.ts`)
14. Open Infrastructure API & Enterprise Gateway (`scripts/test-enterprise-gateway.ts`)
15. Outbound Real-Time Webhook Subscriptions & Event Bus (`scripts/test-webhook-subscriptions.ts`)

---

## Running Applications Locally

### Run Sovereign Node Daemon
```bash
pnpm --dir core/node dev
```
Micro-daemon starts on `http://127.0.0.1:4000`.

### Run Next.js Web Portal & Developer Playground
```bash
pnpm --dir apps/web dev
```
Web application starts on `http://localhost:3000`.

---

## Pull Request Guidelines

1. **Keep Pull Requests Focused**: Avoid mixing unrelated fixes or refactors into a single PR.
2. **Modular File Sizes**: Keep individual source files concise, modular, and focused (avoid monolithic files $>300$ lines).
3. **Add Tests**: Whenever adding a feature, include automated verification in the corresponding test suite under `scripts/`.
4. **Clean Commits**: Write descriptive commit messages summarizing the functional changes.

---

## Security Disclosures

If you discover a security vulnerability, please do NOT open a public GitHub issue. Instead, email security@pressprotocol.com or reach out directly to the core maintainers with a reproducible report.
