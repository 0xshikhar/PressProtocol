/**
 * PressProtocol Test Suite: Outbound Real-Time Webhook Subscriptions & Event Bus
 * 
 * Verifies:
 * 1. Webhook Secret Generation (whsec_<32_hex>)
 * 2. HMAC-SHA256 Payload Signing (X-PressProtocol-Signature: t=...,v1=...)
 * 3. Cryptographic Verification & Tamper Detection
 * 4. Replay Attack Protection (Timestamp Drift Windows)
 * 5. WebhookSubscriptionService CRUD & In-Memory Store
 * 6. Live HTTP Event Bus Dispatch & Receipt on Local Receiver
 * 7. Granular Event Filtering (article.published vs article.verified vs wildcard)
 * 8. Live Test Ping Trigger & Statistics Tracking
 * 9. Network / HTTP Error Handling & Retry Resilience
 * 10. Cross-Runtime Parity between Node.js Crypto & SDK noble/hashes Engine
 */

import assert from 'node:assert';
import http from 'node:http';
import {
  generateWebhookSecret,
  signWebhookPayload as nodeSign,
  verifyWebhookSignature as nodeVerify,
} from '../core/node/src/lib/webhook-crypto.js';
import { WebhookSubscriptionService } from '../core/node/src/services/WebhookSubscriptionService.js';
import {
  signWebhookPayload as sdkSign,
  verifyWebhookSignature as sdkVerify,
} from '../packages/sdk/src/webhooks.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✅ ${name}`);
          passed++;
        })
        .catch((err) => {
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
  console.log('🧪 Running Outbound Real-Time Webhook Subscriptions & Event Bus Tests\n');

  // =========================================================================
  // SUITE 1: Secret Generation & Signature Format
  // =========================================================================
  console.log('🔹 1. Secret Generation & HMAC-SHA256 Signature Formatting');

  test('generateWebhookSecret generates valid whsec_ prefixed 32-hex string', () => {
    const secret = generateWebhookSecret();
    assert(secret.startsWith('whsec_'), 'Must start with whsec_ prefix');
    assert.strictEqual(secret.length, 38, 'Must be 6 chars prefix + 32 chars hex = 38');
    assert(/^[0-9a-f]+$/.test(secret.replace('whsec_', '')), 'Must contain valid hex characters');
  });

  test('signWebhookPayload produces standard t=<timestamp>,v1=<signature> header', () => {
    const secret = 'whsec_abcdef0123456789abcdef0123456789';
    const payload = { event: 'article.published', cid: 'bafkreidemo' };
    const fixedTime = 1757721600;

    const result = nodeSign(payload, secret, fixedTime);
    assert.strictEqual(result.timestamp, fixedTime);
    assert(result.header.startsWith('t=1757721600,v1='), 'Header must match t=...,v1= format');
    assert.strictEqual(result.signature.length, 64, 'Signature must be 32-byte hex (64 chars)');
  });

  // =========================================================================
  // SUITE 2: Verification, Tamper Detection & Replay Protection
  // =========================================================================
  console.log('\n🔹 2. Verification, Tamper Detection & Replay Attack Protection');

  test('verifyWebhookSignature validates authentic payload and header', () => {
    const secret = generateWebhookSecret();
    const payload = { id: 'evt_101', cid: 'bafkreitestcid', verified: true };
    const { header } = nodeSign(payload, secret);

    const verification = nodeVerify(payload, header, secret);
    assert.strictEqual(verification.valid, true, 'Verification must succeed for authentic payload');
  });

  test('verifyWebhookSignature detects tampering with payload content', () => {
    const secret = generateWebhookSecret();
    const originalPayload = { title: 'Authentic Disclosure', amount: 1000 };
    const tamperedPayload = { title: 'Authentic Disclosure', amount: 9999 };
    const { header } = nodeSign(originalPayload, secret);

    const verification = nodeVerify(tamperedPayload, header, secret);
    assert.strictEqual(verification.valid, false, 'Tampered payload must fail verification');
    assert(verification.reason?.includes('mismatch'), 'Reason must indicate mismatch');
  });

  test('verifyWebhookSignature rejects incorrect shared secret', () => {
    const secretA = generateWebhookSecret();
    const secretB = generateWebhookSecret();
    const payload = { test: true };
    const { header } = nodeSign(payload, secretA);

    const verification = nodeVerify(payload, header, secretB);
    assert.strictEqual(verification.valid, false, 'Wrong secret must fail verification');
  });

  test('verifyWebhookSignature rejects timestamp drift outside 300s window (Replay Attack)', () => {
    const secret = generateWebhookSecret();
    const payload = { data: 'replay-test' };
    const staleTime = Math.floor(Date.now() / 1000) - 360; // 6 minutes ago (> 5m tolerance)
    const { header } = nodeSign(payload, secret, staleTime);

    const verification = nodeVerify(payload, header, secret, 300);
    assert.strictEqual(verification.valid, false, 'Stale timestamp must be rejected');
    assert(verification.reason?.includes('drifted'), 'Reason must indicate timestamp drift');
  });

  // =========================================================================
  // SUITE 3: Cross-Runtime Parity (Node.js crypto vs SDK @noble/hashes)
  // =========================================================================
  console.log('\n🔹 3. Cross-Runtime Parity: Node.js Crypto <-> SDK Noble/Hashes');

  test('Payload signed by Node.js can be verified by SDK noble/hashes engine', () => {
    const secret = generateWebhookSecret();
    const payload = { event: 'article.published', timestamp: new Date().toISOString() };
    const { header } = nodeSign(payload, secret);

    const sdkResult = sdkVerify(payload, header, secret);
    assert.strictEqual(sdkResult.valid, true, 'SDK must verify Node-signed payload');
  });

  test('Payload signed by SDK noble/hashes can be verified by Node.js engine', () => {
    const secret = generateWebhookSecret();
    const payload = { cid: 'bafkreibar', author: '0xWhistleblower' };
    const { header } = sdkSign(payload, secret);

    const nodeResult = nodeVerify(payload, header, secret);
    assert.strictEqual(nodeResult.valid, true, 'Node must verify SDK-signed payload');
  });

  // =========================================================================
  // SUITE 4: WebhookSubscriptionService CRUD
  // =========================================================================
  console.log('\n🔹 4. WebhookSubscriptionService Subscription Management (CRUD)');

  const service = new WebhookSubscriptionService();

  let sub1Id = '';
  test('createSubscription registers endpoint and returns generated secret', () => {
    const sub = service.createSubscription({
      url: 'https://newsroom.example.com/webhooks',
      events: ['article.published'],
      owner: 'user_acme',
      description: 'Acme Newsroom Sync',
    });

    assert(sub.id.startsWith('sub_'), 'ID must have sub_ prefix');
    assert(sub.secret.startsWith('whsec_'), 'Secret must have whsec_ prefix');
    assert.deepStrictEqual(sub.events, ['article.published']);
    assert.strictEqual(sub.status, 'active');
    sub1Id = sub.id;
  });

  test('listSubscriptions filters by owner accurately', () => {
    service.createSubscription({
      url: 'https://other.example.com/callback',
      events: ['*'],
      owner: 'user_beta',
    });

    const acmeSubs = service.listSubscriptions('user_acme');
    assert.strictEqual(acmeSubs.length, 1);
    assert.strictEqual(acmeSubs[0].id, sub1Id);

    const allSubs = service.listSubscriptions();
    assert.strictEqual(allSubs.length, 2);
  });

  test('getSubscription retrieves specific subscription details', () => {
    const sub = service.getSubscription(sub1Id);
    assert(sub !== null, 'Subscription should exist');
    assert.strictEqual(sub?.description, 'Acme Newsroom Sync');
  });

  test('deleteSubscription removes subscription from registry', () => {
    const deleted = service.deleteSubscription(sub1Id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(service.getSubscription(sub1Id), undefined);
  });


  // =========================================================================
  // SUITE 5: Live HTTP Event Bus Dispatch & Event Filtering
  // =========================================================================
  console.log('\n🔹 5. Live HTTP Webhook Delivery & Event Filtering');

  // Spin up an in-memory HTTP receiver server for live callback testing
  const receivedRequests: Array<{
    headers: http.IncomingHttpHeaders;
    body: any;
  }> = [];

  const mockServer = http.createServer((req, res) => {
    let bodyStr = '';
    req.on('data', (chunk) => (bodyStr += chunk));
    req.on('end', () => {
      try {
        const json = JSON.parse(bodyStr);
        receivedRequests.push({ headers: req.headers, body: json });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
  });

  await new Promise<void>((resolve) => {
    mockServer.listen(0, '127.0.0.1', () => resolve());
  });

  const address = mockServer.address() as any;
  const mockServerUrl = `http://127.0.0.1:${address.port}/webhook-target`;

  const liveTestService = new WebhookSubscriptionService();

  // Create a subscription listening to article.published only
  const publishedOnlySub = liveTestService.createSubscription({
    url: mockServerUrl,
    events: ['article.published'],
    description: 'Published Events Only',
  });

  // Create a wildcard subscription
  let wildcardDeliveryCount = 0;
  const wildcardServer = http.createServer((req, res) => {
    wildcardDeliveryCount++;
    res.writeHead(200);
    res.end('OK');
  });
  await new Promise<void>((resolve) => wildcardServer.listen(0, '127.0.0.1', () => resolve()));
  const wildcardUrl = `http://127.0.0.1:${(wildcardServer.address() as any).port}/wildcard`;
  liveTestService.createSubscription({
    url: wildcardUrl,
    events: ['*'],
  });

  await test('dispatch("article.published") delivers signed payload to matching subscriber', async () => {
    receivedRequests.length = 0;

    liveTestService.dispatch('article.published', {
      cid: 'bafkreig43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4',
      title: 'Breaking Investigative Report',
      tags: ['investigation', 'whistleblower'],
    });

    // Wait 150ms for asynchronous network delivery
    await new Promise((resolve) => setTimeout(resolve, 150));

    assert.strictEqual(receivedRequests.length, 1, 'Mock server must receive 1 delivery');
    const req = receivedRequests[0];

    assert.strictEqual(req.headers['x-pressprotocol-event'], 'article.published');
    const sigHeader = req.headers['x-pressprotocol-signature'] as string;
    assert(sigHeader, 'Signature header must be present');

    // Cryptographically verify the received payload against the subscriber secret
    const verifyResult = sdkVerify(req.body, sigHeader, publishedOnlySub.secret);
    assert.strictEqual(verifyResult.valid, true, 'Received webhook signature must be valid');
    assert.strictEqual(req.body.data.title, 'Breaking Investigative Report');
  });

  await test('dispatch("article.verified") is filtered out from single-topic subscriber', async () => {
    receivedRequests.length = 0;

    liveTestService.dispatch('article.verified', {
      cid: 'bafkreianotherexample',
      verified: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.strictEqual(receivedRequests.length, 0, 'Published-only subscriber must NOT receive verified event');
  });

  await test('Wildcard subscriber received both dispatched events', async () => {
    assert.strictEqual(wildcardDeliveryCount, 2, 'Wildcard subscriber should receive both events');
  });

  // =========================================================================
  // SUITE 6: Test Ping & Telemetry Stats
  // =========================================================================
  console.log('\n🔹 6. Test Ping Trigger & Statistics Tracking');

  await test('triggerTestPing delivers immediate ping and updates delivery stats', async () => {
    const pingResult = await liveTestService.triggerTestPing(publishedOnlySub.id);
    assert.strictEqual(pingResult.success, true);
    assert.strictEqual(pingResult.statusCode, 200);

    const updatedSub = liveTestService.getSubscription(publishedOnlySub.id);
    assert(updatedSub !== null);
    assert(updatedSub.stats.deliveredCount >= 2, 'Delivered count should have incremented');
    assert.strictEqual(updatedSub.stats.lastDeliveryStatus, 'success');
    assert(typeof updatedSub.stats.lastLatencyMs === 'number');
  });

  // =========================================================================
  // SUITE 7: Failure Handling & Graceful Degradation
  // =========================================================================
  console.log('\n🔹 7. Failure Handling & Non-Blocking Delivery on Unreachable Server');

  await test('Delivering to unreachable endpoint fails gracefully and updates failure stats', async () => {
    const badSub = liveTestService.createSubscription({
      url: 'http://127.0.0.1:59999/non-existent-endpoint',
      events: ['article.published'],
    });

    const pingResult = await liveTestService.triggerTestPing(badSub.id);
    assert.strictEqual(pingResult.success, false);
    assert(pingResult.error !== undefined);

    const updatedBadSub = liveTestService.getSubscription(badSub.id);
    assert.strictEqual(updatedBadSub?.stats.lastDeliveryStatus, 'failed');
    assert(updatedBadSub.stats.failureCount >= 1);
  });

  // Cleanup mock servers
  await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  await new Promise<void>((resolve) => wildcardServer.close(() => resolve()));

  // =========================================================================
  // Final Summary
  // =========================================================================
  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
