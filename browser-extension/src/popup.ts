/**
 * AnonPress Extension Popup
 */

interface Mirror {
  available: boolean;
  latency: number | null;
}

interface ContentInfo {
  cid: string;
  title: string;
  mirrors: {
    ipfs?: Mirror;
    tor?: Mirror;
    gateway?: Mirror;
  };
  recommended: string;
}

// Get current tab and check if it's an AnonPress page
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0]?.url || "";
  
  // Check if we're on an AnonPress content page
  const match = url.match(/\/read\/([^\/\?]+)/);
  if (match) {
    const cid = match[1];
    checkContent(cid);
  }
});

async function checkContent(cid: string) {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) return;
  
  // Show loading state
  contentDiv.innerHTML = `
    <div class="status-card loading">
      <div class="spinner"></div>
      <p>Checking mirrors...</p>
    </div>
  `;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: "resolveContent",
      cid: cid
    });
    
    if (response.error) {
      showError(response.error);
    } else {
      showContentInfo(response);
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : "Failed to check content");
  }
}

function showError(message: string) {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) return;
  
  contentDiv.innerHTML = `
    <div class="status-card error">
      <div class="icon">❌</div>
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
}

function showContentInfo(info: ContentInfo) {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) return;
  
  const mirrorItems = Object.entries(info.mirrors)
    .map(([type, mirror]) => {
      const icon = getMirrorIcon(type);
      const status = getMirrorStatus(mirror);
      const isRecommended = type === info.recommended;
      
      return `
        <div class="mirror-item ${isRecommended ? 'recommended' : ''}">
          <span class="mirror-type">${icon} ${type.toUpperCase()}</span>
          <span class="mirror-status" style="color: ${status.color}">${status.text}</span>
          ${isRecommended ? '<span class="recommended-badge">⚡ Fastest</span>' : ''}
        </div>
      `;
    })
    .join('');
  
  contentDiv.innerHTML = `
    <div class="content-info">
      <div class="content-header">
        <h3>${info.title || 'Untitled'}</h3>
        <code class="cid">${info.cid.substring(0, 12)}...</code>
      </div>
      
      <div class="mirrors">
        <h4>Mirror Status</h4>
        ${mirrorItems}
      </div>
      
      <div class="actions">
        <button class="btn btn-secondary" onclick="location.reload()">
          Refresh Status
        </button>
      </div>
    </div>
  `;
}

function getMirrorIcon(type: string): string {
  switch (type) {
    case "ipfs": return "📦";
    case "tor": return "🧅";
    case "gateway": return "🌐";
    default: return "🔗";
  }
}

function getMirrorStatus(mirror?: Mirror): { text: string; color: string } {
  if (!mirror) return { text: "N/A", color: "#999" };
  if (mirror.available) {
    return {
      text: `✓ ${mirror.latency}ms`,
      color: "#10b981"
    };
  }
  return { text: "✗ Unavailable", color: "#ef4444" };
}
