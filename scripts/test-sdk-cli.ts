import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  generateKeypairSync,
  signPayload,
  createCanonicalPayload,
  calculateDeterministicCIDv1,
  sha256Hex,
} from "../packages/sdk/src/crypto.js";

const packageUrl = new URL("../packages/sdk/package.json", import.meta.url);
const { version } = JSON.parse(readFileSync(packageUrl, "utf8"));
const loader = createRequire(packageUrl).resolve("tsx");
const cli = fileURLToPath(new URL("../packages/sdk/src/bin/cli.ts", import.meta.url));

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", loader, cli, ...args], {
    cwd: tmpdir(),
    encoding: "utf8",
    timeout: 10_000,
  });
}

for (const flag of ["--version", "-v"]) {
  test(`${flag} prints the SDK version from another working directory`, () => {
    const result = runCli([flag]);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.equal(result.stdout.trim(), `pressprotocol v${version}`);
  });
}

test("help documents both version flags", () => {
  const result = runCli(["--help"]);
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--version, -v\s+Show/);
});

test("help documents verify command and options", () => {
  const result = runCli(["--help"]);
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /verify.*<cid \| file\.json>\s+Verify cryptographic signature/);
  assert.match(result.stdout, /--strict\s+Enforce strict signature requirement/);
});

test("verify command fails when no argument is supplied", () => {
  const result = runCli(["verify"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing required argument <cid \| file\.json>/);
});

test("verify command fails when specified file does not exist", () => {
  const result = runCli(["verify", "non-existent-proof.json"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /File not found/);
});

test("verify command validates authentic .pressproof.json air-gapped manifest", async () => {
  const content = "# Whistleblower Archive\n\nImmutable leak documentation.";
  const title = "Whistleblower Archive";
  const tags = ["leak", "journalism"];
  const timestamp = "2026-09-28T00:00:00.000Z";
  const keypair = generateKeypairSync();
  const canonical = createCanonicalPayload(title, tags, timestamp);
  const signature = await signPayload(canonical, keypair.privateKey);
  const cid = calculateDeterministicCIDv1(content);
  const sha256 = sha256Hex(content);

  const proof = {
    version: "1.0.0",
    protocol: "PressProtocol",
    standard: "RFC-8032-CIDv1",
    cid,
    title,
    content,
    tags,
    timestamp,
    publisher: {
      publicKey: keypair.publicKey,
      signature,
    },
    checksum: {
      sha256,
      byteSize: new TextEncoder().encode(content).length,
    },
    offlinePreservedAt: timestamp,
  };

  const tempPath = join(tmpdir(), `test-proof-${Date.now()}.pressproof.json`);
  writeFileSync(tempPath, JSON.stringify(proof, null, 2), "utf8");

  try {
    const result = runCli(["verify", tempPath]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Cryptographically Verified Sovereign Proof/);
    assert.match(result.stdout, /Matches deterministic CID/);
    assert.match(result.stdout, /Checksum intact/);
    assert.match(result.stdout, /Authentic Author Signature/);
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {}
  }
});

test("verify command supports --json output with structured audit fields", async () => {
  const content = "# Encrypted Ledger\n\nPublic verification manifest.";
  const title = "Encrypted Ledger";
  const tags = ["audit"];
  const timestamp = "2026-09-28T01:00:00.000Z";
  const keypair = generateKeypairSync();
  const canonical = createCanonicalPayload(title, tags, timestamp);
  const signature = await signPayload(canonical, keypair.privateKey);
  const cid = calculateDeterministicCIDv1(content);
  const sha256 = sha256Hex(content);

  const proof = {
    version: "1.0.0",
    protocol: "PressProtocol",
    cid,
    title,
    content,
    tags,
    timestamp,
    publisher: {
      publicKey: keypair.publicKey,
      signature,
    },
    checksum: {
      sha256,
      byteSize: new TextEncoder().encode(content).length,
    },
  };

  const tempPath = join(tmpdir(), `test-json-${Date.now()}.pressproof.json`);
  writeFileSync(tempPath, JSON.stringify(proof, null, 2), "utf8");

  try {
    const result = runCli(["verify", tempPath, "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.verified, true);
    assert.equal(parsed.signatureValid, true);
    assert.equal(parsed.cidMatches, true);
    assert.equal(parsed.checksumMatches, true);
    assert.equal(parsed.cid, cid);
    assert.equal(parsed.status, "verified");
    assert.equal(parsed.publicKey, keypair.publicKey);
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {}
  }
});

test("verify command detects tampered content and exits with code 1", async () => {
  const content = "Original sovereign content.";
  const title = "Original";
  const timestamp = "2026-09-28T00:00:00.000Z";
  const keypair = generateKeypairSync();
  const canonical = createCanonicalPayload(title, [], timestamp);
  const signature = await signPayload(canonical, keypair.privateKey);
  const cid = calculateDeterministicCIDv1(content);
  const sha256 = sha256Hex(content);

  const proof = {
    version: "1.0.0",
    protocol: "PressProtocol",
    cid,
    title,
    content: "Tampered content by adversary.",
    tags: [],
    timestamp,
    publisher: {
      publicKey: keypair.publicKey,
      signature,
    },
    checksum: {
      sha256,
      byteSize: 64,
    },
  };

  const tempPath = join(tmpdir(), `test-tampered-${Date.now()}.pressproof.json`);
  writeFileSync(tempPath, JSON.stringify(proof, null, 2), "utf8");

  try {
    const result = runCli(["verify", tempPath]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Proof Tampering Detected/);
    assert.match(result.stdout, /CID mismatch/);
    assert.match(result.stdout, /Checksum mismatch/);
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {}
  }
});

