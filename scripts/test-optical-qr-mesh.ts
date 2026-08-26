/**
 * PressProtocol Test Suite: Optical QR Codec & Delay-Tolerant Mesh Reassembly
 * 
 * Verifies:
 * 1. High-Density Optical QR Chunking (maxChunkSize parameterization)
 * 2. PPQR Packet Header Formatting (PPQR:1:<index>:<total>:<data>)
 * 3. Individual QR Packet Parsing & Boundary Validation
 * 4. Out-of-Order Packet Reassembly (Reverse, Shuffled)
 * 5. Partial Scan & Missing Chunk Index Detection
 * 6. Cryptographic Payload Integrity after Optical Reassembly
 */

import {
  splitIntoQrPackets,
  parseQrPacket,
  reassembleQrPackets,
  exportPressProof,
  calculateDeterministicCIDv1,
} from "../packages/proof/src/index";
import { generateKeypair, signPayload, createCanonicalPayload } from "../packages/sdk/src/index";

async function runTests() {
  console.log("🧪 Starting Optical QR Codec & Delay-Tolerant Mesh Test Suite...\n");
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

  // Setup authentic signed payload
  const authorKeypair = await generateKeypair();
  const timestamp = new Date().toISOString();
  const title = "Air-Gapped Whistleblower Optical Transmission";
  const tags = ["optical", "qr-mesh", "delay-tolerant"];
  const content = "This is a confidential optical transmission broadcast via sequential high-density animated QR codes. It travels across physical air-gaps without any radio, cellular, WiFi, or Bluetooth emissions.";
  const canonicalPayload = createCanonicalPayload(title, tags, timestamp);
  const signature = await signPayload(canonicalPayload, authorKeypair.privateKey);
  const cid = calculateDeterministicCIDv1(content);

  const proof = exportPressProof({
    title,
    content,
    tags,
    timestamp,
    publisher: {
      publicKey: authorKeypair.publicKey,
      signature,
      username: "Sovereign Mesh Node",
      isAnonymous: true,
    },
  });

  const manifestJson = JSON.stringify(proof);

  // TEST 1: Optical QR Packet Chunking
  console.log("🔹 1. Testing Optical QR Packet Chunking & Header Protocol...");
  const packets = splitIntoQrPackets(manifestJson, { maxChunkSize: 120 });
  assert(packets.length >= 3, `Split ${manifestJson.length} bytes into ${packets.length} optical QR packets (chunk size: 120 bytes)`);

  // Verify packet formatting
  assert(packets[0].raw.startsWith("PPQR:1:"), "Packet conforms to PPQR:1: protocol header");
  assert(packets[0].total === packets.length, "Packet header total matches generated packet count");
  assert(packets[0].index === 1, "First packet index is 1 (1-indexed protocol)");

  // TEST 2: Parsing Individual QR Packets
  console.log("\n🔹 2. Testing QR Packet Parser & Header Deconstruction...");
  const parsedFirst = parseQrPacket(packets[0].raw);
  assert(parsedFirst !== null, "Successfully parsed raw QR packet");
  assert(parsedFirst?.index === 1, "Parsed packet index is 1");
  assert(parsedFirst?.total === packets.length, "Parsed packet total matches total packets");
  assert(parsedFirst?.chunk.length > 0, `Parsed chunk data payload extracted (${parsedFirst?.chunk.length} chars)`);

  // Invalid packet handling
  const invalidPacket = parseQrPacket("CORRUPTED_NON_PPQR_SCAN_DATA");
  assert(invalidPacket === null, "Malformed/corrupted scan string safely returned null without throwing");

  // TEST 3: In-Order Packet Reassembly
  console.log("\n🔹 3. Testing Sequential Packet Reassembly...");
  const sequentialReassembly = reassembleQrPackets(packets);
  assert(sequentialReassembly.complete === true, "Sequential scan successfully completed");
  assert(sequentialReassembly.payload === manifestJson, "Reassembled payload exactly matches original manifest string");
  assert(sequentialReassembly.missingIndices.length === 0, "No missing indices in complete sequential scan");

  // TEST 4: Out-of-Order Packet Reassembly (Simulating Camera Ingest)
  console.log("\n🔹 4. Testing Out-of-Order & Reversed Packet Reassembly...");
  const reversedPackets = [...packets].reverse();
  const reversedReassembly = reassembleQrPackets(reversedPackets);
  assert(reversedReassembly.complete === true, "Reversed packets successfully reassembled into complete payload");
  assert(reversedReassembly.payload === manifestJson, "Reassembled payload byte-for-byte identical to original manifest");

  // Shuffled packets
  const shuffledPackets = [...packets].sort(() => Math.random() - 0.5);
  const shuffledReassembly = reassembleQrPackets(shuffledPackets);
  assert(shuffledReassembly.complete === true, "Randomly shuffled packets successfully reassembled");
  assert(shuffledReassembly.payload === manifestJson, "Shuffled reassembly byte-for-byte identical");

  // TEST 5: Incomplete / Dropped Frame Detection
  console.log("\n🔹 5. Testing Incomplete Scan & Missing Frame Index Detection...");
  // Drop index 2 and index 3
  const droppedIndices = [2, 3];
  const partialPackets = packets.filter(p => !droppedIndices.includes(p.index));
  const partialReassembly = reassembleQrPackets(partialPackets);

  assert(partialReassembly.complete === false, "Partial scan correctly reported incomplete (complete: false)");
  assert(partialReassembly.receivedCount === packets.length - droppedIndices.length, "Accurately reports received chunk count");
  assert(partialReassembly.missingIndices.includes(2), "Correctly identified missing frame index 2");
  assert(partialReassembly.missingIndices.includes(3), "Correctly identified missing frame index 3");

  // TEST 6: Cryptographic Payload Re-Validation
  console.log("\n🔹 6. Testing End-to-End Cryptographic Validation of Reassembled Payload...");
  const parsedManifest = JSON.parse(reversedReassembly.payload!);
  assert(parsedManifest.cid === cid, "Reassembled manifest preserves exact deterministic CIDv1");
  assert(parsedManifest.publisher.signature === signature, "Reassembled manifest preserves exact author signature");

  console.log(`\n🎉 All ${passed}/${total} Optical QR Codec & Mesh tests passed successfully!`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
