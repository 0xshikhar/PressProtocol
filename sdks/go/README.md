# PressProtocol Go SDK

[![Go Reference](https://pkg.go.dev/badge/github.com/0xshikhar/AnonPress/sdks/go.svg)](https://pkg.go.dev/github.com/0xshikhar/AnonPress/sdks/go)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Go Report Card](https://goreportcard.com/badge/github.com/0xshikhar/AnonPress/sdks/go)](https://goreportcard.com/report/github.com/0xshikhar/AnonPress/sdks/go)

Official Go SDK for [PressProtocol](https://pressprotocol.com) — Autonomous, censorship-resistant publishing infrastructure, zero-custody cryptographic signing, and multi-transport content resolution across IPFS and Tor.

---

## Features

- 🚀 **Zero External Dependencies**: Built entirely on Go standard library (`crypto/ed25519`, `crypto/sha256`, `net/http`).
- 🔐 **Zero-Custody Signing**: Generate RFC-8032 Ed25519 keypairs and sign articles locally.
- ⚡ **Deterministic In-Memory CIDv1**: Compute authentic IPFS base32 multihash strings (`bafk...`) in memory with 0 network calls.
- 🌐 **Multi-Transport Resolution**: Fast, concurrent resolution of IPFS gateway links, raw gateways, and Tor `.onion` mirrors.

---

## Installation

```bash
go get github.com/0xshikhar/AnonPress/sdks/go@sdks/go/v1.0.7
```

---

## Quickstart

```go
package main

import (
	"fmt"
	"log"
	"time"

	pressprotocol "github.com/0xshikhar/AnonPress/sdks/go"
)

func main() {
	// 1. Initialize client
	client := pressprotocol.NewClient("https://pressprotocol.com", "")

	// 2. Generate sovereign Ed25519 keypair locally
	keypair, err := pressprotocol.GenerateKeypair()
	if err != nil {
		log.Fatalf("Failed to generate keypair: %v", err)
	}
	fmt.Printf("Public Key: %s\n", keypair.PublicKey)

	// 3. Prepare article
	title := "Decentralized Newsroom Sovereignty"
	content := "# Investigative Report\n\nImmutable record preserved across swarms."
	tags := []string{"freedom", "journalism"}
	timestamp := time.Now().UTC().Format(time.RFC3339)

	// 4. Publish via Zero-Custody relay
	res, err := client.PublishRaw(&pressprotocol.PublishRawRequest{
		Title:   title,
		Content: content,
		Tags:    tags,
	})
	if err != nil {
		log.Fatalf("Publish error: %v", err)
	}

	fmt.Printf("✅ Published CID: %s\n", res.CID)
	fmt.Printf("📦 URLs: %+v\n", res.URLs)

	// 5. In-Memory Deterministic CIDv1 calculation
	computedCID := pressprotocol.CalculateDeterministicCIDv1([]byte(content))
	fmt.Printf("🧮 In-Memory CID: %s\n", computedCID)
}
```

---

## License

MIT © [0xShikhar](https://github.com/0xShikhar) & [PressProtocol Architects](https://pressprotocol.com)
