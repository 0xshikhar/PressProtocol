# PressProtocol Obsidian Community Plugin

> Cryptographically sign and publish sovereign articles to IPFS and Tor directly from your Obsidian vault.

---

## Features
- **1-Click Sovereign Publishing**: Click the feather icon in the ribbon or run `PressProtocol: Publish Active Note` from the command palette.
- **Smart Markdown Cleaner**:
  - Automatically cleans Obsidian wiki-links (`[[Target|Label]]` -> `Label`, `[[Target]]` -> `Target`).
  - Strips Obsidian block identifiers (`^c7b8a1`) and internal embed references.
  - Cleans YAML frontmatter while using `title:` properties as the published headline.
- **Decentralized Multi-Transport**: Notes are pinned to IPFS swarm and Tor hidden services.
- **Instant Clipboard Permalinks**: Automatically copies `https://pressprotocol.com/read/<CID>` and iframe embed code.

---

## Installation

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Inside your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a new folder named `pressprotocol-obsidian`.
4. Place the three files inside that folder.
5. In Obsidian, go to **Settings > Community plugins**, reload, and enable **PressProtocol Sovereign Publisher**.

---

## Building from Source

```bash
pnpm install
pnpm run build
```
This compiles `src/main.ts` into `main.js`.
