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
  Link as LinkIcon,
  Minus,
  AlertCircle,
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
          class: "rounded-[6px] max-w-full h-auto my-6 shadow-md border border-border/60",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline decoration-accent-ribbon underline-offset-2 hover:text-accent-hover cursor-pointer",
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
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[450px] px-0 py-2 font-reader text-lg leading-relaxed text-primary selection:bg-accent-tint selection:text-primary",
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
    <div className="w-full bg-transparent font-sans">
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

      {/* Floating Toolbar */}
      <div className="flex items-center justify-start my-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-[6px] border border-border/70 bg-surface px-2.5 py-1.5 shadow-xl">
          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] text-xs font-mono transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-overlay text-primary border border-hairline font-bold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1 (/h1)"
          >
            H1
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] text-xs font-mono transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-overlay text-primary border border-hairline font-bold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (/h2)"
          >
            H2
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] text-xs font-mono transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-overlay text-primary border border-hairline font-bold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3 (/h3)"
          >
            H3
          </Button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          {/* Text formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("bold")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (⌘B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("italic")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (⌘I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("strike")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("bulletList")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List (- item)"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("orderedList")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List (1. item)"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          {/* Quote & Callout */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("blockquote")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Pull Quote (> quote)"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              (editor.isActive as any)("callout")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => (editor.chain().focus() as any).toggleCallout({ type: "info" }).run()}
            title="Whistleblower Callout Box (/callout)"
          >
            <AlertCircle className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block (```)"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          {/* Media & Links */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-[4px] transition-colors ${
              editor.isActive("link")
                ? "bg-overlay text-primary border border-hairline font-semibold"
                : "text-muted hover:text-primary hover:bg-overlay"
            }`}
            onClick={setLink}
            title="Add Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>

          <ImageUploadButton onImageUploaded={handleImageUploaded} disabled={!editable} />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-[4px] text-muted hover:text-primary hover:bg-surface-raised"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Line (---)"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
