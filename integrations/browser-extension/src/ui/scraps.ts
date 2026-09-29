/**
 * Sovereign Scrap Vault Controller
 */
import type { SovereignScrap } from "../types";

export function formatTimeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

export async function renderScrapsList(
  container: HTMLElement,
  badge: HTMLElement,
  emptyState: HTMLElement,
  vaultFooter: HTMLElement,
  onRefresh: () => void
): Promise<void> {
  const res = await chrome.runtime.sendMessage({ action: "getScraps" });
  const scraps: SovereignScrap[] = res?.success ? res.data : [];

  badge.textContent = String(scraps.length);

  if (scraps.length === 0) {
    emptyState.classList.remove("hidden");
    container.innerHTML = "";
    vaultFooter.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  vaultFooter.classList.remove("hidden");

  container.innerHTML = scraps
    .map((scrap) => {
      let hostname = "";
      let safeUrl = "#";
      try {
        const parsed = new URL(scrap.url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          safeUrl = parsed.toString();
          hostname = parsed.hostname.replace("www.", "");
        } else {
          hostname = "external-source";
        }
      } catch {
        hostname = "external-source";
      }

      return `
        <div class="scrap-card" data-id="${scrap.id}">
          <div class="scrap-quote">"${escapeHtml(scrap.quote)}"</div>
          <div class="scrap-meta">
            <a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="scrap-source text-truncate mono" title="${escapeHtml(scrap.pageTitle)}">
              ${escapeHtml(hostname)}
            </a>
            <span class="mono">${formatTimeAgo(scrap.timestamp)}</span>
          </div>
          <div class="scrap-actions">
            <button class="btn-scrap-action btn-copy-scrap" data-quote="${escapeAttr(scrap.quote)}" data-title="${escapeAttr(scrap.pageTitle)}" data-url="${escapeAttr(safeUrl)}">
              Copy Markdown
            </button>
            <button class="btn-scrap-action btn-delete-scrap" data-id="${scrap.id}">
              Remove
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach delete handlers
  container.querySelectorAll<HTMLButtonElement>(".btn-delete-scrap").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!id) return;
      await chrome.runtime.sendMessage({ action: "deleteScrap", id });
      onRefresh();
    });
  });

  // Attach copy handlers
  container.querySelectorAll<HTMLButtonElement>(".btn-copy-scrap").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.quote || "";
      const t = btn.dataset.title || "";
      const u = btn.dataset.url || "";
      const markdown = `> "${q}"\n>\n> — [${t}](${u})`;
      navigator.clipboard.writeText(markdown);
      btn.textContent = "✓ Copied";
      setTimeout(() => (btn.textContent = "Copy Markdown"), 1800);
    });
  });
}
