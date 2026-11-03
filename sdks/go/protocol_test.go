package pressprotocol

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

type vectorArticle struct {
	Title     string   `json:"title"`
	Tags      []string `json:"tags"`
	Timestamp string   `json:"timestamp"`
	Content   string   `json:"content"`
}

type vector struct {
	Name           string        `json:"name"`
	PrivateKey     string        `json:"privateKey"`
	PublicKey      string        `json:"publicKey"`
	Article        vectorArticle `json:"article"`
	ContentSha256  string        `json:"contentSha256"`
	SigningPayload string        `json:"signingPayload"`
	Signature      string        `json:"signature"`
	ExpectedStatus string        `json:"expectedStatus"`
}

type vectorFile struct {
	Valid   []vector `json:"valid"`
	Invalid []vector `json:"invalid"`
	Legacy  []vector `json:"legacy"`
}

func loadVectors(t *testing.T) vectorFile {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join("..", "..", "spec", "test-vectors", "signature-v2.json"))
	if err != nil {
		t.Fatalf("read vectors: %v", err)
	}
	var vf vectorFile
	if err := json.Unmarshal(raw, &vf); err != nil {
		t.Fatalf("parse vectors: %v", err)
	}
	return vf
}

func (a vectorArticle) signable() SignableArticle {
	return SignableArticle{Title: a.Title, Tags: a.Tags, Timestamp: a.Timestamp, Content: a.Content}
}

func TestSignatureVectors(t *testing.T) {
	vf := loadVectors(t)

	for _, v := range vf.Valid {
		t.Run(v.Name, func(t *testing.T) {
			art := v.Article.signable()
			if got := ContentSHA256Hex(art.Content); got != v.ContentSha256 {
				t.Fatalf("contentSha256 = %s, want %s", got, v.ContentSha256)
			}
			if got := BuildSigningPayloadV2(art); got != v.SigningPayload {
				t.Fatalf("payload mismatch:\n got  %s\n want %s", got, v.SigningPayload)
			}
			if pub, _ := PublicKeyFromPrivate(v.PrivateKey); pub != v.PublicKey {
				t.Fatalf("public key = %s, want %s", pub, v.PublicKey)
			}
			sig, err := SignArticleV2(art, v.PrivateKey)
			if err != nil || sig != v.Signature {
				t.Fatalf("signature = %s (%v), want %s", sig, err, v.Signature)
			}
			if res := VerifyPublication(art, v.PublicKey, v.Signature, 0); res.Status != "verified" {
				t.Fatalf("status = %s, want verified", res.Status)
			}
		})
	}

	for _, v := range append(vf.Invalid, vf.Legacy...) {
		t.Run(v.Name, func(t *testing.T) {
			if res := VerifyPublication(v.Article.signable(), v.PublicKey, v.Signature, 0); res.Status != v.ExpectedStatus || res.IsValid {
				t.Fatalf("status = %s (valid=%v), want %s", res.Status, res.IsValid, v.ExpectedStatus)
			}
		})
	}
}

func TestUnsignedAndMalformed(t *testing.T) {
	art := SignableArticle{Title: "t", Timestamp: "2026-01-01T00:00:00Z", Content: "c"}
	if res := VerifyPublication(art, "", "", 0); res.Status != "unsigned" {
		t.Fatalf("got %s", res.Status)
	}
	if res := VerifyPublication(art, "00", "zz", 0); res.Status != "malformed" {
		t.Fatalf("got %s", res.Status)
	}
}
