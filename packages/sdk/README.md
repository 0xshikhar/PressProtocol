# PressProtocol SDK (`@pressprotocol/sdk`)

[![npm version](https://img.shields.io/npm/v/@pressprotocol/sdk.svg?color=4F46E5&style=flat-square)](https://www.npmjs.com/package/@pressprotocol/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![IPFS](https://img.shields.io/badge/Storage-IPFS%20CIDv1-cyan.svg?style=flat-square)](https://ipfs.tech/)
[![Tor](https://img.shields.io/badge/Privacy-Tor%20v3-purple.svg?style=flat-square)](https://www.torproject.org/)

**Official Developer SDK & Terminal CLI for [PressProtocol](https://pressprotocol.com)** — Sovereign, censorship-resistant publishing infrastructure, zero-custody cryptographic signing, and multi-transport content resolution.

---

## Features

- 🔐 **Zero-Custody Client Signing**: Ed25519 (RFC 8032) in-memory keypair generation; private keys never touch servers.
- ⚡ **Deterministic In-Memory CIDv1**: Compute authentic IPFS base32 multihash identifiers (`bafk...`) instantly without an IPFS daemon.
- 🌐 **Multi-Transport Resolution**: Fetch articles with automated failover across Pinata, W3S, public IPFS gateways, and Tor v3 hidden services.
- 📦 **Air-Gapped Proof Receipts**: Generate, sign, and verify cryptographic `.pressproof.json` integrity manifests.
- 💻 **Cross-Platform CLI**: Complete command-line publishing and resolution toolkit included out of the box (`pressprotocol`).

---

## Installation

```bash
# Using pnpm
pnpm add @pressprotocol/sdk

# Using bun
bun add @pressprotocol/sdk

# Using npm
npm install @pressprotocol/sdk
```

---

## Quickstart (Node.js & TypeScript)

```typescript
import { PressProtocol, generateKeypair, createCanonicalPayload, signPayload } from "@pressprotocol/sdk";

// 1. Initialize the client
const client = new PressProtocol({
  endpoint: "https://pressprotocol.com",
});

// 2. Generate sovereign Ed25519 keypair locally
const keypair = await generateKeypair();
console.log("Public Key:", keypair.publicKey);

// 3. Prepare article
const article = {
  title: "Sovereign Information in the Age of Coercion",
  content: "# Freedom of Thought\n\nVerifiable cryptographic publications survive hosting takedowns.",
  tags: ["freedom", "journalism", "sovereignty"],
  timestamp: new Date().toISOString(),
};

// 4. Client-side deterministic sign (Zero-Custody)
const canonical = createCanonicalPayload(article.title, article.tags, article.timestamp);
const signature = await signPayload(canonical, keypair.privateKey);

// 5. Publish to decentralized transports
const result = await client.publishSigned({
  ...article,
  publicKey: keypair.publicKey,
  signature,
});

console.log("Published CID:", result.cid);
console.log("Reader URL:", result.urls.reader);
console.log("IPFS Gateway:", result.urls.ipfs);
console.log("Tor Mirror:", result.urls.tor);
```

---

## In-Memory Deterministic CIDv1

Compute authentic IPFS CIDv1 identifiers in-memory with zero external network overhead:

```typescript
import { calculateDeterministicCIDv1 } from "@pressprotocol/sdk";

const cid = calculateDeterministicCIDv1("Hello, Sovereign Cyberspace!");
console.log("CID:", cid); // bafk...
```

---

## Resolving & Verifying Content

```typescript
// Resolve multi-transport availability
const content = await client.resolve("bafkreibm7...");

console.log("Title:", content.title);
console.log("Mirrors:", content.mirrors);

// Verify signature integrity
const verification = await client.verify({
  content: content.content,
  publicKey: content.publisher.publicKey,
  signature: content.publisher.signature,
  title: content.title,
  tags: content.tags,
  timestamp: content.timestamp,
});

console.log("Signature Valid:", verification.isValid);
```

---

## CLI Usage

The package includes the `pressprotocol` CLI executable:

```bash
# Run without installing
npx @pressprotocol/sdk publish ./article.md --tags journalism,censorship

# Check CID resolution & mirror health
npx @pressprotocol/sdk resolve bafkreibm7...

# Verify cryptographic signature of any CID
npx @pressprotocol/sdk verify bafkreibm7...
```

---

## API Reference

### `new PressProtocol(options)`
- `endpoint?: string` — Gateway node URL (default: `https://pressprotocol.com`)
- `apiKey?: string` — Optional bearer token for high-throughput node gateways

### Methods
- `publishSigned(request): Promise<PublishResponse>` — Relays client-signed payload to IPFS & Tor.
- `publishRaw(request): Promise<PublishResponse>` — Node-signed publish gateway.
- `resolve(cid): Promise<ResolveResponse>` — Resolves article payload and mirror health.
- `verify(request): Promise<VerifyResponse>` — Audits cryptographic signature and hash integrity.

---

## License

MIT © [0xShikhar](https://github.com/0xShikhar) & [PressProtocol Architects](https://pressprotocol.com)
