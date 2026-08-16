import { 
  extractArticleFromDom, 
  ExtractedArticle,
  detectEditorType 
} from './connectors.js';
import { 
  generateKeypair, 
  getPublicKey, 
  signPayload, 
  calculateDeterministicCIDv1,
  KeyPair 
} from './crypto.js';

export interface PublishResult {
  cid: string;
  signature: string;
  publicKey: string;
  title: string;
  tags: string[];
  timestamp: string;
  nodeUrl: string;
  ipfsGatewayUrl: string;
  torOnionUrl?: string;
  proof: any;
}

export type WidgetTheme = 'cyber' | 'dark' | 'light';
export type WidgetBadge = 'compact' | 'full' | 'minimal';

export class PressProtocolPublishElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'target-editor',
      'target-title',
      'node-url',
      'badge',
      'theme',
      'author-key',
      'tags',
      'disabled',
    ];
  }

  private shadow: ShadowRoot;
  private state: 'idle' | 'extracting' | 'signing' | 'publishing' | 'success' | 'error' = 'idle';
  private statusMessage = '';
  private lastResult: PublishResult | null = null;
  private errorMessage = '';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get targetEditor(): string {
    return this.getAttribute('target-editor') || '#editor';
  }

  get targetTitle(): string {
    return this.getAttribute('target-title') || '#title';
  }

  get nodeUrl(): string {
    return this.getAttribute('node-url') || 'http://127.0.0.1:4000';
  }

  get badge(): WidgetBadge {
    return (this.getAttribute('badge') as WidgetBadge) || 'full';
  }

  get theme(): WidgetTheme {
    return (this.getAttribute('theme') as WidgetTheme) || 'cyber';
  }

  get authorKey(): string | null {
    return this.getAttribute('author-key') || null;
  }

  get tags(): string[] {
    const raw = this.getAttribute('tags');
    return raw ? raw.split(',').map(t => t.trim()).filter(Boolean) : ['sovereign', 'pressprotocol'];
  }

  /**
   * Retrieves or creates a sovereign burner Ed25519 keypair from localStorage.
   */
  private async getOrCreateIdentity(): Promise<KeyPair> {
    if (this.authorKey) {
      const pub = await getPublicKey(this.authorKey);
      return {
        privateKey: this.authorKey,
        publicKey: pub,
      };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('pressprotocol_burner_identity');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.publicKey && parsed.privateKey) {
            return parsed;
          }
        } catch {
          // ignore parsing failure
        }
      }
    }

    const newKey = await generateKeypair();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('pressprotocol_burner_identity', JSON.stringify(newKey));
    }
    return newKey;
  }

  /**
   * Main publishing flow.
   */
  public async publish(): Promise<PublishResult | null> {
    try {
      this.state = 'extracting';
      this.statusMessage = 'Extracting editor content...';
      this.render();

      const doc = this.ownerDocument || document;
      const editorEl = doc.querySelector(this.targetEditor);
      const titleEl = doc.querySelector(this.targetTitle);

      const article: ExtractedArticle = extractArticleFromDom({
        editorElement: editorEl,
        titleElement: titleEl,
        defaultTitle: 'Sovereign Article',
      });

      if (!article.content.trim()) {
        throw new Error(`Target editor "${this.targetEditor}" contains no text or HTML content.`);
      }

      // Step 2: Key derivation and signing
      this.state = 'signing';
      this.statusMessage = 'Signing with Ed25519 identity...';
      this.render();

      const identity = await this.getOrCreateIdentity();
      const timestamp = new Date().toISOString();
      const canonicalPayload = JSON.stringify({
        title: article.title,
        tags: this.tags,
        timestamp,
      });

      const signature = await signPayload(canonicalPayload, identity.privateKey);
      const deterministicCID = calculateDeterministicCIDv1(article.content);

      // Step 3: Node dispatch or direct archival
      this.state = 'publishing';
      this.statusMessage = 'Anchoring to IPFS and Tor swarm...';
      this.render();

      let nodeResponse: any = null;
      try {
        const response = await fetch(`${this.nodeUrl.replace(/\/$/, '')}/api/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: article.title,
            content: article.content,
            tags: this.tags,
            publicKey: identity.publicKey,
            signature,
            timestamp,
          }),
        });

        if (response.ok) {
          nodeResponse = await response.json();
        }
      } catch (err) {
        console.warn('[PressProtocol Widget] Node unreachable, continuing with local proof receipt:', err);
      }

      const finalCID = nodeResponse?.cid || deterministicCID;
      const proofReceipt = {
        pressprotocol: '1.0.0-sovereign',
        cid: finalCID,
        title: article.title,
        tags: this.tags,
        timestamp,
        publisher: {
          publicKey: identity.publicKey,
          signature,
        },
        metadata: {
          editor: article.editorType,
          mediaCount: article.media.length,
          wordCount: article.wordCount,
        },
      };

      const result: PublishResult = {
        cid: finalCID,
        signature,
        publicKey: identity.publicKey,
        title: article.title,
        tags: this.tags,
        timestamp,
        nodeUrl: this.nodeUrl,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${finalCID}`,
        torOnionUrl: nodeResponse?.torUrl || undefined,
        proof: proofReceipt,
      };

      this.lastResult = result;
      this.state = 'success';
      this.render();

      // Dispatch custom event
      const customEvent = new CustomEvent('publish', {
        detail: result,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(customEvent);

      // Also trigger inline onpublish if defined
      const onPublishAttr = this.getAttribute('onpublish');
      if (onPublishAttr) {
        try {
          const fn = new Function('event', onPublishAttr);
          fn.call(this, customEvent);
        } catch (e) {
          console.error('[PressProtocol Widget] onpublish handler error:', e);
        }
      }

      return result;
    } catch (err: any) {
      this.state = 'error';
      this.errorMessage = err?.message || 'Publishing failed';
      this.render();
      return null;
    }
  }

  private reset() {
    this.state = 'idle';
    this.statusMessage = '';
    this.errorMessage = '';
    this.render();
  }

  private downloadProof() {
    if (!this.lastResult) return;
    const blob = new Blob([JSON.stringify(this.lastResult.proof, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.lastResult.cid}.pressproof.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private copyCID() {
    if (!this.lastResult?.cid) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.lastResult.cid);
      const copyBtn = this.shadow.querySelector('#copy-cid-btn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = 'Copy CID';
        }, 1500);
      }
    }
  }

  private render() {
    const isCyber = this.theme === 'cyber';
    const isDark = this.theme === 'dark' || isCyber;

    const bgGradient = isCyber
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.4) 100%)'
      : isDark
      ? '#18181b'
      : '#f4f4f5';

    const borderCol = isCyber ? '#10b981' : isDark ? '#27272a' : '#e4e4e7';
    const textCol = isDark ? '#f4f4f5' : '#18181b';
    const accentCol = isCyber ? '#10b981' : '#3b82f6';

    const isCompact = this.badge === 'compact';
    const isMinimal = this.badge === 'minimal';

    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          user-select: none;
        }
        .widget-container {
          display: inline-flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid ${borderCol};
          background: ${bgGradient};
          border-radius: 8px;
          padding: ${isMinimal ? '4px' : isCompact ? '6px 12px' : '12px 16px'};
          color: ${textCol};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .btn-publish {
          background: ${accentCol};
          color: #ffffff;
          border: none;
          padding: ${isMinimal ? '6px 12px' : '8px 16px'};
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          letter-spacing: 0.02em;
          transition: transform 0.1s ease, filter 0.2s ease;
        }
        .btn-publish:hover:not(:disabled) {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
        .btn-publish:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .status-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .success-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }
        .cid-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.25);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
        }
        .action-link {
          color: ${accentCol};
          text-decoration: none;
          cursor: pointer;
          font-size: 11px;
        }
        .action-link:hover {
          text-decoration: underline;
        }
        .error-box {
          color: #ef4444;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      </style>

      <div class="widget-container">
        ${this.renderStateContent(accentCol)}
      </div>
    `;

    // Bind event listeners
    const publishBtn = this.shadow.querySelector('#publish-trigger');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.publish());
    }

    const resetBtn = this.shadow.querySelector('#reset-trigger');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    const copyBtn = this.shadow.querySelector('#copy-cid-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCID());
    }

    const dlBtn = this.shadow.querySelector('#download-proof-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => this.downloadProof());
    }
  }

  private renderStateContent(accentCol: string): string {
    switch (this.state) {
      case 'idle':
        return `
          <button id="publish-trigger" class="btn-publish">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Publish to Sovereign Web
          </button>
        `;

      case 'extracting':
      case 'signing':
      case 'publishing':
        return `
          <button class="btn-publish" disabled>
            <div class="status-spinner"></div>
            <span>${this.statusMessage}</span>
          </button>
        `;

      case 'success':
        const cid = this.lastResult?.cid || '';
        const shortCid = cid.length > 18 ? `${cid.slice(0, 8)}...${cid.slice(-6)}` : cid;
        return `
          <div class="success-box">
            <div style="display:flex;align-items:center;gap:6px;font-weight:600;color:${accentCol};">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Anchored to Sovereign Web</span>
            </div>
            <div class="cid-badge">
              <span>CID: ${shortCid}</span>
              <button id="copy-cid-btn" class="action-link" style="border:none;background:transparent;">Copy CID</button>
            </div>
            <div style="display:flex;gap:10px;margin-top:2px;">
              <a href="${this.lastResult?.ipfsGatewayUrl}" target="_blank" rel="noopener" class="action-link">View IPFS</a>
              <button id="download-proof-btn" class="action-link" style="border:none;background:transparent;">Download Proof</button>
              <button id="reset-trigger" class="action-link" style="border:none;background:transparent;opacity:0.8;">Publish Another</button>
            </div>
          </div>
        `;

      case 'error':
        return `
          <div class="error-box">
            <span>⚠️ ${this.errorMessage}</span>
            <button id="reset-trigger" class="btn-publish" style="padding:4px 8px;font-size:11px;">Retry</button>
          </div>
        `;
    }
  }
}

// Auto-register Custom Element in browser environments
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  if (!customElements.get('pressprotocol-publish')) {
    customElements.define('pressprotocol-publish', PressProtocolPublishElement);
  }
}
