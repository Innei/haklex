import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

// Re-export common node types (defined inline to avoid Lexical package import issues)
type SerializedTextNode = SerializedLexicalNode & {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: 'normal' | 'token' | 'segmented'
  style: string
}

type SerializedParagraphNode = SerializedLexicalNode & {
  type: 'paragraph'
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
  textFormat: number
  textStyle: string
}

type SerializedHeadingNode = SerializedLexicalNode & {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
}

type SerializedQuoteNode = SerializedLexicalNode & {
  type: 'quote'
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
}

type SerializedListNode = SerializedLexicalNode & {
  type: 'list'
  listType: 'bullet' | 'number'
  start: number
  tag: 'ul' | 'ol'
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
}

type SerializedListItemNode = SerializedLexicalNode & {
  type: 'listitem'
  value: number
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
}

type SerializedLinkNode = SerializedLexicalNode & {
  type: 'link'
  url: string
  rel: string | null
  target: string | null
  title: string | null
  children: SerializedLexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
}

// Text formats (bitwise flags)
export const FORMAT_BOLD = 1
export const FORMAT_ITALIC = 1 << 1
export const FORMAT_STRIKETHROUGH = 1 << 2
export const FORMAT_UNDERLINE = 1 << 3
export const FORMAT_CODE = 1 << 4

export function text(content: string, format = 0): SerializedTextNode {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text: content,
    type: 'text',
    version: 1,
  }
}

export function paragraph(
  ...children: SerializedLexicalNode[]
): SerializedParagraphNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

export function heading(
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  ...children: SerializedLexicalNode[]
): SerializedHeadingNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

export function quote(
  ...children: SerializedLexicalNode[]
): SerializedQuoteNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'quote',
    version: 1,
  }
}

export function list(
  listType: 'bullet' | 'number',
  ...children: SerializedLexicalNode[]
): SerializedListNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    listType,
    start: 1,
    tag: listType === 'bullet' ? 'ul' : 'ol',
    type: 'list',
    version: 1,
  }
}

export function listItem(
  ...children: SerializedLexicalNode[]
): SerializedListItemNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    version: 1,
    value: 1,
  }
}

export function link(
  url: string,
  ...children: SerializedLexicalNode[]
): SerializedLinkNode {
  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'link',
    version: 1,
    rel: null,
    target: null,
    title: null,
    url,
  }
}

export function horizontalRule() {
  return {
    type: 'horizontalrule',
    version: 1,
  }
}

export function lineBreak() {
  return {
    type: 'linebreak',
    version: 1,
  }
}

export function doc(
  ...children: SerializedLexicalNode[]
): SerializedEditorState {
  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
