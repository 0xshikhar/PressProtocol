import DOMPurify from "dompurify";

/**
 * Article HTML comes from arbitrary IPFS CIDs and must be treated as untrusted.
 * Every render path that uses dangerouslySetInnerHTML for article bodies must go through here.
 */

const FORBID_TAGS = ["style", "form", "input", "button", "textarea", "select", "iframe", "object", "embed", "frame", "frameset", "link", "meta", "base"];
const FORBID_ATTR = ["style", "srcset", "formaction", "action"];

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.hasAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow ugc");
    }
    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("referrerpolicy", "no-referrer");
    }
  });
  hooksInstalled = true;
}

/**
 * Sanitizes untrusted article HTML. Returns an empty string outside the browser,
 * where DOMPurify cannot run, so unsanitized markup is never emitted during SSR.
 */
export function sanitizeArticleHtml(dirty: string | null | undefined): string {
  if (!dirty || typeof window === "undefined" || !DOMPurify.isSupported) return "";
  installHooks();
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
