/**
 * AnonPress Browser Extension - Background Service
 * Handles protocol interception, API communication, and context menus
 */

// API configuration
const API_URL = "http://localhost:4000";
const WEB_APP_URL = "https://anonpress-2we663lev-linux369s-projects.vercel.app";

interface MirrorHealth {
  mirrors: {
    ipfs?: { available: boolean; latency: number | null };
    tor?: { available: boolean; latency: number | null };
    gateway?: { available: boolean; latency: number | null };
  };
  recommended: string;
}

interface ContentResolution {
  cid: string;
  title: string;
  mirrors: MirrorHealth['mirrors'];
  recommended: string;
}

/**
 * Fetches data from the backend API
 */
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "API returned an error");
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Protocol handler for anonpress:// links
 */
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = details.url;
  
  if (url.startsWith("anonpress://")) {
    const cid = url.replace("anonpress://", "");
    const redirectUrl = `${WEB_APP_URL}/read/${cid}`;
    
    chrome.tabs.update(details.tabId, { url: redirectUrl });
  }
});

/**
 * Extension installation handler
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("AnonPress extension installed.");
  
  // Set default settings
  chrome.storage.local.set({
    apiUrl: API_URL,
    webAppUrl: WEB_APP_URL,
    autoRoute: true,
    preferredMirror: "fastest"
  });
  
  // Create context menu for anonpress:// links
  chrome.contextMenus.create({
    id: "open-with-anonpress",
    title: "Open with AnonPress",
    contexts: ["link"],
    documentUrlPatterns: ["*://*/*"],
    targetUrlPatterns: ["anonpress://*"]
  });
});

/**
 * Context menu click handler
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "open-with-anonpress" && info.linkUrl) {
    const cid = info.linkUrl.replace("anonpress://", "");
    chrome.tabs.create({ url: `${WEB_APP_URL}/read/${cid}` });
  }
});

/**
 * Message handler for requests from content scripts or popups
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleRequest = async () => {
    switch (request.action) {
      case "resolveContent":
        return await fetchFromApi<ContentResolution>(`/api/resolve/${request.cid}`);
      case "checkMirrors":
        return await fetchFromApi<MirrorHealth>(`/api/mirrors/${request.cid}/health`);
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  };
  
  handleRequest()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }));
  
  return true; // Indicates an asynchronous response
});
