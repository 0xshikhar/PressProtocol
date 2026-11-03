"""
PressProtocol signature protocol v2 (Python).

Signs an RFC 8785 (JCS) canonical JSON object that binds the article body:
    {"proto": "pressprotocol/sig/v2", "title", "tags", "timestamp", "contentSha256"}

Payload construction uses only the standard library. Signing and verification use the
optional ``cryptography`` package: ``pip install "pressprotocol-py[crypto]"``.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List, Optional

SIGNATURE_PROTOCOL_V2 = "pressprotocol/sig/v2"


def canonicalize_json(value: Any) -> str:
    """RFC 8785 canonical JSON for the protocol's JSON subset (objects, arrays, strings, bools, null)."""
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def sha256_hex(content: str | bytes) -> str:
    data = content.encode("utf-8") if isinstance(content, str) else content
    return hashlib.sha256(data).hexdigest()


def build_signing_payload_v2(title: str, tags: List[str], timestamp: str, content: str) -> str:
    return canonicalize_json(
        {
            "proto": SIGNATURE_PROTOCOL_V2,
            "title": title,
            "tags": list(tags),
            "timestamp": timestamp,
            "contentSha256": sha256_hex(content),
        }
    )


def build_legacy_payloads_v1(title: str, tags: List[str], timestamp: str) -> List[str]:
    """Legacy v1 payloads (metadata only). Verify-only; never produce new v1 signatures."""
    insertion_ordered = json.dumps(
        {"title": title, "tags": list(tags), "timestamp": timestamp}, ensure_ascii=False, separators=(",", ":")
    )
    sorted_keys = canonicalize_json({"title": title, "tags": list(tags), "timestamp": timestamp})
    return list(dict.fromkeys([insertion_ordered, sorted_keys]))


def _ed25519():
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519  # type: ignore
    except ImportError as exc:  # pragma: no cover - exercised only without the extra
        raise ImportError('Ed25519 signing requires the "crypto" extra: pip install "pressprotocol-py[crypto]"') from exc
    return ed25519


def public_key_from_private(private_key_hex: str) -> str:
    from cryptography.hazmat.primitives import serialization  # type: ignore

    key = _ed25519().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(private_key_hex))
    return key.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw).hex()


def sign_article_v2(title: str, tags: List[str], timestamp: str, content: str, private_key_hex: str) -> str:
    key = _ed25519().Ed25519PrivateKey.from_private_bytes(bytes.fromhex(private_key_hex))
    return key.sign(build_signing_payload_v2(title, tags, timestamp, content).encode("utf-8")).hex()


def _verify(message: str, signature_hex: str, public_key_hex: str) -> bool:
    try:
        key = _ed25519().Ed25519PublicKey.from_public_bytes(bytes.fromhex(public_key_hex))
        key.verify(bytes.fromhex(signature_hex), message.encode("utf-8"))
        return True
    except ImportError:
        raise
    except Exception:
        return False


def _is_hex(value: Optional[str], byte_length: int) -> bool:
    if not isinstance(value, str) or len(value) != byte_length * 2:
        return False
    try:
        bytes.fromhex(value)
        return True
    except ValueError:
        return False


def verify_publication(
    title: str,
    tags: List[str],
    timestamp: Optional[str],
    content: Optional[str],
    public_key: Optional[str],
    signature: Optional[str],
    sig_version: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Returns {"status", "isValid", "signatureValid", "contentBound", "version"}.
    Only v2 (content-bound) signatures are reported as "verified"; v1 signatures are "legacy".
    """
    if not public_key or not signature or signature == "unsigned":
        return {"status": "unsigned", "isValid": False, "signatureValid": False, "contentBound": False, "version": None}
    if not _is_hex(public_key, 32) or not _is_hex(signature, 64):
        return {"status": "malformed", "isValid": False, "signatureValid": False, "contentBound": False, "version": None}
    if not timestamp:
        return {"status": "invalid", "isValid": False, "signatureValid": False, "contentBound": False, "version": None}

    if sig_version != 1 and isinstance(content, str):
        if _verify(build_signing_payload_v2(title, tags, timestamp, content), signature, public_key):
            return {"status": "verified", "isValid": True, "signatureValid": True, "contentBound": True, "version": 2}

    if sig_version != 2:
        for payload in build_legacy_payloads_v1(title, tags, timestamp):
            if _verify(payload, signature, public_key):
                return {"status": "legacy", "isValid": False, "signatureValid": True, "contentBound": False, "version": 1}

    return {"status": "invalid", "isValid": False, "signatureValid": False, "contentBound": False, "version": None}
