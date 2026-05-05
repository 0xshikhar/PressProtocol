"use client";

import { BubbleMenu, type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Quote,
  Heading2,
  Heading3,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    // cancelled
    if (url === null) return;

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        animation: "shift-away",
        placement: "top",
      }}
      className="flex items-center gap-0.5 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-xl p-1 z-50 animate-in fade-in zoom-in-95"
    >
      {/* Bold */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (⌘B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      {/* Italic */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (⌘I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      {/* Strikethrough */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Button>

      {/* Inline Code */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("code") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code (⌘E)"
      >
        <Code className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-border/60 mx-0.5" />

      {/* Heading 2 */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Button>

      {/* Heading 3 */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Button>

      {/* Quote */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Pull Quote"
      >
        <Quote className="h-3.5 w-3.5" />
      </Button>

      {/* Callout */}
      <Button
        type="button"
        size="sm"
        variant={(editor.isActive as any)("callout") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={() => (editor.chain().focus() as any).toggleCallout().run()}
        title="Callout Box"
      >
        <AlertCircle className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-border/60 mx-0.5" />

      {/* Link */}
      <Button
        type="button"
        size="sm"
        variant={editor.isActive("link") ? "secondary" : "ghost"}
        className="h-8 w-8 p-0 text-foreground hover:text-foreground"
        onClick={setLink}
        title={editor.isActive("link") ? "Edit Link" : "Add Link"}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </Button>

      {editor.isActive("link") && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove Link"
        >
          <Unlink className="h-3.5 w-3.5" />
        </Button>
      )}
    </BubbleMenu>
  );
}
