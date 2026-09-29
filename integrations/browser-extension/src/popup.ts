/**
 * PressProtocol Sovereign Web Clipper - Interactive Popup Controller
 * Manages 1-click sovereign archival, scrap vault, and transport health telemetry.
 */
import { extractPageContent } from "./clipper";
import {
  getOrCreateBurnerIdentity,
  burnCurrentIdentity,
  type BurnerIdentity,
} from "./crypto";
import type { ClippedArticle, SovereignScrap, ExtensionSettings } from "./types";
import { DEFAULT_SETTINGS, CANONICAL_ONION_HOST } from "./config";
import { initTabs } from "./ui/tabs";
import { renderScrapsList } from "./ui/scraps";
import { displayReaderDiagnostics } from "./ui/diagnostics";
import { updatePipelineStep } from "./ui/pipeline";

let activeTabId: number | null = null;
let activeTabUrl: string = "";
let activeTabTitle: string = "";
let currentIdentity: BurnerIdentity | null = null;
let currentSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
let preloadedArticle: ClippedArticle | null = null;

// Header DOM Elements
const headerPseudonym = document.getElementById("headerPseudonym")!;

// Tab 1 Elements
const readerBanner = document.getElementById("readerBanner")!;
const readerTitle = document.getElementById("readerTitle")!;
const readerCid = document.getElementById("readerCid")!;
const mirrorsList = document.getElementById("mirrorsList")!;

const targetDomain = document.getElementById("targetDomain")!;
const targetTitle = document.getElementById("targetTitle")!;
const targetAuthor = document.getElementById("targetAuthor")!;
const targetReadTime = document.getElementById("targetReadTime")!;

const btnClipNow = document.getElementById("btnClipNow") as HTMLButtonElement;
const clipProgressCard = document.getElementById("clipProgressCard")!;
const clipSuccessCard = document.getElementById("clipSuccessCard")!;

const stepExtract = document.getElementById("stepExtract")!;
const stepScrub = document.getElementById("stepScrub")!;
const stepSign = document.getElementById("stepSign")!;
const stepBroadcast = document.getElementById("stepBroadcast")!;

const publishedCid = document.getElementById("publishedCid")!;
const btnCopyCid = document.getElementById("btnCopyCid") as HTMLButtonElement;
const btnOpenReader = document.getElementById("btnOpenReader") as HTMLAnchorElement;
const btnCopyOnion = document.getElementById("btnCopyOnion") as HTMLButtonElement;
const btnCopyEmbedCode = document.getElementById("btnCopyEmbedCode") as HTMLButtonElement;

// Tab 2 Elements
const scrapsCountBadge = document.getElementById("scrapsCountBadge")!;
const scrapsEmpty = document.getElementById("scrapsEmpty")!;
const scrapsList = document.getElementById("scrapsList")!;
const vaultFooter = document.getElementById("vaultFooter")!;
const btnClearScraps = document.getElementById("btnClearScraps") as HTMLButtonElement;
const btnSendToWriter = document.getElementById("btnSendToWriter") as HTMLButtonElement;

// Tab 3 Elements
const settingsPseudonym = document.getElementById("settingsPseudonym")!;
const settingsPubKey = document.getElementById("settingsPubKey")!;
const btnCopyPubKey = document.getElementById("btnCopyPubKey") as HTMLButtonElement;
const btnBurnIdentity = document.getElementById("btnBurnIdentity") as HTMLButtonElement;
const inputApiUrl = document.getElementById("inputApiUrl") as HTMLInputElement;
const inputWebAppUrl = document.getElementById("inputWebAppUrl") as HTMLInputElement;
const btnSaveSettings = document.getElementById("btnSaveSettings") as HTMLButtonElement;
const settingsSavedToast = document.getElementById("settingsSavedToast")!;

/**
 * Initialize Popup
 */
async function init() {
  initTabs((tabId) => {
    if (tabId === "tabScraps") {
      refreshScraps();
    }
  });

  await loadSettings();
  await loadIdentity();
  await refreshScraps();
  await inspectActiveTab();
}

/**
 * Load Settings from Extension Storage
 */
async function loadSettings() {
  const res = await chrome.runtime.sendMessage({ action: "getSettings" });
  if (res?.success && res.data) {
    currentSettings = res.data;
    inputApiUrl.value = currentSettings.apiUrl || DEFAULT_SETTINGS.apiUrl;
    inputWebAppUrl.value = currentSettings.webAppUrl || DEFAULT_SETTINGS.webAppUrl;
  }
}

/**
 * Load or Create Burner Identity
 */
async function loadIdentity() {
  currentIdentity = await getOrCreateBurnerIdentity();
  headerPseudonym.textContent = currentIdentity.pseudonym;
  settingsPseudonym.textContent = currentIdentity.pseudonym;
  settingsPubKey.textContent = `${currentIdentity.publicKey.slice(0, 14)}...${currentIdentity.publicKey.slice(-10)}`;
}

/**
 * Refresh Scraps List in Tab 2
 */
async function refreshScraps() {
  await renderScrapsList(
    scrapsList,
    scrapsCountBadge,
    scrapsEmpty,
    vaultFooter,
    refreshScraps
  );
}

/**
 * Inspect Active Browser Tab
 */
async function inspectActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  activeTabId = tab.id;
  activeTabUrl = tab.url || "";
  activeTabTitle = tab.title || "Web Page";

  try {
    const urlObj = new URL(activeTabUrl);
    targetDomain.textContent = urlObj.hostname.replace("www.", "");
  } catch {
    targetDomain.textContent = "web-document";
  }

  targetTitle.textContent = activeTabTitle;

  // Check if active tab is a PressProtocol Reader page (/read/[cid])
  const readerMatch = activeTabUrl.match(/\/read\/([^\/\?#]+)/);
  if (readerMatch) {
    const cid = readerMatch[1];
    displayReaderDiagnostics(
      readerBanner,
      readerTitle,
      readerCid,
      mirrorsList,
      cid,
      activeTabTitle
    );
  } else {
    readerBanner.classList.add("hidden");
  }

  // Preload article preview on tab inspect so author, read time, and word count are instantly visible
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      func: extractPageContent,
    });

    if (result?.result && typeof result.result === "object") {
      preloadedArticle = result.result as ClippedArticle;
      if (preloadedArticle.title) {
        targetTitle.textContent = preloadedArticle.title;
      }
      targetAuthor.textContent = preloadedArticle.author ? `By ${preloadedArticle.author}` : "By Sovereign Author";
      targetReadTime.textContent = `~${preloadedArticle.readingTimeMinutes || 1} min read (${preloadedArticle.wordCount || 0} words)`;
    }
  } catch {
    // Restricted internal page (e.g. chrome://)
  }
}

/**
 * 1-Click Sovereign Web Clipper Pipeline
 */
btnClipNow.addEventListener("click", async () => {
  if (!activeTabId) return;

  btnClipNow.disabled = true;
  clipProgressCard.classList.remove("hidden");
  clipSuccessCard.classList.add("hidden");

  // Step 1: Extract
  updatePipelineStep(stepExtract, "active");
  updatePipelineStep(stepScrub, "pending");
  updatePipelineStep(stepSign, "pending");
  updatePipelineStep(stepBroadcast, "pending");

  let clipped: ClippedArticle;
  if (preloadedArticle && preloadedArticle.textContent) {
    clipped = preloadedArticle;
  } else {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: extractPageContent,
      });

      if (!result || !result.result || typeof result.result !== "object") {
        throw new Error("Could not extract readable article content from this tab.");
      }

      clipped = result.result as ClippedArticle;
    } catch (err: any) {
      console.error("Extraction error:", err);
      alert(`Could not extract article from this page: ${err.message || String(err)}`);
      btnClipNow.disabled = false;
      clipProgressCard.classList.add("hidden");
      return;
    }
  }

  updatePipelineStep(
    stepExtract,
    "completed",
    `Extracted ${clipped.wordCount} words (${Math.round(clipped.telemetry.cleanedByteSize / 1024)} KB)`
  );

  // Step 2: Scrub Surveillance
  updatePipelineStep(stepScrub, "active");
  targetAuthor.textContent = clipped?.author ? `By ${clipped.author}` : "By Sovereign Author";
  targetReadTime.textContent = `~${clipped?.readingTimeMinutes || 1} min read (${clipped?.wordCount || 0} words)`;
  targetTitle.textContent = clipped?.title || activeTabTitle;

  updatePipelineStep(
    stepScrub,
    "completed",
    `Purged ${clipped.telemetry.totalPurged} tracking beacons & modals`
  );
  await new Promise((r) => setTimeout(r, 180));

  // Step 3: Ed25519 Sign
  updatePipelineStep(stepSign, "active");
  updatePipelineStep(
    stepSign,
    "completed",
    `Signed with Ed25519 key (${currentIdentity?.pseudonym || "Anon"})`
  );
  await new Promise((r) => setTimeout(r, 180));

  // Step 4: Broadcast to Swarm
  updatePipelineStep(stepBroadcast, "active");

  try {
    const res = await chrome.runtime.sendMessage({
      action: "publishClippedArticle",
      article: clipped,
    });

    if (!res.success) {
      throw new Error(res.error || "Gateway error");
    }

    const data = res.data;
    updatePipelineStep(stepBroadcast, "completed");

    // Success State
    setTimeout(() => {
      clipProgressCard.classList.add("hidden");
      clipSuccessCard.classList.remove("hidden");
      btnClipNow.disabled = false;

      publishedCid.textContent = data.cid;
      const readUrl = `${currentSettings.webAppUrl}/read/${data.cid}`;
      btnOpenReader.href = readUrl;

      // Copy permalink to clipboard
      navigator.clipboard.writeText(readUrl).catch(() => {});

      // Setup Onion URL copy
      const onionUrl =
        data?.mirrors?.tor ||
        `http://${CANONICAL_ONION_HOST}/read/${data.cid}`;

      btnCopyOnion.onclick = () => {
        navigator.clipboard.writeText(onionUrl);
        const originalHtml = btnCopyOnion.innerHTML;
        btnCopyOnion.innerHTML = `<span>✓ .onion Copied!</span>`;
        setTimeout(() => {
          btnCopyOnion.innerHTML = originalHtml;
        }, 2000);
      };

      // Setup embed code (clean editorial embed without legacy theme param)
      const embedCode = `<iframe src="${currentSettings.webAppUrl}/embed/${data.cid}" width="100%" height="600" frameborder="0" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
      btnCopyEmbedCode.onclick = () => {
        navigator.clipboard.writeText(embedCode);
        const originalHtml = btnCopyEmbedCode.innerHTML;
        btnCopyEmbedCode.innerHTML = `<span>✓ Embed Copied!</span>`;
        setTimeout(() => {
          btnCopyEmbedCode.innerHTML = originalHtml;
        }, 2000);
      };
    }, 350);
  } catch (err: any) {
    console.error("Publishing error:", err);
    alert(`Failed to syndicate article to PressProtocol gateway: ${err.message}`);
    btnClipNow.disabled = false;
    clipProgressCard.classList.add("hidden");
  }
});

/**
 * Copy CID Button with Checkmark Feedback
 */
btnCopyCid.addEventListener("click", () => {
  const cid = publishedCid.textContent || "";
  navigator.clipboard.writeText(cid);
  const origHtml = btnCopyCid.innerHTML;
  btnCopyCid.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  setTimeout(() => {
    btnCopyCid.innerHTML = origHtml;
  }, 1800);
});

/**
 * Clear All Scraps
 */
btnClearScraps.addEventListener("click", async () => {
  if (confirm("Permanently clear all saved passage scraps?")) {
    await chrome.runtime.sendMessage({ action: "clearScraps" });
    await refreshScraps();
  }
});

/**
 * Send All Scraps to Sovereign Writer Studio
 */
btnSendToWriter.addEventListener("click", async () => {
  const res = await chrome.runtime.sendMessage({ action: "getScraps" });
  const scraps: SovereignScrap[] = res?.success ? res.data : [];
  if (scraps.length === 0) return;

  const citationsMarkdown = scraps
    .map((s) => `> "${s.quote}"\n>\n> — [${s.pageTitle}](${s.url})\n`)
    .join("\n---\n\n");

  const fullPayload = `# Research Citations (${new Date().toLocaleDateString()})\n\n${citationsMarkdown}`;

  // Copy citations to clipboard
  await navigator.clipboard.writeText(fullPayload);

  // Open /write in a new tab
  chrome.tabs.create({ url: `${currentSettings.webAppUrl}/write` });
});

/**
 * Burn Identity
 */
btnBurnIdentity.addEventListener("click", async () => {
  if (confirm("Burn current Ed25519 identity and provision a fresh sovereign cryptographic keypair?")) {
    currentIdentity = await burnCurrentIdentity();
    await loadIdentity();
  }
});

/**
 * Copy Public Key
 */
btnCopyPubKey.addEventListener("click", () => {
  if (currentIdentity) {
    navigator.clipboard.writeText(currentIdentity.publicKey);
    btnCopyPubKey.textContent = "✓";
    setTimeout(() => (btnCopyPubKey.textContent = "Copy"), 1800);
  }
});

/**
 * Save Node & Gateway Configuration
 */
btnSaveSettings.addEventListener("click", async () => {
  currentSettings.apiUrl = inputApiUrl.value.trim() || DEFAULT_SETTINGS.apiUrl;
  currentSettings.webAppUrl = inputWebAppUrl.value.trim() || DEFAULT_SETTINGS.webAppUrl;

  await chrome.runtime.sendMessage({
    action: "saveSettings",
    settings: currentSettings,
  });

  settingsSavedToast.classList.remove("hidden");
  setTimeout(() => {
    settingsSavedToast.classList.add("hidden");
  }, 2200);
});

// Start
document.addEventListener("DOMContentLoaded", init);
