/**
 * Conformance suite: the TypeScript protocol implementation must reproduce
 * spec/test-vectors/signature-v2.json exactly (shared with the Python, Go and Rust SDKs).
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSigningPayloadV2,
  publicKeyFromPrivate,
  sha256Hex,
  signArticleV2,
  verifyPublication,
} from '../packages/sdk/src/protocol.js';
import { verifyArticle } from '../packages/sdk/src/crypto.js';

const vectors = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'spec', 'test-vectors', 'signature-v2.json'), 'utf8')
);

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

for (const v of vectors.valid) {
  await test(`valid/${v.name}: payload, key, signature and status`, async () => {
    assert.equal(sha256Hex(v.article.content), v.contentSha256);
    assert.equal(buildSigningPayloadV2(v.article), v.signingPayload);
    assert.equal(await publicKeyFromPrivate(v.privateKey), v.publicKey);
    assert.equal(await signArticleV2(v.article, v.privateKey), v.signature);
    const res = await verifyPublication({ ...v.article, publicKey: v.publicKey, signature: v.signature });
    assert.equal(res.status, 'verified');
    assert.equal(res.isValid, true);
  });
}

for (const v of [...vectors.invalid, ...vectors.legacy]) {
  await test(`${v.expectedStatus}/${v.name}: not reported as verified`, async () => {
    const res = await verifyPublication({ ...v.article, publicKey: v.publicKey, signature: v.signature });
    assert.equal(res.status, v.expectedStatus);
    assert.equal(res.isValid, false);
  });
}

await test('SDK verifyArticle delegates to the protocol (legacy is not verified)', async () => {
  const legacy = vectors.legacy[0];
  const res = await verifyArticle({
    title: legacy.article.title,
    tags: legacy.article.tags,
    content: legacy.article.content,
    timestamp: legacy.article.timestamp,
    publisher: { pubkey: legacy.publicKey, signature: legacy.signature },
  });
  assert.equal(res.status, 'legacy');
  assert.equal(res.isValid, false);
});

await test('title-only signatures are no longer accepted', async () => {
  const v = vectors.valid[0];
  const { signPayload } = await import('../packages/sdk/src/crypto.js');
  const titleOnly = await signPayload(v.article.title, v.privateKey);
  const res = await verifyPublication({ ...v.article, publicKey: v.publicKey, signature: titleOnly });
  assert.equal(res.status, 'invalid');
});

console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
