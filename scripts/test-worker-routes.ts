/**
 * Route-level regression tests for the Cloudflare edge worker (core/worker), exercised
 * in-process through Hono's app.request() with no network access.
 */
import assert from 'node:assert';
import app from '../core/worker/src/index';
import { signArticleV2 } from '../packages/sdk/src/protocol.js';
import { createCanonicalPayload, generateKeypair, signPayload } from '../packages/sdk/src/crypto.js';

type Limiter = { limit: (o: { key: string }) => Promise<{ success: boolean }> };
const limiter = (allow: boolean): Limiter => ({ limit: async () => ({ success: allow }) });
const baseEnv: Record<string, unknown> = { CORS_ORIGIN: '*' };

const request = (path: string, init: RequestInit = {}, env = baseEnv) => app.request(path, init, env);
const postJson = (path: string, body: unknown, env = baseEnv) =>
  request(path, { method: 'POST', headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' }, body: JSON.stringify(body) }, env);

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

const kp = await generateKeypair();
const article = { title: 'Edge test', tags: ['edge'], timestamp: '2026-11-01T00:00:00.000Z', content: '<p>edge body</p>' };
const v2Signature = await signArticleV2(article, kp.privateKey);
const v1Signature = await signPayload(createCanonicalPayload(article.title, article.tags, article.timestamp), kp.privateKey);

console.log('🧪 Edge worker route regression suite\n');

await test('POST /api/v1/verify rejects garbage input (no longer always verified)', async () => {
  const body: any = await (await postJson('/api/v1/verify', { title: 'x', publicKey: '00', signature: 'garbage' })).json();
  assert.equal(body.verified, false);
  assert.equal(body.status, 'malformed');
});

await test('POST /api/v1/verify verifies a v2 signature', async () => {
  const body: any = await (await postJson('/api/v1/verify', { ...article, publicKey: kp.publicKey, signature: v2Signature })).json();
  assert.equal(body.status, 'verified');
  assert.equal(body.verified, true);
});

await test('POST /api/v1/verify reports tampered body as invalid', async () => {
  const body: any = await (await postJson('/api/v1/verify', { ...article, content: '<p>swapped</p>', publicKey: kp.publicKey, signature: v2Signature })).json();
  assert.equal(body.status, 'invalid');
});

await test('POST /api/v1/verify reports v1 signatures as legacy, not verified', async () => {
  const body: any = await (await postJson('/api/v1/verify', { ...article, publicKey: kp.publicKey, signature: v1Signature })).json();
  assert.equal(body.status, 'legacy');
  assert.equal(body.verified, false);
});

await test('POST /api/v1/publish/signed rejects an invalid signature with 401 before pinning', async () => {
  const res = await postJson('/api/v1/publish/signed', { ...article, publicKey: kp.publicKey, signature: '00'.repeat(64) });
  assert.equal(res.status, 401);
});

await test('POST /api/content rejects an invalid supplied signature with 401', async () => {
  const res = await postJson('/api/content', { ...article, publicKey: kp.publicKey, signature: '11'.repeat(64) });
  assert.equal(res.status, 401);
});

await test('POST /api/content validates input (missing title, too many tags, bad hex)', async () => {
  assert.equal((await postJson('/api/content', { content: 'x' })).status, 400);
  assert.equal((await postJson('/api/content', { title: 't', content: 'x', tags: Array(30).fill('a') })).status, 400);
  assert.equal((await postJson('/api/content', { title: 't', content: 'x', publicKey: 'zz', signature: 'yy' })).status, 400);
});

await test('JSON bodies over 2 MiB are rejected with 413', async () => {
  assert.equal((await postJson('/api/content', { title: 't', content: 'x'.repeat(3 * 1024 * 1024) })).status, 413);
});

await test('Publishing is rate limited when the limiter denies', async () => {
  const res = await postJson('/api/content', { title: 't', content: 'x' }, { ...baseEnv, PUBLISH_LIMITER: limiter(false) });
  assert.equal(res.status, 429);
});

await test('Malformed CIDs are rejected before gateway fan-out', async () => {
  assert.equal((await request('/api/content/not-a-cid')).status, 400);
  assert.equal((await request('/api/v1/resolve/..%2F..%2Fetc')).status, 400);
  assert.equal((await request('/api/mirrors/xyz/health')).status, 400);
});

await test('Non-CID routes are not caught by the CID guard', async () => {
  assert.equal((await request('/api/node/status')).status, 200);
  assert.equal((await request('/health')).status, 200);
});

await test('/api/manifests/stats returns null counts (not fabricated numbers) without an index', async () => {
  const body: any = await (await request('/api/manifests/stats')).json();
  assert.equal(body.totalManifests, null);
  assert.equal(body.source, 'unavailable');
});

await test('Image upload rejects non-image files', async () => {
  const form = new FormData();
  form.append('file', new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }));
  const res = await request('/api/upload/image', { method: 'POST', body: form });
  assert.equal(res.status, 400);
});

console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
