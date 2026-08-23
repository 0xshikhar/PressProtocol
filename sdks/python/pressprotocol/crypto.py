"""
PressProtocol Sovereign Cryptography & Deterministic Multihash (Python)
"""

import hashlib
import json
from typing import Dict, Any, Tuple, Optional

BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567"


def base32_encode(data: bytes) -> str:
    """RFC 4648 lowercase unpadded base32 encoding (multibase 'b')."""
    result = []
    bits = 0
    value = 0

    for byte in data:
        value = (value << 8) | byte
        bits += 8
        while bits >= 5:
            bits -= 5
            result.append(BASE32_ALPHABET[(value >> bits) & 31])

    if bits > 0:
        result.append(BASE32_ALPHABET[(value << (5 - bits)) & 31])

    return "".join(result)


def calculate_deterministic_cidv1(content: str | bytes) -> str:
    """
    Deterministically computes an authentic IPFS CIDv1 (raw codec, sha2-256, base32)
    in-memory without contacting any external IPFS daemon or gateway.
    """
    raw_bytes = content.encode("utf-8") if isinstance(content, str) else content
    digest = hashlib.sha256(raw_bytes).digest()

    # Binary CIDv1 structure: [0x01 (CIDv1), 0x55 (raw), 0x12 (sha2-256), 0x20 (32 bytes), ...digest]
    header = bytes([0x01, 0x55, 0x12, 0x20])
    cid_binary = header + digest

    return "b" + base32_encode(cid_binary)


def create_canonical_payload(title: str, tags: list[str], timestamp: str) -> str:
    """Creates deterministic canonical JSON for article signing."""
    return json.dumps({
        "title": title,
        "tags": sorted(tags),
        "timestamp": timestamp
    }, separators=(",", ":"))
