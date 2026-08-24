pub mod crypto;

pub use crypto::{base32_encode, calculate_deterministic_cidv1};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishRawRequest {
    pub title: String,
    pub content: String,
    pub format: Option<String>,
    pub tags: Vec<String>,
    pub author: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishResponse {
    pub success: bool,
    pub cid: String,
    pub title: String,
    pub tags: Vec<String>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyRequest {
    pub cid: Option<String>,
    pub content: String,
    pub public_key: String,
    pub signature: String,
    pub title: Option<String>,
    pub tags: Option<Vec<String>>,
    pub timestamp: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResponse {
    pub is_valid: bool,
    pub cid_matches: bool,
    pub signature_valid: bool,
    pub algorithm: String,
    pub computed_cid: String,
}
