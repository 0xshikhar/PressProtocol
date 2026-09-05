"""
PressProtocol Python Client - Idiomatic REST & Swarm Gateway
"""

import urllib.request
import urllib.error
import json
from typing import Dict, Any, Optional, List
from .crypto import calculate_deterministic_cidv1, create_canonical_payload


class PressProtocol:
    def __init__(
        self,
        endpoint: str = "http://127.0.0.1:4000",
        api_key: Optional[str] = None,
        timeout: float = 15.0
    ):
        self.endpoint = endpoint.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def _request(
        self,
        method: str,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        url = f"{self.endpoint}{path}"
        req_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "pressprotocol-py/1.0.7"
        }
        if self.api_key:
            req_headers["Authorization"] = f"Bearer {self.api_key}"
            req_headers["X-API-Key"] = self.api_key
        if headers:
            req_headers.update(headers)

        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=req_headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                res_bytes = response.read()
                return json.loads(res_bytes.decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            raise RuntimeError(f"PressProtocol API error ({e.code}): {err_body}")

    def publish_raw(
        self,
        title: str,
        content: str,
        format: str = "markdown",
        tags: Optional[List[str]] = None,
        author: Optional[str] = None
    ) -> Dict[str, Any]:
        """Publishes an article via the node's sovereign signing gateway."""
        payload = {
            "title": title,
            "content": content,
            "format": format,
            "tags": tags or [],
            "author": author
        }
        return self._request("POST", "/api/v1/publish/raw", data=payload)

    def publish_signed(
        self,
        title: str,
        content: str,
        tags: List[str],
        timestamp: str,
        public_key: str,
        signature: str
    ) -> Dict[str, Any]:
        """Relays a client-signed article (zero-custody gateway mode)."""
        payload = {
            "title": title,
            "content": content,
            "tags": tags,
            "timestamp": timestamp,
            "publicKey": public_key,
            "signature": signature
        }
        return self._request("POST", "/api/v1/publish/signed", data=payload)

    def resolve(self, cid: str) -> Dict[str, Any]:
        """Resolves content and multi-transport availability for a given CID."""
        return self._request("GET", f"/api/v1/resolve/{cid}")

    def verify(
        self,
        content: str,
        public_key: str,
        signature: str,
        cid: Optional[str] = None,
        title: Optional[str] = None,
        tags: Optional[List[str]] = None,
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        """Performs cryptographic audit of an article against public key and signature."""
        payload = {
            "content": content,
            "publicKey": public_key,
            "signature": signature,
            "cid": cid,
            "title": title,
            "tags": tags,
            "timestamp": timestamp
        }
        return self._request("POST", "/api/v1/verify", data=payload)

    def get_metrics(self) -> Dict[str, Any]:
        """Fetches node throughput and gateway health metrics."""
        return self._request("GET", "/api/v1/metrics")
