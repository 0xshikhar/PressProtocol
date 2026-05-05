"use client";

import { useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { ImageUploadButton } from "./ImageUpload";
import { Callout } from "./extensions/Callout";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { SlashCommandMenu } from "./SlashCommandMenu";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Minus,
  AlertCircle,
  Command,
} from "lucide-react";
import { toast } from "sonner";

interface EnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function EnhancedEditor({
  content,
  onChange,
  placeholder = "Tell your story... (Type '/' for slash commands)",
  editable = true,
}: EnhancedEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Callout,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto my-6 shadow-md border border-border/40",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[480px] px-6 py-6 font-serif leading-relaxed text-foreground selection:bg-primary/20",
      },
    },
  });

  const handleImageUploaded = useCallback(
    (url: string, cid: string) => {
      if (editor) {
        editor
          .chain()
          .focus()
          .setImage({
            src: url,
            alt: "Sovereign IPFS Media",
            // @ts-ignore - custom attribute
            "data-cid": cid,
          })
          .run();
      }
    },
    [editor]
  );

  const triggerImageUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    try {
      toast.loading("Uploading image to IPFS swarm...", { id: "ipfs-upload" });
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { cid, url } = await response.json();
      handleImageUploaded(url, cid);
      toast.success("Image pinned to IPFS!", { id: "ipfs-upload" });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: "ipfs-upload" });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border/70 rounded-xl overflow-hidden bg-background shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
      {/* Hidden File Input for Slash Command Image Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Floating Contextual Bubble Menu */}
      <EditorBubbleMenu editor={editor} />

      {/* Slash Commands Dropdown Menu */}
      <SlashCommandMenu editor={editor} onImageTrigger={triggerImageUpload} />

      {/* Top Toolbar */}
      <div className="border-b border-border/60 bg-muted/20 px-3 py-2 flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1 (/h1)"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (/h2)"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3 (/h3)"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Text formatting */}
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (⌘B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (⌘I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List (- item)"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List (1. item)"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Quote & Callout */}
          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Pull Quote (> quote)"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={(editor.isActive as any)("callout") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 text-emerald-600 dark:text-emerald-400"
            onClick={() => (editor.chain().focus() as any).toggleCallout({ type: "info" }).run()}
            title="Whistleblower Callout Box (/callout)"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block (```)"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Media & Links */}
          <Button
            type="button"
            variant={editor.isActive("link") ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={setLink}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <ImageUploadButton onImageUploaded={handleImageUploaded} disabled={!editable} />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Line (---)"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Slash Command Hint Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-[11px] text-muted-foreground border border-border/40 font-mono">
          <Command className="h-3 w-3 text-primary" />
          <span>Type <strong className="text-foreground">/</strong> for slash commands</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
