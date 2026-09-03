pub mod crypto;

pub use crypto::{base32_encode, calculate_deterministic_cidv1};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Alias for compatibility with code snippets
pub type PublishRequest = PublishRawRequest;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishRawRequest {
    pub title: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishSignedRequest {
    pub title: String,
    pub content: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub timestamp: String,
    #[serde(rename = "publicKey")]
    pub public_key: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishResponse {
    pub success: bool,
    pub cid: String,
    pub title: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub timestamp: String,
    #[serde(default)]
    pub urls: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cid: Option<String>,
    pub content: String,
    #[serde(rename = "publicKey")]
    pub public_key: String,
    pub signature: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timestamp: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResponse {
    #[serde(rename = "isValid")]
    pub is_valid: bool,
    #[serde(default, rename = "cidMatches")]
    pub cid_matches: bool,
    #[serde(default, rename = "signatureValid")]
    pub signature_valid: bool,
    #[serde(default)]
    pub algorithm: String,
    #[serde(default, rename = "computedCID")]
    pub computed_cid: String,
    #[serde(default, rename = "latencyMs")]
    pub latency_ms: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolveResponse {
    pub cid: String,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub content: Option<String>,
    #[serde(default, rename = "rawUrl")]
    pub raw_url: Option<String>,
    #[serde(default, rename = "ipfsGatewayUrl")]
    pub ipfs_gateway_url: Option<String>,
    #[serde(default, rename = "torGatewayUrl")]
    pub tor_gateway_url: Option<String>,
}

/// The official PressProtocol Rust HTTP REST Client
#[derive(Clone, Debug)]
pub struct Client {
    endpoint: String,
    api_key: String,
    http: reqwest::Client,
}

impl Client {
    /// Initializes a new PressProtocol client with the target endpoint and optional API key
    pub fn new(
        endpoint: impl Into<String>,
        api_key: impl Into<String>,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let ep = endpoint.into().trim_end_matches('/').to_string();
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()?;

        Ok(Self {
            endpoint: ep,
            api_key: api_key.into(),
            http: client,
        })
    }

    /// Publishes content via the node's sovereign signing gateway
    pub async fn publish_raw(
        &self,
        req: PublishRawRequest,
    ) -> Result<PublishResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/v1/publish/raw", self.endpoint);
        let mut builder = self.http.post(&url).json(&req);

        if !self.api_key.is_empty() {
            builder = builder
                .header("Authorization", format!("Bearer {}", self.api_key))
                .header("X-API-Key", &self.api_key);
        }

        let res = builder.send().await?;
        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            return Err(format!("PressProtocol API error ({}): {}", status, body).into());
        }

        let response = res.json::<PublishResponse>().await?;
        Ok(response)
    }

    /// Relays a client-signed article in zero-custody mode
    pub async fn publish_signed(
        &self,
        req: PublishSignedRequest,
    ) -> Result<PublishResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/v1/publish/signed", self.endpoint);
        let mut builder = self.http.post(&url).json(&req);

        if !self.api_key.is_empty() {
            builder = builder
                .header("Authorization", format!("Bearer {}", self.api_key))
                .header("X-API-Key", &self.api_key);
        }

        let res = builder.send().await?;
        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            return Err(format!("PressProtocol API error ({}): {}", status, body).into());
        }

        let response = res.json::<PublishResponse>().await?;
        Ok(response)
    }

    /// Performs cryptographic audit of an article against public key and signature
    pub async fn verify(
        &self,
        req: VerifyRequest,
    ) -> Result<VerifyResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/v1/verify", self.endpoint);
        let res = self.http.post(&url).json(&req).send().await?;

        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            return Err(format!("PressProtocol API error ({}): {}", status, body).into());
        }

        let response = res.json::<VerifyResponse>().await?;
        Ok(response)
    }

    /// Resolves content and multi-transport availability for a given CID
    pub async fn resolve(
        &self,
        cid: &str,
    ) -> Result<ResolveResponse, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/v1/resolve/{}", self.endpoint, cid);
        let res = self.http.get(&url).send().await?;

        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            return Err(format!("PressProtocol API error ({}): {}", status, body).into());
        }

        let response = res.json::<ResolveResponse>().await?;
        Ok(response)
    }

    /// Fetches node health and status
    pub async fn health(&self) -> Result<serde_json::Value, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/v1/health", self.endpoint);
        let res = self.http.get(&url).send().await?;
        let response = res.json::<serde_json::Value>().await?;
        Ok(response)
    }
}
