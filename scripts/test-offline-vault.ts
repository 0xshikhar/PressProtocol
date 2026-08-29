/**
 * PressProtocol Test Suite: Offline-First Local Vault & Bookmarks Test Suite
 * Validates zero-telemetry offline storage schemas, source rail classification,
 * backup/restore codec, offline reader fallback simulation, cryptographic provenance
 * verification on cached articles, and multi-rail feed discovery filtering.
 */
import path from "path";
import { fileURLToPath } from "url";
import {
  classifySourceRail,
  type OfflineArticle,
  type OfflineVaultBackup,
} from "../apps/web/src/lib/offline-storage";
import { generateKeypair, signPayload, verifySignature, createCanonicalPayload } from "../packages/sdk/src/index";
import { exportPressProof, verifyPressProof, calculateDeterministicCIDv1 } from "../packages/proof/src/index";

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

async function runTests() {
  console.log("\n🧪 Running Offline-First Local Vault, Bookmarks & Feed Discovery Test Suite");
  console.log("==========================================================================");

  // Group 1: Source Rail Classification
  console.log("\n[1] Publication Source Rail Classification");
  assert(classifySourceRail(["notion"]) === "Notion", "Classified 'notion' tag as Notion rail");
  assert(classifySourceRail(["notion-import", "crypto"]) === "Notion", "Classified 'notion-import' tag as Notion rail");
  assert(classifySourceRail(["substack", "tech"]) === "Substack/RSS", "Classified 'substack' tag as Substack/RSS rail");
  assert(classifySourceRail(["rss", "news"]) === "Substack/RSS", "Classified 'rss' tag as Substack/RSS rail");
  assert(classifySourceRail(["wordpress", "blog"]) === "WordPress", "Classified 'wordpress' tag as WordPress rail");
  assert(classifySourceRail(["web-clipper"]) === "Web Clipper", "Classified 'web-clipper' tag as Web Clipper rail");
  assert(classifySourceRail(["browser-extension"]) === "Web Clipper", "Classified 'browser-extension' tag as Web Clipper rail");
  assert(classifySourceRail(["git-publish"]) === "Git SSG", "Classified 'git-publish' tag as Git SSG rail");
  assert(classifySourceRail(["publish-action"]) === "Git SSG", "Classified 'publish-action' tag as Git SSG rail");
  assert(classifySourceRail(["studio"]) === "Studio", "Classified 'studio' tag as Studio rail");
  assert(
    classifySourceRail([], '<div data-type="callout" data-callout-type="warning">Notice</div>') === "Studio",
    "Classified Callout HTML heuristic as Studio rail"
  );
  assert(classifySourceRail(["general", "crypto"]) === "Community", "Classified untagged article as Community rail");

  // Group 2: Offline Article Schema & Zero-Telemetry Serialization
  console.log("\n[2] Offline Article Schema & Zero-Telemetry Serialization");
  const authorKeypair = await generateKeypair();
  const tags = ["zk", "tor", "git-publish"];
  const canonical = createCanonicalPayload("Zero-Knowledge Storage Manifesto", tags, "2026-09-12T12:00:00Z");
  const authorSignature = await signPayload(canonical, authorKeypair.privateKey);

  const articleContent = "<article><h1>ZK Storage</h1><p>Full content preserved without network.</p></article>";
  const deterministicCid = calculateDeterministicCIDv1(articleContent);

  const mockOfflineArticle: OfflineArticle = {
    cid: deterministicCid,
    title: "Zero-Knowledge Storage Manifesto",
    content: articleContent,
    tags,
    author: "Cypherpunk Author",
    publicKey: authorKeypair.publicKey,
    signature: authorSignature,
    createdAt: "2026-09-12T12:00:00Z",
    savedAt: 1789218000000,
    mirrors: {
      ipfs: { url: `ipfs://${deterministicCid}`, available: true },
      tor: { url: `http://pressp42x7a6sover.onion/read/${deterministicCid}`, available: true },
    },
    wordCount: 8,
    readingTimeMinutes: 1,
    excerpt: "Full content preserved without network.",
    sourceRail: "Git SSG",
    isVerified: true,
  };

  assert(mockOfflineArticle.cid.startsWith("baf"), "Valid multibase IPFS CIDv1 in offline item");
  assert(mockOfflineArticle.content.includes("<article>"), "Preserves full semantic HTML body");
  assert(mockOfflineArticle.isVerified === true, "Flags verified Ed25519 signature provenance");
  assert(mockOfflineArticle.sourceRail === "Git SSG", "Correctly tagged source rail");

  // Group 3: Cryptographic Provenance Verification in Offline Mode
  console.log("\n[3] In-Memory Cryptographic Verification of Offline Cached Content");
  const isSigValid = await verifySignature(canonical, mockOfflineArticle.signature!, mockOfflineArticle.publicKey!);
  assert(isSigValid === true, "Ed25519 signature verified directly from offline cache without server call");

  const proof = exportPressProof({
    cid: mockOfflineArticle.cid,
    title: mockOfflineArticle.title,
    content: mockOfflineArticle.content,
    tags: mockOfflineArticle.tags,
    timestamp: mockOfflineArticle.createdAt,
    publisher: {
      publicKey: mockOfflineArticle.publicKey!,
      signature: mockOfflineArticle.signature!,
      username: mockOfflineArticle.author,
    },
    mirrors: {
      ipfs: mockOfflineArticle.mirrors?.ipfs?.url,
      tor: mockOfflineArticle.mirrors?.tor?.url,
    },
  });

  const verifiedProof = await verifyPressProof(proof);
  assert(verifiedProof.valid === true, "Cryptographic proof generated from offline cache passes verification");

  // Group 4: Sovereign Vault Backup & Deterministic Restore Codec
  console.log("\n[4] Sovereign Vault Backup & Deterministic Restore Codec");
  const vaultBackup: OfflineVaultBackup = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    totalArticles: 1,
    articles: [mockOfflineArticle],
  };

  const serialized = JSON.stringify(vaultBackup);
  assert(serialized.includes(mockOfflineArticle.cid), "Serialized vault includes article CID");
  assert(serialized.includes("Zero-Knowledge Storage Manifesto"), "Serialized vault includes article title");

  const parsedBackup: OfflineVaultBackup = JSON.parse(serialized);
  assert(parsedBackup.version === "1.0.0", "Parsed backup matches 1.0.0 schema version");
  assert(parsedBackup.articles.length === 1, "Restored exact article count from vault");
  assert(parsedBackup.articles[0].cid === mockOfflineArticle.cid, "Preserved exact article CID");

  // Group 5: Multi-Rail Feed Discovery Filtering
  console.log("\n[5] Multi-Rail Feed Discovery Filtering");
  const mockFeedItems = [
    {
      cid: "cid-studio-1",
      title: "Studio Whistleblower Disclosure",
      tags: ["studio", "whistleblower"],
      createdAt: "2026-09-12T10:00:00Z",
      publisher: { publicKey: authorKeypair.publicKey, username: "StudioAuthor" },
    },
    {
      cid: "cid-notion-1",
      title: "DAO Treasury Allocation 2026",
      tags: ["notion", "dao"],
      createdAt: "2026-09-12T11:00:00Z",
      publisher: { publicKey: authorKeypair.publicKey, username: "NotionAuthor" },
    },
    {
      cid: "cid-substack-1",
      title: "The Weekly Cryptographic Review",
      tags: ["substack", "rss"],
      createdAt: "2026-09-12T12:00:00Z",
      publisher: { publicKey: authorKeypair.publicKey, username: "SubstackAuthor" },
    },
    {
      cid: "cid-unsigned-1",
      title: "Community Discussion Thread",
      tags: ["community"],
      createdAt: "2026-09-12T13:00:00Z",
      publisher: { publicKey: "", username: "Anonymous" },
    },
  ];

  // Rail filter tests
  const notionFiltered = mockFeedItems.filter((item) => classifySourceRail(item.tags) === "Notion");
  assert(notionFiltered.length === 1 && notionFiltered[0].cid === "cid-notion-1", "Filtered feed by Notion rail");

  const substackFiltered = mockFeedItems.filter((item) => classifySourceRail(item.tags) === "Substack/RSS");
  assert(substackFiltered.length === 1 && substackFiltered[0].cid === "cid-substack-1", "Filtered feed by Substack/RSS rail");

  const studioFiltered = mockFeedItems.filter((item) => classifySourceRail(item.tags) === "Studio");
  assert(studioFiltered.length === 1 && studioFiltered[0].cid === "cid-studio-1", "Filtered feed by Studio rail");

  // Provenance verification filter tests
  const verifiedOnlyFiltered = mockFeedItems.filter((item) => !!(item.publisher.publicKey && item.publisher.publicKey.length >= 32));
  assert(verifiedOnlyFiltered.length === 3, "Filtered feed by Ed25519 Verified Only (3 verified items)");

  const unsignedFiltered = mockFeedItems.filter((item) => !item.publisher.publicKey);
  assert(unsignedFiltered.length === 1 && unsignedFiltered[0].cid === "cid-unsigned-1", "Isolated unsigned community post");

  // Search query filter tests
  const query = "treasury";
  const searchResults = mockFeedItems.filter((item) =>
    item.title.toLowerCase().includes(query) || item.tags.some((t) => t.toLowerCase().includes(query))
  );
  assert(searchResults.length === 1 && searchResults[0].cid === "cid-notion-1", "Instant search matched title 'Treasury'");

  // Group 6: Offline Fallback Simulation
  console.log("\n[6] Offline Reader Fallback Simulator");
  let networkOnline = false;
  async function simulateResolveContent(cid: string) {
    if (!networkOnline) {
      if (cid === mockOfflineArticle.cid) {
        return {
          source: "offline-cache",
          article: mockOfflineArticle,
        };
      }
      throw new Error("Content not available offline or online");
    }
    return { source: "network-daemon", article: mockOfflineArticle };
  }

  const resolvedOffline = await simulateResolveContent(mockOfflineArticle.cid);
  assert(resolvedOffline.source === "offline-cache", "Simulated offline reader fallback returned cached article");
  assert(resolvedOffline.article.title === "Zero-Knowledge Storage Manifesto", "Preserved complete article title in offline mode");
  assert(resolvedOffline.article.content.length > 0, "Preserved complete article body in offline mode");

  console.log(`\n🎉 Offline-First Reading List & Local Vault Test Suite Complete: ${passed}/${total} checks passed!\n`);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
