import fs from "fs";
import path from "path";
import { scanContentDirectory } from "./scanner.js";
import { parseMarkdownFile } from "./frontmatter.js";
import { publishArticle, getPublicKey, generateKeypair } from "./publisher.js";
import { loadManifest, saveManifest, mergeArticlesIntoManifest } from "./manifest.js";
import type { ActionInputs, ActionOutputs, PublishResultItem } from "./types.js";

/**
 * Parses inputs from GitHub Action environment variables or options argument.
 */
export function getActionInputs(overrides: Partial<ActionInputs> = {}): ActionInputs {
  const getEnv = (name: string, fallback: string = ""): string => {
    const key = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
    return process.env[key] !== undefined ? process.env[key]! : fallback;
  };

  const parseBool = (val: string): boolean => {
    return val.toLowerCase() === "true" || val === "1";
  };

  const rawTags = overrides.tags !== undefined
    ? overrides.tags
    : getEnv("tags", "git-publish,sovereign-doc")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  return {
    contentDir: overrides.contentDir || getEnv("content_dir", "./content/posts"),
    privateKey: overrides.privateKey !== undefined ? overrides.privateKey : getEnv("private_key", ""),
    gatewayUrl: overrides.gatewayUrl || getEnv("gateway_url", "https://pressprotocol.com"),
    authorPseudonym: overrides.authorPseudonym || getEnv("author_pseudonym", "Sovereign Developer"),
    manifestPath: overrides.manifestPath || getEnv("manifest_path", "pressprotocol-manifest.json"),
    filterModifiedOnly: overrides.filterModifiedOnly !== undefined
      ? overrides.filterModifiedOnly
      : parseBool(getEnv("filter_modified_only", "false")),
    dryRun: overrides.dryRun !== undefined
      ? overrides.dryRun
      : parseBool(getEnv("dry_run", "false")),
    tags: Array.isArray(rawTags) ? rawTags : [String(rawTags)],
  };
}

/**
 * Sets output variables for GitHub Actions runner via GITHUB_OUTPUT.
 */
export function setActionOutputs(outputs: ActionOutputs): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  const lines = [
    `published_count=${outputs.publishedCount}`,
    `latest_cid=${outputs.latestCid}`,
    `manifest_path=${outputs.manifestPath}`,
    `cids=${JSON.stringify(outputs.cids)}`,
    `public_key=${outputs.publicKey}`,
  ];

  if (outputFile && fs.existsSync(path.dirname(outputFile))) {
    fs.appendFileSync(outputFile, lines.join("\n") + "\n", "utf8");
  } else {
    // Fallback log for terminal / local execution
    for (const line of lines) {
      console.log(`[Output] ${line}`);
    }
  }
}

/**
 * Writes markdown summary to GITHUB_STEP_SUMMARY if available.
 */
export function writeStepSummary(
  articles: PublishResultItem[],
  manifestPath: string,
  publicKey: string
): void {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;

  const rows = articles.map((art) => {
    const titleLink = `[${escapeMarkdown(art.title)}](${art.shareUrl})`;
    const ipfsBadge = `[\`${art.cid.slice(0, 12)}...\`](${art.mirrors.ipfs})`;
    return `| ${titleLink} | ${ipfsBadge} | ${art.wordCount} words | ${art.readingTimeMinutes} min | \`${art.date.slice(0, 10)}\` |`;
  });

  const markdown = `
### 🗞️ PressProtocol Sovereign Syndication Summary

Successfully signed and syndicated **${articles.length}** article${articles.length === 1 ? "" : "s"} to decentralized storage.

| Article Title | IPFS CID | Length | Read Time | Date |
|:---|:---|:---|:---|:---|
${rows.join("\n")}

- **Author Public Key**: \`${publicKey}\`
- **Publication Manifest**: \`${manifestPath}\`
- **Transports Active**: IPFS Swarm (Pinata, Cloudflare) & Tor v3 Onion Gateway
`;

  try {
    fs.appendFileSync(summaryFile, markdown + "\n", "utf8");
  } catch (err) {
    // Ignore step summary write error
  }
}

function escapeMarkdown(str: string): string {
  return str.replace(/\|/g, "\\|");
}

/**
 * Main execution orchestration for publish-action.
 */
export async function run(customInputs?: Partial<ActionInputs>): Promise<ActionOutputs> {
  console.log("⚡ PressProtocol Sovereign Publish Action v1.0.0");
  console.log("===============================================");

  const inputs = getActionInputs(customInputs);
  console.log(`📂 Content Directory: ${inputs.contentDir}`);
  console.log(`🌐 Gateway:           ${inputs.gatewayUrl}`);
  console.log(`👤 Author Byline:     ${inputs.authorPseudonym}`);
  console.log(`🔍 Modified Only:     ${inputs.filterModifiedOnly}`);
  console.log(`🧪 Dry Run:           ${inputs.dryRun}`);
  console.log(`📜 Manifest Path:     ${inputs.manifestPath}\n`);

  // 1. Scan for markdown files
  const filePaths = await scanContentDirectory(inputs.contentDir, {
    filterModifiedOnly: inputs.filterModifiedOnly,
  });

  if (filePaths.length === 0) {
    console.log("ℹ️ No markdown articles found to publish.");
    const outputs: ActionOutputs = {
      publishedCount: 0,
      latestCid: "",
      manifestPath: inputs.manifestPath,
      cids: [],
      publicKey: "",
    };
    setActionOutputs(outputs);
    return outputs;
  }

  console.log(`🔎 Discovered ${filePaths.length} candidate file(s)...`);

  // 2. Prepare author keypair
  let privKey = inputs.privateKey?.trim();
  let pubKey = "";
  if (privKey && privKey.length === 64) {
    pubKey = await getPublicKey(privKey);
    console.log(`🔑 Sovereign Author Public Key: ${pubKey.slice(0, 16)}...${pubKey.slice(-8)}`);
  } else {
    console.log("⚠️ No private key provided. Generating ephemeral sovereign burner keypair...");
    const burner = await generateKeypair();
    privKey = burner.privateKey;
    pubKey = burner.publicKey;
    console.log(`🔑 Generated Ephemeral Key: ${pubKey.slice(0, 16)}...${pubKey.slice(-8)}`);
  }

  // 3. Process each article
  const publishedItems: PublishResultItem[] = [];
  let skippedDrafts = 0;

  for (const filePath of filePaths) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const article = parseMarkdownFile(filePath, rawContent, inputs.contentDir);

    if (article.isDraft) {
      console.log(`  ⏩ [DRAFT SKIP] ${article.title} (${article.relativePath})`);
      skippedDrafts++;
      continue;
    }

    console.log(`  🖋️  Signing & Syndicating: "${article.title}"...`);
    const result = await publishArticle(article, {
      privateKeyHex: privKey,
      gatewayUrl: inputs.gatewayUrl,
      authorPseudonym: inputs.authorPseudonym,
      extraTags: inputs.tags,
      dryRun: inputs.dryRun,
    });

    console.log(`     ↳ CID: ${result.cid} (Signature: ${result.signature.slice(0, 12)}...)`);
    publishedItems.push(result);
  }

  console.log(`\n✅ Published ${publishedItems.length} article(s) (${skippedDrafts} drafts skipped).`);

  // 4. Update publication manifest
  const existingManifest = loadManifest(inputs.manifestPath);
  const repoName = process.env.GITHUB_REPOSITORY;
  const updatedManifest = mergeArticlesIntoManifest(existingManifest, publishedItems, {
    author: inputs.authorPseudonym,
    publicKey: pubKey,
    repository: repoName,
  });

  saveManifest(inputs.manifestPath, updatedManifest);
  console.log(`💾 Updated publication manifest: ${inputs.manifestPath} (${updatedManifest.totalArticles} total catalog entries)`);

  // 5. Outputs & Step Summary
  const outputs: ActionOutputs = {
    publishedCount: publishedItems.length,
    latestCid: publishedItems.length > 0 ? publishedItems[0].cid : "",
    manifestPath: inputs.manifestPath,
    cids: publishedItems.map((a) => a.cid),
    publicKey: pubKey,
  };

  setActionOutputs(outputs);
  writeStepSummary(publishedItems, inputs.manifestPath, pubKey);

  return outputs;
}

// Auto-run if executed directly
if (process.argv[1] && (process.argv[1].endsWith("dist/index.js") || process.argv[1].endsWith("src/index.ts"))) {
  run().catch((err) => {
    console.error("❌ Action failed with fatal error:", err);
    process.exit(1);
  });
}
