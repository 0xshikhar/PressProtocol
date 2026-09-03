# PressProtocol Rust SDK (`pressprotocol-rs`)

Official Rust SDK for [PressProtocol](https://pressprotocol.com) — Autonomous, censorship-resistant publishing infrastructure. Syndicate cryptographic publications across IPFS swarms, Tor v3 hidden services, and deterministic content-addressed storage.

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
pressprotocol-rs = "1.0.0"
tokio = { version = "1.0", features = ["full"] }
```

Or install via Cargo:

```bash
cargo add pressprotocol-rs
```

## Quickstart

```rust
use pressprotocol_rs::{Client, PublishRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client with gateway endpoint & sandbox key
    let client = Client::new("https://node.pressprotocol.com", "pp_test_sandbox_key")?;

    // 1-Line Server-Signed Ingest
    let response = client.publish_raw(PublishRequest {
        title: "Investigative Transparency Report".to_string(),
        content: "# Sovereign Dispatch\n\nFull disclosure preserved on IPFS and Tor.".to_string(),
        format: Some("markdown".to_string()),
        tags: vec!["whistleblower".to_string(), "sovereignty".to_string()],
        author: Some("Newsroom Bureau".to_string()),
    }).await?;

    println!("✅ Anchored CID: {}", response.cid);
    println!("🌐 IPFS Gateway: {:?}", response.urls.get("ipfs"));
    println!("🧅 Tor Mirror: {:?}", response.urls.get("tor"));

    Ok(())
}
```

## Features

- **Deterministic In-Memory CIDv1**: Compute base32 IPFS CIDv1 without contacting an external IPFS daemon via `calculate_deterministic_cidv1`.
- **Server-Signed Ingest**: Simple 1-line publishing via `client.publish_raw`.
- **Client-Signed Zero-Custody**: Relay client-signed Ed25519 dispatches via `client.publish_signed`.
- **Multi-Transport Resolution**: Resolve content and gateway availability via `client.resolve`.
- **Cryptographic Audit**: Audit signature validity against public keys via `client.verify`.

## License

MIT
