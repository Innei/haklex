export interface LNode {
  type: string
  version: number
  [key: string]: unknown
}

export interface EditorState {
  root: LNode & {
    children: LNode[]
    direction: 'ltr' | 'rtl' | null
    format: string
    indent: number
  }
}

// Text format bitwise flags (from Lexical)
export const FORMAT_BOLD = 1
export const FORMAT_ITALIC = 1 << 1
export const FORMAT_STRIKETHROUGH = 1 << 2
export const FORMAT_UNDERLINE = 1 << 3
export const FORMAT_CODE = 1 << 4
export const FORMAT_SUBSCRIPT = 1 << 5
export const FORMAT_SUPERSCRIPT = 1 << 6
export const FORMAT_HIGHLIGHT = 1 << 7

// ── Node builders ──

export function text(content: string, format = 0): LNode {
  return { detail: 0, format, mode: 'normal', style: '', text: content, type: 'text', version: 1 }
}

export function paragraph(...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1, textFormat: 0, textStyle: '' }
}

export function heading(tag: string, ...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, tag, type: 'heading', version: 1 }
}

export function quote(...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'quote', version: 1 }
}

export function listNode(listType: 'bullet' | 'number', ...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, listType, start: 1, tag: listType === 'bullet' ? 'ul' : 'ol', type: 'list', version: 1 }
}

export function listItem(value: number, ...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'listitem', version: 1, value }
}

export function link(url: string, title: string | null, ...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'link', version: 1, rel: null, target: null, title, url }
}

export function horizontalRule(): LNode {
  return { type: 'horizontalrule', version: 1 }
}

export function lineBreak(): LNode {
  return { type: 'linebreak', version: 1 }
}

export function codeBlock(code: string, language: string): LNode {
  return { type: 'code-block', code, language, version: 1 }
}

export function mermaid(diagram: string): LNode {
  return { type: 'mermaid', diagram, version: 1 }
}

export function image(src: string, altText: string, caption?: string): LNode {
  return { type: 'image', src, altText, width: undefined, height: undefined, caption, thumbhash: undefined, accent: undefined, version: 1 }
}

export function video(src: string): LNode {
  return { type: 'video', src, poster: undefined, width: undefined, height: undefined, version: 1 }
}

export function katexBlock(equation: string): LNode {
  return { type: 'katex-block', equation, version: 1 }
}

export function katexInline(equation: string): LNode {
  return { type: 'katex-inline', equation, version: 1 }
}

export function spoiler(...children: LNode[]): LNode {
  return { type: 'spoiler', children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function mention(platform: string, handle: string, displayName?: string): LNode {
  return { type: 'mention', platform, handle, ...(displayName ? { displayName } : {}), version: 1 }
}

export function footnoteRef(identifier: string): LNode {
  return { type: 'footnote', identifier, version: 1 }
}

export function footnoteSection(definitions: Record<string, string>): LNode {
  return { type: 'footnote-section', definitions, version: 1 }
}

export function ruby(base: string, reading: string): LNode {
  return { type: 'ruby', reading, children: [text(base)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function tag(t: string): LNode {
  return { type: 'tag', text: t, version: 1 }
}

export function linkCard(url: string, title?: string): LNode {
  return { type: 'link-card', url, source: undefined, id: undefined, title: title || undefined, description: undefined, favicon: undefined, image: undefined, version: 1 }
}

export function alertQuote(alertType: string, ...children: LNode[]): LNode {
  return { type: 'alert-quote', alertType, content: wrapRoot(children), version: 1 }
}

export function banner(bannerType: string, ...children: LNode[]): LNode {
  return { type: 'banner', bannerType, content: wrapRoot(children), version: 1 }
}

export function details(summary: string, open: boolean, ...children: LNode[]): LNode {
  return { type: 'details', summary, open, children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

export function gallery(images: { src: string; alt?: string }[], layout = 'grid'): LNode {
  return { type: 'gallery', images, layout, version: 1 }
}

export function gridContainer(cols: number, gap: string, cells: unknown[]): LNode {
  return { type: 'grid-container', cols, gap, cells, version: 1 }
}

export function codeSnippet(files: { filename: string; language: string; code: string }[]): LNode {
  return { type: 'code-snippet', files, version: 1 }
}

export function nestedDoc(...children: LNode[]): LNode {
  return { type: 'nested-doc', content: wrapRoot(children), version: 1 }
}

export function excalidraw(snapshot: string): LNode {
  return { type: 'excalidraw', snapshot, version: 1 }
}

export function tableNode(...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'table', version: 1 }
}

export function tableRow(...children: LNode[]): LNode {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'tablerow', version: 1 }
}

export function tableCell(headerState: number, ...children: LNode[]): LNode {
  return { children, colSpan: 1, direction: 'ltr', format: '', headerState, indent: 0, type: 'tablecell', version: 1, width: null }
}

export function embed(url: string): LNode {
  return { type: 'embed', url, source: null, version: 1 }
}

export function wrapRoot(children: LNode[]) {
  return { root: { children, direction: 'ltr' as const, format: '', indent: 0, type: 'root' as const, version: 1 } }
}

export function doc(...children: LNode[]): EditorState {
  return { root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
}
