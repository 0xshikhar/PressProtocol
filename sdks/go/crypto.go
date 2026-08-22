package pressprotocol

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"sort"
)

const base32Alphabet = "abcdefghijklmnopqrstuvwxyz234567"

// Base32Encode performs RFC 4648 unpadded base32 encoding (multibase 'b').
func Base32Encode(data []byte) string {
	var result []byte
	bits := 0
	value := 0

	for _, b := range data {
		value = (value << 8) | int(b)
		bits += 8
		for bits >= 5 {
			bits -= 5
			result = append(result, base32Alphabet[(value>>bits)&31])
		}
	}

	if bits > 0 {
		result = append(result, base32Alphabet[(value<<(5-bits))&31])
	}

	return string(result)
}

// CalculateDeterministicCIDv1 computes an authentic raw-SHA256 multihash CIDv1 in-memory.
func CalculateDeterministicCIDv1(content []byte) string {
	hash := sha256.Sum256(content)

	// Binary CIDv1 layout: [0x01 (CIDv1), 0x55 (raw), 0x12 (sha2-256), 0x20 (32 bytes), ...digest]
	cidBinary := make([]byte, 4+32)
	cidBinary[0] = 0x01
	cidBinary[1] = 0x55
	cidBinary[2] = 0x12
	cidBinary[3] = 0x20
	copy(cidBinary[4:], hash[:])

	return "b" + Base32Encode(cidBinary)
}

// KeyPair represents an Ed25519 keypair in hex format.
type KeyPair struct {
	PublicKey  string `json:"publicKey"`
	PrivateKey string `json:"privateKey"`
}

// GenerateKeypair generates an authentic RFC 8032 Ed25519 keypair.
func GenerateKeypair() (*KeyPair, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}
	return &KeyPair{
		PublicKey:  hex.EncodeToString(pub),
		PrivateKey: hex.EncodeToString(priv),
	}, nil
}

// CreateCanonicalPayload builds deterministic JSON string for signing.
func CreateCanonicalPayload(title string, tags []string, timestamp string) (string, error) {
	sortedTags := make([]string, len(tags))
	copy(sortedTags, tags)
	sort.Strings(sortedTags)

	payload := map[string]interface{}{
		"title":     title,
		"tags":      sortedTags,
		"timestamp": timestamp,
	}
	bytes, err := json.Marshal(payload)
	return string(bytes), err
}
