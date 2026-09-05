/**
 * PressProtocol In-Page Link Interceptor
 * Intercepts pressprotocol:// and anonpress:// URIs clicked on any webpage
 * and routes them seamlessly to the PressProtocol decentralized reader.
 */

document.addEventListener(
  "click",
  (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href") || anchor.href || "";
    if (href.startsWith("pressprotocol://") || href.startsWith("anonpress://")) {
      event.preventDefault();
      event.stopPropagation();

      const rawCid = href.replace(/^(pressprotocol|anonpress):\/\//, "").replace(/^\/+/, "");
      if (rawCid) {
        chrome.runtime.sendMessage({
          action: "openProtocolLink",
          cid: rawCid,
        });
      }
    }
  },
  true // Capture phase to intercept before page listeners or browser navigation
);
