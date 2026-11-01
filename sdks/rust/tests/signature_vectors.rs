use pressprotocol_rs::protocol::{
    build_signing_payload_v2, content_sha256_hex, public_key_from_private, sign_article_v2, verify_publication,
    SignableArticle, SignatureStatus,
};
use serde_json::Value;

fn vectors() -> Value {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../spec/test-vectors/signature-v2.json");
    serde_json::from_str(&std::fs::read_to_string(path).expect("read vectors")).expect("parse vectors")
}

fn tags(v: &Value) -> Vec<String> {
    v["article"]["tags"].as_array().unwrap().iter().map(|t| t.as_str().unwrap().to_string()).collect()
}

fn article<'a>(v: &'a Value, tags: &'a [String]) -> SignableArticle<'a> {
    SignableArticle {
        title: v["article"]["title"].as_str().unwrap(),
        tags,
        timestamp: v["article"]["timestamp"].as_str().unwrap(),
        content: v["article"]["content"].as_str().unwrap(),
    }
}

#[test]
fn valid_vectors_reproduce_payload_and_signature() {
    for v in vectors()["valid"].as_array().unwrap() {
        let t = tags(v);
        let a = article(v, &t);
        let name = v["name"].as_str().unwrap();
        assert_eq!(content_sha256_hex(a.content), v["contentSha256"].as_str().unwrap(), "{name}");
        assert_eq!(build_signing_payload_v2(&a), v["signingPayload"].as_str().unwrap(), "{name}");
        assert_eq!(public_key_from_private(v["privateKey"].as_str().unwrap()).unwrap(), v["publicKey"].as_str().unwrap(), "{name}");
        assert_eq!(sign_article_v2(&a, v["privateKey"].as_str().unwrap()).unwrap(), v["signature"].as_str().unwrap(), "{name}");
        let res = verify_publication(&a, v["publicKey"].as_str().unwrap(), v["signature"].as_str().unwrap(), None);
        assert_eq!(res.status, SignatureStatus::Verified, "{name}");
    }
}

#[test]
fn tampered_and_legacy_vectors_are_not_verified() {
    let data = vectors();
    let cases = data["invalid"].as_array().unwrap().iter().map(|v| (v, SignatureStatus::Invalid))
        .chain(data["legacy"].as_array().unwrap().iter().map(|v| (v, SignatureStatus::Legacy)));
    for (v, expected) in cases {
        let t = tags(v);
        let res = verify_publication(&article(v, &t), v["publicKey"].as_str().unwrap(), v["signature"].as_str().unwrap(), None);
        assert_eq!(res.status, expected, "{}", v["name"]);
        assert!(!res.is_valid, "{}", v["name"]);
    }
}

#[test]
fn unsigned_and_malformed() {
    let t: Vec<String> = vec![];
    let a = SignableArticle { title: "t", tags: &t, timestamp: "2026-01-01T00:00:00Z", content: "c" };
    assert_eq!(verify_publication(&a, "", "", None).status, SignatureStatus::Unsigned);
    assert_eq!(verify_publication(&a, "00", "zz", None).status, SignatureStatus::Malformed);
}
