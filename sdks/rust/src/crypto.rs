const BASE32_ALPHABET: &[u8; 32] = b"abcdefghijklmnopqrstuvwxyz234567";

pub fn base32_encode(data: &[u8]) -> String {
    let mut result = String::new();
    let mut bits: u32 = 0;
    let mut value: u32 = 0;

    for &byte in data {
        value = (value << 8) | (byte as u32);
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            let idx = ((value >> bits) & 31) as usize;
            result.push(BASE32_ALPHABET[idx] as char);
        }
    }

    if bits > 0 {
        let idx = ((value << (5 - bits)) & 31) as usize;
        result.push(BASE32_ALPHABET[idx] as char);
    }

    result
}

pub fn calculate_deterministic_cidv1(content: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(content);
    let digest = hasher.finalize();

    // Binary layout: [0x01, 0x55, 0x12, 0x20, ...digest]
    let mut cid_bytes = Vec::with_capacity(4 + 32);
    cid_bytes.extend_from_slice(&[0x01, 0x55, 0x12, 0x20]);
    cid_bytes.extend_from_slice(&digest);

    format!("b{}", base32_encode(&cid_bytes))
}
