"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Image as ImageIcon,
  Minus,
  AlertCircle,
  List,
  ListOrdered,
  Sparkles,
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords: string[];
  action: (editor: Editor, onImageTrigger?: () => void) => void;
}

export const COMMANDS: CommandItem[] = [
  {
    id: "h1",
    title: "Heading 1",
    description: "Large section title for major chapters",
    icon: Heading1,
    keywords: ["h1", "heading1", "title", "large"],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "Medium subsection heading",
    icon: Heading2,
    keywords: ["h2", "heading2", "subtitle", "section"],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "Small sub-topic header",
    icon: Heading3,
    keywords: ["h3", "heading3", "sub"],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "callout",
    title: "Callout Box",
    description: "Whistleblower disclosure & alert highlight",
    icon: AlertCircle,
    badge: "Sovereign",
    keywords: ["callout", "alert", "box", "info", "whistleblower", "warning", "leak"],
    action: (editor) => (editor.chain().focus() as any).toggleCallout({ type: "info" }).run(),
  },
  {
    id: "quote",
    title: "Pull Quote",
    description: "Editorial quote or cited source testimony",
    icon: Quote,
    keywords: ["quote", "pullquote", "cite", "blockquote"],
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "code",
    title: "Code Block",
    description: "Syntax-highlighted code container",
    icon: Code,
    keywords: ["code", "pre", "javascript", "typescript", "snippet"],
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "image",
    title: "Upload Image",
    description: "Embed media directly to IPFS swarm",
    icon: ImageIcon,
    badge: "IPFS",
    keywords: ["image", "img", "photo", "picture", "upload", "ipfs"],
    action: (_editor, onImageTrigger) => {
      if (onImageTrigger) onImageTrigger();
    },
  },
  {
    id: "bullet",
    title: "Bullet List",
    description: "Unordered bullet point list",
    icon: List,
    keywords: ["bullet", "list", "ul", "unordered"],
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "numbered",
    title: "Numbered List",
    description: "Sequential numbered list",
    icon: ListOrdered,
    keywords: ["numbered", "ordered", "ol", "count"],
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "divider",
    title: "Divider Line",
    description: "Cryptographic horizontal divider",
    icon: Minus,
    keywords: ["divider", "hr", "line", "rule", "separator"],
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

interface SlashCommandMenuProps {
  editor: Editor;
  onImageTrigger?: () => void;
}

export function SlashCommandMenu({ editor, onImageTrigger }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const slashPosRef = useRef<number | null>(null);

  // Filter commands
  const filteredCommands = COMMANDS.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q))
    );
  });

  // Handle selecting a command
  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      if (!editor) return;

      const { state } = editor;
      const { from } = state.selection;
      const slashPos = slashPosRef.current;

      // Delete the slash and query text
      if (slashPos !== null && slashPos < from) {
        editor.chain().focus().deleteRange({ from: slashPos, to: from }).run();
      }

      // Execute command action
      cmd.action(editor, onImageTrigger);

      // Close menu
      setIsOpen(false);
      setQuery("");
      slashPosRef.current = null;
    },
    [editor, onImageTrigger]
  );

  // Update slash trigger detection on editor changes
  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { state } = editor;
      const { selection } = state;
      const { from, empty } = selection;

      if (!empty) {
        if (isOpen) setIsOpen(false);
        return;
      }

      // Get text of current block up to cursor
      const $from = state.doc.resolve(from);
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");

      // Match slash at word boundary or start of paragraph
      const match = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

      if (match) {
        const queryText = match[1];
        const matchIndex = match.index! + (match[0].startsWith(" ") ? 1 : 0);
        const slashAbsolutePos = from - $from.parentOffset + matchIndex;

        slashPosRef.current = slashAbsolutePos;
        setQuery(queryText);
        setSelectedIndex(0);

        try {
          const domCoords = editor.view.coordsAtPos(from);
          setCoords({
            top: domCoords.bottom + window.scrollY + 8,
            left: Math.max(16, Math.min(domCoords.left + window.scrollX, window.innerWidth - 320)),
          });
          setIsOpen(true);
        } catch {
          setIsOpen(false);
        }
      } else {
        if (isOpen) {
          setIsOpen(false);
          setQuery("");
          slashPosRef.current = null;
        }
      }
    };

    editor.on("transaction", handleTransaction);
    return () => {
      editor.off("transaction", handleTransaction);
    };
  }, [editor, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)
        );
      } else if (event.key === "Enter") {
        if (filteredCommands.length > 0) {
          event.preventDefault();
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        setQuery("");
      }
    };

    const domNode = editor.view.dom;
    domNode.addEventListener("keydown", handleKeyDown, true);

    return () => {
      domNode.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, editor, filteredCommands, selectedIndex, executeCommand]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen || !coords || filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-border/80 bg-background/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1">
        <span>Slash Commands</span>
        {query && <span className="font-mono text-primary">/{query}</span>}
      </div>

      <div className="space-y-0.5">
        {filteredCommands.map((cmd, idx) => {
          const Icon = cmd.icon;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={cmd.id}
              type="button"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors text-xs ${
                isSelected
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/60 text-foreground"
              }`}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div
                className={`p-1.5 rounded-md flex items-center justify-center ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs">{cmd.title}</span>
                  {cmd.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {cmd.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{cmd.description}</p>
              </div>

              {isSelected && (
                <span className="text-[10px] font-mono text-muted-foreground opacity-70">
                  ↵
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
