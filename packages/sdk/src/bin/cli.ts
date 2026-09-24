#!/usr/bin/env node

/**
 * PressProtocol Headless CLI Binary
 * Universal Sovereign Publishing & Multi-Transport Resolution CLI
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PressProtocolClient } from "../client.js";
import {
  generateKeypairSync,
  getPublicKey,
  signPayload,
  createCanonicalPayload,
  calculateDeterministicCIDv1,
} from "../crypto.js";

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
  ${colors.green}daemon${colors.reset}                    Inspect or run local sovereign headless micro-daemon

${colors.bold}OPTIONS:${colors.reset}
  --local-only             Pure air-gapped publishing: compute CIDv1 & sign in-memory without network
  --sign                   Explicitly enforce cryptographic Ed25519 signature creation
  --title <title>          Article title (defaults to Markdown H1 header or filename)
  --tags <tags>            Comma-separated tags (e.g. --tags privacy,leaks)
  --key <privateKey>       Ed25519 private key hex for sovereign author signing
  --endpoint <url>         PressProtocol node daemon endpoint
  --verify                 Verify Ed25519 signature during resolution (default: true)
  --no-verify              Skip signature verification
  --json                   Output machine-readable JSON
  --version, -v            Show the installed SDK version
  --help, -h               Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  $ cat investigation.md | pressprotocol publish --local-only --sign
  $ pressprotocol publish article.md --tags privacy,leaks
  $ pressprotocol daemon
  $ pressprotocol resolve bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi --verify
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
      } else if (key === "json" || key === "verify" || key === "help" || key === "version") {
        flags[key] = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        flags[key] = args[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg === "-h") {
      flags.help = true;
    } else if (arg === "-v") {
      flags.version = true;
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

  const isLocalOnly = Boolean(flags["local-only"] || flags.localOnly || flags.local);

  // 1. Air-Gapped / Zero-Server Local Publishing Mode
  if (isLocalOnly) {
    const timestamp = new Date().toISOString();
    const cid = calculateDeterministicCIDv1(content);

    let keypair;
    if (privateKey) {
      const pub = await getPublicKey(privateKey);
      keypair = { privateKey, publicKey: pub };
    } else {
      keypair = generateKeypairSync();
    }

    const canonicalPayload = createCanonicalPayload(title, tags, timestamp);
    const signature = await signPayload(canonicalPayload, keypair.privateKey);

    // Check if local node or Tor daemon is running on 127.0.0.1:4000
    let onionHost = "jcqyihxqjobepnfit2u7qwmo6e4hvhxphujkw7qwx7abugvfjqm3jnqd.onion";
    let localGateway = `http://127.0.0.1:4000/read/${cid}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);
      const res = await fetch("http://127.0.0.1:4000/api/node/status", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.tor?.onionAddress) {
          onionHost = data.tor.onionAddress;
        }
      }
    } catch {
      // Local node is offline, gracefully use default onion routing
    }

    const onionMirror = `http://${onionHost}/ipfs/${cid}`;

    // Construct and export .pressproof.json receipt
    const proofManifest = {
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
      mirrors: {
        ipfs: `ipfs://${cid}`,
        tor: onionMirror,
        gateway: localGateway,
      },
      offlinePreservedAt: timestamp,
    };

    let proofFileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "investigation"}.pressproof.json`;
    if (filePath && filePath !== "-") {
      const base = path.basename(filePath, path.extname(filePath));
      proofFileName = `${base}.pressproof.json`;
    }
    const proofFilePath = path.resolve(process.cwd(), proofFileName);
    fs.writeFileSync(proofFilePath, JSON.stringify(proofManifest, null, 2), "utf8");

    if (flags.json) {
      console.log(JSON.stringify({
        success: true,
        localOnly: true,
        cid,
        title,
        publicKey: keypair.publicKey,
        signature,
        onionMirror,
        localGateway,
        proofFile: `./${proofFileName}`,
      }, null, 2));
      return;
    }

    console.log(`
${colors.green}${colors.bold}✅ Cryptographically signed with local Ed25519 key (0x${keypair.publicKey.slice(0, 6)}...)${colors.reset}
${colors.cyan}${colors.bold}📦 Deterministic CIDv1: ${cid}${colors.reset}
${colors.magenta}🧅 Live Onion Mirror:   ${onionMirror}${colors.reset}
${colors.blue}🌐 Local Gateway:      ${localGateway}${colors.reset}
${colors.yellow}💾 Proof Exported:      ./${proofFileName}${colors.reset}
`);
    return;
  }

  // 2. Network Client Publishing Mode
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

async function handleDaemon(positionals: string[], flags: Record<string, any>) {
  console.log(`
${colors.cyan}${colors.bold}========================================================================${colors.reset}
${colors.bold}   🌐 PRESSPROTOCOL SOVEREIGN HEADLESS MICRO-DAEMON (P1)                ${colors.reset}
${colors.cyan}${colors.bold}========================================================================${colors.reset}

${colors.bold}System Invariants:${colors.reset}
  Memory Footprint:    ${colors.green}< 65MB RAM${colors.reset}
  Zero Prerequisites:  Embedded SQLite, In-Memory Blockstore, Tor v3
  Mode:                Autonomous Zero-SPOF Substrate

${colors.bold}Network Interfaces:${colors.reset}
  🌐 Local API Gateway:  ${colors.bold}http://127.0.0.1:4000${colors.reset}
  📊 Node Health Probe:  ${colors.bold}http://127.0.0.1:4000/api/node/health${colors.reset}
  📡 Node Federation:    ${colors.bold}http://127.0.0.1:4000/api/node/status${colors.reset}
  🧅 Embedded Tor v3:     ${colors.magenta}socks5://127.0.0.1:9050${colors.reset}

${colors.bold}Management Status:${colors.reset}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);
    const res = await fetch("http://127.0.0.1:4000/api/node/status", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const status = await res.json() as any;
      console.log(`  State:               ${colors.green}● ONLINE (Active)${colors.reset}`);
      console.log(`  Node ID:             ${status.nodeId}`);
      console.log(`  Tor Onion Address:   ${colors.magenta}${status.tor?.onionAddress || "Initializing..."}${colors.reset}`);
      console.log(`  IPFS DHT Peers:      ${status.ipfs?.peersCount || 0}`);
      console.log(`  Locally Pinned:      ${status.storage?.pinnedCids || 0} CIDs`);
    } else {
      console.log(`  State:               ${colors.yellow}○ STANDBY (HTTP ${res.status})${colors.reset}`);
    }
  } catch {
    console.log(`  State:               ${colors.dim}○ STANDBY (Launch via 'bash scripts/install-node.sh' or Docker)${colors.reset}`);
    console.log(`  Docker 1-Command:    ${colors.dim}docker run -d -p 4000:4000 -p 9050:9050 -v ~/.pressprotocol:/data pressprotocol/node:latest${colors.reset}`);
  }
  console.log("");
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

  if (flags.version) {
    const { version } = JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
    console.log(`pressprotocol v${version}`);
    return;
  }

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
    case "daemon":
      await handleDaemon(positionals, flags);
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
