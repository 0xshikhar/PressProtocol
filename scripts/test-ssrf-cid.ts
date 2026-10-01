import { isValidCID, assertValidCID, calculateDeterministicCIDv1 } from "../core/node/src/lib/cid.js";
import {
  validateSafeUrl,
  isPrivateOrBlockedHost,
  isCloudMetadata,
  decodeMappedIpv4,
} from "../apps/web/src/lib/ssrf.js";

async function runTests() {
  console.log("🧪 Starting PressProtocol Security & CID Boundary Verification Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // =========================================================================
  // 1. Strict IPFS CID Validation & Parsing
  // =========================================================================
  console.log("🔹 1. Testing Strict IPFS CID Validation (v0 Base58btc & v1 Base32)...");

  // Valid CIDv0
  const validV0_1 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const validV0_2 = "QmZTMNxXVbvPqv6wmUvtT2GgahGarWBzMe2H524WmNoPrg";
  assert(isValidCID(validV0_1), "Recognizes valid CIDv0 (Qm...)");
  assert(isValidCID(validV0_2), "Recognizes valid CIDv0 variant (Qm...)");
  assert(assertValidCID(validV0_1) === validV0_1, "assertValidCID succeeds for valid CIDv0");

  // Valid CIDv1
  const validV1_1 = "bafybeicg2abbmanlpdqgahfvugqgahfvugqgahfvugqgahfvugqgahfvu";
  const validV1_2 = "bafkreifzjut3gte2nhydihxox7vp3nvdodman5w7mdq7gwttewgiuxzcz4";
  assert(isValidCID(validV1_1), "Recognizes valid CIDv1 (bafy...)");
  assert(isValidCID(validV1_2), "Recognizes valid CIDv1 (bafk...)");
  assert(assertValidCID(validV1_2) === validV1_2, "assertValidCID succeeds for valid CIDv1");

  // Rejection of Path Traversal
  console.log("\n🔹 2. Testing Injection & Path Traversal Rejection in CIDs...");
  assert(!isValidCID("../../../etc/passwd"), "Rejects Unix path traversal (../../etc/passwd)");
  assert(!isValidCID("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/../../secret"), "Rejects CID with path traversal segment");
  assert(!isValidCID("..\\..\\windows\\win.ini"), "Rejects Windows path traversal");

  // Rejection of URL Injection
  assert(!isValidCID("https://evil.com/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"), "Rejects URL prefix injection");
  assert(!isValidCID("bafybeicg2abbmanlpdqgahfvugqgahfvugqgahfvugqgahfvugqgahfvu?foo=bar"), "Rejects query parameters in CID");
  assert(!isValidCID("bafybeicg2abbmanlpdqgahfvugqgahfvugqgahfvugqgahfvugqgahfvu#hash"), "Rejects fragment identifiers in CID");

  // Rejection of generic alphanumeric strings that are NOT valid CIDs
  console.log("\n🔹 3. Testing Rejection of Generic Alphanumeric Fallback Strings...");
  const fakeAlnum = "a".repeat(46); // 46 chars alphanumeric, but doesn't start with Qm or baf
  assert(!isValidCID(fakeAlnum), "Rejects 46-char alphanumeric string without IPFS prefix");
  assert(!isValidCID("deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"), "Rejects hex hash strings");
  assert(!isValidCID(""), "Rejects empty CID string");
  assert(!isValidCID(null), "Rejects null CID");
  assert(!isValidCID(undefined), "Rejects undefined CID");
  assert(!isValidCID(12345), "Rejects numeric input as CID");

  // =========================================================================
  // 2. Deterministic CID Generation & Content Non-Collision
  // =========================================================================
  console.log("\n🔹 4. Testing Deterministic CID Generation & Non-Collision...");
  const cidA = calculateDeterministicCIDv1("First article about decentralization");
  const cidB = calculateDeterministicCIDv1("Second article about censorship resistance");
  const cidC = calculateDeterministicCIDv1("First article about decentralization"); // Duplicate content

  assert(isValidCID(cidA), "Deterministic CID A is a valid IPFS CID");
  assert(isValidCID(cidB), "Deterministic CID B is a valid IPFS CID");
  assert(cidA !== cidB, "Distinct articles produce DISTINCT CIDs (non-colliding digest)");
  assert(cidA === cidC, "Identical articles produce IDENTICAL CIDs (deterministic)");

  // =========================================================================
  // 3. SSRF URL Validation & Host Classification
  // =========================================================================
  console.log("\n🔹 5. Testing SSRF Unconditional Cloud Metadata & Hypervisor Firewalls...");

  // Cloud Hypervisor Metadata (Unconditionally blocked)
  assert(isCloudMetadata("169.254.169.254"), "Identifies AWS/OpenStack IPv4 metadata");
  assert(isCloudMetadata("169.254.1.1"), "Identifies general link-local metadata range (169.254.0.0/16)");
  assert(isCloudMetadata("100.100.100.200"), "Identifies Alibaba Cloud ECS metadata (100.100.100.200)");
  assert(isCloudMetadata("fd00:ec2::254"), "Identifies AWS Nitro IPv6 metadata (fd00:ec2::254)");
  assert(isPrivateOrBlockedHost("169.254.169.254"), "Blocks AWS metadata IP");
  assert(isPrivateOrBlockedHost("100.100.100.200"), "Blocks Alibaba ECS metadata IP");
  assert(isPrivateOrBlockedHost("[fd00:ec2::254]"), "Blocks AWS Nitro IPv6 metadata IP");
  assert(isPrivateOrBlockedHost("metadata.google.internal"), "Blocks Google Cloud metadata hostname");
  assert(isPrivateOrBlockedHost("metadata.google.internal."), "Blocks Google Cloud metadata hostname with trailing dot");
  assert(isPrivateOrBlockedHost("instance-data"), "Blocks OpenStack instance-data");

  // WHATWG Mapped IPv4 Addresses
  console.log("\n🔹 6. Testing Mapped IPv4/IPv6 Address Parsing...");
  const decodedMetaHex = decodeMappedIpv4("::ffff:a9fe:a9fe");
  assert(decodedMetaHex === "169.254.169.254", "Decodes WHATWG hex-mapped IPv6 metadata (::ffff:a9fe:a9fe -> 169.254.169.254)");
  assert(isPrivateOrBlockedHost("[::ffff:a9fe:a9fe]"), "Blocks hex-mapped cloud metadata IPv6");

  const decodedMetaDotted = decodeMappedIpv4("::ffff:169.254.169.254");
  assert(decodedMetaDotted === "169.254.169.254", "Decodes dotted-quad mapped IPv6 metadata");
  assert(isPrivateOrBlockedHost("[::ffff:169.254.169.254]"), "Blocks dotted-quad mapped cloud metadata IPv6");

  // URL Syntax & Protocol Validation
  console.log("\n🔹 7. Testing URL Syntax & Protocol Restriction...");

  function throwsExpected(fn: () => void, expectedText: string): boolean {
    try {
      fn();
      return false;
    } catch (e: any) {
      return typeof e?.message === "string" && e.message.toLowerCase().includes(expectedText.toLowerCase());
    }
  }

  assert(throwsExpected(() => validateSafeUrl("file:///etc/passwd"), "Forbidden protocol"), "Rejects file:/// protocol scheme");
  assert(throwsExpected(() => validateSafeUrl("ftp://ftp.example.com/file.txt"), "Forbidden protocol"), "Rejects ftp:// protocol scheme");
  assert(throwsExpected(() => validateSafeUrl("javascript:alert(1)"), "Forbidden protocol"), "Rejects javascript: scheme");
  assert(throwsExpected(() => validateSafeUrl("http://user:password@example.com/feed.xml"), "credentials"), "Rejects credential-bearing URLs (user:pass@host)");
  assert(throwsExpected(() => validateSafeUrl("http://example.com:0/feed.xml"), "Invalid destination port"), "Rejects port 0 (<1)");
  assert(throwsExpected(() => validateSafeUrl("http://example.com:70000/feed.xml"), "Invalid"), "Rejects out-of-range destination port (>65535)");
  assert(throwsExpected(() => validateSafeUrl("http://169.254.169.254/latest/meta-data"), "prohibited"), "Rejects direct cloud metadata fetch in validateSafeUrl");

  // Legitimate External URLs
  console.log("\n🔹 8. Testing Permitted Clearnet Targets...");
  const validUrl = validateSafeUrl("https://vitalik.eth.limo/general/2024/01/01/crypto.html");
  assert(validUrl.protocol === "https:", "Accepts legitimate HTTPS URL");
  assert(validUrl.hostname === "vitalik.eth.limo", "Preserves target hostname");

  console.log(`\n=================================================`);
  console.log(`🎉 All ${passed}/${total} Security & CID Verification Checks Passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
