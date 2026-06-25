/**
 * PressProtocol Browser Extension - Background Service Worker
 * Manages context menus, passage clipping, burner signing, and gateway broadcasting.
 */
import { getOrCreateBurnerIdentity, signPayload } from "./crypto";
import type { ClippedArticle } from "./clipper";

export interface SovereignScrap {
  id: string;
  quote: string;
  url: string;
  pageTitle: string;
  timestamp: number;
}

export interface ExtensionSettings {
  apiUrl: string;
  webAppUrl: string;
  autoCopyPermalink: boolean;
  signWithBurnerKey: boolean;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  apiUrl: "http://localhost:4000",
  webAppUrl: "https://pressprotocol.com",
  autoCopyPermalink: true,
  signWithBurnerKey: true,
};

const SCRAPS_KEY = "pressprotocol_scraps";
const SETTINGS_KEY = "pressprotocol_settings";

/**
 * Retrieves configuration settings with sensible defaults.
 */
async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (res) => {
      resolve({ ...DEFAULT_SETTINGS, ...(res[SETTINGS_KEY] || {}) });
    });
  });
}

/**
 * Retrieves all saved scraps from the scrap vault.
 */
async function getScraps(): Promise<SovereignScrap[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SCRAPS_KEY], (res) => {
      resolve(res[SCRAPS_KEY] || []);
    });
  });
}

/**
 * Saves a new passage scrap into the local extension vault.
 */
async function saveScrap(scrap: SovereignScrap): Promise<void> {
  const current = await getScraps();
  const updated = [scrap, ...current.filter((s) => s.id !== scrap.id)].slice(0, 100);
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [SCRAPS_KEY]: updated }, () => resolve());
  });
}

/**
 * Removes a scrap by ID.
 */
async function deleteScrap(id: string): Promise<void> {
  const current = await getScraps();
  const updated = current.filter((s) => s.id !== id);
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [SCRAPS_KEY]: updated }, () => resolve());
  });
}

/**
 * Clears all scraps.
 */
async function clearScraps(): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [SCRAPS_KEY]: [] }, () => resolve());
  });
}

/**
 * Extension installation and context menu setup
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log("PressProtocol Sovereign Web Clipper active.");

  // Initialize default settings if not set
  chrome.storage.local.get([SETTINGS_KEY], (res) => {
    if (!res[SETTINGS_KEY]) {
      chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
    }
  });

  // Ensure burner identity exists
  await getOrCreateBurnerIdentity();

  // Create context menu for highlighting text -> "Preserve Quote on PressProtocol"
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "clip-quote-pressprotocol",
      title: "Preserve Quote on PressProtocol",
      contexts: ["selection"],
    });

    chrome.contextMenus.create({
      id: "open-with-pressprotocol",
      title: "Open with PressProtocol",
      contexts: ["link"],
      targetUrlPatterns: ["*://*/*read/*", "pressprotocol://*", "anonpress://*"],
    });
  });
});

/**
 * Context menu click listener
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "clip-quote-pressprotocol" && info.selectionText) {
    const scrap: SovereignScrap = {
      id: "scrap_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      quote: info.selectionText.trim(),
      url: tab?.url || "",
      pageTitle: tab?.title || "Preserved Citation",
      timestamp: Date.now(),
    };

    await saveScrap(scrap);

    // Visual feedback: green badge on extension icon
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 2200);
  }

  if (info.menuItemId === "open-with-pressprotocol" && info.linkUrl) {
    const settings = await getSettings();
    let target = info.linkUrl;
    if (target.startsWith("pressprotocol://") || target.startsWith("anonpress://")) {
      const cid = target.replace(/^(pressprotocol|anonpress):\/\//, "");
      target = `${settings.webAppUrl}/read/${cid}`;
    }
    chrome.tabs.create({ url: target });
  }
});

/**
 * Handle custom protocol navigation
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const url = details.url;
  if (url.startsWith("pressprotocol://") || url.startsWith("anonpress://")) {
    const settings = await getSettings();
    const cid = url.replace(/^(pressprotocol|anonpress):\/\//, "");
    chrome.tabs.update(details.tabId, { url: `${settings.webAppUrl}/read/${cid}` });
  }
});

/**
 * Dispatches a sanitized article to the PressProtocol gateway.
 */
async function publishArticle(article: ClippedArticle): Promise<any> {
  const settings = await getSettings();
  const identity = await getOrCreateBurnerIdentity();

  const timestamp = article.publishedAt || new Date().toISOString();
  const tags = article.tags && article.tags.length > 0 ? article.tags : ["web-archive", "sovereign-clip"];

  // Deterministic signable payload
  const signable = {
    title: article.title,
    tags,
    timestamp,
  };

  const { signature } = await signPayload(signable, identity.privateKey);

  // Payload for backend /api/content
  const body = {
    title: article.title,
    content: article.contentHtml,
    tags,
    publicKey: identity.publicKey,
    signature,
    timestamp,
  };

  const response = await fetch(`${settings.apiUrl}/api/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gateway returned HTTP ${response.status}: ${errText}`);
  }

  const resJson = await response.json();
  const data = resJson.data || resJson;
  const cid = data.cid;

  return {
    success: true,
    cid,
    shareUrl: `${settings.webAppUrl}/read/${cid}`,
    mirrors: data.mirrors || {
      ipfs: { available: true, latency: 45 },
      tor: { available: true, latency: 280 },
      gateway: { available: true, latency: 60 },
    },
    author: identity.pseudonym,
  };
}

/**
 * Message dispatch for popup and content interactions
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const handleAsync = async () => {
    switch (request.action) {
      case "getSettings":
        return await getSettings();

      case "saveSettings":
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({ [SETTINGS_KEY]: request.settings }, () => resolve());
        });
        return { success: true };

      case "getScraps":
        return await getScraps();

      case "deleteScrap":
        await deleteScrap(request.id);
        return { success: true };

      case "clearScraps":
        await clearScraps();
        return { success: true };

      case "publishClippedArticle":
        return await publishArticle(request.article);

      case "resolveContent": {
        const settings = await getSettings();
        const res = await fetch(`${settings.apiUrl}/api/resolve/${request.cid}`);
        const json = await res.json();
        return json.data || json;
      }

      case "checkMirrors": {
        const settings = await getSettings();
        const res = await fetch(`${settings.apiUrl}/api/mirrors/${request.cid}/health`);
        const json = await res.json();
        return json.data || json;
      }

      default:
        throw new Error(`Unknown message action: ${request.action}`);
    }
  };

  handleAsync()
    .then((result) => sendResponse({ success: true, data: result }))
    .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));

  return true; // Keep message channel open for async response
});
