# PressProtocol Web Widget (`@pressprotocol/widget`)

[![npm version](https://img.shields.io/npm/v/@pressprotocol/widget.svg?color=4F46E5&style=flat-square)](https://www.npmjs.com/package/@pressprotocol/widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Custom Elements](https://img.shields.io/badge/Web%20Components-Custom%20Elements%20v1-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

**Universal Drop-In Sovereign Publishing Web Component (`<pressprotocol-publish>`) & Rich-Text Editor Connectors for [PressProtocol](https://pressprotocol.com).**

---

## Overview

Embed sovereign 1-click publishing into any CMS, web application, or rich text editor with zero framework lock-in. Works with vanilla HTML/JS, React, Vue, Svelte, and popular WYSIWYG editors (Tiptap, Lexical, Quill, TinyMCE, ProseMirror, Slate).

---

## Installation

```bash
# Using pnpm
pnpm add @pressprotocol/widget

# Using bun
bun add @pressprotocol/widget

# Using npm
npm install @pressprotocol/widget
```

Or import directly via CDN in vanilla HTML:

```html
<script type="module" src="https://esm.sh/@pressprotocol/widget@1.0.7"></script>
```

---

## Quickstart

### 1. Drop-In Web Component (Vanilla HTML)

```html
<!-- Register the custom element -->
<script type="module">
  import "@pressprotocol/widget";
</script>

<!-- Add the publish widget anywhere in your markup -->
<pressprotocol-publish
  endpoint="https://pressprotocol.com"
  theme="dark"
  target-selector="#my-article-content"
  auto-tag="true"
></pressprotocol-publish>

<article id="my-article-content">
  <h1>Investigation into Global Data Silos</h1>
  <p>Censorship-resistant distribution ensures knowledge permanence.</p>
</article>
```

---

### 2. Editor Connectors (Tiptap, Lexical, Quill, TinyMCE)

```typescript
import { attachToTiptap, attachToQuill, attachToLexical } from "@pressprotocol/widget/connectors";

// Attach to Tiptap instance
attachToTiptap(editorInstance, {
  buttonElement: document.getElementById("publish-btn"),
  onSuccess: ({ cid, readerUrl, ipfsUrl, torUrl }) => {
    console.log("Published to IPFS:", cid);
    window.open(readerUrl, "_blank");
  },
  onError: (error) => {
    console.error("Publishing failed:", error);
  },
});
```

---

## Attributes & Configuration

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `endpoint` | `string` | `https://pressprotocol.com` | API gateway endpoint |
| `theme` | `"dark" \| "light" \| "auto"` | `"dark"` | Color scheme |
| `target-selector` | `string` | `""` | CSS selector of the article DOM element to publish |
| `anonymous` | `boolean` | `true` | Client-signed zero-custody mode |

---

## License

MIT © [0xShikhar](https://github.com/0xShikhar) & [PressProtocol Architects](https://pressprotocol.com)
