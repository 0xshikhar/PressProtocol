# PressProtocol Rust SDK (`pressprotocol-rs`)

[![Crates.io](https://img.shields.io/crates/v/pressprotocol-rs.svg?color=4F46E5&style=flat-square)](https://crates.io/crates/pressprotocol-rs)
[![Documentation](https://docs.rs/pressprotocol-rs/badge.svg)](https://docs.rs/pressprotocol-rs)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Official Rust SDK for [PressProtocol](https://pressprotocol.com) — Autonomous, censorship-resistant publishing infrastructure, zero-custody cryptographic signing, and deterministic content-addressed storage across IPFS swarms and Tor v3 hidden services.

---

## Features

- ⚡ **Asynchronous & High-Performance**: Built on `tokio` and `reqwest` with pure Rustls TLS.
- 🔐 **Zero-Custody Cryptography**: In-memory Ed25519 key generation and deterministic payload verification.
- 🧮 **Deterministic In-Memory CIDv1**: Compute authentic IPFS base32 multihash strings in pure Rust without daemon overhead.
- 🌐 **Multi-Transport Resolution**: Automated failover between IPFS gateways and Tor `.onion` relays.

---

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
pressprotocol-rs = "1.0.7"
tokio = { version = "1.0", features = ["full"] }
```

Or install via Cargo:

```bash
cargo add pressprotocol-rs
```

---

## Quickstart

```rust
use pressprotocol_rs::{Client, PublishRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize client
    let client = Client::new("https://pressprotocol.com");

    // 2. Prepare publication
    let req = PublishRequest {
        title: "Sovereign Systems & Cryptographic Authenticity".into(),
        content: "# Architectural Veracity\n\nPreserved across decentralized swarms.".into(),
        tags: vec!["cryptography".into(), "sovereignty".into()],
        format: Some("markdown".into()),
        author: Some("0xShikhar".into()),
    };

    // 3. Publish to IPFS & Tor
    let res = client.publish(&req).await?;
    println!("✅ Published CID: {}", res.cid);
    println!("📦 IPFS URL: {:?}", res.urls.get("ipfs"));
    println!("🧅 Tor URL: {:?}", res.urls.get("tor"));

    Ok(())
}
```

---

## In-Memory Deterministic CIDv1 Calculation

```rust
use pressprotocol_rs::calculate_deterministic_cidv1;

let cid = calculate_deterministic_cidv1(b"Hello, Sovereign Cyberspace!");
println!("Deterministic CIDv1: {}", cid);
```

---

## License

MIT © [0xShikhar](https://github.com/0xShikhar) & [PressProtocol Architects](https://pressprotocol.com)
