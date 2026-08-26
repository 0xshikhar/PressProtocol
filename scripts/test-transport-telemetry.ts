import { GET as getGateways } from "../apps/web/src/app/api/gateways/route";
import { GET as getManifestStats } from "../apps/web/src/app/api/manifests/stats/route";

async function runTests() {
  console.log("🧪 Starting Multi-Transport Telemetry & Live Gateway Probing Test Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // TEST 1: Gateway Latency Probe API
  console.log("🔹 1. Testing Gateway Latency Probe Route (/api/gateways)...");
  const startProbe = performance.now();
  const res1 = await getGateways();
  const durationProbe = performance.now() - startProbe;

  assert(res1.status === 200, "HTTP 200 returned from /api/gateways");
  assert(durationProbe < 4000, `Probes completed concurrently in ${Math.round(durationProbe)}ms (< 4000ms max SLA)`);

  const data1 = await res1.json();
  assert(data1.success === true, "data.success is true");
  assert(Array.isArray(data1.gateways), "data.gateways is an array");
  assert(data1.gateways.length === 5, `Expected 5 gateway probes, found ${data1.gateways.length}`);
  assert(data1.cached === false, "First probe call is freshly computed (cached: false)");

  const gatewayIds = data1.gateways.map((g: any) => g.id);
  assert(gatewayIds.includes("pinata"), "Includes Pinata gateway");
  assert(gatewayIds.includes("cloudflare"), "Includes Cloudflare gateway");
  assert(gatewayIds.includes("ipfs-io"), "Includes IPFS.io mirror");
  assert(gatewayIds.includes("dweb"), "Includes dweb.link gateway");
  assert(gatewayIds.includes("tor-onion"), "Includes Tor onion service");

  for (const gw of data1.gateways) {
    assert(typeof gw.latencyMs === "number" && gw.latencyMs > 0, `${gw.name} has valid measured latency (${gw.latencyMs}ms)`);
    assert(["optimal", "operational", "degraded", "offline"].includes(gw.status), `${gw.name} has valid status: ${gw.status}`);
    assert(typeof gw.uptime === "string", `${gw.name} has uptime: ${gw.uptime}`);
  }

  assert(typeof data1.fastest?.id === "string", `Identified fastest gateway: ${data1.fastest?.name} (${data1.fastest?.latencyMs}ms)`);
  assert(data1.averageLatencyMs > 0, `Computed average latency: ${data1.averageLatencyMs}ms`);
  assert(data1.activeDHTNodes >= 300, `Reported active DHT nodes: ${data1.activeDHTNodes}`);

  // TEST 2: In-Memory 15s Gateway Cache Validation
  console.log("\n🔹 2. Testing 15-Second In-Memory Gateway Caching & Rate-Limiting Defense...");
  const res2 = await getGateways();
  const data2 = await res2.json();

  assert(data2.cached === true, "Immediate second call returned cached results (cached: true)");
  assert(data2.cacheExpiresInMs > 0 && data2.cacheExpiresInMs <= 15000, `Cache TTL remaining: ${data2.cacheExpiresInMs}ms`);
  assert(data2.gateways[0].id === data1.gateways[0].id, "Cached gateways match previous results");

  // TEST 3: Discovery & Manifest Stats API
  console.log("\n🔹 3. Testing Discovery & Manifest Stats Route (/api/manifests/stats)...");
  const statsRes = await getManifestStats();
  assert(statsRes.status === 200, "HTTP 200 returned from /api/manifests/stats");

  const statsData = await statsRes.json();
  assert(statsData.success === true, "statsData.success is true");
  assert(statsData.data.totalPublished >= 0, `Total published count: ${statsData.data.totalPublished}`);
  assert(statsData.data.manifestCount >= 0, `Manifest count: ${statsData.data.manifestCount}`);
  assert(statsData.data.verificationSuccessRate.includes("%"), `Verification success rate: ${statsData.data.verificationSuccessRate}`);
  assert(statsData.data.activeDHTNodes >= 300, `Active DHT nodes: ${statsData.data.activeDHTNodes}`);
  assert(statsData.data.activeRelays >= 4, `Active multi-transport relays: ${statsData.data.activeRelays}`);
  assert(Array.isArray(statsData.data.tags) && statsData.data.tags.length > 0, `Indexed syndication tags: ${statsData.data.tags.join(", ")}`);

  console.log(`\n🎉 All ${passed}/${total} Multi-Transport Telemetry tests passed successfully!`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
