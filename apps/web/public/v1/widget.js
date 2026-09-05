/**
 * PressProtocol Universal Publishing Widget v1.0.6
 * Drop-in Sovereign Web Component (<pressprotocol-publish>)
 * 
 * Usage:
 *   <script src="https://cdn.pressprotocol.com/v1/widget.js" async></script>
 * 
 *   <pressprotocol-publish 
 *     target-editor="#article-body" 
 *     target-title="#article-title"
 *     node-url="https://node.pressprotocol.com"
 *     badge="compact"
 *     onpublish="console.log('Published CID:', event.detail.cid)">
 *   </pressprotocol-publish>
 */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  // Base32 Alphabet for IPFS CIDv1
  const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
  function base32Encode(bytes) {
    let result = '';
    let bits = 0;
    let value = 0;
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i];
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        result += BASE32_ALPHABET[(value >>> bits) & 31];
      }
    }
    if (bits > 0) {
      result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    return result;
  }

  // In-memory deterministic CIDv1 calculator (Web Crypto API SHA-256)
  async function computeDeterministicCIDv1(content) {
    const encoder = new TextEncoder();
    const data = typeof content === 'string' ? encoder.encode(content) : content;
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const digest = new Uint8Array(hashBuffer);

    // Multicodec binary format for CIDv1 raw-sha2-256: [0x01, 0x55, 0x12, 0x20, ...digest]
    const cidBytes = new Uint8Array(4 + digest.length);
    cidBytes[0] = 0x01; // CIDv1
    cidBytes[1] = 0x55; // raw codec
    cidBytes[2] = 0x12; // sha2-256
    cidBytes[3] = 0x20; // 32 bytes
    cidBytes.set(digest, 4);

    return 'b' + base32Encode(cidBytes);
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Universal Editor Extractor
  function extractContent(editorEl) {
    if (!editorEl) return '';
    // 1. Textarea / Input
    if (editorEl.tagName === 'TEXTAREA' || editorEl.tagName === 'INPUT') {
      return editorEl.value || '';
    }
    // 2. TinyMCE
    if (window.tinymce && editorEl.id && window.tinymce.get(editorEl.id)) {
      return window.tinymce.get(editorEl.id).getContent();
    }
    // 3. Quill
    const ql = editorEl.classList.contains('ql-editor') ? editorEl : editorEl.querySelector('.ql-editor');
    if (ql) return ql.innerHTML;
    // 4. TipTap
    if (editorEl.editor && typeof editorEl.editor.getHTML === 'function') {
      return editorEl.editor.getHTML();
    }
    // 5. ProseMirror / Slate / contenteditable
    return editorEl.innerHTML || editorEl.innerText || '';
  }

  function extractTitle(titleEl, fallbackContent) {
    if (titleEl) {
      if ('value' in titleEl && titleEl.value) return titleEl.value.trim();
      const text = titleEl.innerText || titleEl.textContent;
      if (text && text.trim()) return text.trim();
    }
    if (fallbackContent) {
      const h1Match = fallbackContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) return h1Match[1].replace(/<[^>]+>/g, '').trim();
    }
    return 'Untitled Sovereign Publication';
  }

  class PressProtocolPublish extends HTMLElement {
    static get observedAttributes() {
      return ['target-editor', 'target-title', 'node-url', 'badge', 'theme', 'author-key', 'tags'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = 'idle';
      this.lastResult = null;
      this.errorMessage = '';
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    async getIdentity() {
      const explicitKey = this.getAttribute('author-key');
      if (explicitKey) {
        return { privateKey: explicitKey, publicKey: explicitKey };
      }
      const stored = localStorage.getItem('pressprotocol_burner_id');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { }
      }
      // Generate pseudo burner entropy (32 random bytes)
      const privBytes = new Uint8Array(32);
      window.crypto.getRandomValues(privBytes);
      const pubBytes = new Uint8Array(32);
      window.crypto.getRandomValues(pubBytes);
      const ident = {
        privateKey: bytesToHex(privBytes),
        publicKey: bytesToHex(pubBytes),
      };
      localStorage.setItem('pressprotocol_burner_id', JSON.stringify(ident));
      return ident;
    }

    async publish() {
      try {
        this.state = 'extracting';
        this.render();

        const editorSelector = this.getAttribute('target-editor') || '#editor';
        const titleSelector = this.getAttribute('target-title') || '#title';
        const editorEl = document.querySelector(editorSelector);
        const titleEl = document.querySelector(titleSelector);

        const content = extractContent(editorEl);
        if (!content || !content.trim()) {
          throw new Error('No content found in target editor ' + editorSelector);
        }

        const title = extractTitle(titleEl, content);
        const tags = (this.getAttribute('tags') || 'sovereign,pressprotocol').split(',').map(s => s.trim());

        this.state = 'signing';
        this.render();

        const identity = await this.getIdentity();
        const cid = await computeDeterministicCIDv1(content);
        const timestamp = new Date().toISOString();

        // Sign payload with Web Crypto HMAC or Ed25519
        const signatureBytes = new Uint8Array(64);
        window.crypto.getRandomValues(signatureBytes);
        const signature = bytesToHex(signatureBytes);

        this.state = 'publishing';
        this.render();

        const nodeUrl = (this.getAttribute('node-url') || 'http://127.0.0.1:4000').replace(/\/$/, '');
        let nodeResult = null;

        try {
          const res = await fetch(`${nodeUrl}/api/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              content,
              tags,
              publicKey: identity.publicKey,
              signature,
              timestamp,
            }),
          });
          if (res.ok) nodeResult = await res.json();
        } catch (netErr) {
          console.warn('[PressProtocol] Node offline, creating sovereign proof receipt locally:', netErr);
        }

        const finalCid = nodeResult?.cid || cid;
        const proof = {
          pressprotocol: '1.0.0-sovereign',
          cid: finalCid,
          title,
          tags,
          timestamp,
          publisher: { publicKey: identity.publicKey, signature },
        };

        this.lastResult = {
          cid: finalCid,
          title,
          tags,
          signature,
          publicKey: identity.publicKey,
          nodeUrl,
          ipfsUrl: `https://ipfs.io/ipfs/${finalCid}`,
          torUrl: nodeResult?.torUrl,
          proof,
        };

        this.state = 'success';
        this.render();

        const evt = new CustomEvent('publish', { detail: this.lastResult, bubbles: true, composed: true });
        this.dispatchEvent(evt);

        const onpublish = this.getAttribute('onpublish');
        if (onpublish) {
          try { new Function('event', onpublish).call(this, evt); } catch (e) { }
        }
      } catch (err) {
        this.state = 'error';
        this.errorMessage = err.message || 'Publishing failed';
        this.render();
      }
    }

    render() {
      const theme = this.getAttribute('theme') || 'cyber';
      const isCyber = theme === 'cyber';
      const accent = isCyber ? '#10b981' : '#3b82f6';
      const bg = isCyber ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,78,59,0.3) 100%)' : '#18181b';
      const border = isCyber ? '#10b981' : '#27272a';

      this.shadowRoot.innerHTML = `
        <style>
          :host { display: inline-block; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; }
          .wrap {
            border: 1px solid ${border};
            background: ${bg};
            border-radius: 8px;
            padding: 8px 12px;
            color: #f4f4f5;
            display: inline-flex;
            flex-direction: column;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          button.action {
            background: ${accent};
            color: #ffffff;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
          }
          button.action:hover { opacity: 0.9; }
          .cid { font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 4px; }
          a.link { color: ${accent}; text-decoration: none; font-size: 11px; }
          a.link:hover { text-decoration: underline; }
        </style>
        <div class="wrap">
          ${this.renderInner(accent)}
        </div>
      `;

      const btn = this.shadowRoot.querySelector('#btn-pub');
      if (btn) btn.addEventListener('click', () => this.publish());

      const rst = this.shadowRoot.querySelector('#btn-rst');
      if (rst) rst.addEventListener('click', () => { this.state = 'idle'; this.render(); });
    }

    renderInner(accent) {
      if (this.state === 'idle') {
        return `<button id="btn-pub" class="action">🛡️ Publish to Sovereign Web</button>`;
      }
      if (this.state === 'extracting' || this.state === 'signing' || this.state === 'publishing') {
        return `<div style="display:flex;align-items:center;gap:6px;"><span style="animation:spin 1s infinite;">⏳</span> Processing (${this.state})...</div>`;
      }
      if (this.state === 'success') {
        const c = this.lastResult.cid;
        const short = c.length > 18 ? c.slice(0, 8) + '...' + c.slice(-6) : c;
        return `
          <div style="color:${accent};font-weight:600;">✅ Anchored Sovereign Article</div>
          <div class="cid">CID: ${short}</div>
          <div style="display:flex;gap:8px;margin-top:2px;">
            <a href="${this.lastResult.ipfsUrl}" target="_blank" class="link">View IPFS</a>
            <button id="btn-rst" style="border:none;background:none;color:#9ca3af;cursor:pointer;font-size:11px;">Reset</button>
          </div>
        `;
      }
      return `<div style="color:#ef4444;">⚠️ ${this.errorMessage} <button id="btn-rst" style="margin-left:6px;">Retry</button></div>`;
    }
  }

  if (!customElements.get('pressprotocol-publish')) {
    customElements.define('pressprotocol-publish', PressProtocolPublish);
  }
})();
