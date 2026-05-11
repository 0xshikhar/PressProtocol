import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";

interface PressProtocolSettings {
  apiUrl: string;
  authorPseudonym: string;
  privateKey: string;
  publicKey: string;
  autoCopyLink: boolean;
  defaultTags: string;
}

const DEFAULT_SETTINGS: PressProtocolSettings = {
  apiUrl: "https://pressprotocol.com",
  authorPseudonym: "Sovereign Thinker",
  privateKey: "",
  publicKey: "",
  autoCopyLink: true,
  defaultTags: "obsidian, sovereign, research",
};

/**
 * Sanitizes Obsidian-specific markdown syntax into standard universal markdown
 */
export function cleanObsidianMarkdown(raw: string): string {
  let text = raw;

  // 1. Strip YAML frontmatter
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  // 2. Transform wiki-links with custom display text: [[Note Title|Custom Text]] -> Custom Text
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");

  // 3. Transform simple wiki-links: [[Note Title]] -> Note Title
  text = text.replace(/\[\[([^\]]+)\]\]/g, "$1");

  // 4. Strip Obsidian block references (e.g. ^c7b8a1)
  text = text.replace(/\s*\^[a-zA-Z0-9-]+\s*$/gm, "");

  // 5. Clean internal embedded transclusions: ![[Note Title]] -> [Note Reference: Note Title]
  text = text.replace(/!\[\[([^\]]+)\]\]/g, "*[Embedded Note: $1]*");

  return text.trim();
}

/**
 * Extracts a title from frontmatter, first H1, or file basename
 */
export function extractArticleTitle(raw: string, fallbackBasename: string): string {
  // Check YAML frontmatter for title: ...
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/^title:\s*["']?([^"'\n\r]+)["']?/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
  }

  // Check first markdown H1
  const h1Match = raw.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  return fallbackBasename;
}

export default class PressProtocolPlugin extends Plugin {
  settings: PressProtocolSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // 1. Register left ribbon icon
    this.addRibbonIcon("feather", "Publish to PressProtocol", () => {
      this.publishActiveNote();
    });

    // 2. Register command palette action
    this.addCommand({
      id: "publish-active-note",
      name: "Publish Active Note to IPFS & Tor Swarm",
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.extension === "md") {
          if (!checking) {
            this.publishActiveNote();
          }
          return true;
        }
        return false;
      },
    });

    // 3. Register file context menu
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFile && file.extension === "md") {
          menu.addItem((item) => {
            item
              .setTitle("Publish to PressProtocol")
              .setIcon("shield")
              .onClick(() => {
                this.publishFile(file);
              });
          });
        }
      })
    );

    // 4. Register settings tab
    this.addSettingTab(new PressProtocolSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async publishActiveNote() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("⚠️ No active markdown note open to publish.");
      return;
    }
    await this.publishFile(activeFile);
  }

  async publishFile(file: TFile) {
    const notice = new Notice(`⏳ Preparing "${file.basename}" for sovereign publication...`, 0);

    try {
      const rawContent = await this.app.vault.read(file);
      const title = extractArticleTitle(rawContent, file.basename);
      const cleanedContent = cleanObsidianMarkdown(rawContent);

      if (!cleanedContent) {
        notice.hide();
        new Notice("❌ Note content is empty.");
        return;
      }

      const tags = this.settings.defaultTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      // Prepare publication payload
      const payload = {
        title,
        content: cleanedContent,
        tags,
        publisher: {
          username: this.settings.authorPseudonym,
          walletAddress: "anonymous",
          pubkey: this.settings.publicKey || undefined,
        },
      };

      notice.setMessage("🚀 Broadcasting content to IPFS Swarm & Tor...");

      const endpoint = `${this.settings.apiUrl.replace(/\/+$/, "")}/api/content`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gateway returned HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      notice.hide();

      const permalink = `${this.settings.apiUrl.replace(/\/+$/, "")}/read/${data.cid}`;

      if (this.settings.autoCopyLink) {
        await navigator.clipboard.writeText(permalink);
      }

      new Notice(`✅ Successfully published "${title}"! CID: ${data.cid.slice(0, 12)}...`, 5000);

      // Open interactive result modal
      new PublishResultModal(this.app, title, data.cid, permalink, this.settings.apiUrl).open();
    } catch (err: any) {
      notice.hide();
      console.error("[PressProtocol] Publication error:", err);
      new Notice(`❌ Failed to publish: ${err.message || err}`);
    }
  }
}

/**
 * Modal displaying publication result with permalink and embed code
 */
class PublishResultModal extends Modal {
  title: string;
  cid: string;
  permalink: string;
  apiUrl: string;

  constructor(app: App, title: string, cid: string, permalink: string, apiUrl: string) {
    super(app);
    this.title = title;
    this.cid = cid;
    this.permalink = permalink;
    this.apiUrl = apiUrl;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("pressprotocol-modal-content");

    contentEl.createEl("h2", { text: "🎉 Published to PressProtocol Swarm" });

    const banner = contentEl.createDiv({ cls: "pressprotocol-success-banner" });
    banner.setText(`"${this.title}" is now permanently published across IPFS and Tor.`);

    // Telemetry Row
    const row = contentEl.createDiv({ cls: "pressprotocol-telemetry-row" });
    row.createSpan({ text: "Content Multihash (CIDv1):" });
    row.createSpan({ text: `${this.cid.slice(0, 16)}...${this.cid.slice(-8)}` });

    // Link Row
    contentEl.createEl("label", { text: "Sovereign Reading Link:" });
    const input = contentEl.createEl("input", {
      cls: "pressprotocol-link-field",
      type: "text",
      value: this.permalink,
    });
    input.readOnly = true;

    // Button Row
    const btnRow = contentEl.createDiv({ cls: "pressprotocol-button-row" });

    const copyBtn = btnRow.createEl("button", { text: "Copy Link", cls: "mod-cta" });
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(this.permalink);
      new Notice("📋 Permlink copied to clipboard!");
    };

    const copyEmbedBtn = btnRow.createEl("button", { text: "Copy Embed Code" });
    copyEmbedBtn.onclick = () => {
      const embedCode = `<iframe src="${this.apiUrl}/embed/${this.cid}?theme=cyber" width="100%" height="600" frameborder="0"></iframe>`;
      navigator.clipboard.writeText(embedCode);
      new Notice("📋 HTML iframe code copied to clipboard!");
    };

    const openBtn = btnRow.createEl("button", { text: "Open in Browser" });
    openBtn.onclick = () => {
      window.open(this.permalink, "_blank");
    };
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * Settings Tab in Obsidian Preferences
 */
class PressProtocolSettingTab extends PluginSettingTab {
  plugin: PressProtocolPlugin;

  constructor(app: App, plugin: PressProtocolPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "PressProtocol Sovereign Publishing Settings" });

    new Setting(containerEl)
      .setName("API Gateway Endpoint")
      .setDesc("PressProtocol node or web gateway URL for broadcasting content.")
      .addText((text) =>
        text
          .setPlaceholder("https://pressprotocol.com")
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Author Sovereign Pseudonym")
      .setDesc("Display name attached to published sovereign articles.")
      .addText((text) =>
        text
          .setPlaceholder("Sovereign Thinker")
          .setValue(this.plugin.settings.authorPseudonym)
          .onChange(async (value) => {
            this.plugin.settings.authorPseudonym = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default Tags")
      .setDesc("Comma-separated list of tags automatically applied to notes.")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultTags)
          .onChange(async (value) => {
            this.plugin.settings.defaultTags = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Auto-Copy Permalink")
      .setDesc("Automatically copy the live reader link to clipboard on successful publish.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoCopyLink)
          .onChange(async (value) => {
            this.plugin.settings.autoCopyLink = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
