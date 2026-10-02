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
 * Strips HTML tags safely using character-level scanning while preserving literal '<' symbols.
 *
 * @param html - Raw HTML string to be stripped of tags.
 * @returns Cleaned text content with HTML tags removed.
 */
function stripHtmlTags(html: string): string {
  let inTag = false;
  let quoteChar: string | null = null;
  let text = '';

  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (!inTag) {
      if (ch === '<' && i + 1 < html.length && /[a-zA-Z\/!_?]/.test(html[i + 1])) {
        inTag = true;
        quoteChar = null;
        text += ' ';
      } else {
        text += ch;
      }
    } else {
      if (quoteChar) {
        if (ch === quoteChar) {
          quoteChar = null;
        }
      } else {
        if (ch === '"' || ch === "'") {
          quoteChar = ch;
        } else if (ch === '>') {
          inTag = false;
        }
      }
    }
  }
  return text;
}

/**
 * Extracts title from a title element, input, or fallback heading.
 *
 * @param titleElement - Optional DOM element containing the document title.
 * @param fallbackContent - Optional fallback HTML or Markdown string to extract title from.
 * @returns Extracted clean title string or default fallback title.
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

  // Fallback: Check for first H1 tag in content outside attributes
  if (fallbackContent) {
    const cleanMarkup = fallbackContent.replace(/="[^"]*"|='[^']*'/g, '=""');
    const h1Open = /<h1\b[^>]*>/i.exec(cleanMarkup);
    if (h1Open) {
      const startIndex = h1Open.index + h1Open[0].length;
      const closeIndex = cleanMarkup.toLowerCase().indexOf('</h1>', startIndex);
      if (closeIndex !== -1) {
        const inner = cleanMarkup.slice(startIndex, closeIndex);
        const titleText = stripHtmlTags(inner).trim();
        if (titleText) return titleText;
      }
    }
    const mdH1Match = fallbackContent.match(/^#[ \t]+([^\r\n]+)/m);
    if (mdH1Match && mdH1Match[1]) {
      return mdH1Match[1].trim();
    }
  }

  return 'Untitled Sovereign Publication';
}

/**
 * Extracts inline media and image URLs from content.
 *
 * @param htmlOrMarkdown - Content string in HTML or Markdown format.
 * @returns Array of unique media URL strings.
 */
export function extractMediaUrls(htmlOrMarkdown: string): string[] {
  const urls = new Set<string>();

  // HTML img src regex (bounded linear tag match to prevent backtracking)
  const imgTagRegex = /<img\b[^>]+>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgTagRegex.exec(htmlOrMarkdown)) !== null) {
    const srcMatch = imgMatch[0].match(/(?:\s|^)src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('data:image/svg+xml;utf8,<svg')) {
      urls.add(srcMatch[1]);
    }
  }

  // Markdown image syntax regex: ![alt](url) bounded to single-line without nested [ to prevent ReDoS
  const mdImgRegex = /!\[[^\[\]\r\n]{0,300}\]\(([^)\s\r\n]{1,500})\)/g;
  let mdMatch: RegExpExecArray | null;
  while ((mdMatch = mdImgRegex.exec(htmlOrMarkdown)) !== null) {
    if (mdMatch[1]) {
      urls.add(mdMatch[1]);
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

  // Compute word count safely without ReDoS or incomplete sanitization
  const cleanText = stripHtmlTags(rawContent).replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  const isHtml = /<[a-z][^<>]{0,250}>/i.test(rawContent);

  return {
    title,
    content: rawContent,
    format: isHtml ? 'html' : 'markdown',
    editorType,
    media,
    wordCount,
  };
}
