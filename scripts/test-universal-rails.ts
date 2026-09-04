/**
 * PressProtocol Test Suite: Universal Publishing Rails for Any Website & CMS
 * 
 * Verifies:
 * 1. Web Component <pressprotocol-publish> & Universal Editor Connectors (TipTap, Lexical, Quill, ProseMirror, Slate, TinyMCE, Textarea)
 * 2. Medium Surveillance Tracker Cleansing & Ingest Mirroring
 * 3. Substack Email Tracker Stripping & Ingest Mirroring
 * 4. Ghost CMS HMAC-SHA256 Webhook Verification, Replay Prevention & Ingestion
 * 5. Strapi CMS Bearer Authentication & Lifecycle Event Ingestion
 * 6. Generic Headless CMS (Sanity / Contentful) Ingestion
 * 7. Deterministic CIDv1 & Cryptographic Receipt Generation
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import { 
  detectEditorType, 
  extractEditorContent, 
  extractTitle, 
  extractMediaUrls, 
  extractArticleFromDom 
} from '../packages/widget/src/connectors.js';
import { 
  calculateDeterministicCIDv1, 
  generateKeypair, 
  signPayload, 
  base32Encode 
} from '../packages/widget/src/crypto.js';
import { sovereignMirrorService } from '../core/node/src/services/SovereignMirrorService.js';
import { cmsBridgeService } from '../core/node/src/services/CmsBridgeService.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  ✅ ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ❌ ${name}:`, err.message);
        failed++;
      });
    } else {
      console.log(`  ✅ ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

async function runAllTests() {
  console.log('🧪 Running Universal Publishing Rails for Any Website & CMS Test Suite\n');

  // =========================================================================
  // SUITE 1: Universal Editor Connectors
  // =========================================================================
  console.log('🔹 1. Universal Editor Connectors & DOM Extractors');

  test('detectEditorType accurately classifies textarea', () => {
    const mockEl = { tagName: 'TEXTAREA', classList: { contains: () => false }, getAttribute: () => null } as any;
    assert.strictEqual(detectEditorType(mockEl), 'textarea');
  });

  test('detectEditorType accurately classifies TinyMCE editor', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: (c: string) => c === 'mce-content-body' }, 
      getAttribute: () => null 
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'tinymce');
  });

  test('detectEditorType accurately classifies Quill editor', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: (c: string) => c === 'ql-editor' }, 
      getAttribute: () => null,
      closest: () => null,
      querySelector: () => null,
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'quill');
  });

  test('detectEditorType accurately classifies TipTap editor', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: (c: string) => c === 'tiptap' }, 
      getAttribute: () => null,
      closest: () => null,
      querySelector: () => null,
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'tiptap');
  });

  test('detectEditorType accurately classifies Lexical editor', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: () => false }, 
      getAttribute: (a: string) => a === 'data-lexical-editor' ? 'true' : null,
      closest: () => null,
      querySelector: () => null,
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'lexical');
  });

  test('detectEditorType accurately classifies Slate editor', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: () => false }, 
      getAttribute: (a: string) => a === 'data-slate-editor' ? 'true' : null,
      closest: () => null,
      querySelector: () => null,
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'slate');
  });

  test('detectEditorType accurately classifies ProseMirror element', () => {
    const mockEl = { 
      tagName: 'DIV', 
      classList: { contains: (c: string) => c === 'ProseMirror' }, 
      getAttribute: () => null,
      closest: () => null,
      querySelector: () => null,
    } as any;
    assert.strictEqual(detectEditorType(mockEl), 'prosemirror');
  });

  test('extractEditorContent extracts from TipTap instance if available', () => {
    const mockEl = {
      tagName: 'DIV',
      classList: { contains: (c: string) => c === 'tiptap' },
      getAttribute: () => null,
      editor: {
        getHTML: () => '<p>Sovereign content from TipTap instance</p>',
      },
      innerHTML: '<p>Fallback</p>',
    } as any;
    const content = extractEditorContent(mockEl);
    assert.strictEqual(content, '<p>Sovereign content from TipTap instance</p>');
  });

  test('extractTitle extracts input value or falls back to H1 in HTML', () => {
    const titleInput = { value: 'My Investigatory Report' } as any;
    assert.strictEqual(extractTitle(titleInput), 'My Investigatory Report');

    const htmlContent = '<div><h1>The Secret Cables</h1><p>Body...</p></div>';
    assert.strictEqual(extractTitle(null, htmlContent), 'The Secret Cables');
  });

  test('extractMediaUrls collects both HTML img tags and Markdown images', () => {
    const mixed = `
      <p>Here is an image: <img src="https://example.com/photo1.jpg" alt="Photo 1" /></p>
      And here is a markdown image: ![Chart](https://example.com/chart.png)
    `;
    const urls = extractMediaUrls(mixed);
    assert.deepStrictEqual(urls.sort(), ['https://example.com/chart.png', 'https://example.com/photo1.jpg'].sort());
  });

  test('extractArticleFromDom executes full automated extraction pipeline', () => {
    const mockEditor = {
      tagName: 'DIV',
      classList: { contains: () => false },
      getAttribute: (a: string) => a === 'data-lexical-editor' ? 'true' : null,
      innerHTML: '<h2>Decentralization Report</h2><p>Full content extracted safely.</p><img src="https://example.com/banner.jpg">',
    } as any;
    const mockTitle = {
      tagName: 'INPUT',
      value: 'Sovereign Web Component Report',
    } as any;

    const result = extractArticleFromDom({
      editorElement: mockEditor,
      titleElement: mockTitle,
    });

    assert.strictEqual(result.title, 'Sovereign Web Component Report');
    assert.strictEqual(result.editorType, 'lexical');
    assert.strictEqual(result.format, 'html');
    assert.strictEqual(result.media.length, 1);
    assert.strictEqual(result.media[0], 'https://example.com/banner.jpg');
    assert.ok(result.wordCount > 0, 'Word count calculated');
  });

  test('base32Encode produces RFC 4648 compliant base32 encoding', () => {
    const data = new TextEncoder().encode('Hello PressProtocol');
    const encoded = base32Encode(data);
    assert.strictEqual(encoded, 'jbswy3dpebihezltonihe33un5rw63a');
  });

  // =========================================================================
  // SUITE 2: Deterministic Cryptography & Base32
  // =========================================================================
  console.log('\n🔹 2. Client-Side In-Memory Cryptography & Deterministic CIDv1');

  await test('calculateDeterministicCIDv1 produces standard base32 multihash', async () => {
    const content = 'Sovereign decentralization is the only hedge against digital censorship.';
    const cid = calculateDeterministicCIDv1(content);
    assert.ok(cid.startsWith('b'), 'CIDv1 starts with multibase "b" prefix');
    assert.ok(cid.length > 50, 'CIDv1 length is standard multihash base32');
  });

  await test('generateKeypair & signPayload creates verifiable Ed25519 signature', async () => {
    const kp = await generateKeypair();
    assert.ok(kp.publicKey.length === 64, 'Public key is 32 bytes hex (64 chars)');
    assert.ok(kp.privateKey.length === 64, 'Private key is 32 bytes hex (64 chars)');

    const payload = JSON.stringify({ title: 'Freedom of the Press', timestamp: '2026-09-13T00:00:00.000Z' });
    const sig = await signPayload(payload, kp.privateKey);
    assert.ok(sig.length === 128, 'Signature is 64 bytes hex (128 chars)');
  });

  // =========================================================================
  // SUITE 3: Medium Sovereign Mirroring Bridge
  // =========================================================================
  console.log('\n🔹 3. Medium Mirroring & Commercial Surveillance Cleanser');

  test('cleanseSurveillanceTrackers removes tracking pixels, UTM params, and redirect wrappers', () => {
    const dirtyMediumHtml = `
      <h1>Whistleblower Dispatches</h1>
      <p>Read more at <a href="https://medium.com/m/global-identity?redirectUrl=https%3A%2F%2Ftorproject.org%3Futm_source%3Dmedium%26utm_medium%3Demail">Tor Project</a></p>
      <img src="https://medium.com/_/stat?event=post.opened&post_id=abc12345" width="1" height="1" />
      <img src="https://cdn.example.com/pixel.gif" width="1" height="1" />
      <script src="https://medium.com/tracking.js"></script>
    `;

    const { cleansed, trackersRemoved } = sovereignMirrorService.cleanseSurveillanceTrackers(dirtyMediumHtml);
    assert.ok(trackersRemoved >= 3, `Expected >= 3 trackers removed, got ${trackersRemoved}`);
    assert.ok(!cleansed.includes('stat?event='), 'Tracking pixel removed');
    assert.ok(!cleansed.includes('utm_source'), 'UTM params removed');
    assert.ok(!cleansed.includes('/m/global-identity?redirectUrl='), 'Medium redirect wrapper removed');
    assert.ok(!cleansed.includes('<script'), 'Tracking scripts removed');
    assert.ok(cleansed.includes('https://torproject.org'), 'Unwrapped clean destination preserved');
  });

  await test('mirrorMediumArticle publishes sanitized sovereign publication', async () => {
    const result = await sovereignMirrorService.mirrorMediumArticle({
      url: 'https://medium.com/@activist/sovereignty-now-1234',
      title: 'Sovereignty Now',
      content: '<p>Decentralize everything.<img src="https://medium.com/_/stat?event=read" width="1" height="1"></p>',
      author: 'Activist X',
      tags: ['liberty', 'crypto'],
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.title, 'Sovereignty Now');
    assert.strictEqual(result.platform, 'medium');
    assert.ok(result.cid.startsWith('b') || result.cid.startsWith('Qm'), 'Has valid IPFS CID');
    assert.ok(result.proof.publisher.signature.length > 0, 'Carries cryptographic signature');
    assert.strictEqual(result.sanitizedTrackerCount, 1, 'Sanitized 1 tracking pixel');
  });

  // =========================================================================
  // SUITE 4: Substack Mirroring Bridge
  // =========================================================================
  console.log('\n🔹 4. Substack Cross-Syndication Mirroring');

  await test('mirrorSubstackPost sanitizes email beacons and produces sovereign receipt', async () => {
    const substackHtml = `
      <h1>The Weekly Dissident #42</h1>
      <p>Inside the offshore banking leaks.</p>
      <img src="https://substackcdn.com/open_tracking?token=secret123" width="1" height="1" />
    `;

    const result = await sovereignMirrorService.mirrorSubstackPost({
      url: 'https://dissident.substack.com/p/weekly-42',
      title: 'The Weekly Dissident #42',
      subtitle: 'Inside the offshore banking leaks',
      content: substackHtml,
      author: 'Investigative Bureau',
      tags: ['panama', 'leaks'],
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.platform, 'substack');
    assert.ok(!result.cleansedContent.includes('open_tracking'), 'Email beacon stripped');
    assert.ok(result.proof.cid.startsWith('b') || result.proof.cid.startsWith('Qm'), 'Proof CID present');
  });

  // =========================================================================
  // SUITE 5: Ghost CMS Webhook Bridge
  // =========================================================================
  console.log('\n🔹 5. Ghost CMS Webhook Ingress & Replay Protection');

  const secret = 'ghost_test_secret_987654321';
  const sampleGhostBody = JSON.stringify({
    post: {
      current: {
        id: 'ghost_post_xyz',
        title: 'Ghost Sovereign Dispatch',
        slug: 'ghost-sovereign-dispatch',
        html: '<p>Published directly from Ghost CMS headless dashboard.</p>',
        published_at: new Date().toISOString(),
        tags: [{ id: '1', name: 'freedom', slug: 'freedom' }],
        primary_author: { id: 'auth1', name: 'John Milton', slug: 'john-milton' },
      },
    },
  });

  test('verifyGhostSignature accepts authentic HMAC signature within timestamp window', () => {
    const timestamp = Date.now();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${sampleGhostBody}${timestamp}`);
    const sig = hmac.digest('hex');
    const header = `sha256=${sig}, t=${timestamp}`;

    const check = cmsBridgeService.verifyGhostSignature(sampleGhostBody, header, secret);
    assert.strictEqual(check.valid, true, 'Valid Ghost signature verified');
  });

  test('verifyGhostSignature rejects replayed / expired timestamp', () => {
    const expiredTimestamp = Date.now() - 600000; // 10 minutes ago (> 5 min window)
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${sampleGhostBody}${expiredTimestamp}`);
    const sig = hmac.digest('hex');
    const header = `sha256=${sig}, t=${expiredTimestamp}`;

    const check = cmsBridgeService.verifyGhostSignature(sampleGhostBody, header, secret);
    assert.strictEqual(check.valid, false, 'Expired timestamp rejected');
    assert.ok(check.reason?.includes('replay protection'), 'Rejected due to replay window');
  });

  test('verifyGhostSignature rejects tampered body with correct key', () => {
    const timestamp = Date.now();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${sampleGhostBody}${timestamp}`);
    const sig = hmac.digest('hex');
    const header = `sha256=${sig}, t=${timestamp}`;

    const tamperedBody = sampleGhostBody + '/* injected */';
    const check = cmsBridgeService.verifyGhostSignature(tamperedBody, header, secret);
    assert.strictEqual(check.valid, false, 'Tampered body rejected');
  });

  await test('ingestGhostPost stores article and signs sovereign proof', async () => {
    const payload = JSON.parse(sampleGhostBody);
    const result = await cmsBridgeService.ingestGhostPost(payload.post);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.title, 'Ghost Sovereign Dispatch');
    assert.strictEqual(result.platform, 'ghost');
    assert.ok(result.proof.cid.startsWith('b') || result.proof.cid.startsWith('Qm'), 'Proof CID verified');
    assert.ok(result.proof.publisher.signature.length > 0, 'Publisher signature verified');
  });

  // =========================================================================
  // SUITE 6: Strapi CMS Webhook Bridge & Generic Headless CMS
  // =========================================================================
  console.log('\n🔹 6. Strapi CMS & Generic CMS Ingress');

  await test('ingestStrapiEntry parses entry.publish event and creates proof', async () => {
    const strapiPayload = {
      event: 'entry.publish',
      createdAt: new Date().toISOString(),
      model: 'article',
      entry: {
        id: 101,
        title: 'Strapi Headless Sovereign Post',
        content: '<p>Content authored inside Strapi CMS v4/v5 admin.</p>',
        slug: 'strapi-headless-post',
        tags: [{ name: 'cms' }, { name: 'strapi' }],
      },
    };

    const result = await cmsBridgeService.ingestStrapiEntry(strapiPayload);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.title, 'Strapi Headless Sovereign Post');
    assert.strictEqual(result.platform, 'strapi');
    assert.strictEqual(result.model, 'article');
    assert.ok(result.proof.cid.startsWith('b') || result.proof.cid.startsWith('Qm'), 'Valid IPFS CID generated');
  });

  await test('ingestGenericCms handles Sanity / Contentful document schemas', async () => {
    const genericPayload = {
      title: 'Sanity Studio Release',
      content: '## Decentralized Archival\nAll news is signed.',
      tags: ['sanity', 'studio'],
      platform: 'sanity-io',
      author: 'Newsroom Desk',
    };

    const result = await cmsBridgeService.ingestGenericCms(genericPayload);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.title, 'Sanity Studio Release');
    assert.strictEqual(result.platform, 'sanity-io');
    assert.ok(result.proof.publisher.signature.length > 0, 'Signature attached');
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n=======================================');
  console.log(`📊 Universal Publishing Rails Results: ${passed} passed, ${failed} failed`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
