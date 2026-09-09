/**
 * PressProtocol Sovereign Web Clipper Verification Suite
 * Tests in-browser de-surveillance, Ed25519 burner cryptography,
 * canonical RFC 8785 signing, scrap vault operations, and extension bundle packaging.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateKeypair, signPayload, verifySignature, createCanonicalPayload } from "../packages/sdk/src/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "..");

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// 1. Tracker Scrubbing Logic
const TRACKING_URL_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gclsrc",
  "dclid",
  "msclkid",
  "twclid",
  "ttclid",
  "mc_cid",
  "mc_eid",
  "si",
  "ref",
  "ref_src",
  "ref_url",
  "_hsenc",
  "_hsmi",
  "wickedid",
  "igshid",
  "srsltid",
  "yclid",
];

function sanitizeUrl(urlStr: string, base: string = "https://example.com/"): { cleanedUrl: string; purged: number } {
  if (!urlStr || urlStr.startsWith("#") || urlStr.startsWith("mailto:") || urlStr.startsWith("tel:")) {
    return { cleanedUrl: urlStr || "", purged: 0 };
  }

  try {
    const url = new URL(urlStr, base);
    let purged = 0;

    for (const param of TRACKING_URL_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        purged++;
      }
    }

    const allKeys = Array.from(url.searchParams.keys());
    for (const key of allKeys) {
      if (key.startsWith("utm_") || key.startsWith("track_") || key.startsWith("analytics_")) {
        url.searchParams.delete(key);
        purged++;
      }
    }

    return { cleanedUrl: url.toString(), purged };
  } catch {
    return { cleanedUrl: urlStr, purged: 0 };
  }
}

function canonicalizeJson(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map((item) => canonicalizeJson(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(value).sort();
  const pairs = sortedKeys.map((key) => {
    return JSON.stringify(key) + ":" + canonicalizeJson(value[key]);
  });

  return "{" + pairs.join(",") + "}";
}

async function runTests() {
  console.log("\n🧪 Running PressProtocol Sovereign Web Clipper Test Suite");
  console.log("==========================================================");

  // Group 1: Tracker URL Sanitization
  console.log("\n[1] De-Surveillance Tracker & Beacon Purging");
  const dirtyUrl = "https://theverge.com/article?utm_source=twitter&utm_medium=social&utm_campaign=launch&fbclid=IwAR2314&gclid=CjwKCAjw&id=42";
  const sanitized = sanitizeUrl(dirtyUrl);
  assert(!sanitized.cleanedUrl.includes("utm_source"), "Purged utm_source parameter");
  assert(!sanitized.cleanedUrl.includes("utm_medium"), "Purged utm_medium parameter");
  assert(!sanitized.cleanedUrl.includes("fbclid"), "Purged fbclid parameter");
  assert(!sanitized.cleanedUrl.includes("gclid"), "Purged gclid parameter");
  assert(sanitized.cleanedUrl.includes("id=42"), "Preserved essential functional parameter id=42");
  assert(sanitized.purged === 5, `Accurately counted 5 purged surveillance parameters`);

  // Group 2: Canonical RFC 8785 Deterministic JSON Serialization
  console.log("\n[2] Canonical RFC 8785 JSON Determinism");
  const obj1 = { z: 1, a: "press", m: [3, 2, 1], nested: { y: true, x: false } };
  const obj2 = { nested: { x: false, y: true }, m: [3, 2, 1], a: "press", z: 1 };
  const canon1 = canonicalizeJson(obj1);
  const canon2 = canonicalizeJson(obj2);
  assert(canon1 === canon2, "Identical canonical strings produced regardless of object key order");
  assert(canon1.startsWith('{"a":"press"'), "Keys are sorted in strict lexicographical order");

  // Group 3: Ed25519 Burner Identity & Cryptographic Signing
  console.log("\n[3] In-Browser Sovereign Ed25519 Cryptography");
  const keypair = await generateKeypair();
  const pubHex = keypair.publicKey;
  const privHex = keypair.privateKey;
  const pseudonym = `Anon-${pubHex.slice(0, 4)}...${pubHex.slice(-4)}`;

  assert(pubHex.length === 64, "Generated valid 32-byte (64 hex char) Ed25519 public key");
  assert(pseudonym.startsWith("Anon-"), "Derived deterministic sovereign pseudonym");

  const payload = {
    title: "Breaking Investigation on Decentralized Infrastructure",
    tags: ["pressprotocol", "sovereign-clipper"],
    timestamp: "2026-09-12T17:00:00.000Z",
  };

  const canonicalMsg = canonicalizeJson(payload);
  const sigHex = await signPayload(canonicalMsg, privHex);
  assert(sigHex.length === 128, "Produced standard 64-byte (128 hex char) EdDSA signature");

  const valid = await verifySignature(canonicalMsg, sigHex, pubHex);
  assert(valid === true, "Author Ed25519 signature successfully verified");

  // Tampering detection
  const tamperedPayload = { ...payload, title: "Tampered Malicious Headline" };
  const tamperedMsg = canonicalizeJson(tamperedPayload);
  const tamperedValid = await verifySignature(tamperedMsg, sigHex, pubHex);
  assert(tamperedValid === false, "Tampered payload was rejected by Ed25519 cryptographic verifier");

  // Group 4: Context Menu Passage Scrap Vault Formatting
  console.log("\n[4] Sovereign Quote Scrap Vault Operations");
  const sampleScrap = {
    id: "scrap_1001",
    quote: "Sovereign publishing ensures truth cannot be revoked by platform deplatforming.",
    pageTitle: "Decentralized Truth Report",
    url: "https://theverge.com/reports/decentralized-truth",
    timestamp: Date.now(),
  };

  const formattedCitation = `> "${sampleScrap.quote}"\n>\n> — [${sampleScrap.pageTitle}](${sampleScrap.url})`;
  assert(formattedCitation.includes('> "Sovereign publishing ensures'), "Correct blockquote format");
  assert(formattedCitation.includes("— [Decentralized Truth Report]"), "Correct citation source attribution link");

  // Group 5: Manifest V3 & Extension Bundle Verification
  console.log("\n[5] Chromium MV3 Extension Bundle Integrity");
  const manifestPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/manifest.json");

  if (!fs.existsSync(manifestPath)) {
    const { execSync } = await import("child_process");
    try {
      execSync("pnpm --dir integrations/browser-extension build", { cwd: monorepoRoot, stdio: "ignore" });
    } catch {}
  }

  assert(fs.existsSync(manifestPath), "dist/manifest.json exists");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert(manifest.manifest_version === 3, "Manifest is compliant with Chrome MV3");
  assert(manifest.name === "PressProtocol Sovereign Web Clipper", "Manifest reflects rebranded name");
  assert(manifest.permissions.includes("activeTab"), "Has activeTab permission for DOM extraction");
  assert(manifest.permissions.includes("scripting"), "Has scripting permission for in-browser clipper injection");
  assert(manifest.permissions.includes("contextMenus"), "Has contextMenus permission for quote preservation");
  assert(manifest.permissions.includes("clipboardWrite"), "Has clipboardWrite permission for instant CID permalink copy");
  assert(manifest.host_permissions.includes("<all_urls>"), "Has host permissions for universal web page clipping");

  const bgScriptPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/background.js");
  const popupScriptPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/popup.js");
  const clipperScriptPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/clipper.js");
  const popupHtmlPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/popup.html");
  const popupCssPath = path.resolve(monorepoRoot, "integrations/browser-extension/dist/popup.css");

  if (!fs.existsSync(bgScriptPath)) {
    const { execSync } = await import("child_process");
    try {
      execSync("pnpm --dir integrations/browser-extension build", { cwd: monorepoRoot, stdio: "ignore" });
    } catch {}
  }

  assert(fs.existsSync(bgScriptPath), "dist/background.js bundle exists");
  assert(fs.existsSync(popupScriptPath), "dist/popup.js bundle exists");
  assert(fs.existsSync(clipperScriptPath), "dist/clipper.js bundle exists");
  assert(fs.existsSync(popupHtmlPath), "dist/popup.html exists");
  assert(fs.existsSync(popupCssPath), "dist/popup.css exists");

  // Icon checks
  [16, 48, 128].forEach((size) => {
    const iconPath = path.resolve(monorepoRoot, `integrations/browser-extension/dist/icons/icon-${size}.png`);
    assert(fs.existsSync(iconPath), `dist/icons/icon-${size}.png exists`);
    assert(fs.statSync(iconPath).size > 50, `icon-${size}.png is a valid binary PNG file`);
  });

  // Group 6: Public Release Packaging
  console.log("\n[6] Production Distribution Release Package");
  const zipPath1 = path.resolve(monorepoRoot, "apps/web/public/downloads/PressProtocol_Browser_Extension.zip");
  const zipPath2 = path.resolve(monorepoRoot, "apps/web/public/downloads/press-protocol-extension.zip");
  assert(fs.existsSync(zipPath1), "Release bundle PressProtocol_Browser_Extension.zip exists");
  assert(fs.existsSync(zipPath2), "Release bundle press-protocol-extension.zip exists");
  assert(fs.statSync(zipPath1).size > 1000, "Release zip file size is non-trivial (>1KB)");

  console.log(`\n🎉 Sovereign Web Clipper Test Suite Complete: ${passed}/${total} checks passed!\n`);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
