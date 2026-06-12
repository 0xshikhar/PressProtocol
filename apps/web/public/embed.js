/**
 * PressProtocol Universal Web Component (<press-embed>)
 * 
 * Embed decentralized, cryptographically-signed sovereign articles on ANY website
 * with a single zero-dependency HTML tag.
 * 
 * Usage:
 *   <script type="module" src="https://pressprotocol.com/embed.js"></script>
 *   <press-embed cid="bafkreic7x..." theme="cyber" compact="false"></press-embed>
 */
(function () {
  if (typeof window === "undefined" || customElements.get("press-embed")) return;

  class PressEmbed extends HTMLElement {
    static get observedAttributes() {
      return ["cid", "theme", "compact", "width", "height", "host"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
      this.setupMessageListener();
    }

    attributeChangedCallback() {
      this.render();
    }

    setupMessageListener() {
      window.addEventListener("message", (event) => {
        if (!event.data || event.data.type !== "pressprotocol:resize") return;
        const iframe = this.shadowRoot.querySelector("iframe");
        if (iframe && event.data.height && !this.getAttribute("height")) {
          iframe.style.height = `${event.data.height}px`;
        }
      });
    }

    render() {
      const cid = this.getAttribute("cid");
      if (!cid) {
        this.shadowRoot.innerHTML = `
          <div style="padding:12px;color:#ef4444;font-family:monospace;font-size:12px;border:1px dashed #ef4444;border-radius:8px;background:rgba(239,68,68,0.05);">
            [PressProtocol Embed: Missing "cid" attribute]
          </div>
        `;
        return;
      }

      const theme = this.getAttribute("theme") || "cyber";
      const compact = this.getAttribute("compact") === "true";
      const width = this.getAttribute("width") || "100%";
      const height = this.getAttribute("height") || (compact ? "300px" : "650px");
      
      // Determine host dynamically or fallback to current origin / production
      let host = this.getAttribute("host");
      if (!host) {
        host = window.location.origin.includes("localhost")
          ? window.location.origin
          : "https://pressprotocol.com";
      }

      const embedUrl = `${host}/embed/${encodeURIComponent(cid)}?theme=${encodeURIComponent(theme)}${compact ? "&compact=true" : ""}`;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: ${width};
            max-width: 100%;
            margin: 16px 0;
            box-sizing: border-box;
          }
          iframe {
            width: 100%;
            height: ${height};
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            background: #09090b;
            color-scheme: dark;
            display: block;
            overflow: hidden;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          iframe:hover {
            border-color: rgba(16, 185, 129, 0.35);
          }
        </style>
        <iframe
          src="${embedUrl}"
          frameborder="0"
          loading="lazy"
          allow="clipboard-write"
          title="PressProtocol Sovereign Embed"
        ></iframe>
      `;
    }
  }

  customElements.define("press-embed", PressEmbed);
})();
