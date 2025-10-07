import { useEffect, useState } from "react"
import "./popup.css"

interface Mirror {
  type: string
  url: string
  available: boolean
  latency: number | null
}

interface ContentInfo {
  cid: string
  title: string
  mirrors: {
    ipfs?: Mirror
    tor?: Mirror
    gateway?: Mirror
  }
  recommended: string
}

function IndexPopup() {
  const [status, setStatus] = useState<"idle" | "loading" | "resolved">("idle")
  const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string>("")

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || ""
      setCurrentUrl(url)
      
      // Check if we're on an AnonPress content page
      const match = url.match(/\/read\/([^\/\?]+)/)
      if (match) {
        const cid = match[1]
        checkContent(cid)
      }
    })
  }, [])

  const checkContent = async (cid: string) => {
    setStatus("loading")
    setError(null)
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: "resolveContent",
        cid: cid
      })
      
      if (response.error) {
        setError(response.error)
        setStatus("idle")
      } else {
        setContentInfo(response)
        setStatus("resolved")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check content")
      setStatus("idle")
    }
  }

  const getMirrorIcon = (type: string) => {
    switch (type) {
      case "ipfs": return "📦"
      case "tor": return "🧅"
      case "gateway": return "🌐"
      default: return "🔗"
    }
  }

  const getMirrorStatus = (mirror?: Mirror) => {
    if (!mirror) return { text: "N/A", color: "#999" }
    if (mirror.available) {
      return {
        text: `✓ ${mirror.latency}ms`,
        color: "#10b981"
      }
    }
    return { text: "✗ Unavailable", color: "#ef4444" }
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <h1>AnonPress</h1>
        </div>
        <p className="tagline">Censorship-Resistant Publishing</p>
      </header>

      <main className="popup-content">
        {status === "idle" && !currentUrl.includes("/read/") && (
          <div className="status-card">
            <div className="icon">ℹ️</div>
            <h3>Ready</h3>
            <p>Navigate to AnonPress content to see mirror status</p>
            <a 
              href="http://localhost:3000" 
              target="_blank"
              className="btn btn-primary"
            >
              Open AnonPress
            </a>
          </div>
        )}

        {status === "loading" && (
          <div className="status-card loading">
            <div className="spinner"></div>
            <p>Checking mirrors...</p>
          </div>
        )}

        {error && (
          <div className="status-card error">
            <div className="icon">❌</div>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {status === "resolved" && contentInfo && (
          <div className="content-info">
            <div className="content-header">
              <h3>{contentInfo.title}</h3>
              <code className="cid">{contentInfo.cid.substring(0, 12)}...</code>
            </div>

            <div className="mirrors">
              <h4>Mirror Status</h4>
              
              {Object.entries(contentInfo.mirrors).map(([type, mirror]) => {
                const status = getMirrorStatus(mirror)
                const isRecommended = type === contentInfo.recommended
                
                return (
                  <div 
                    key={type}
                    className={`mirror-item ${isRecommended ? "recommended" : ""}`}
                  >
                    <span className="mirror-type">
                      {getMirrorIcon(type)} {type.toUpperCase()}
                    </span>
                    <span 
                      className="mirror-status"
                      style={{ color: status.color }}
                    >
                      {status.text}
                    </span>
                    {isRecommended && (
                      <span className="recommended-badge">⚡ Fastest</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="actions">
              <button 
                className="btn btn-secondary"
                onClick={() => checkContent(contentInfo.cid)}
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="popup-footer">
        <a href="http://localhost:3000" target="_blank">Home</a>
        <a href="http://localhost:3000/publish" target="_blank">Publish</a>
        <a href="http://localhost:3000/dashboard" target="_blank">Dashboard</a>
      </footer>
    </div>
  )
}

export default IndexPopup
