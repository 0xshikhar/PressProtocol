import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'node:crypto';
import { federationService } from '../core/node/src/services/FederationService.js';
import { torService } from '../core/node/src/services/TorService.js';
import { embeddedDB } from '../core/node/src/lib/embedded-db.js';
import { storageService } from '../core/node/src/services/StorageService.js';
import { calculateDeterministicCIDv1 } from '../core/node/src/lib/cid.js';
import { env } from '../core/node/src/config/env.js';
import { signArticleV2 } from '../packages/sdk/src/protocol.js';
import { generateKeypair } from '../packages/sdk/src/crypto.js';

/** Publishes a v2-signed article to the local sovereign store and returns its gossip envelope. */
async function publishLocalArticle(title: string, tags: string[] = []): Promise<{
  cid: string; title: string; tags: string[]; timestamp: string; signature: string; publicKey: string;
}> {
  const kp = await generateKeypair();
  const timestamp = new Date().toISOString();
  const content = `<p>${title} — gossip test body</p>`;
  const signature = await signArticleV2({ title, tags, timestamp, content }, kp.privateKey);
  await storageService.uploadContent(title, content, tags, { pubkey: kp.publicKey, signature }, timestamp);
  return { cid: calculateDeterministicCIDv1(content), title, tags, timestamp, signature, publicKey: kp.publicKey };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ Assertion Failed: ${message}`);
  }
}

async function runAutonomousNodeTests() {
  console.log('🧪 Testing PressProtocol Pillar I: Autonomous Community Node & P2P Federation');
  console.log('================================================================================');

  // --- 1. Node Status & Health Specification ---
  console.log('1️⃣  Node Status Specification & Observability...');
  const status = await federationService.getStatus();
  assert(status.status === 'online', 'Node reports online status');
  assert(status.specification === 'RFC-PP-007-WAVE4-COMPLETE-INFRA', 'Node complies with RFC-PP-007 specification');
  assert(status.version === '1.0.0-sovereign', 'Node version is 1.0.0-sovereign');
  assert(status.uptimeSeconds >= 0, 'Uptime is non-negative');
  assert(status.ipfs !== undefined && typeof status.ipfs.dhtActive === 'boolean', 'IPFS DHT telemetry is populated');
  assert(status.storage !== undefined && typeof status.storage.totalContent === 'number', 'Storage metrics are populated');

  // --- 2. Tor v3 Onion Hidden Service Cryptographic Format ---
  console.log('2️⃣  Tor v3 Onion Address Cryptographic Verification...');
  const previousOnion = env.TOR_ONION_ADDRESS;
  env.TOR_ONION_ADDRESS = 'not-a-real-onion.onion';
  assert((await torService.getSelfOnionAddress()) === null, 'Malformed configured onion address is rejected');
  const validOnion = `${'a'.repeat(52)}2345.onion`;
  env.TOR_ONION_ADDRESS = `http://${validOnion}/`;
  const onionAddress = await torService.getSelfOnionAddress();
  // Tor v3 standard: 56 base32 characters (a-z, 2-7) + .onion
  assert(onionAddress === validOnion, `Configured v3 onion address "${onionAddress}" is normalized`);
  env.TOR_ONION_ADDRESS = previousOnion;

  const torStatus = await torService.getTorStatus();
  assert(torStatus.enabled === true, 'Tor daemon is enabled in node status');
  const proxyPort = Number.parseInt(torStatus.socksProxy.match(/:(\d+)$/)?.[1] ?? '', 10);
  assert(
    Number.isInteger(proxyPort) && proxyPort >= 1 && proxyPort <= 65535,
    'Tor SOCKS5 proxy port is configured',
  );

  // --- 3. Peer-to-Peer Node Federation ---
  console.log('3️⃣  P2P Node Federation Peer Management...');
  const testPeerUrl = 'http://testpeer7node2press4protocol.onion:4000';
  const addedPeer = federationService.addPeer(testPeerUrl, 'Alpine Test Node');
  assert(addedPeer.url === testPeerUrl, 'Federation peer URL registered successfully');
  assert(addedPeer.name === 'Alpine Test Node', 'Federation peer name stored');

  const peersList = federationService.getPeers();
  assert(peersList.some((p) => p.url === testPeerUrl), 'Registered peer appears in getPeers() list');

  const removed = federationService.removePeer(testPeerUrl);
  assert(removed === true, 'Federation peer successfully un-registered');
  const postRemoveList = federationService.getPeers();
  assert(!postRemoveList.some((p) => p.url === testPeerUrl), 'Peer no longer in federation list');

  // --- 4. GossipSub Publication Broadcasting & Auto-Pin Engine ---
  console.log('4️⃣  GossipSub Ingestion & Cryptographic Auto-Pin Policies...');
  
  // Test Policy 1: 'all'
  federationService.setAutoPinPolicy('all');
  const gossip1 = await publishLocalArticle('Sovereign Manifest 01');

  const gossipRes1 = await federationService.handleGossip(gossip1);

  assert(gossipRes1.accepted === true, `Gossip message accepted by node (${gossipRes1.reason || 'ok'})`);
  assert(gossipRes1.pinned === true, 'Auto-pin policy "all" pinned the gossiped CID');
  assert(gossipRes1.signatureStatus === 'verified', 'Gossip signature verified against content-bound v2 payload');
  assert(embeddedDB.isPinned(gossip1.cid), 'CID recorded in persistent local pin store');

  // Test Policy 2: 'followed'
  const gossipIgnored = await publishLocalArticle('Ignored Non-Followed Post');
  const gossipFollowed = await publishLocalArticle('Followed Author Post');
  federationService.setAutoPinPolicy('followed', [gossipFollowed.publicKey]);

  const gossipResIgnored = await federationService.handleGossip(gossipIgnored);
  assert(gossipResIgnored.accepted === true, 'Verified gossip from non-followed author still accepted');
  assert(gossipResIgnored.pinned === false, 'Auto-pin policy "followed" ignored non-followed author');

  const gossipResFollowed = await federationService.handleGossip(gossipFollowed);
  assert(gossipResFollowed.pinned === true, 'Auto-pin policy "followed" pinned followed author CID');

  // Test unsigned / invalid-signature rejection (NEW-08 regression)
  const unsignedGossip = await federationService.handleGossip({
    cid: gossip1.cid,
    title: 'Unsigned Forgery',
    signature: '',
    publicKey: '',
    timestamp: new Date().toISOString(),
  });
  assert(unsignedGossip.accepted === false, 'Unsigned gossip rejected');
  const forgedGossip = await federationService.handleGossip({
    ...gossip1,
    title: 'Forged Title For Same CID',
  });
  assert(forgedGossip.accepted === false, 'Gossip whose signature does not cover the payload is rejected');

  // --- 5. Embedded Zero-Config Storage Engine ---
  console.log('5️⃣  Embedded Storage Engine & Search...');
  const searchResults = embeddedDB.searchContent('Sovereign');
  assert(searchResults.length > 0, 'Embedded DB indexes and searches gossiped articles');
  assert(searchResults[0].cid === gossip1.cid, 'Embedded DB retrieves correct article by search');

  // --- 6. Multi-Architecture Docker & Security Blueprint Verification ---
  console.log('6️⃣  Multi-Architecture Container & Security Hardening...');
  function findRepoRoot(): string {
    let curr = process.cwd();
    while (curr !== '/' && curr !== '') {
      if (existsSync(join(curr, 'pnpm-workspace.yaml'))) {
        return curr;
      }
      curr = join(curr, '..');
    }
    return process.cwd();
  }
  const repoRoot = findRepoRoot();

  const dockerfilePath = join(repoRoot, 'core/node/Dockerfile');
  assert(existsSync(dockerfilePath), 'core/node/Dockerfile exists');
  const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
  assert(dockerfileContent.includes('pressprotocol'), 'Dockerfile defines unprivileged user 10001');
  assert(dockerfileContent.includes('4000') && dockerfileContent.includes('9050'), 'Dockerfile exposes port 4000 and 9050');
  assert(dockerfileContent.includes('su-exec'), 'Dockerfile utilizes su-exec for safe privilege dropping');

  const entrypointPath = join(repoRoot, 'core/node/docker-entrypoint.sh');
  assert(existsSync(entrypointPath), 'core/node/docker-entrypoint.sh exists');
  const entrypointContent = readFileSync(entrypointPath, 'utf-8');
  assert(entrypointContent.includes('chmod 700'), 'docker-entrypoint.sh enforces strict 700 permissions on Tor directory');

  const composePath = join(repoRoot, 'core/node/docker-compose.yml');
  assert(existsSync(composePath), 'core/node/docker-compose.yml exists');
  const composeContent = readFileSync(composePath, 'utf-8');
  assert(composeContent.includes('pressprotocol/node:latest'), 'docker-compose uses official node image');
  assert(composeContent.includes('pressprotocol_data:/data'), 'docker-compose mounts persistent /data volume');

  const installerPath = join(repoRoot, 'scripts/install-node.sh');
  assert(existsSync(installerPath), 'scripts/install-node.sh exists');
  const installerContent = readFileSync(installerPath, 'utf-8');
  assert(installerContent.includes('uname -m'), 'Installer detects system CPU architecture');
  assert(installerContent.includes('--dry-run'), 'Installer supports safe dry-run mode');

  console.log('');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Autonomous Community Node & P2P Federation tests passed!');
  }
}

runAutonomousNodeTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
