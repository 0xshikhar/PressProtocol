/**
 * Generates spec/test-vectors/signature-v2.json — the cross-language conformance fixtures for
 * the PressProtocol signature protocol. Ed25519 is deterministic, so every SDK must reproduce
 * the exact signingPayload and signature for each valid vector.
 *
 * Usage: pnpm --dir packages/sdk exec tsx ../../scripts/generate-signature-vectors.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSigningPayloadV2,
  publicKeyFromPrivate,
  sha256Hex,
  signArticleV2,
} from '../packages/sdk/src/protocol.js';
import { createCanonicalPayload, signPayload } from '../packages/sdk/src/crypto.js';

const seed = (label: string) => sha256Hex(`pressprotocol test vector ${label}`);

const articles = [
  {
    name: 'basic',
    article: { title: 'Hello PressProtocol', tags: ['press', 'freedom'], timestamp: '2026-11-01T00:00:00.000Z', content: '<p>Hello world</p>' },
  },
  {
    name: 'empty-tags-unicode',
    article: { title: 'Ünïcødé — “quotes” & 日本語 🗞️', tags: [], timestamp: '2026-11-01T12:34:56.789Z', content: '<p>Grüße aus München 🚀</p>' },
  },
  {
    name: 'escaping',
    article: {
      title: 'Back\\slash "quoted" / slash',
      tags: ['tab\tseparated', 'line\nbreak', 'ctrl\u0001char', 'sep\u2028line'],
      timestamp: '2024-05-01',
      content: '<script>alert("x")</script>\r\n\u0000 null byte',
    },
  },
  {
    name: 'tag-order-preserved',
    article: { title: 'Order matters', tags: ['zeta', 'alpha', 'mu'], timestamp: '2026-01-02T03:04:05Z', content: 'plain text body' },
  },
];

const vectors = [];
for (const [index, { name, article }] of articles.entries()) {
  const privateKey = seed(String(index));
  const publicKey = await publicKeyFromPrivate(privateKey);
  vectors.push({
    name,
    privateKey,
    publicKey,
    article,
    contentSha256: sha256Hex(article.content),
    signingPayload: buildSigningPayloadV2(article),
    signature: await signArticleV2(article, privateKey),
    expectedStatus: 'verified',
  });
}

const base = vectors[0];
const negative = [
  { name: 'tampered-content', article: { ...base.article, content: '<p>Hello world!</p>' } },
  { name: 'tampered-title', article: { ...base.article, title: 'Hello PressProtocoI' } },
  { name: 'tampered-tags-order', article: { ...base.article, tags: ['freedom', 'press'] } },
  { name: 'tampered-timestamp', article: { ...base.article, timestamp: '2026-11-01T00:00:00.001Z' } },
].map((v) => ({ ...v, publicKey: base.publicKey, signature: base.signature, expectedStatus: 'invalid' }));

const legacyPrivateKey = seed('legacy');
const legacyArticle = { title: 'Legacy v1', tags: ['old'], timestamp: '2025-06-01T00:00:00.000Z', content: '<p>body not covered</p>' };
const legacy = {
  name: 'legacy-v1-metadata-only',
  publicKey: await publicKeyFromPrivate(legacyPrivateKey),
  article: legacyArticle,
  signature: await signPayload(createCanonicalPayload(legacyArticle.title, legacyArticle.tags, legacyArticle.timestamp), legacyPrivateKey),
  expectedStatus: 'legacy',
};

const output = {
  protocol: 'pressprotocol/sig/v2',
  description:
    'Ed25519 over RFC 8785 canonical JSON of {proto, title, tags, timestamp, contentSha256}. Tags keep their order; title, timestamp and content are used byte-for-byte (UTF-8).',
  valid: vectors,
  invalid: negative,
  legacy: [legacy],
};

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'spec', 'test-vectors', 'signature-v2.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${vectors.length} valid, ${negative.length} invalid, 1 legacy vectors to ${outPath}`);
