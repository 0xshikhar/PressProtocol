import { Node, mergeAttributes } from "@tiptap/react";

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Toggle a callout box
       */
      toggleCallout: (attributes?: { type?: "info" | "warning" | "whistleblower" }) => ReturnType;
      /**
       * Set a callout box
       */
      setCallout: (attributes?: { type?: "info" | "warning" | "whistleblower" }) => ReturnType;
      /**
       * Unset a callout box
       */
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-callout-type") || "info",
        renderHTML: (attributes: Record<string, any>) => ({
          "data-callout-type": attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    const type = node.attrs.type || "info";
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "callout",
        class: `press-callout press-callout-${type}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes?: { type?: "info" | "warning" | "whistleblower" }) =>
        ({ commands }: { commands: any }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes?: { type?: "info" | "warning" | "whistleblower" }) =>
        ({ commands }: { commands: any }) => {
          return commands.toggleWrap(this.name, attributes);
        },
      unsetCallout:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.lift(this.name);
        },
    };
  },
});
