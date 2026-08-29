/**
 * PressProtocol Milestone 5: Developer Publishing Rails (GitHub Action) Test Suite
 * Validates action.yml specification, SSG frontmatter parsing across Hugo/Astro/Jekyll,
 * de-surveillance markdown transpilation, in-memory Ed25519 cryptographic signing,
 * deterministic CIDv1 calculation, publication manifest merging, directory scanning,
 * and end-to-end dry-run execution.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  parseMarkdownFile,
  splitFrontmatter,
  parseYamlBlock,
  normalizeTags,
} from "../integrations/publish-action/src/frontmatter";
import {
  calculateCIDv1,
  transpileMarkdown,
  getPublicKey,
  generateKeypair,
  createCanonicalPayload,
  signPayload,
  publishArticle,
} from "../integrations/publish-action/src/publisher";
import {
  loadManifest,
  saveManifest,
  mergeArticlesIntoManifest,
} from "../integrations/publish-action/src/manifest";
import { scanContentDirectory } from "../integrations/publish-action/src/scanner";
import { run, getActionInputs } from "../integrations/publish-action/src/index";
import { verifySignature } from "../packages/sdk/src/index";

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
  console.log("\n🧪 Running Milestone 5: Developer Publishing Rails (GitHub Action) Test Suite");
  console.log("==========================================================================");

  // Group 1: action.yml Specification Validation
  console.log("\n[1] GitHub Action Specification & Metadata (action.yml)");
  const actionYmlPath = path.join(monorepoRoot, "integrations/publish-action/action.yml");
  assert(fs.existsSync(actionYmlPath), "action.yml exists on disk");

  const actionYmlContent = fs.readFileSync(actionYmlPath, "utf8");
  assert(actionYmlContent.includes("name: 'PressProtocol Sovereign Publish Action'"), "Declared action name");
  assert(actionYmlContent.includes("using: 'node20'"), "Declared node20 execution runner");
  assert(actionYmlContent.includes("main: 'dist/index.js'"), "Points to bundled dist/index.js");
  assert(actionYmlContent.includes("content_dir:"), "Exposes content_dir input");
  assert(actionYmlContent.includes("private_key:"), "Exposes private_key input for secret provenance signing");
  assert(actionYmlContent.includes("gateway_url:"), "Exposes gateway_url input");
  assert(actionYmlContent.includes("manifest_path:"), "Exposes manifest_path input");
  assert(actionYmlContent.includes("published_count:"), "Exposes published_count output");
  assert(actionYmlContent.includes("latest_cid:"), "Exposes latest_cid output");
  assert(actionYmlContent.includes("public_key:"), "Exposes public_key output");

  // Group 2: SSG Frontmatter Extraction (Hugo, Astro, Jekyll, Nextra)
  console.log("\n[2] Multi-SSG Frontmatter Parser & Draft Filtering");

  // Hugo sample with YAML list tags
  const hugoPost = `---
title: "Zero Knowledge Disclosures on Tor"
date: 2026-09-12T14:30:00Z
author: "Alice Anonym"
tags:
  - cryptography
  - tor
  - whistleblower
slug: zk-disclosures-tor
draft: false
---
# Zero Knowledge Disclosures on Tor
Content starts here.
`;
  const parsedHugo = parseMarkdownFile("/dummy/content/posts/zk-disclosures.md", hugoPost);
  assert(parsedHugo.title === "Zero Knowledge Disclosures on Tor", "Extracted Hugo post title");
  assert(parsedHugo.author === "Alice Anonym", "Extracted author byline");
  assert(parsedHugo.slug === "zk-disclosures-tor", "Extracted custom slug");
  assert(parsedHugo.tags.length === 3 && parsedHugo.tags.includes("tor"), "Parsed YAML list tags");
  assert(parsedHugo.isDraft === false, "Recognized non-draft status");

  // Astro sample with inline array tags and draft: true
  const astroPost = `---
title: "Upcoming Protocol Roadmap"
date: "2026-10-01"
tags: ["preview", "experimental"]
description: "Confidential upcoming architectural preview"
draft: true
---
## Internal Draft Notice
This should not be published yet.
`;
  const parsedAstro = parseMarkdownFile("/dummy/src/content/blog/preview.md", astroPost);
  assert(parsedAstro.title === "Upcoming Protocol Roadmap", "Extracted Astro title");
  assert(parsedAstro.isDraft === true, "Correctly flagged draft: true for exclusion");
  assert(parsedAstro.excerpt === "Confidential upcoming architectural preview", "Extracted frontmatter description as excerpt");

  // Jekyll sample with date prefix in filename
  const jekyllPost = `---
author: "Satoshi"
categories: sovereign-computing, mesh-nets
---
# Mesh Networking for Decentralized Journalism
Autonomous communication nodes without centralized ISPs.
`;
  const parsedJekyll = parseMarkdownFile("/dummy/_posts/2026-09-12-mesh-networking.md", jekyllPost);
  assert(parsedJekyll.title === "Mesh Networking for Decentralized Journalism", "Derived title from first H1 header");
  assert(parsedJekyll.slug === "mesh-networking", "Stripped Jekyll date prefix from filename slug");
  assert(parsedJekyll.tags.includes("mesh-nets"), "Parsed comma-separated categories into tags");

  // Group 3: Markdown Transpilation & De-Surveillance Engine
  console.log("\n[3] Markdown Transpiler, Callouts & De-Surveillance");
  const sampleMd = `
# Editorial Headline
> 💡 Notice: Cryptographic keys must remain in runner memory only.

> 🚨 Critical: Never commit raw private keys to source control.

> "True journalism demands censorship-resistance."

\`\`\`typescript
const client = new PressProtocolClient();
await client.publish();
\`\`\`

- Bullet item one
- Bullet item two

Check out [PressProtocol](https://pressprotocol.com?utm_source=twitter&tracker=123).

<script>alert('malicious tracker')</script>
<img src="https://analytics.com/pixel.gif" onload="stealKeys()" />
`;
  const transpiled = transpileMarkdown(sampleMd);
  assert(transpiled.html.includes("<h1"), "Converted H1 heading");
  assert(transpiled.html.includes('data-type="callout"'), "Transpiled PressProtocol callout container");
  assert(transpiled.html.includes('data-callout-type="info"'), "Mapped 💡 to info callout");
  assert(transpiled.html.includes('data-callout-type="warning"'), "Mapped 🚨 to warning callout");
  assert(transpiled.html.includes("<blockquote"), "Transpiled quote to blockquote");
  assert(transpiled.html.includes("<pre"), "Transpiled code fence with syntax container");
  assert(transpiled.html.includes("<li"), "Transpiled list items");
  assert(!transpiled.html.includes("<script>"), "Purged executable <script> tags");
  assert(!transpiled.html.includes("onload="), "Purged inline event handlers (onload)");
  assert(transpiled.wordCount > 20, "Calculated non-zero word count");
  assert(transpiled.readingTimeMinutes >= 1, "Calculated reading time minutes");

  // Group 4: Cryptographic Provenance & Deterministic CIDv1
  console.log("\n[4] Ed25519 Provenance Signing & In-Memory CIDv1 Determinism");
  const keypair = await generateKeypair();
  const derivedPub = await getPublicKey(keypair.privateKey);
  assert(derivedPub === keypair.publicKey, "Derived public key matches generated public key");

  const title = "Decentralized Publishing Manifesto";
  const tags = ["git-publish", "sovereign"];
  const timestamp = new Date().toISOString();
  const canonicalPayload = createCanonicalPayload(title, tags, timestamp);

  const sig = await signPayload(canonicalPayload, keypair.privateKey);
  const isValid = await verifySignature(canonicalPayload, sig, keypair.publicKey);
  assert(isValid === true, "Author Ed25519 signature verified over canonical payload");

  // Deterministic CIDv1 calculation
  const cid1 = calculateCIDv1(canonicalPayload);
  const cid2 = calculateCIDv1(canonicalPayload);
  assert(cid1.startsWith("bafk") || cid1.startsWith("b"), "Generated valid multibase base32 CIDv1 ('b' prefix)");
  assert(cid1 === cid2, "CIDv1 calculation is deterministic and immutable");

  // Group 5: Publication Manifest Manager (pressprotocol-manifest.json)
  console.log("\n[5] Syndication Manifest Serialization & Incremental Merging");
  const initialManifest = mergeArticlesIntoManifest(
    null,
    [
      {
        filePath: "content/posts/article-1.md",
        slug: "article-1",
        title: "First Post",
        date: "2026-09-10T10:00:00Z",
        author: "Alice",
        tags: ["tech"],
        cid: "bafybeidemo1",
        signature: "sig1",
        publicKey: keypair.publicKey,
        readingTimeMinutes: 2,
        wordCount: 300,
        shareUrl: "https://pressprotocol.com/read/bafybeidemo1",
        mirrors: { ipfs: "https://ipfs.io/ipfs/bafybeidemo1", gateway: "https://gateway/bafybeidemo1" },
        publishedAt: "2026-09-10T10:05:00Z",
      },
    ],
    {
      author: "Alice",
      publicKey: keypair.publicKey,
      repository: "pressprotocol/demo-blog",
    }
  );

  assert(initialManifest.totalArticles === 1, "Initialized manifest with 1 article");
  assert(initialManifest.manifestVersion === "1.0.0", "Set manifest version to 1.0.0");
  assert(initialManifest.publicKey === keypair.publicKey, "Persisted author public key");

  // Incremental merge: Add article 2, and update article 1 with newer CID
  const updatedManifest = mergeArticlesIntoManifest(
    initialManifest,
    [
      {
        filePath: "content/posts/article-1.md", // update existing
        slug: "article-1",
        title: "First Post (Revised)",
        date: "2026-09-10T10:00:00Z",
        author: "Alice",
        tags: ["tech", "revised"],
        cid: "bafybeidemo1-v2",
        signature: "sig1-revised",
        publicKey: keypair.publicKey,
        readingTimeMinutes: 3,
        wordCount: 450,
        shareUrl: "https://pressprotocol.com/read/bafybeidemo1-v2",
        mirrors: { ipfs: "https://ipfs.io/ipfs/bafybeidemo1-v2", gateway: "https://gateway/bafybeidemo1-v2" },
        publishedAt: "2026-09-12T12:00:00Z",
      },
      {
        filePath: "content/posts/article-2.md", // new
        slug: "article-2",
        title: "Second Post",
        date: "2026-09-12T11:00:00Z",
        author: "Alice",
        tags: ["crypto"],
        cid: "bafybeidemo2",
        signature: "sig2",
        publicKey: keypair.publicKey,
        readingTimeMinutes: 4,
        wordCount: 600,
        shareUrl: "https://pressprotocol.com/read/bafybeidemo2",
        mirrors: { ipfs: "https://ipfs.io/ipfs/bafybeidemo2", gateway: "https://gateway/bafybeidemo2" },
        publishedAt: "2026-09-12T11:05:00Z",
      },
    ],
    {
      author: "Alice",
      publicKey: keypair.publicKey,
    }
  );

  assert(updatedManifest.totalArticles === 2, "Merged without duplicating updated post (2 total)");
  assert(updatedManifest.articles[0].slug === "article-2", "Sorted articles chronologically descending (article-2 first)");
  assert(updatedManifest.articles[1].title === "First Post (Revised)", "Replaced updated article record cleanly");

  // Group 6: Directory Scanner & File Discovery
  console.log("\n[6] Directory Traversal & Content Scanner");
  const tempFixtureDir = path.join(monorepoRoot, "integrations/publish-action/fixtures-test");
  if (fs.existsSync(tempFixtureDir)) {
    fs.rmSync(tempFixtureDir, { recursive: true });
  }
  fs.mkdirSync(path.join(tempFixtureDir, "sub"), { recursive: true });

  fs.writeFileSync(path.join(tempFixtureDir, "post-a.md"), "# Post A\nBody");
  fs.writeFileSync(path.join(tempFixtureDir, "post-b.markdown"), "# Post B\nBody");
  fs.writeFileSync(path.join(tempFixtureDir, "sub/post-c.mdx"), "# Post C\nBody");
  fs.writeFileSync(path.join(tempFixtureDir, "notes.txt"), "Not markdown");

  const scannedFiles = await scanContentDirectory(tempFixtureDir);
  assert(scannedFiles.length === 3, "Scanned exactly 3 markdown files (.md, .markdown, .mdx)");
  assert(!scannedFiles.some((f) => f.endsWith(".txt")), "Excluded non-markdown files");

  // Group 7: End-to-End Action Execution Simulation (Dry-Run)
  console.log("\n[7] End-to-End Action Execution Simulation");
  const tempManifestPath = path.join(tempFixtureDir, "test-manifest.json");
  const actionOutputs = await run({
    contentDir: tempFixtureDir,
    privateKey: keypair.privateKey,
    manifestPath: tempManifestPath,
    dryRun: true,
    authorPseudonym: "Test Cypherpunk",
    tags: ["ci-test"],
  });

  assert(actionOutputs.publishedCount === 3, "Published all 3 candidate articles in test run");
  assert(actionOutputs.cids.length === 3, "Generated 3 CIDs");
  assert(actionOutputs.publicKey === keypair.publicKey, "Returned matching author public key");
  assert(fs.existsSync(tempManifestPath), "Created manifest file on disk");

  const writtenManifest = JSON.parse(fs.readFileSync(tempManifestPath, "utf8"));
  assert(writtenManifest.totalArticles === 3, "Manifest on disk contains 3 articles");
  assert(writtenManifest.articles[0].author === "Test Cypherpunk", "Recorded author byline in manifest");

  // Clean up temporary fixtures
  fs.rmSync(tempFixtureDir, { recursive: true });

  // Group 8: Standalone Distribution Bundle Integrity
  console.log("\n[8] Standalone Distribution Bundle Integrity (dist/index.js)");
  const bundlePath = path.join(monorepoRoot, "integrations/publish-action/dist/index.js");
  assert(fs.existsSync(bundlePath), "Compiled dist/index.js exists");
  const bundleStat = fs.statSync(bundlePath);
  assert(bundleStat.size > 20000, `Bundle size is robust (${(bundleStat.size / 1024).toFixed(1)} KB)`);

  console.log(`\n🎉 Milestone 5: Developer Publishing Rails (GitHub Action) Complete: ${passed}/${total} checks passed!\n`);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
