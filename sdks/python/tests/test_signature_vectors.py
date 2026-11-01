import json
import pathlib
import unittest

from pressprotocol.protocol import (
    build_signing_payload_v2,
    public_key_from_private,
    sha256_hex,
    sign_article_v2,
    verify_publication,
)

VECTORS = json.loads(
    (pathlib.Path(__file__).resolve().parents[3] / "spec" / "test-vectors" / "signature-v2.json").read_text("utf-8")
)


def _article_args(article):
    return article["title"], article["tags"], article["timestamp"], article["content"]


class SignatureVectorTests(unittest.TestCase):
    def test_valid_vectors_reproduce_payload_and_signature(self):
        for vector in VECTORS["valid"]:
            with self.subTest(vector["name"]):
                args = _article_args(vector["article"])
                self.assertEqual(sha256_hex(vector["article"]["content"]), vector["contentSha256"])
                self.assertEqual(build_signing_payload_v2(*args), vector["signingPayload"])
                self.assertEqual(public_key_from_private(vector["privateKey"]), vector["publicKey"])
                self.assertEqual(sign_article_v2(*args, vector["privateKey"]), vector["signature"])
                result = verify_publication(*args, vector["publicKey"], vector["signature"])
                self.assertEqual(result["status"], "verified")

    def test_tampered_vectors_are_invalid(self):
        for vector in VECTORS["invalid"]:
            with self.subTest(vector["name"]):
                result = verify_publication(*_article_args(vector["article"]), vector["publicKey"], vector["signature"])
                self.assertEqual(result["status"], "invalid")

    def test_legacy_vectors_are_not_verified(self):
        for vector in VECTORS["legacy"]:
            with self.subTest(vector["name"]):
                result = verify_publication(*_article_args(vector["article"]), vector["publicKey"], vector["signature"])
                self.assertEqual(result["status"], "legacy")
                self.assertFalse(result["isValid"])

    def test_unsigned_and_malformed(self):
        article = VECTORS["valid"][0]["article"]
        self.assertEqual(verify_publication(*_article_args(article), None, None)["status"], "unsigned")
        self.assertEqual(verify_publication(*_article_args(article), "00", "zz")["status"], "malformed")


if __name__ == "__main__":
    unittest.main()
