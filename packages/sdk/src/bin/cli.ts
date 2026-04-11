#!/usr/bin/env node

/**
 * PressProtocol Headless CLI Binary
 * Universal Sovereign Publishing & Multi-Transport Resolution CLI
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PressProtocolClient } from "../client.js";

// ANSI Color Helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function printBanner() {
  console.log(`
${colors.cyan}${colors.bold}PressProtocol Sovereign Publishing CLI${colors.reset}
${colors.dim}Decentralized • Cryptographically Signed • Multi-Transport${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`${colors.bold}USAGE:${colors.reset}
  $ pressprotocol <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}publish${colors.reset} <file.md>         Publish an article to decentralized swarms (or pipe via stdin)
  ${colors.green}resolve${colors.reset} <cid>             Multi-transport resolve article & verify Ed25519 signature
  ${colors.green}health${colors.reset} <cid>              Probe latency and availability across all network mirrors
  ${colors.green}keygen${colors.reset}                    Generate a fresh sovereign Ed25519 keypair

${colors.bold}OPTIONS:${colors.reset}
  --title <title>          Article title (defaults to Markdown H1 header or filename)
  --tags <tags>            Comma-separated tags (e.g. --tags privacy,leaks)
  --key <privateKey>       Ed25519 private key hex for sovereign author signing
  --endpoint <url>         PressProtocol node daemon endpoint
  --verify                 Verify Ed25519 signature during resolution (default: true)
  --no-verify              Skip signature verification
  --json                   Output machine-readable JSON
  --help, -h               Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  $ pressprotocol publish article.md --tags privacy,leaks
  $ cat document.md | pressprotocol publish --title "Whistleblower Dossier"
  $ pressprotocol resolve bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi --verify
  $ pressprotocol health bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
  $ pressprotocol keygen
`);
}

/**
 * Reads all incoming content from piped stdin.
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
    process.stdin.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Parses command-line flags.
 */
function parseArgs(args: string[]) {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key === "no-verify") {
        flags.verify = false;
      } else if (key === "json" || key === "verify" || key === "help") {
        flags[key] = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        flags[key] = args[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg === "-h") {
      flags.help = true;
    } else {
      positionals.push(arg);
    }
  }

  return { command: positionals[0], positionals: positionals.slice(1), flags };
}

/**
 * Extracts title from markdown content if not explicitly passed.
 */
function extractTitleFromContent(content: string, fallback: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }
  return fallback;
}

async function handlePublish(positionals: string[], flags: Record<string, any>) {
  let content = "";
  let fallbackTitle = "Sovereign Publication";

  const filePath = positionals[0];

  if (filePath && filePath !== "-") {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`${colors.red}Error: File not found: ${resolvedPath}${colors.reset}`);
      process.exit(1);
    }
    content = fs.readFileSync(resolvedPath, "utf8");
    fallbackTitle = path.basename(filePath, path.extname(filePath));
  } else if (!process.stdin.isTTY || filePath === "-") {
    content = await readStdin();
  } else {
    console.error(`${colors.red}Error: Please specify a file to publish or pipe via stdin.${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!content.trim()) {
    console.error(`${colors.red}Error: Cannot publish empty content.${colors.reset}`);
    process.exit(1);
  }

  const title = (flags.title as string) || extractTitleFromContent(content, fallbackTitle);
  const tags = flags.tags ? (flags.tags as string).split(",").map((t) => t.trim()) : [];
  const privateKey = flags.key as string | undefined;
  const endpoint = flags.endpoint as string | undefined;

  console.log(`${colors.cyan}Publishing to PressProtocol decentralized network...${colors.reset}`);
  if (privateKey) {
    console.log(`${colors.dim}Signing with provided sovereign Ed25519 key...${colors.reset}`);
  } else {
    console.log(`${colors.dim}Generating ephemeral sovereign burner keypair...${colors.reset}`);
  }

  const client = new PressProtocolClient({ endpoint });

  try {
    const start = performance.now();
    const result = await client.publish({
      title,
      content,
      tags,
      privateKey,
    });
    const elapsed = Math.round(performance.now() - start);

    if (flags.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(`
${colors.green}${colors.bold}✓ Sovereign Article Successfully Published!${colors.reset} ${colors.dim}(${elapsed}ms)${colors.reset}

${colors.bold}Article Details:${colors.reset}
  Title:      ${colors.bold}${title}${colors.reset}
  Tags:       ${tags.length > 0 ? tags.map((t) => `#${t}`).join(" ") : "none"}
  
${colors.bold}Cryptographic Manifest:${colors.reset}
  CID:        ${colors.cyan}${result.cid}${colors.reset}
  URI:        ${colors.cyan}${result.uri}${colors.reset}
  Public Key: ${colors.dim}${result.publicKey}${colors.reset}
  Signature:  ${colors.dim}${result.signature.slice(0, 32)}...${result.signature.slice(-16)}${colors.reset}

${colors.bold}Access URLs:${colors.reset}
  Web Reader: ${result.shareUrl}
  IPFS Swarm: https://gateway.pinata.cloud/ipfs/${result.cid}
  Embed Code: <iframe src="https://pressprotocol.com/embed/${result.cid}?theme=cyber" width="100%" height="600"></iframe>
`);
  } catch (error: any) {
    console.error(`\n${colors.red}✗ Publish failed:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

async function handleResolve(positionals: string[], flags: Record<string, any>) {
  const cid = positionals[0];
  if (!cid) {
    console.error(`${colors.red}Error: Missing required argument <cid>.${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  const verify = flags.verify !== false;
  const endpoint = flags.endpoint as string | undefined;

  const client = new PressProtocolClient({ endpoint });

  try {
    const start = performance.now();
    const article = await client.resolve(cid, { verify });
    const elapsed = Math.round(performance.now() - start);

    if (flags.json) {
      console.log(JSON.stringify(article, null, 2));
      return;
    }

    console.log(`
${colors.green}${colors.bold}✓ Resolved Sovereign Article${colors.reset} ${colors.dim}(${elapsed}ms via ${article.source})${colors.reset}

${colors.bold}Title:${colors.reset} ${article.title}
${colors.bold}Date:${colors.reset}  ${article.createdAt}
${colors.bold}Tags:${colors.reset}  ${article.tags.map((t) => `#${t}`).join(" ")}

${colors.bold}Cryptographic Integrity:${colors.reset}
  Status:     ${
    article.verified
      ? `${colors.green}${colors.bold}✓ Verified (Ed25519 RFC 8032)${colors.reset} ${colors.dim}(${article.verificationLatencyMs}ms)${colors.reset}`
      : article.verificationStatus === "unsigned"
      ? `${colors.yellow}⚠ Unsigned Article${colors.reset}`
      : `${colors.red}✗ Invalid Cryptographic Signature${colors.reset}`
  }
  Author Key: ${colors.dim}${article.publisher.pubkey || "Anonymous"}${colors.reset}
  Signature:  ${colors.dim}${article.signature ? `${article.signature.slice(0, 24)}...` : "none"}${colors.reset}

${colors.bold}Content Preview:${colors.reset}
${colors.dim}------------------------------------------------------------${colors.reset}
${article.content.slice(0, 400)}${article.content.length > 400 ? "\n..." : ""}
${colors.dim}------------------------------------------------------------${colors.reset}
`);
  } catch (error: any) {
    console.error(`\n${colors.red}✗ Resolve failed:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

async function handleHealth(positionals: string[], flags: Record<string, any>) {
  const cid = positionals[0];
  if (!cid) {
    console.error(`${colors.red}Error: Missing required argument <cid>.${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  const endpoint = flags.endpoint as string | undefined;
  const client = new PressProtocolClient({ endpoint });

  console.log(`${colors.cyan}Probing multi-transport mirrors for CID ${cid}...${colors.reset}\n`);

  try {
    const health = await client.health(cid);

    if (flags.json) {
      console.log(JSON.stringify(health, null, 2));
      return;
    }

    console.log(`${colors.bold}Mirror Latency & Availability:${colors.reset}`);
    for (const mirror of health.mirrors) {
      const statusSymbol = mirror.available ? `${colors.green}✓ Available${colors.reset}` : `${colors.red}✗ Offline${colors.reset}`;
      const latencyStr = mirror.latencyMs !== undefined ? `${mirror.latencyMs}ms` : "timeout";
      console.log(`  ${mirror.name.padEnd(26)} ${statusSymbol.padEnd(20)} ${latencyStr.padStart(8)}`);
    }

    if (health.fastest) {
      console.log(`\n${colors.bold}Fastest Mirror:${colors.reset} ${colors.green}${health.fastest.name}${colors.reset} (${health.fastest.latencyMs}ms)`);
      console.log(`${colors.dim}${health.fastest.url}${colors.reset}`);
    }
  } catch (error: any) {
    console.error(`\n${colors.red}✗ Health probe failed:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

async function handleKeygen(flags: Record<string, any>) {
  const client = new PressProtocolClient();
  const keypair = await client.generateKeypair();

  if (flags.json) {
    console.log(JSON.stringify(keypair, null, 2));
    return;
  }

  console.log(`
${colors.green}${colors.bold}✓ Fresh Sovereign Ed25519 Keypair Generated${colors.reset}

${colors.bold}Public Key (Author Identity):${colors.reset}
  ${colors.cyan}${keypair.publicKey}${colors.reset}

${colors.bold}Private Key (Keep Confidential):${colors.reset}
  ${colors.yellow}${keypair.privateKey}${colors.reset}

${colors.dim}To publish using this key:
  $ export PRESSPROTOCOL_PRIVATE_KEY=${keypair.privateKey}
  $ pressprotocol publish my-article.md
  or
  $ pressprotocol publish my-article.md --key ${keypair.privateKey}
${colors.reset}
`);
}

async function main() {
  const { command, positionals, flags } = parseArgs(process.argv.slice(2));

  if (flags.help || !command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "publish":
      await handlePublish(positionals, flags);
      break;
    case "resolve":
      await handleResolve(positionals, flags);
      break;
    case "health":
      await handleHealth(positionals, flags);
      break;
    case "keygen":
      await handleKeygen(flags);
      break;
    default:
      console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
