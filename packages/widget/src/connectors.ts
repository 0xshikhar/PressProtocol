/**
 * PressProtocol Universal Editor Connectors
 * 
 * Automatically detects and extracts content, titles, and media from:
 * - TipTap
 * - Lexical
 * - Quill
 * - ProseMirror
 * - Slate
 * - TinyMCE
 * - Standard <textarea> / <input>
 * - Standard contenteditable HTML elements
 */

export type SupportedEditorType = 
  | 'tiptap'
  | 'lexical'
  | 'quill'
  | 'prosemirror'
  | 'slate'
  | 'tinymce'
  | 'textarea'
  | 'contenteditable'
  | 'generic';

export interface ExtractedArticle {
  title: string;
  content: string;
  format: 'html' | 'markdown' | 'text';
  editorType: SupportedEditorType;
  media: string[];
  wordCount: number;
}

/**
 * Detect the editor type of a given DOM element or selector.
 */
export function detectEditorType(element: Element | null): SupportedEditorType {
  if (!element) return 'generic';

  // 1. Textarea or Input
  const tagName = element.tagName ? element.tagName.toLowerCase() : '';
  if (tagName === 'textarea' || tagName === 'input') {
    return 'textarea';
  }

  // 2. TinyMCE
  if (
    element.classList?.contains('mce-content-body') ||
    element.getAttribute?.('id')?.startsWith('mce_') ||
    (typeof window !== 'undefined' && (window as any).tinymce?.get(element.id))
  ) {
    return 'tinymce';
  }

  // 3. Quill
  if (
    element.classList?.contains('ql-editor') ||
    element.closest?.('.ql-container') ||
    element.querySelector?.('.ql-editor')
  ) {
    return 'quill';
  }

  // 4. TipTap (often has .tiptap or ProseMirror with TipTap instance)
  if (
    element.classList?.contains('tiptap') ||
    (element as any).editor ||
    (element as any).__tiptap__ ||
    element.closest?.('.tiptap')
  ) {
    return 'tiptap';
  }

  // 5. ProseMirror (general)
  if (
    element.classList?.contains('ProseMirror') ||
    element.closest?.('.ProseMirror') ||
    (element as any).pmView
  ) {
    return 'prosemirror';
  }

  // 6. Lexical
  if (
    element.getAttribute?.('data-lexical-editor') === 'true' ||
    element.querySelector?.('[data-lexical-editor="true"]') ||
    (element as any).__lexicalEditor
  ) {
    return 'lexical';
  }

  // 7. Slate
  if (
    element.getAttribute?.('data-slate-editor') === 'true' ||
    element.querySelector?.('[data-slate-editor="true"]') ||
    element.querySelector?.('[data-slate-node="value"]')
  ) {
    return 'slate';
  }

  // 8. contenteditable fallback
  if (element.getAttribute('contenteditable') === 'true' || (element as HTMLElement).isContentEditable) {
    return 'contenteditable';
  }

  return 'generic';
}

/**
 * Extracts raw HTML/text content from any editor element based on its type.
 */
export function extractEditorContent(element: Element | null, editorType?: SupportedEditorType): string {
  if (!element) return '';

  const type = editorType || detectEditorType(element);

  switch (type) {
    case 'textarea': {
      return (element as HTMLTextAreaElement | HTMLInputElement).value || '';
    }

    case 'tinymce': {
      if (typeof window !== 'undefined' && (window as any).tinymce?.get) {
        const editor = (window as any).tinymce.get(element.id);
        if (editor && typeof editor.getContent === 'function') {
          return editor.getContent();
        }
      }
      return element.innerHTML || '';
    }

    case 'quill': {
      const qlEditor = element.classList.contains('ql-editor') 
        ? element 
        : element.querySelector('.ql-editor');
      if (qlEditor) {
        return qlEditor.innerHTML || '';
      }
      if (typeof window !== 'undefined' && (window as any).Quill?.find) {
        const qInstance = (window as any).Quill.find(element);
        if (qInstance?.root) {
          return qInstance.root.innerHTML || '';
        }
      }
      return element.innerHTML || '';
    }

    case 'tiptap': {
      const tipInstance = (element as any).editor || (element as any).__tiptap__;
      if (tipInstance && typeof tipInstance.getHTML === 'function') {
        return tipInstance.getHTML();
      }
      return element.innerHTML || '';
    }

    case 'lexical': {
      const lexicalEditor = (element as any).__lexicalEditor;
      if (lexicalEditor && typeof lexicalEditor.getEditorState === 'function') {
        // Fallback to DOM representation if running directly
        return element.innerHTML || '';
      }
      return element.innerHTML || '';
    }

    case 'slate':
    case 'prosemirror':
    case 'contenteditable':
    case 'generic':
    default: {
      return element.innerHTML || (element as HTMLElement).innerText || '';
    }
  }
}

/**
 * Extracts title from a title element, input, or fallback heading.
 */
export function extractTitle(titleElement: Element | null, fallbackContent?: string): string {
  if (titleElement) {
    if ('value' in titleElement && typeof (titleElement as HTMLInputElement).value === 'string') {
      const val = (titleElement as HTMLInputElement).value.trim();
      if (val) return val;
    }
    const text = (titleElement as HTMLElement).innerText || titleElement.textContent || '';
    if (text.trim()) return text.trim();
  }

  // Fallback: Check for first H1 tag in content
  if (fallbackContent) {
    const h1Match = fallbackContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      return h1Match[1].replace(/<[^>]+>/g, '').trim();
    }
    const mdH1Match = fallbackContent.match(/^#\s+(.+)$/m);
    if (mdH1Match && mdH1Match[1]) {
      return mdH1Match[1].trim();
    }
  }

  return 'Untitled Sovereign Publication';
}

/**
 * Extracts inline media and image URLs from content.
 */
export function extractMediaUrls(htmlOrMarkdown: string): string[] {
  const urls = new Set<string>();

  // HTML img src regex
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(htmlOrMarkdown)) !== null) {
    if (match[1] && !match[1].startsWith('data:image/svg+xml;utf8,<svg')) {
      urls.add(match[1]);
    }
  }

  // Markdown image syntax regex: ![alt](url)
  const mdImgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  while ((match = mdImgRegex.exec(htmlOrMarkdown)) !== null) {
    if (match[1]) {
      urls.add(match[1].split(/\s+/)[0]);
    }
  }

  return Array.from(urls);
}

/**
 * Full extraction pipeline combining title, content, editor detection, and media scanning.
 */
export function extractArticleFromDom(options: {
  editorElement: Element | null;
  titleElement?: Element | null;
  defaultTitle?: string;
}): ExtractedArticle {
  const { editorElement, titleElement, defaultTitle } = options;
  const editorType = detectEditorType(editorElement);
  const rawContent = extractEditorContent(editorElement, editorType);
  const title = extractTitle(titleElement || null, rawContent) || defaultTitle || 'Untitled Publication';
  const media = extractMediaUrls(rawContent);

  // Compute word count
  const cleanText = rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

  return {
    title,
    content: rawContent,
    format: isHtml ? 'html' : 'markdown',
    editorType,
    media,
    wordCount,
  };
}
