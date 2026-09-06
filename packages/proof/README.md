# PressProtocol Proof Codec (`@pressprotocol/proof`)

[![npm version](https://img.shields.io/npm/v/@pressprotocol/proof.svg?color=4F46E5&style=flat-square)](https://www.npmjs.com/package/@pressprotocol/proof)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

**Deterministic In-Browser CIDv1 Multihash & Air-Gapped `.pressproof.json` Cryptographic Codec for [PressProtocol](https://pressprotocol.com).**

---

## Overview

`@pressprotocol/proof` provides offline-first cryptographic utilities for generating and verifying cryptographic publication receipts, visual QR code proofs, and deterministic raw-SHA256 CIDv1 multihashes.

## Key Capabilities

- 📜 **Proof Manifest Encoding & Decoding**: Standardized RFC-8032 Ed25519 signature validation and verification for air-gapped `.pressproof.json` files.
- 🔳 **Air-Gapped QR Proofs**: High-density QR code serialization for verifying articles over physical, offline mediums.
- 🧮 **Deterministic CIDv1 Computation**: Browser and Node.js compatible raw-SHA256 multihash (`bafk...`) generator with zero external C-bindings or daemons.

---

## Installation

```bash
# Using pnpm
pnpm add @pressprotocol/proof

# Using bun
bun add @pressprotocol/proof

# Using npm
npm install @pressprotocol/proof
```

---

## Usage

### 1. Encode & Decode Cryptographic Proof Receipts

```typescript
import { encodeProof, decodeProof, verifyProof } from "@pressprotocol/proof";

// Create proof receipt
const proof = encodeProof({
  cid: "bafkreibm7...",
  title: "Decentralized Whistleblower Dossier",
  content: "# Dossier Findings\n\nImmutable verification across decentralized mirrors.",
  tags: ["investigation", "leak"],
  timestamp: "2026-09-15T00:00:00.000Z",
  publicKey: "6a4d...",
  signature: "9f8e...",
  mirrors: {
    ipfs: "ipfs://bafkreibm7...",
    tor: "http://onionaddress.onion/ipfs/bafkreibm7...",
    gateway: "https://pressprotocol.com/read/bafkreibm7...",
  },
});

// Save or distribute as .pressproof.json
const jsonString = JSON.stringify(proof, null, 2);

// Decode and verify an incoming proof
const decoded = decodeProof(jsonString);
const verification = await verifyProof(decoded);

console.log("Proof Authenticity Verified:", verification.isValid);
```

---

### 2. Generate Air-Gapped QR Code Proofs

```typescript
import { generateProofQR, renderQRToSVG } from "@pressprotocol/proof/qr";

const qrData = generateProofQR({
  cid: "bafkreibm7...",
  publicKey: "6a4d...",
  signature: "9f8e...",
  timestamp: "2026-09-15T00:00:00.000Z",
});

const svgElement = renderQRToSVG(qrData);
document.getElementById("qr-container")?.appendChild(svgElement);
```

---

## License

MIT © [0xShikhar](https://github.com/0xShikhar) & [PressProtocol Architects](https://pressprotocol.com)
