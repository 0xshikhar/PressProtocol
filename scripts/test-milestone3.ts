import { scrubArticleHtml, sanitizeUrl } from "../apps/web/src/lib/scrubber";
import crypto from "crypto";
import fs from "fs";
import path from "path";

async function runTests() {
  console.log("🧪 Starting Milestone III: Universal CMS Adapters Test Suite...\n");
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

  // TEST 1: URL Sanitization
  console.log("🔹 1. Testing URL Sanitization & Tracking Parameter Stripping...");
  const dirtyUrl = "https://substack.com/post/12345?utm_source=twitter&utm_medium=social&utm_campaign=launch&fbclid=IwAR123&si=456&valid_param=keep_this#section-1";
  const { cleanedUrl, paramsPurged } = sanitizeUrl(dirtyUrl);
  assert(paramsPurged >= 5, `Purged ${paramsPurged} tracking params from dirty URL`);
  assert(!cleanedUrl.includes("utm_source"), "utm_source removed");
  assert(!cleanedUrl.includes("fbclid"), "fbclid removed");
  assert(!cleanedUrl.includes("si="), "si param removed");
  assert(cleanedUrl.includes("valid_param=keep_this"), "Legitimate query param preserved");
  assert(cleanedUrl.includes("#section-1"), "Anchor tag preserved");

  // TEST 2: HTML Surveillance & Tracker Stripping
  console.log("\n🔹 2. Testing Deep Surveillance Scrubber (Scripts, Pixels, Beacons, Inline Handlers)...");
  const dirtyHtml = `
    <article>
      <h1>Sovereign Manifesto</h1>
      <script src="https://googletagmanager.com/gtag/js?id=G-123"></script>
      <script>console.log("surveillance script active");</script>
      <noscript><img src="https://facebook.com/tr?id=123&ev=PageView" height="1" width="1" /></noscript>
      <p>This is legitimate editorial content that must be preserved.</p>
      <img src="https://google-analytics.com/collect?v=1" width="1" height="1" style="display:none" alt="tracking" />
      <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?utm_source=ad&w=800" alt="Cyberpunk city" />
      <iframe src="https://disqus.com/embed/comments"></iframe>
      <iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>
      <a href="https://example.com/source?utm_medium=email&ref=newsletter" onclick="trackClick(event)" data-analytics-event="cta_click">Read Source</a>
      <div class="subscription-widget-wrap">Subscribe for $10/mo</div>
      <p>Decentralization protects freedom of speech and sovereign identity.</p>
    </article>
  `;

  const { cleanHtml, telemetry } = scrubArticleHtml(dirtyHtml);

  assert(telemetry.scriptsPurged >= 2, `Purged ${telemetry.scriptsPurged} script tags`);
  assert(telemetry.trackingPixelsPurged >= 1, `Purged ${telemetry.trackingPixelsPurged} tracking pixels`);
  assert(telemetry.inlineHandlersPurged >= 1, `Purged ${telemetry.inlineHandlersPurged} inline onclick handlers`);
  assert(telemetry.trackingParamsPurged >= 2, `Purged ${telemetry.trackingParamsPurged} tracking URL params`);
  assert(telemetry.surveillanceElementsPurged >= 2, `Purged ${telemetry.surveillanceElementsPurged} surveillance elements (paywall, tracking iframe, etc.)`);
  assert(!cleanHtml.includes("<script"), "No script tags present in output HTML");
  assert(!cleanHtml.includes("googletagmanager"), "No Google Tag Manager present");
  assert(!cleanHtml.includes("onclick="), "No onclick handler present");
  assert(!cleanHtml.includes("data-analytics-event"), "No telemetry data-* attribute present");
  assert(!cleanHtml.includes("disqus.com"), "Surveillance iframe removed");
  assert(cleanHtml.includes("youtube-nocookie.com/embed"), "Safe video iframe preserved");
  assert(cleanHtml.includes("Sovereign Manifesto"), "Article title preserved");
  assert(cleanHtml.includes("Decentralization protects freedom"), "Editorial prose preserved");
  assert(cleanHtml.includes("images.unsplash.com"), "Legitimate image preserved with clean URL");
  assert(!cleanHtml.includes("utm_source=ad"), "Image src tracking params purged");

  // TEST 3: Ghost Webhook HMAC-SHA256 Signature Verification
  console.log("\n🔹 3. Testing Ghost CMS Webhook HMAC-SHA256 Verification & Replay Protection...");
  const secret = "ghost_super_secret_key_123456789";
  const now = Date.now();
  const sampleGhostBody = JSON.stringify({
    post: {
      current: {
        id: "ghost_post_1",
        title: "Ghost Syndicated Article",
        slug: "ghost-syndicated-article",
        html: "<p>Published from Ghost CMS with zero surveillance.</p>",
        tags: [{ name: "sovereignty" }, { name: "pressprotocol" }],
      },
    },
  });

  const payload = `${sampleGhostBody}${now}`;
  const validHash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const validSignatureHeader = `sha256=${validHash}, t=${now}`;

  // Helper function mirroring Ghost webhook signature verifier
  function verifyGhostSignature(rawBody: string, header: string, secretKey: string): boolean {
    const parts = header.split(",").reduce((acc: any, part) => {
      const [k, v] = part.trim().split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    const sig = parts["sha256"];
    const ts = parseInt(parts["t"], 10);
    if (!sig || isNaN(ts) || Math.abs(Date.now() - ts) > 10 * 60 * 1000) return false;

    const expected = crypto.createHmac("sha256", secretKey).update(`${rawBody}${ts}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  }

  assert(verifyGhostSignature(sampleGhostBody, validSignatureHeader, secret), "Valid Ghost signature accepted");
  assert(!verifyGhostSignature(sampleGhostBody, validSignatureHeader, "wrong_secret"), "Wrong secret rejected");
  assert(!verifyGhostSignature(sampleGhostBody + "tampered", validSignatureHeader, secret), "Tampered body rejected");

  const expiredTimestamp = now - 15 * 60 * 1000; // 15 mins ago
  const expiredPayload = `${sampleGhostBody}${expiredTimestamp}`;
  const expiredHash = crypto.createHmac("sha256", secret).update(expiredPayload).digest("hex");
  const expiredSignatureHeader = `sha256=${expiredHash}, t=${expiredTimestamp}`;
  assert(!verifyGhostSignature(sampleGhostBody, expiredSignatureHeader, secret), "Replayed/expired timestamp rejected");

  // TEST 4: WordPress Packaging & Distribution Verification
  console.log("\n🔹 4. Testing WordPress Plugin Distribution Artifacts...");
  const rootDir = process.cwd().endsWith("apps/web")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
  const wpZip1 = path.join(rootDir, "apps/web/public/downloads/PressProtocol_Wordpress_Plugin.zip");
  const wpZip2 = path.join(rootDir, "apps/web/public/downloads/press-protocol-wordpress.zip");

  assert(fs.existsSync(wpZip1), "PressProtocol_Wordpress_Plugin.zip exists in web downloads");
  assert(fs.existsSync(wpZip2), "press-protocol-wordpress.zip exists in web downloads");
  const stats1 = fs.statSync(wpZip1);
  assert(stats1.size > 10000, `WordPress plugin archive is valid size (${stats1.size} bytes)`);

  console.log(`\n🎉 All ${passed}/${total} Milestone III tests passed successfully!`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
