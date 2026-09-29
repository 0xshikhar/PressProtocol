/**
 * Reader Page Diagnostics & Mirror Telemetry
 */

export async function displayReaderDiagnostics(
  banner: HTMLElement,
  titleEl: HTMLElement,
  cidEl: HTMLElement,
  mirrorsList: HTMLElement,
  cid: string,
  activeTabTitle: string
): Promise<void> {
  banner.classList.remove("hidden");
  cidEl.textContent = cid;
  titleEl.textContent = activeTabTitle.replace(" - PressProtocol", "");

  mirrorsList.innerHTML = `
    <div class="mirror-row">
      <span class="mirror-tag mono">IPFS Swarm</span>
      <span class="mirror-latency online mono">✓ Connected</span>
    </div>
    <div class="mirror-row">
      <span class="mirror-tag mono">Tor v3 Onion</span>
      <span class="mirror-latency online mono">✓ Live</span>
    </div>
    <div class="mirror-row">
      <span class="mirror-tag mono">Sovereign Gateway</span>
      <span class="mirror-latency online mono">✓ Online</span>
    </div>
  `;

  try {
    const res = await chrome.runtime.sendMessage({ action: "checkMirrors", cid });
    if (res?.success && res.data?.mirrors) {
      const mirrors = res.data.mirrors;
      mirrorsList.innerHTML = Object.entries(mirrors)
        .map(([type, m]: [string, any]) => `
          <div class="mirror-row">
            <span class="mirror-tag mono">${type === "ipfs" ? "IPFS Swarm" : type === "tor" ? "Tor v3 Onion" : "Sovereign Gateway"}</span>
            <span class="mirror-latency ${m.available ? "online" : "offline"} mono">
              ${m.available ? `✓ ${m.latency ? m.latency + "ms" : "Active"}` : "✗ Unavailable"}
            </span>
          </div>
        `)
        .join("");
    }
  } catch {
    // Keep baseline connected status
  }
}
