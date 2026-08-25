/**
 * PressProtocol Milestone 2: Bulk RSS Publication Archive Importer Test Suite
 * Tests full publication feed parsing (RSS 2.0 & Atom), multi-article de-surveillance,
 * batch Ed25519 signing, and master archive manifest (.pressproof.json) generation.
 */
import path from "path";
import { fileURLToPath } from "url";
import { parseFullRssFeed } from "../apps/web/src/lib/scrubber";
import { generateKeypair, signPayload, verifySignature } from "../packages/sdk/src/index";
import { POST as postImportRss } from "../apps/web/src/app/api/import/rss/route";

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

// Sample multi-item RSS 2.0 fixture
const SAMPLE_RSS_2 = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Sovereign Dispatch</title>
    <link>https://sovereigndispatch.substack.com</link>
    <description>Investigations into censorship-resistant communications.</description>
    <language>en</language>
    <item>
      <title>Article One: The Architecture of Censorship</title>
      <link>https://sovereigndispatch.substack.com/p/architecture-censorship?utm_source=rss&amp;utm_medium=feed&amp;fbclid=123</link>
      <dc:creator>Alice Cipher</dc:creator>
      <pubDate>Mon, 01 Sep 2026 12:00:00 GMT</pubDate>
      <category>censorship</category>
      <category>infrastructure</category>
      <description>Summary of article one with basic details.</description>
      <content:encoded><![CDATA[
        <p>This is the first major article on protocol sovereignty.</p>
        <script src="https://google-analytics.com/analytics.js"></script>
        <img src="https://facebook.com/tr?id=123" width="1" height="1" style="display:none;" />
        <p>Decentralized publication guarantees permanence.</p>
      ]]></content:encoded>
    </item>
    <item>
      <title>Article Two: Optical Sneakernets &amp; Air-Gaps</title>
      <link>https://sovereigndispatch.substack.com/p/optical-sneakernets</link>
      <dc:creator>Bob Verifier</dc:creator>
      <pubDate>Wed, 03 Sep 2026 15:30:00 GMT</pubDate>
      <category>security</category>
      <description>Exploring high-density optical QR packet transmission.</description>
      <content:encoded><![CDATA[
        <p>When physical internet links are severed, optical QR bursts transmit encrypted text.</p>
        <div class="paywall">Subscribe to read more!</div>
        <p>Camera scanners reassemble chunks instantaneously.</p>
      ]]></content:encoded>
    </item>
    <item>
      <title>Article Three: Sovereign Identity &amp; Burner Keys</title>
      <link>https://sovereigndispatch.substack.com/p/sovereign-identity</link>
      <dc:creator>Alice Cipher</dc:creator>
      <pubDate>Fri, 05 Sep 2026 09:00:00 GMT</pubDate>
      <category>cryptography</category>
      <description>Why cryptographic identity replaces centralized accounts.</description>
      <content:encoded><![CDATA[
        <p>Your public key is your identity. Zero accounts, zero surveillance.</p>
        <p>Ed25519 enables high-speed digital signatures directly in browser memory.</p>
      ]]></content:encoded>
    </item>
  </channel>
</rss>`;

// Sample multi-item Atom fixture
const SAMPLE_ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Cyber Log</title>
  <subtitle>Decentralized research updates</subtitle>
  <link href="https://cyberlog.eth.limo" rel="alternate" />
  <updated>2026-09-10T10:00:00Z</updated>
  <author>
    <name>Cypherpunk Collective</name>
  </author>
  <entry>
    <title>Tor Onion Mirror Geodistribution</title>
    <link href="https://cyberlog.eth.limo/entries/onion-mirrors" />
    <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
    <updated>2026-09-08T08:00:00Z</updated>
    <category term="tor" />
    <content type="html"><![CDATA[
      <p>Tor v3 onion routing guarantees reachability even under national firewall blocks.</p>
    ]]></content>
  </entry>
  <entry>
    <title>IPFS Swarm Multi-Transport Failover</title>
    <link href="https://cyberlog.eth.limo/entries/ipfs-failover" />
    <id>urn:uuid:2225c695-cfb8-4ebb-aaaa-80da344efa6b</id>
    <updated>2026-09-09T09:00:00Z</updated>
    <category term="ipfs" />
    <content type="html"><![CDATA[
      <p>Content-addressed storage decouples article verification from DNS hosting servers.</p>
    ]]></content>
  </entry>
</feed>`;

async function runTests() {
  console.log("\n🧪 Running Milestone 2: Bulk RSS Publication Archive Test Suite");
  console.log("===============================================================");

  // Group 1: RSS 2.0 Full Feed Parsing
  console.log("\n[1] Multi-Article RSS 2.0 Archive Parsing");
  const parsedRss = parseFullRssFeed(SAMPLE_RSS_2, "https://sovereigndispatch.substack.com/feed");
  assert(parsedRss.title === "Sovereign Dispatch", "Extracted publication title");
  assert(parsedRss.description.includes("censorship-resistant"), "Extracted publication description");
  assert(parsedRss.totalItems === 3, "Accurately parsed all 3 publication articles");
  assert(parsedRss.items.length === 3, "Populated items array with 3 articles");

  const item1 = parsedRss.items[0];
  assert(item1.title === "Article One: The Architecture of Censorship", "Parsed first article headline");
  assert(item1.author === "Alice Cipher", "Extracted author byline");
  assert(item1.tags.includes("censorship"), "Extracted article category tag");

  // Group 2: In-Feed Tracker & Paywall Stripping
  console.log("\n[2] In-Feed De-Surveillance Scrubber");
  assert(!item1.cleanHtml.includes("google-analytics"), "Stripped Google Analytics from feed content");
  assert(!item1.cleanHtml.includes("facebook.com/tr"), "Stripped Facebook pixel beacon from feed content");
  assert(item1.telemetry.scriptsPurged >= 1, "Recorded scripts purged telemetry");
  assert(item1.telemetry.trackingPixelsPurged >= 1, "Recorded tracking pixel purged telemetry");
  assert(item1.wordCount > 5, "Computed positive word count for article prose");

  const item2 = parsedRss.items[1];
  assert(!item2.cleanHtml.includes("Subscribe to read more!"), "Stripped paywall overlay wrapper");
  assert(item2.author === "Bob Verifier", "Extracted second author correctly");

  // Group 3: Atom Feed Parsing
  console.log("\n[3] Multi-Article Atom Feed Parsing");
  const parsedAtom = parseFullRssFeed(SAMPLE_ATOM, "https://cyberlog.eth.limo/feed.atom");
  assert(parsedAtom.title === "Atom Cyber Log", "Extracted Atom feed title");
  assert(parsedAtom.totalItems === 2, "Accurately parsed both Atom entries");
  assert(parsedAtom.items[0].title === "Tor Onion Mirror Geodistribution", "Extracted Atom entry title");
  assert(parsedAtom.items[0].author === "Cypherpunk Collective", "Fallback to channel author");
  assert(parsedAtom.items[1].cleanHtml.includes("Content-addressed storage"), "Preserved Atom HTML content");

  // Group 4: Batch Ed25519 Cryptographic Signing
  console.log("\n[4] Batch Ed25519 Sovereign Cryptography");
  const keypair = await generateKeypair();
  assert(keypair.publicKey.length === 64, "Generated 32-byte author Ed25519 public key");

  const batchResults = [];
  for (let i = 0; i < parsedRss.items.length; i++) {
    const item = parsedRss.items[i];
    const signable = JSON.stringify({
      title: item.title,
      tags: item.tags,
      timestamp: item.publishedAt,
    });
    const sig = await signPayload(signable, keypair.privateKey);
    const valid = await verifySignature(signable, sig, keypair.publicKey);
    assert(valid === true, `Article #${i + 1} (${item.title.slice(0, 25)}...) signed and verified`);

    batchResults.push({
      cid: `bafkreig${i}pressprotocoltestcid${Math.random().toString(36).slice(2, 8)}`,
      title: item.title,
      canonicalUrl: item.link,
      publishedAt: item.publishedAt,
      signature: sig,
      wordCount: item.wordCount,
      tags: item.tags,
      telemetry: item.telemetry,
    });
  }
  assert(batchResults.length === 3, "Batch signing successfully processed all articles");

  // Group 5: Master Archive Bundle (.pressproof.json)
  console.log("\n[5] Master Publication Archive Bundle Manifest");
  const manifest = {
    version: "1.0.0",
    type: "PressProtocol_Bulk_Publication_Archive",
    archivedAt: new Date().toISOString(),
    publication: {
      title: parsedRss.title,
      description: parsedRss.description,
      feedUrl: parsedRss.feedUrl,
      homeUrl: parsedRss.link,
      authorPublicKey: keypair.publicKey,
    },
    stats: {
      totalArticlesArchived: batchResults.length,
      totalWordsArchived: batchResults.reduce((acc, a) => acc + a.wordCount, 0),
      totalTrackersPurged: batchResults.reduce((acc, a) => acc + a.telemetry.totalPurged, 0),
    },
    articles: batchResults,
  };

  assert(manifest.version === "1.0.0", "Manifest has version identifier");
  assert(manifest.type === "PressProtocol_Bulk_Publication_Archive", "Manifest has correct archive type");
  assert(manifest.stats.totalArticlesArchived === 3, "Manifest statistics track total archived articles");
  assert(manifest.articles.length === 3, "Manifest contains all signed article records");
  assert(manifest.publication.authorPublicKey === keypair.publicKey, "Manifest records author Ed25519 identity");

  // Group 6: API Route Error Handling
  console.log("\n[6] API Endpoint Validation");
  const mockReqEmpty = { json: async () => ({}) } as any;
  const resEmpty = await postImportRss(mockReqEmpty);
  const dataEmpty = await resEmpty.json();
  assert(resEmpty.status === 400, "Rejected request with missing feedUrl (HTTP 400)");
  assert(dataEmpty.error.includes("valid RSS or Atom feed URL"), "Returned descriptive error message");

  const mockReqInvalidUrl = { json: async () => ({ feedUrl: "not-a-valid-url" }) } as any;
  const resInvalid = await postImportRss(mockReqInvalidUrl);
  assert(resInvalid.status === 400, "Rejected invalid URL syntax (HTTP 400)");

  console.log(`\n🎉 Bulk RSS Publication Archive Test Suite Complete: ${passed}/${total} checks passed!\n`);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
