import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { federationService } from '../core/node/src/services/FederationService.js';
import { calculateDeterministicCIDv1 } from '../packages/sdk/src/crypto.js';

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

async function runPrivateNodeTests() {
  console.log('🧪 Testing Wave 5 Pillar I: Self-Sovereign Private Node & Zero-Permission Daemon');
  console.log('================================================================================');

  const repoRoot = findRepoRoot();

  // --- 1. Air-Gapped CLI --local-only Mode ---
  console.log('1️⃣  Air-Gapped CLI --local-only In-Memory Publishing Mode...');
  const testContent = '# Sovereign Whistleblower Report\n\nConfidential investigative evidence.';
  const expectedCid = calculateDeterministicCIDv1(testContent);
  assert(expectedCid.startsWith('bafk') || expectedCid.startsWith('bafy'), 'Deterministic CIDv1 multihash generated');

  const testFilePath = join(repoRoot, 'test-sovereign-report.md');
  const { writeFileSync } = await import('fs');
  writeFileSync(testFilePath, testContent, 'utf-8');

  try {
    const cliOutput = execSync(
      `pnpm --dir packages/sdk exec tsx src/bin/cli.ts publish "${testFilePath}" --local-only --sign --json`,
      { cwd: repoRoot, encoding: 'utf-8' }
    );
    const result = JSON.parse(cliOutput);
    assert(result.success === true, 'CLI reports success: true');
    assert(result.localOnly === true, 'CLI marks publish as localOnly');
    assert(result.cid === expectedCid, 'CLI computed CID matches in-memory deterministic multihash');
    assert(typeof result.publicKey === 'string' && result.publicKey.length === 64, 'Local Ed25519 public key generated (32 bytes hex)');
    assert(typeof result.signature === 'string' && result.signature.length === 128, 'Local Ed25519 signature generated (64 bytes hex)');
    assert(result.onionMirror.includes('.onion'), 'Live Onion Mirror is formatted');
    assert(result.localGateway.includes('http://127.0.0.1:4000/read/'), 'Local Gateway URL is formatted');

    // Verify .pressproof.json file
    const generatedProofPath = join(repoRoot, 'packages/sdk', result.proofFile.replace(/^\.\//, ''));
    if (existsSync(generatedProofPath)) {
      assert(true, 'Standalone .pressproof.json receipt written to disk');
      const proofJson = JSON.parse(readFileSync(generatedProofPath, 'utf-8'));
      assert(proofJson.standard === 'RFC-8032-CIDv1', 'Proof standard is RFC-8032-CIDv1');
      assert(proofJson.cid === expectedCid, 'Proof CID matches article CID');
      unlinkSync(generatedProofPath); // cleanup
    } else {
      assert(false, 'Generated .pressproof.json receipt not found on disk');
    }
  } catch (err: any) {
    console.error('CLI execution error:', err.stdout || err.message);
    assert(false, 'Air-gapped CLI publish command executed successfully');
  } finally {
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  }

  // --- 2. CLI daemon Command Inspection ---
  console.log('2️⃣  CLI pressprotocol daemon Command Verification...');
  try {
    const daemonOutput = execSync(
      `pnpm --dir packages/sdk exec tsx src/bin/cli.ts daemon`,
      { cwd: repoRoot, encoding: 'utf-8' }
    );
    assert(daemonOutput.includes('PRESSPROTOCOL SOVEREIGN HEADLESS MICRO-DAEMON'), 'Daemon banner displayed');
    assert(daemonOutput.includes('< 65MB RAM'), 'Daemon reports < 65MB RAM footprint constraint');
    assert(daemonOutput.includes('socks5://127.0.0.1:9050'), 'Tor SOCKS5 proxy port listed');
    assert(daemonOutput.includes('http://127.0.0.1:4000'), 'Local API gateway port listed');
  } catch (err: any) {
    console.error('Daemon command error:', err.stdout || err.message);
    assert(false, 'CLI daemon command executed successfully');
  }

  // --- 3. 1-Click Cloud Deployment Manifests ---
  console.log('3️⃣  1-Click Cloud Deployment Manifests Verification...');
  const renderPath = join(repoRoot, 'deploy/render.yaml');
  assert(existsSync(renderPath), 'deploy/render.yaml exists');
  const renderContent = readFileSync(renderPath, 'utf-8');
  assert(renderContent.includes('pressprotocol-node') && renderContent.includes('/data'), 'render.yaml mounts persistent disk');

  const flyPath = join(repoRoot, 'deploy/fly.toml');
  assert(existsSync(flyPath), 'deploy/fly.toml exists');
  const flyContent = readFileSync(flyPath, 'utf-8');
  assert(flyContent.includes('pressprotocol_data') && flyContent.includes('4000'), 'fly.toml defines HTTP service & volume');

  const akashPath = join(repoRoot, 'deploy/akash.yaml');
  assert(existsSync(akashPath), 'deploy/akash.yaml exists');
  const akashContent = readFileSync(akashPath, 'utf-8');
  assert(akashContent.includes('akash') && akashContent.includes('persistent: true'), 'akash.yaml defines decentralized storage');

  const doPath = join(repoRoot, 'deploy/digitalocean.sh');
  assert(existsSync(doPath), 'deploy/digitalocean.sh exists');
  const doContent = readFileSync(doPath, 'utf-8');
  assert(doContent.includes('pressprotocol-node.service'), 'digitalocean.sh sets up systemd service');

  // --- 4. Private Consortium PSK & Gated Swarms ---
  console.log('4️⃣  Private Consortium Swarm (PSK & Whitelist Authorization)...');
  
  // Set PSK on node
  const testPsk = 'secret-newsroom-consortium-psk-2026';
  federationService.setPsk(testPsk);

  const status = await federationService.getStatus();
  assert(status.federation.pskProtected === true, 'Node status reports pskProtected: true');
  assert(status.federation.gatedSwarm === true, 'Node status reports gatedSwarm: true');

  // Attempt gossip without PSK -> should be rejected
  const gossipFailPsk = await federationService.handleGossip({
    cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55consortium',
    title: 'Unauthorized Consortium Leak',
    signature: 'mock-sig',
    publicKey: 'mock-pub',
    timestamp: new Date().toISOString(),
  });
  assert(gossipFailPsk.accepted === false, 'Gossip without PSK rejected');
  assert(gossipFailPsk.reason?.includes('Unauthorized'), 'Rejection reason states Unauthorized PSK');

  // Attempt gossip with correct PSK -> should be accepted
  const gossipPassPsk = await federationService.handleGossip(
    {
      cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55consortium',
      title: 'Authorized Consortium Leak',
      signature: 'mock-sig',
      publicKey: 'mock-pub',
      timestamp: new Date().toISOString(),
    },
    { psk: testPsk }
  );
  assert(gossipPassPsk.accepted === true, 'Gossip with valid PSK accepted');

  // Test Whitelist Isolation
  const authorizedAuthorKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  federationService.setPeerWhitelist([authorizedAuthorKey]);

  const gossipFailWhitelist = await federationService.handleGossip(
    {
      cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55nonwhitelisted',
      title: 'Non-Whitelisted Author Leak',
      signature: 'mock-sig',
      publicKey: 'unauthorized-key-hex',
      timestamp: new Date().toISOString(),
    },
    { psk: testPsk }
  );
  assert(gossipFailWhitelist.accepted === false, 'Gossip from non-whitelisted key rejected in gated swarm');
  assert(gossipFailWhitelist.reason?.includes('Forbidden'), 'Rejection states Forbidden: Peer not in private consortium whitelist');

  const gossipPassWhitelist = await federationService.handleGossip(
    {
      cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55whitelisted',
      title: 'Whitelisted Author Leak',
      signature: 'mock-sig',
      publicKey: authorizedAuthorKey,
      timestamp: new Date().toISOString(),
    },
    { psk: testPsk }
  );
  assert(gossipPassWhitelist.accepted === true, 'Gossip from whitelisted consortium author accepted');

  // Reset node to open federation
  federationService.setPsk('');
  federationService.setPeerWhitelist([]);

  console.log('');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Wave 5 Pillar I Self-Sovereign Private Node tests passed!');
  }
}

runPrivateNodeTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
