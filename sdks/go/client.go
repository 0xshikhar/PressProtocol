package pressprotocol

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client represents the PressProtocol HTTP REST client.
type Client struct {
	endpoint   string
	apiKey     string
	httpClient *http.Client
}

// NewClient initializes a new PressProtocol client.
func NewClient(endpoint, apiKey string) *Client {
	return &Client{
		endpoint: strings.TrimRight(endpoint, "/"),
		apiKey:   apiKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type PublishRawRequest struct {
	Title    string   `json:"title"`
	Content  string   `json:"content"`
	Format   string   `json:"format,omitempty"`
	Tags     []string `json:"tags,omitempty"`
	Author   string   `json:"author,omitempty"`
}

// PublishRequest is an alias to PublishRawRequest for convenient drop-in usage.
type PublishRequest = PublishRawRequest

type PublishSignedRequest struct {
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags,omitempty"`
	Timestamp string   `json:"timestamp"`
	PublicKey string   `json:"publicKey"`
	Signature string   `json:"signature"`
}

type PublishResponse struct {
	Success   bool              `json:"success"`
	CID       string            `json:"cid"`
	Title     string            `json:"title"`
	Tags      []string          `json:"tags"`
	Timestamp string            `json:"timestamp"`
	URLs      map[string]string `json:"urls,omitempty"`
}

type ResolveResponse struct {
	CID            string `json:"cid"`
	Title          string `json:"title,omitempty"`
	Content        string `json:"content,omitempty"`
	RawURL         string `json:"rawUrl,omitempty"`
	IPFSGatewayURL string `json:"ipfsGatewayUrl,omitempty"`
	TorGatewayURL  string `json:"torGatewayUrl,omitempty"`
}

type VerifyRequest struct {
	CID       string   `json:"cid,omitempty"`
	Content   string   `json:"content"`
	PublicKey string   `json:"publicKey"`
	Signature string   `json:"signature"`
	Title     string   `json:"title,omitempty"`
	Tags      []string `json:"tags,omitempty"`
	Timestamp string   `json:"timestamp,omitempty"`
}

type VerifyResponse struct {
	IsValid        bool    `json:"isValid"`
	CIDMatches     bool    `json:"cidMatches"`
	SignatureValid bool    `json:"signatureValid"`
	Algorithm      string  `json:"algorithm"`
	ComputedCID    string  `json:"computedCID"`
	LatencyMs      float64 `json:"latencyMs"`
}

// PublishRaw publishes raw content via node signing.
func (c *Client) PublishRaw(req *PublishRawRequest) (*PublishResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", c.endpoint+"/api/v1/publish/raw", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	if c.apiKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
		httpReq.Header.Set("X-API-Key", c.apiKey)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var result PublishResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// Verify verifies an article against its signature.
func (c *Client) Verify(req *VerifyRequest) (*VerifyResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", c.endpoint+"/api/v1/verify", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result VerifyResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// PublishSigned relays a client-signed article in zero-custody mode.
func (c *Client) PublishSigned(req *PublishSignedRequest) (*PublishResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", c.endpoint+"/api/v1/publish/signed", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	if c.apiKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
		httpReq.Header.Set("X-API-Key", c.apiKey)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var result PublishResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// Resolve resolves content and multi-transport availability for a given CID.
func (c *Client) Resolve(cid string) (*ResolveResponse, error) {
	httpReq, err := http.NewRequest("GET", c.endpoint+"/api/v1/resolve/"+cid, nil)
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var result ResolveResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// Health checks the status of the node gateway.
func (c *Client) Health() (map[string]interface{}, error) {
	httpReq, err := http.NewRequest("GET", c.endpoint+"/api/v1/health", nil)
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return nil, err
	}

	return result, nil
}
