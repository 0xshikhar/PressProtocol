import {
  validateTorV3Address,
  deriveTorV3Address,
  base32Decode,
  base32Encode,
  isValidHex,
  generateKeypair,
} from "../packages/sdk/src/index.js";
import { getCanonicalOnionUrl, extractOnionAddress, formatOnionDisplay } from "../apps/web/src/lib/tor-utils.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ Assertion Failed: ${message}`);
  }
}

async function runTorCryptoTests() {
  console.log("🧪 Testing Tor v3 Cryptographic Address Derivation & Validation");
  console.log("===============================================================");

  // 1. Known valid Tor v3 address verification
  console.log("1️⃣  Valid Tor v3 Address Validation...");
  const validAddress = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion";
  const res1 = validateTorV3Address(validAddress);
  assert(res1.isValid === true, "Valid onion address passes validation");
  assert(res1.version === 3, "Version is 3");
  assert(typeof res1.publicKeyHex === "string" && res1.publicKeyHex.length === 64, "Public key hex is 32 bytes");
  assert(typeof res1.checksumHex === "string" && res1.checksumHex.length === 4, "Checksum hex is 2 bytes");

  // 2. URL variations handling
  console.log("2️⃣  URL Normalization and Scheme/Path Stripping...");
  const urlWithScheme = "http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion/read/bafy123";
  const resUrl = validateTorV3Address(urlWithScheme);
  assert(resUrl.isValid === true, "URL with scheme and path validates correctly");

  const addressWithoutSuffix = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd";
  const resNoSuffix = validateTorV3Address(addressWithoutSuffix);
  assert(resNoSuffix.isValid === true, "Raw 56-char base32 address validates correctly");

  // 3. ReDoS Protection check
  console.log("3️⃣  ReDoS Resilience Test...");
  const redosPayload = "http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion" + "/".repeat(1000) + "evil";
  const start = performance.now();
  const resRedos = validateTorV3Address(redosPayload);
  const duration = performance.now() - start;
  assert(resRedos.isValid === true, "ReDoS input is handled safely");
  assert(duration < 50, `Path stripping finished quickly in ${duration.toFixed(2)}ms (< 50ms)`);

  // 4. Invalid Address Detection
  console.log("4️⃣  Invalid Address Detection & Error Handling...");
  // Old broken 53-character mock string
  const oldBroken = "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion";
  const resOld = validateTorV3Address(oldBroken);
  assert(resOld.isValid === false, "Old 53-char mock string is rejected");
  assert(resOld.error?.includes("length"), "Reports length mismatch error");

  // Checksum mismatch (tampering public key without changing checksum)
  const tamperedPubkey = "kcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion";
  const resTampered = validateTorV3Address(tamperedPubkey);
  assert(resTampered.isValid === false, "Tampered address is rejected");
  assert(resTampered.error?.includes("checksum mismatch"), "Reports checksum mismatch");

  // Invalid version byte
  const invalidVersion = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqa.onion";
  const resVersion = validateTorV3Address(invalidVersion);
  assert(resVersion.isValid === false, "Invalid version byte is rejected");
  assert(resVersion.error?.includes("version"), "Reports unsupported version error");

  // Invalid base32 character (e.g. '8' or '9' or '1')
  const invalidBase32 = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnq8.onion";
  const resBase32 = validateTorV3Address(invalidBase32);
  assert(resBase32.isValid === false, "Invalid Base32 character is rejected");

  // 5. Address Derivation from Public Key
  console.log("5️⃣  Address Derivation from Ed25519 Public Key...");
  const kp = await generateKeypair();
  const pubKeyHex = kp.publicKey;
  const derivedFromHex = deriveTorV3Address(pubKeyHex);
  assert(derivedFromHex.endsWith(".onion"), "Derived address has .onion extension");
  assert(derivedFromHex.length === 62, "Derived full address is 56 base32 + 6 (.onion) = 62 chars");

  // Validate the newly derived onion address
  const validateDerived = validateTorV3Address(derivedFromHex);
  assert(validateDerived.isValid === true, "Derived onion address passes cryptographic validation");
  assert(validateDerived.publicKeyHex === pubKeyHex, "Decoded public key matches original public key");

  // Derive from Uint8Array bytes
  const pubKeyBytes = Buffer.from(pubKeyHex, "hex");
  const derivedFromBytes = deriveTorV3Address(pubKeyBytes);
  assert(derivedFromBytes === derivedFromHex, "Derivation from bytes matches derivation from hex string");

  // Rejection of invalid hex string
  let threwOnBadHex = false;
  try {
    deriveTorV3Address("zz".repeat(32));
  } catch (err: any) {
    threwOnBadHex = true;
    assert(err.message.includes("Invalid Ed25519 public key hex"), "Proper error on invalid hex string");
  }
  assert(threwOnBadHex === true, "deriveTorV3Address throws on non-hex string");

  // 6. Web Canonical URL Construction
  console.log("6️⃣  Canonical Onion URL Construction...");
  const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

  // When given URL without .onion suffix but valid 56-char host
  const canonicalUrl1 = getCanonicalOnionUrl(cid, "http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion/dirty/path");
  assert(
    canonicalUrl1 === `http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion/read/${cid}`,
    "Canonical URL normalizes path and preserves /read/${cid}"
  );

  // Fallback URL (isolated from environment)
  const prevEnvHost = process.env.NEXT_PUBLIC_TOR_ONION_HOST;
  try {
    delete process.env.NEXT_PUBLIC_TOR_ONION_HOST;
    const fallbackUrl = getCanonicalOnionUrl(cid);
    assert(
      fallbackUrl === `http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion/read/${cid}`,
      "Fallback URL uses verified canonical seed host"
    );
  } finally {
    if (prevEnvHost !== undefined) {
      process.env.NEXT_PUBLIC_TOR_ONION_HOST = prevEnvHost;
    }
  }

  // Display formatting
  const display = formatOnionDisplay("http://jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion/read/bafy");
  assert(display === "jcqyihxqjo...m3jnqd.onion", "formatOnionDisplay produces expected truncated format");

  console.log("");
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log("🎉 All Tor v3 cryptographic address tests passed successfully!");
}

runTorCryptoTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
