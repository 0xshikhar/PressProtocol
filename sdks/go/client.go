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

type PublishResponse struct {
	Success   bool              `json:"success"`
	CID       string            `json:"cid"`
	Title     string            `json:"title"`
	Tags      []string          `json:"tags"`
	Timestamp string            `json:"timestamp"`
	URLs      map[string]string `json:"urls,omitempty"`
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
