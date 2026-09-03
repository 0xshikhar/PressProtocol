# PressProtocol Python SDK (`pressprotocol-py`)

Official Python SDK for [PressProtocol](https://pressprotocol.com) — Autonomous, censorship-resistant publishing infrastructure and multi-transport cryptographic syndicate.

## Installation

Install via pip:

```bash
pip install pressprotocol-py
```

Or install directly from GitHub:

```bash
pip install "git+https://github.com/0xshikhar/AnonPress.git#subdirectory=sdks/python"
```

## Quickstart

```python
from pressprotocol import PressProtocol

# Initialize client with node endpoint and API key
client = PressProtocol(
    endpoint="https://node.pressprotocol.com",
    api_key="pp_test_your_sandbox_api_key"
)

# 1-Line Server-Signed Ingest
post = client.publish_raw(
    title="Data Science Pipeline Transparency Audit",
    content="# Methodology & Findings\n\nVerifiable cryptographic dataset preserved across swarms.",
    tags=["science", "reproducibility", "whistleblower"]
)

print(f"✅ Published CID: {post['cid']}")
print(f"📦 IPFS Gateway: {post.get('urls', {}).get('ipfs')}")
print(f"🧅 Tor Mirror: {post.get('urls', {}).get('tor')}")
```

## In-Memory Deterministic CIDv1

Compute standard base32 CIDv1 in-memory without reaching out to an IPFS daemon:

```python
from pressprotocol.crypto import calculate_deterministic_cidv1

cid = calculate_deterministic_cidv1("Hello, Sovereign Cyberspace!")
print("Deterministic CIDv1:", cid)
```

## License

MIT
