//! PressProtocol signature protocol v2.
//!
//! Ed25519 over the RFC 8785 (JCS) canonical JSON of
//! `{"proto":"pressprotocol/sig/v2","title","tags","timestamp","contentSha256"}`,
//! which binds the article body via its SHA-256 digest. v1 (metadata-only) signatures are
//! verify-only and reported as `Legacy`, never `Verified`.

use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use sha2::{Digest, Sha256};

pub const SIGNATURE_PROTOCOL_V2: &str = "pressprotocol/sig/v2";

#[derive(Debug, Clone)]
pub struct SignableArticle<'a> {
    pub title: &'a str,
    pub tags: &'a [String],
    pub timestamp: &'a str,
    pub content: &'a str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SignatureStatus {
    Verified,
    Legacy,
    Invalid,
    Unsigned,
    Malformed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PublicationVerification {
    pub status: SignatureStatus,
    /// True only when the signature is valid and covers the article body (v2).
    pub is_valid: bool,
    pub signature_valid: bool,
    pub version: Option<u8>,
}

impl PublicationVerification {
    fn of(status: SignatureStatus) -> Self {
        let (is_valid, signature_valid, version) = match status {
            SignatureStatus::Verified => (true, true, Some(2)),
            SignatureStatus::Legacy => (false, true, Some(1)),
            _ => (false, false, None),
        };
        Self { status, is_valid, signature_valid, version }
    }
}

/// Encodes a string exactly like ECMAScript `JSON.stringify` (RFC 8785 string rules).
fn jcs_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{08}' => out.push_str("\\b"),
            '\u{0C}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn jcs_string_array(values: &[String]) -> String {
    let parts: Vec<String> = values.iter().map(|v| jcs_string(v)).collect();
    format!("[{}]", parts.join(","))
}

pub fn content_sha256_hex(content: &str) -> String {
    hex::encode(Sha256::digest(content.as_bytes()))
}

/// Canonical v2 message (keys in sorted order: contentSha256, proto, tags, timestamp, title).
pub fn build_signing_payload_v2(a: &SignableArticle) -> String {
    format!(
        "{{\"contentSha256\":{},\"proto\":{},\"tags\":{},\"timestamp\":{},\"title\":{}}}",
        jcs_string(&content_sha256_hex(a.content)),
        jcs_string(SIGNATURE_PROTOCOL_V2),
        jcs_string_array(a.tags),
        jcs_string(a.timestamp),
        jcs_string(a.title),
    )
}

fn legacy_payloads_v1(a: &SignableArticle) -> [String; 2] {
    let tags = jcs_string_array(a.tags);
    [
        format!("{{\"title\":{},\"tags\":{},\"timestamp\":{}}}", jcs_string(a.title), tags, jcs_string(a.timestamp)),
        format!("{{\"tags\":{},\"timestamp\":{},\"title\":{}}}", tags, jcs_string(a.timestamp), jcs_string(a.title)),
    ]
}

fn signing_key(private_key_hex: &str) -> Result<SigningKey, String> {
    let bytes = hex::decode(private_key_hex).map_err(|e| e.to_string())?;
    let seed: [u8; 32] = bytes
        .get(..32)
        .filter(|_| bytes.len() == 32 || bytes.len() == 64)
        .and_then(|s| s.try_into().ok())
        .ok_or("private key must be a 32-byte seed or 64-byte key in hex")?;
    Ok(SigningKey::from_bytes(&seed))
}

pub fn public_key_from_private(private_key_hex: &str) -> Result<String, String> {
    Ok(hex::encode(signing_key(private_key_hex)?.verifying_key().to_bytes()))
}

pub fn sign_article_v2(a: &SignableArticle, private_key_hex: &str) -> Result<String, String> {
    let key = signing_key(private_key_hex)?;
    Ok(hex::encode(key.sign(build_signing_payload_v2(a).as_bytes()).to_bytes()))
}

fn decode_fixed<const N: usize>(value: &str) -> Option<[u8; N]> {
    hex::decode(value).ok()?.try_into().ok()
}

/// Verifies an article signature. `sig_version` may be `None`, `Some(1)` or `Some(2)`.
pub fn verify_publication(
    a: &SignableArticle,
    public_key_hex: &str,
    signature_hex: &str,
    sig_version: Option<u8>,
) -> PublicationVerification {
    if public_key_hex.is_empty() || signature_hex.is_empty() || signature_hex == "unsigned" {
        return PublicationVerification::of(SignatureStatus::Unsigned);
    }
    let (Some(pk), Some(sig)) = (decode_fixed::<32>(public_key_hex), decode_fixed::<64>(signature_hex)) else {
        return PublicationVerification::of(SignatureStatus::Malformed);
    };
    if a.timestamp.is_empty() {
        return PublicationVerification::of(SignatureStatus::Invalid);
    }
    let Ok(key) = VerifyingKey::from_bytes(&pk) else {
        return PublicationVerification::of(SignatureStatus::Invalid);
    };
    let signature = Signature::from_bytes(&sig);
    let verify = |message: &str| key.verify(message.as_bytes(), &signature).is_ok();

    if sig_version != Some(1) && verify(&build_signing_payload_v2(a)) {
        return PublicationVerification::of(SignatureStatus::Verified);
    }
    if sig_version != Some(2) && legacy_payloads_v1(a).iter().any(|p| verify(p)) {
        return PublicationVerification::of(SignatureStatus::Legacy);
    }
    PublicationVerification::of(SignatureStatus::Invalid)
}
