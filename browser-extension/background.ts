import type { PlasmoMessaging } from "@plasmohq/messaging"

// API configuration
const API_URL = "http://localhost:4000"
const WEB_APP_URL = "http://localhost:3000"

// Protocol handler for anonpress:// links
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const url = details.url
  
  if (url.startsWith("anonpress://")) {
    const cid = url.replace("anonpress://", "")
    
    // Redirect to web app with CID
    const redirectUrl = `${WEB_APP_URL}/read/${cid}`
    
    chrome.tabs.update(details.tabId, { url: redirectUrl })
  }
})

// Listen for anonpress:// links in page content
chrome.runtime.onInstalled.addListener(() => {
  console.log("AnonPress extension installed")
  
  // Set default settings
  chrome.storage.local.set({
    apiUrl: API_URL,
    webAppUrl: WEB_APP_URL,
    autoRoute: true,
    preferredMirror: "fastest"
  })
})

// Message handler for content resolution
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "resolveContent") {
    resolveContent(request.cid)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }))
    return true // Keep message channel open for async response
  }
  
  if (request.action === "checkMirrors") {
    checkMirrors(request.cid)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }))
    return true
  }
})

// Resolve content and get best mirror
async function resolveContent(cid: string) {
  try {
    const response = await fetch(`${API_URL}/api/resolve/${cid}`)
    
    if (!response.ok) {
      throw new Error(`Failed to resolve content: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error resolving content:", error)
    throw error
  }
}

// Check mirror health
async function checkMirrors(cid: string) {
  try {
    const response = await fetch(`${API_URL}/api/mirrors/${cid}/health`)
    
    if (!response.ok) {
      throw new Error(`Failed to check mirrors: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error checking mirrors:", error)
    throw error
  }
}

// Context menu for anonpress:// links
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-with-anonpress",
    title: "Open with AnonPress",
    contexts: ["link"],
    documentUrlPatterns: ["*://*/*"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-with-anonpress" && info.linkUrl) {
    const url = info.linkUrl
    
    if (url.startsWith("anonpress://")) {
      const cid = url.replace("anonpress://", "")
      chrome.tabs.create({ url: `${WEB_APP_URL}/read/${cid}` })
    }
  }
})

export {}
