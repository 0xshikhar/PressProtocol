package pressprotocol

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

// SignatureProtocolV2 identifies the content-bound signature payload format.
const SignatureProtocolV2 = "pressprotocol/sig/v2"

// SignableArticle is the data covered by a v2 signature.
type SignableArticle struct {
	Title     string
	Tags      []string
	Timestamp string
	Content   string
}

// PublicationVerification reports the outcome of VerifyPublication.
// Only status "verified" (protocol v2) authenticates the article body.
type PublicationVerification struct {
	Status         string `json:"status"`
	IsValid        bool   `json:"isValid"`
	SignatureValid bool   `json:"signatureValid"`
	ContentBound   bool   `json:"contentBound"`
	Version        int    `json:"version,omitempty"`
}

// jcsString encodes a string exactly like ECMAScript JSON.stringify (RFC 8785 string rules).
func jcsString(s string) string {
	var b strings.Builder
	b.WriteByte('"')
	for _, r := range s {
		switch r {
		case '"':
			b.WriteString(`\"`)
		case '\\':
			b.WriteString(`\\`)
		case '\b':
			b.WriteString(`\b`)
		case '\f':
			b.WriteString(`\f`)
		case '\n':
			b.WriteString(`\n`)
		case '\r':
			b.WriteString(`\r`)
		case '\t':
			b.WriteString(`\t`)
		default:
			if r < 0x20 {
				fmt.Fprintf(&b, `\u%04x`, r)
			} else {
				b.WriteRune(r)
			}
		}
	}
	b.WriteByte('"')
	return b.String()
}

func jcsStringArray(values []string) string {
	parts := make([]string, len(values))
	for i, v := range values {
		parts[i] = jcsString(v)
	}
	return "[" + strings.Join(parts, ",") + "]"
}

// ContentSHA256Hex returns the lowercase hex SHA-256 of the UTF-8 content.
func ContentSHA256Hex(content string) string {
	sum := sha256.Sum256([]byte(content))
	return hex.EncodeToString(sum[:])
}

// BuildSigningPayloadV2 returns the RFC 8785 canonical JSON message that is signed.
// Keys are emitted in canonical (sorted) order: contentSha256, proto, tags, timestamp, title.
func BuildSigningPayloadV2(a SignableArticle) string {
	tags := a.Tags
	if tags == nil {
		tags = []string{}
	}
	return "{" +
		`"contentSha256":` + jcsString(ContentSHA256Hex(a.Content)) + "," +
		`"proto":` + jcsString(SignatureProtocolV2) + "," +
		`"tags":` + jcsStringArray(tags) + "," +
		`"timestamp":` + jcsString(a.Timestamp) + "," +
		`"title":` + jcsString(a.Title) + "}"
}

func buildLegacyPayloadsV1(a SignableArticle) []string {
	tags := a.Tags
	if tags == nil {
		tags = []string{}
	}
	insertion := `{"title":` + jcsString(a.Title) + `,"tags":` + jcsStringArray(tags) + `,"timestamp":` + jcsString(a.Timestamp) + "}"
	sorted := `{"tags":` + jcsStringArray(tags) + `,"timestamp":` + jcsString(a.Timestamp) + `,"title":` + jcsString(a.Title) + "}"
	return []string{insertion, sorted}
}

func privateKeyFromHex(privateKeyHex string) (ed25519.PrivateKey, error) {
	raw, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return nil, err
	}
	switch len(raw) {
	case ed25519.SeedSize:
		return ed25519.NewKeyFromSeed(raw), nil
	case ed25519.PrivateKeySize:
		return ed25519.PrivateKey(raw), nil
	default:
		return nil, errors.New("private key must be a 32-byte seed or 64-byte Ed25519 key in hex")
	}
}

// PublicKeyFromPrivate derives the hex public key from a hex private key (seed or full key).
func PublicKeyFromPrivate(privateKeyHex string) (string, error) {
	priv, err := privateKeyFromHex(privateKeyHex)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(priv.Public().(ed25519.PublicKey)), nil
}

// SignArticleV2 signs the v2 canonical payload and returns the hex signature.
func SignArticleV2(a SignableArticle, privateKeyHex string) (string, error) {
	priv, err := privateKeyFromHex(privateKeyHex)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(ed25519.Sign(priv, []byte(BuildSigningPayloadV2(a)))), nil
}

func verifyRaw(message, signatureHex, publicKeyHex string) bool {
	sig, err := hex.DecodeString(signatureHex)
	if err != nil || len(sig) != ed25519.SignatureSize {
		return false
	}
	pub, err := hex.DecodeString(publicKeyHex)
	if err != nil || len(pub) != ed25519.PublicKeySize {
		return false
	}
	return ed25519.Verify(ed25519.PublicKey(pub), []byte(message), sig)
}

func isHexLen(s string, byteLen int) bool {
	if len(s) != byteLen*2 {
		return false
	}
	_, err := hex.DecodeString(s)
	return err == nil
}

// VerifyPublication verifies an article signature. sigVersion may be 0 (unknown), 1 or 2.
func VerifyPublication(a SignableArticle, publicKeyHex, signatureHex string, sigVersion int) PublicationVerification {
	if publicKeyHex == "" || signatureHex == "" || signatureHex == "unsigned" {
		return PublicationVerification{Status: "unsigned"}
	}
	if !isHexLen(publicKeyHex, ed25519.PublicKeySize) || !isHexLen(signatureHex, ed25519.SignatureSize) {
		return PublicationVerification{Status: "malformed"}
	}
	if a.Timestamp == "" {
		return PublicationVerification{Status: "invalid"}
	}
	if sigVersion != 1 && verifyRaw(BuildSigningPayloadV2(a), signatureHex, publicKeyHex) {
		return PublicationVerification{Status: "verified", IsValid: true, SignatureValid: true, ContentBound: true, Version: 2}
	}
	if sigVersion != 2 {
		for _, legacy := range buildLegacyPayloadsV1(a) {
			if verifyRaw(legacy, signatureHex, publicKeyHex) {
				return PublicationVerification{Status: "legacy", SignatureValid: true, Version: 1}
			}
		}
	}
	return PublicationVerification{Status: "invalid"}
}
