/**
 * PressProtocol Test Suite: Air-Gapped Proofs & Offline Cryptographic Verification
 * 
 * Verifies:
 * 1. RFC 4648 Base32 Multibase Encoder & Decoder
 * 2. Deterministic In-Browser / Node CIDv1 Multihash Computation
 * 3. Air-Gapped .pressproof.json Manifest Packaging & Offline Cryptographic Verifier
 * 4. Tamper Resistance & Threat Model Defense (Payload mutation, forged Ed25519 signatures)
 * 5. Wayback Machine Dual-Preservation Hook (/api/archive)
 */

import {
  calculateDeterministicCIDv1,
  exportPressProof,
  verifyPressProof,
  base32Encode,
  base32Decode,
} from "../packages/proof/src/index";
import { generateKeypair, signPayload, createCanonicalPayload } from "../packages/sdk/src/index";
import { POST as postArchive } from "../apps/web/src/app/api/archive/route";

async function runTests() {
  console.log("🧪 Starting Air-Gapped Proofs & Offline Cryptographic Verification Test Suite...\n");
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

  // TEST 1: Base32 Multibase Codec
  console.log("🔹 1. Testing RFC 4648 Base32 Multibase Encoder & Decoder...");
  const sampleData = new Uint8Array([1, 85, 18, 32, 240, 15, 200, 45, 99]);
  const encoded = base32Encode(sampleData);
  const decoded = base32Decode(encoded);
  assert(encoded.length > 0, `Base32 encoded string: ${encoded}`);
  assert(
    decoded.length === sampleData.length && decoded.every((val, i) => val === sampleData[i]),
    "Base32 roundtrip decode exactly preserved byte sequence"
  );

  // TEST 2: Deterministic In-Browser CIDv1 Multihash Computation
  console.log("\n🔹 2. Testing Deterministic In-Browser CIDv1 Calculation...");
  const contentA = "Sovereign publishing ensures censorship resistance across decentralized networks.";
  const cidA1 = calculateDeterministicCIDv1(contentA);
  const cidA2 = calculateDeterministicCIDv1(contentA);

  assert(cidA1.startsWith("bafk"), `Calculated standard raw-codec IPFS CIDv1: ${cidA1}`);
  assert(cidA1 === cidA2, "Deterministic calculation is 100% repeatable for identical content");

  const contentB = "Sovereign publishing ensures censorship resistance across decentralized networks!"; // 1 char changed
  const cidB = calculateDeterministicCIDv1(contentB);
  assert(cidA1 !== cidB, "Cryptographic avalanche effect: 1 character change completely alters CIDv1");

  // TEST 3: Standalone .pressproof.json Export & Offline Verification
  console.log("\n🔹 3. Testing Air-Gapped .pressproof.json Manifest Packaging & Cryptographic Verifier...");
  const authorKeypair = await generateKeypair();
  const timestamp = new Date().toISOString();
  const title = "Air-Gapped Whistleblower Dossier";
  const tags = ["whistleblower", "airgap", "cryptography"];
  const canonicalPayload = createCanonicalPayload(title, tags, timestamp);
  const signature = await signPayload(canonicalPayload, authorKeypair.privateKey);

  const proof = exportPressProof({
    title,
    content: contentA,
    tags,
    timestamp,
    publisher: {
      publicKey: authorKeypair.publicKey,
      signature,
      username: "Sovereign Deepthroat",
      isAnonymous: true,
    },
  });

  assert(proof.version === "1.0.0", "Proof version is 1.0.0");
  assert(proof.protocol === "PressProtocol", "Protocol identifier is PressProtocol");
  assert(proof.standard === "RFC-8032-CIDv1", "Standard is RFC-8032-CIDv1");
  assert(proof.cid === cidA1, "Proof manifest contains verified deterministic CIDv1");
  assert(typeof proof.checksum.sha256 === "string", "Proof manifest includes content SHA-256 checksum");

  // Verify authentic proof offline
  const verification = await verifyPressProof(proof);
  assert(verification.valid === true, "Valid proof passed complete offline verification");
  assert(verification.checksumMatches === true, "Content SHA-256 checksum verified offline");
  assert(verification.cidMatches === true, "Deterministic CIDv1 multihash verified offline");
  assert(verification.signatureValid === true, "Author Ed25519 signature verified offline in-memory");
  assert(verification.status === "verified", "Verification status is 'verified'");
  assert(verification.latencyMs < 50, `Offline verification latency SLA met (${verification.latencyMs}ms < 50ms)`);

  // TEST 4: Tamper Resistance in Air-Gapped Verification
  console.log("\n🔹 4. Testing Tamper Resistance & Threat Model Defense in Offline Verification...");
  const tamperedContentProof = {
    ...proof,
    content: contentA + " [MODIFIED BY MALICIOUS INTERMEDIARY]",
  };
  const tamperedCheck = await verifyPressProof(tamperedContentProof);
  assert(tamperedCheck.valid === false, "Tampered content payload was detected and rejected");
  assert(tamperedCheck.status === "checksum_mismatch", "Correctly identified 'checksum_mismatch' status");

  const tamperedSigProof = {
    ...proof,
    publisher: {
      ...proof.publisher,
      signature: signature.slice(0, -4) + "0000",
    },
  };
  const tamperedSigCheck = await verifyPressProof(tamperedSigProof);
  assert(tamperedSigCheck.valid === false, "Forged Ed25519 signature was rejected");
  assert(tamperedSigCheck.status === "signature_invalid", "Correctly identified 'signature_invalid' status");

  // TEST 5: Wayback Machine Dual-Preservation Hook
  console.log("\n🔹 5. Testing Wayback Machine Dual-Preservation API Route (/api/archive)...");
  const archiveReq = new Request("http://localhost:3000/api/archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cid: cidA1,
      targetUrl: `https://pressprotocol.com/read/${cidA1}`,
    }),
  });

  const archiveRes = await postArchive(archiveReq as any);
  assert(archiveRes.status === 200, "HTTP 200 returned from /api/archive");

  const archiveData = await archiveRes.json();
  assert(archiveData.success === true, "archiveData.success is true");
  assert(archiveData.cid === cidA1, "Returns preserved CID");
  assert(archiveData.waybackSaveUrl.includes("web.archive.org/save/"), "Dispatches to Wayback Save Page Now URL");
  assert(archiveData.waybackLookupUrl.includes("web.archive.org/web/*/"), "Provides persistent Wayback lookup mirror");
  assert(["saved", "queued", "fallback"].includes(archiveData.status), `Archive status is valid: ${archiveData.status}`);

  console.log(`\n🎉 All ${passed}/${total} Air-Gapped Proof & Offline Cryptographic tests passed successfully!`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
