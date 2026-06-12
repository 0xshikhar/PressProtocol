/**
 * PressProtocol WordPress Gutenberg Block
 * 
 * Keyword: /press
 * Enables WordPress authors to embed interactive, verified sovereign articles.
 */
(function (wp) {
  var registerBlockType = wp.blocks.registerBlockType;
  var el = wp.element.createElement;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var TextControl = wp.components.TextControl;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;

  registerBlockType("pressprotocol/embed", {
    title: "PressProtocol Sovereign Embed",
    description: "Embed a cryptographically-signed sovereign article from IPFS & Tor into your post.",
    icon: "shield-alt",
    category: "embed",
    keywords: ["press", "pressprotocol", "ipfs", "sovereign", "tor", "embed"],
    attributes: {
      cid: {
        type: "string",
        default: "",
      },
      theme: {
        type: "string",
        default: "cyber",
      },
      compact: {
        type: "boolean",
        default: false,
      },
      height: {
        type: "number",
        default: 650,
      },
    },

    edit: function (props) {
      var attributes = props.attributes;
      var setAttributes = props.setAttributes;
      var cid = attributes.cid;
      var theme = attributes.theme;
      var compact = attributes.compact;

      var host = window.location.origin.includes("localhost")
        ? window.location.origin
        : "https://pressprotocol.com";
      var embedUrl = cid
        ? host + "/embed/" + encodeURIComponent(cid) + "?theme=" + encodeURIComponent(theme) + (compact ? "&compact=true" : "")
        : "";

      return el(
        "div",
        {
          className: "pressprotocol-gutenberg-block-wrapper",
          style: {
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            padding: "16px",
            background: "#09090b",
            color: "#ededed",
            fontFamily: "system-ui, -apple-system, sans-serif",
          },
        },
        el(
          InspectorControls,
          {},
          el(
            PanelBody,
            { title: "PressProtocol Settings", initialOpen: true },
            el(TextControl, {
              label: "Article CIDv1 Multihash",
              help: "Paste the IPFS CID (bafkrei...) of the article.",
              value: cid,
              onChange: function (newVal) {
                // Support pasting full URLs (e.g. https://pressprotocol.com/read/bafk...)
                var match = newVal.match(/(bafk[a-z0-9]+)/i);
                setAttributes({ cid: match ? match[1] : newVal.trim() });
              },
            }),
            el(SelectControl, {
              label: "Reading Theme",
              value: theme,
              options: [
                { label: "Cyber Matrix (Terminal)", value: "cyber" },
                { label: "Dark Velvet (High Contrast)", value: "dark" },
                { label: "Warm Sepia (Low Eyestrain)", value: "sepia" },
                { label: "Clean Paper (Daylight)", value: "light" },
              ],
              onChange: function (newVal) {
                setAttributes({ theme: newVal });
              },
            }),
            el(ToggleControl, {
              label: "Compact Mode",
              help: "Render as a 320px summary card instead of full article.",
              checked: compact,
              onChange: function (newVal) {
                setAttributes({ compact: newVal });
              },
            })
          )
        ),
        // Canvas Interface
        !cid
          ? el(
              "div",
              {
                style: {
                  textAlign: "center",
                  padding: "32px 16px",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                },
              },
              el(
                "div",
                { style: { fontSize: "16px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" } },
                "🛡️ PressProtocol Sovereign Reader"
              ),
              el(
                "p",
                { style: { fontSize: "13px", color: "#a1a1aa", marginBottom: "16px" } },
                "Paste an article CID or link to embed verified content with zero censorship risk."
              ),
              el(TextControl, {
                placeholder: "Paste CID (e.g. bafkreic7x...) or pressprotocol.com/read URL",
                value: cid,
                onChange: function (newVal) {
                  var match = newVal.match(/(bafk[a-z0-9]+)/i);
                  setAttributes({ cid: match ? match[1] : newVal.trim() });
                },
              })
            )
          : el(
              "div",
              {},
              el(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#10b981",
                  },
                },
                el("span", { style: { fontFamily: "monospace" } }, "CID: " + cid.slice(0, 16) + "..."),
                el("span", {}, "Mode: " + (compact ? "Compact Card" : "Full Reader") + " • Theme: " + theme)
              ),
              el("iframe", {
                src: embedUrl,
                width: "100%",
                height: compact ? "320px" : "550px",
                frameBorder: "0",
                style: {
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  pointerEvents: "none", // Prevent capturing clicks while editing
                },
              })
            )
      );
    },

    save: function (props) {
      var attributes = props.attributes;
      var cid = attributes.cid;
      var theme = attributes.theme || "cyber";
      var compact = attributes.compact;

      if (!cid) return null;

      var embedUrl = "https://pressprotocol.com/embed/" + encodeURIComponent(cid) + "?theme=" + encodeURIComponent(theme) + (compact ? "&compact=true" : "");

      return el(
        "div",
        { className: "pressprotocol-embed-container" },
        el("iframe", {
          src: embedUrl,
          width: "100%",
          height: compact ? "320" : "650",
          frameBorder: "0",
          loading: "lazy",
          allow: "clipboard-write",
          style: "border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.35);",
          title: "PressProtocol Sovereign Reader",
        })
      );
    },
  });
})(window.wp);
