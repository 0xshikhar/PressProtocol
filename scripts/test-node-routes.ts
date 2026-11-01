/**
 * Route-level regression tests for the sovereign node (core/node), exercised in-process
 * through fastify.inject() with a temporary DATA_DIR. No network calls are made:
 * unsigned gossip is rejected before any fetch, storage runs in pure-sovereign mode.
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert';

// Env must be set before any node module is imported (env.ts reads it at load time)
process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'pp-node-test-'));
process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'pp_test_admin_key_for_routes';
process.env.PINATA_API_KEY = '';
process.env.PINATA_SECRET_KEY = '';
process.env.CORS_ORIGIN = '*';
process.env.DATABASE_URL = '';
delete process.env.GHOST_WEBHOOK_SECRET;
delete process.env.STRAPI_WEBHOOK_SECRET;

const { buildServer } = await import('../core/node/src/index.js');
const { apiKeyService } = await import('../core/node/src/services/ApiKeyService.js');
const { signArticleV2, verifyPublication } = await import('../packages/sdk/src/protocol.js');
const { createCanonicalPayload, generateKeypair, signPayload } = await import('../packages/sdk/src/crypto.js');

const ADMIN_KEY = 'pp_test_admin_key_for_routes';
const operatorKey = apiKeyService.generateKey({
  name: 'test operator',
  scopes: ['resolve', 'publish:raw', 'federate', 'pin'],
  isTest: true,
}).key;
const readerKey = apiKeyService.generateKey({ name: 'test reader', scopes: ['resolve'], isTest: true }).key;

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.error(`  ❌ ${name}: ${err.message}`);
  }
}

const app = await buildServer({ logger: false });
const postJson = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  app.inject({ method: 'POST', url: path, headers: { 'content-type': 'application/json', ...headers }, payload: body as any });

console.log('🧪 Sovereign node route regression suite\n');

await test('health and node status respond without a database', async () => {
  assert.equal((await app.inject('/health')).statusCode, 200);
  const status: any = (await app.inject('/api/node/status')).json();
  assert.equal(status.success, true);
  assert.equal(typeof status.nodePublicKey, 'string');
  assert.equal(status.nodePublicKey.length, 64);
});

await test('admin bootstrap key from ADMIN_API_KEY works; generated keys authenticate', async () => {
  const res = await app.inject({ url: '/api/v1/admin/keys', headers: { 'x-api-key': ADMIN_KEY } });
  assert.equal(res.statusCode, 200);
  assert.ok(res.json().keys.length >= 3);
});

await test('operator endpoints reject unauthenticated callers', async () => {
  assert.equal((await app.inject({ method: 'PUT', url: '/api/node/federation/policy', payload: { policy: 'all' } })).statusCode, 401);
  assert.equal((await postJson('/api/node/federation/peers', { peerUrl: 'https://peer.example' })).statusCode, 401);
  assert.equal((await postJson('/api/v1/admin/keys', { name: 'x' })).statusCode, 401);
  assert.equal((await postJson('/api/v1/webhooks/subscriptions', { url: 'https://hook.example/x' })).statusCode, 401);
  assert.equal((await postJson('/api/upload/json', { data: { a: 1 } })).statusCode, 401);
  assert.equal((await postJson('/api/bridge/cms', { title: 't', content: 'c' })).statusCode, 401);
  assert.equal((await postJson('/api/v1/publish/raw', { title: 't', content: 'c' })).statusCode, 401);
});

await test('operator endpoints reject keys lacking the required scope', async () => {
  const res = await postJson('/api/v1/admin/keys', { name: 'x' }, { 'x-api-key': readerKey });
  assert.equal(res.statusCode, 403);
});

await test('scope-holding keys reach federation policy and admin key issuance', async () => {
  const federateKey = apiKeyService.generateKey({ name: 'fed', scopes: ['federate'], isTest: true }).key;
  const policy = await app.inject({ method: 'PUT', url: '/api/node/federation/policy', headers: { 'x-api-key': federateKey, 'content-type': 'application/json' }, payload: { policy: 'followed', followedKeys: [] } });
  assert.equal(policy.statusCode, 200);
  const keys = await postJson('/api/v1/admin/keys', { name: 'second', scopes: ['resolve'] }, { 'x-api-key': ADMIN_KEY });
  assert.equal(keys.statusCode, 201);
});

await test('webhook subscriptions: SSRF blocked, secret returned once, owner-scoped', async () => {
  const ssrf = await postJson('/api/v1/webhooks/subscriptions', { url: 'http://169.254.169.254/latest/meta-data' }, { 'x-api-key': readerKey });
  assert.equal(ssrf.statusCode, 400);

  const created = await postJson('/api/v1/webhooks/subscriptions', { url: 'https://hooks.example.com/inbound' }, { 'x-api-key': readerKey });
  assert.equal(created.statusCode, 201);
  const sub = created.json().subscription;
  assert.ok(sub.secret, 'secret returned at creation');
  const listed = (await app.inject({ url: '/api/v1/webhooks/subscriptions', headers: { 'x-api-key': readerKey } })).json().subscriptions;
  assert.equal(listed.length, 1);
  assert.equal(listed[0].secret, undefined, 'secret must not be exposed after creation');

  const otherKey = apiKeyService.generateKey({ name: 'other', scopes: ['resolve'], isTest: true }).key;
  const del = await app.inject({ method: 'DELETE', url: `/api/v1/webhooks/subscriptions/${sub.id}`, headers: { 'x-api-key': otherKey } });
  assert.equal(del.statusCode, 403);
});

await test('POST /api/node/gossip rejects unsigned and malformed payloads', async () => {
  const unsigned = await postJson('/api/node/gossip', { cid: 'bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4', title: 'x' });
  assert.equal(unsigned.statusCode, 422);
  const badCid = await postJson('/api/node/gossip', { cid: 'not-a-cid', title: 'x', signature: 'ab'.repeat(64), publicKey: 'cd'.repeat(32) });
  assert.equal(badCid.statusCode, 422);
});

await test('POST /api/v1/verify distinguishes verified, legacy and invalid', async () => {
  const kp = await generateKeypair();
  const article = { title: 'Node verify', tags: ['n'], timestamp: '2026-11-01T00:00:00.000Z', content: '<p>body</p>' };
  const v2 = await signArticleV2(article, kp.privateKey);
  const res = (await postJson('/api/v1/verify', { ...article, publicKey: kp.publicKey, signature: v2 })).json();
  assert.equal(res.isValid, true);
  assert.equal(res.status, 'verified');

  const v1 = await signPayload(createCanonicalPayload(article.title, article.tags, article.timestamp), kp.privateKey);
  const legacy = (await postJson('/api/v1/verify', { ...article, publicKey: kp.publicKey, signature: v1 })).json();
  assert.equal(legacy.status, 'legacy');
  assert.equal(legacy.isValid, false);

  const bad = (await postJson('/api/v1/verify', { ...article, content: '<p>other</p>', publicKey: kp.publicKey, signature: v2 })).json();
  assert.equal(bad.status, 'invalid');
});

await test('POST /api/v1/publish/signed rejects v1 signatures and accepts v2', async () => {
  const kp = await generateKeypair();
  const article = { title: 'Signed publish', tags: ['s'], timestamp: '2026-11-01T00:00:00.000Z', content: '<p>signed body</p>' };
  const v1 = await signPayload(createCanonicalPayload(article.title, article.tags, article.timestamp), kp.privateKey);
  const rejected = await postJson('/api/v1/publish/signed', { ...article, publicKey: kp.publicKey, signature: v1 });
  assert.equal(rejected.statusCode, 401);
  assert.match(rejected.json().error, /legacy v1/i);

  const v2 = await signArticleV2(article, kp.privateKey);
  const accepted = await postJson('/api/v1/publish/signed', { ...article, publicKey: kp.publicKey, signature: v2 });
  assert.equal(accepted.statusCode, 201);
  assert.equal(accepted.json().proof.publisher.sigVersion, undefined); // client signature passthrough
  assert.equal(accepted.json().proof.publisher.publicKey, kp.publicKey);
});

await test('POST /api/v1/publish/raw signs with the persistent node identity (v2)', async () => {
  const first = await postJson('/api/v1/publish/raw', { title: 'Custodial', content: '<p>by node</p>', tags: ['custody'] }, { 'x-api-key': operatorKey });
  assert.equal(first.statusCode, 201);
  const body = first.json();
  assert.equal(body.publisher.sigVersion, 2);
  const check = await verifyPublication({
    title: 'Custodial', tags: ['custody'], timestamp: body.timestamp, content: '<p>by node</p>',
    publicKey: body.publisher.publicKey, signature: body.publisher.signature,
  });
  assert.equal(check.status, 'verified');
  const statusPub = (await app.inject('/api/node/status')).json().nodePublicKey;
  assert.equal(body.publisher.publicKey, statusPub, 'publish must use the same persistent node identity exposed in status');
});

await test('POST /api/content publishes unsigned honestly or verifies a v2 signature', async () => {
  const anon = await postJson('/api/content', { title: 'Anon', content: '<p>anon</p>', tags: [] });
  assert.equal(anon.statusCode, 201);
  const anonData = anon.json().data;
  assert.equal(anonData.publisher.signatureStatus, 'unsigned');
  assert.equal(anonData.storage, 'local');
  assert.equal(anonData.pinnedToIpfs, false);

  const kp = await generateKeypair();
  const timestamp = '2026-11-01T00:00:00.000Z';
  const signed = { title: 'Signed web article', tags: ['web'], timestamp, content: '<p>web body</p>' };
  const signature = await signArticleV2(signed, kp.privateKey);
  const res = await postJson('/api/content', { ...signed, publicKey: kp.publicKey, signature });
  assert.equal(res.statusCode, 201);
  assert.equal(res.json().data.publisher.signatureStatus, 'verified');

  const legacy = await signPayload(createCanonicalPayload(signed.title, signed.tags, timestamp), kp.privateKey);
  const legacyRes = await postJson('/api/content', { ...signed, publicKey: kp.publicKey, signature: legacy });
  assert.equal(legacyRes.statusCode, 401);
});

await test('GET /read/:cid sanitizes untrusted HTML and sends a CSP', async () => {
  const pub = await postJson('/api/content', {
    title: '<img src=x onerror=alert(1)>',
    content: '<p>safe</p><script>alert("xss")</script><img src="https://ok.example/i.png" onerror="alert(2)">',
    tags: ['<b>bad</b>'],
  });
  const cid = pub.json().data.cid;
  const res = await app.inject(`/read/${cid}`);
  assert.equal(res.statusCode, 200);
  const csp = res.headers['content-security-policy'];
  assert.match(String(csp), /default-src 'none'/);
  const html = res.body;
  assert.ok(!html.includes('<script>alert'), 'script tag must be stripped');
  assert.ok(!/<img[^>]*onerror/i.test(html), 'event handler attributes must be stripped');
  assert.ok(html.includes('&lt;img'), 'title must be HTML-escaped');
  assert.ok(html.includes('Unsigned'), 'honest badge for unsigned content');
});

await test('Ghost and Strapi ingress are disabled without configured secrets', async () => {
  assert.equal((await postJson('/api/bridge/ghost', { post: {} })).statusCode, 503);
  assert.equal((await postJson('/api/bridge/strapi', { entry: {} })).statusCode, 503);
});

console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
await app.close();
if (failed > 0) process.exit(1);
