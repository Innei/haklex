/**
 * @haklex/rich-headless
 *
 * Headless-compatible Lexical node registry for server-side parsing.
 * Zero React dependency — only lexical + standard @lexical/* packages.
 *
 * Usage with @lexical/headless:
 *   import { createHeadlessEditor } from '@lexical/headless'
 *   import { allHeadlessNodes } from '@haklex/rich-headless'
 *   const editor = createHeadlessEditor({ nodes: allHeadlessNodes })
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/extension'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import {
  DecoratorNode,
  type EditorConfig,
  ElementNode,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type SerializedLexicalNode,
} from 'lexical'

// ── Builtin nodes ──

export const builtinNodes: Klass<LexicalNode>[] = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
]

// ── Helpers ──

function stubDOM(): HTMLElement {
  return document.createElement('span')
}

function extractText(state: unknown): string {
  if (!state || typeof state !== 'object') return ''
  const root = (state as Record<string, unknown>).root as
    | Record<string, unknown>
    | undefined
  if (!root) return ''
  return walkChildren(root)
}

function walkChildren(node: Record<string, unknown>): string {
  const children = node.children as Record<string, unknown>[] | undefined
  if (!children) return (node.text as string) ?? ''
  return children.map(walkChildren).join('\n')
}

// ── SpoilerNode (ElementNode, inline) ──

export class SpoilerNode extends ElementNode {
  static getType(): string {
    return 'spoiler'
  }
  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode((node as any).__key)
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static importJSON(_json: SerializedElementNode): SpoilerNode {
    return new SpoilerNode()
  }
  exportJSON(): SerializedElementNode {
    return { ...super.exportJSON(), type: 'spoiler', version: 1 }
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  isInline(): boolean {
    return true
  }
}

// ── RubyNode (ElementNode, inline) ──

export class RubyNode extends ElementNode {
  __reading = ''

  static getType(): string {
    return 'ruby'
  }
  static clone(node: RubyNode): RubyNode {
    const n = new RubyNode((node as any).__key)
    n.__reading = node.__reading
    return n
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static importJSON(
    json: SerializedElementNode & { reading?: string },
  ): RubyNode {
    const node = new RubyNode()
    node.__reading = json.reading ?? ''
    return node
  }
  exportJSON(): SerializedElementNode & { reading: string } {
    return {
      ...super.exportJSON(),
      type: 'ruby',
      reading: this.__reading,
      version: 1,
    }
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  isInline(): boolean {
    return true
  }
}

// ── DetailsNode (ElementNode, block) ──

export class DetailsNode extends ElementNode {
  __summary = ''
  __open = false

  static getType(): string {
    return 'details'
  }
  static clone(node: DetailsNode): DetailsNode {
    const n = new DetailsNode((node as any).__key)
    n.__summary = node.__summary
    n.__open = node.__open
    return n
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static importJSON(
    json: SerializedElementNode & { summary?: string; open?: boolean },
  ): DetailsNode {
    const node = new DetailsNode()
    node.__summary = json.summary ?? ''
    node.__open = json.open ?? false
    return node
  }
  exportJSON(): SerializedElementNode & { summary: string; open: boolean } {
    return {
      ...super.exportJSON(),
      type: 'details',
      summary: this.__summary,
      open: this.__open,
    }
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
}

// ── Generic headless DecoratorNode ──

type Props = Record<string, unknown>

function headlessDecorator(
  type: string,
  propKeys: string[],
  defaults: Props,
  inline = false,
) {
  class Node extends DecoratorNode<null> {
    constructor(key?: NodeKey) {
      super(key)
      for (const k of propKeys) {
        ;(this as any)[`__${k}`] = defaults[k]
      }
    }
    static getType(): string {
      return type
    }
    static clone(node: Node): Node {
      const n = new Node((node as any).__key)
      for (const k of propKeys) {
        ;(n as any)[`__${k}`] = (node as any)[`__${k}`]
      }
      return n
    }
    static importJSON(json: SerializedLexicalNode & Props): Node {
      const node = new Node()
      for (const k of propKeys) {
        ;(node as any)[`__${k}`] = json[k] ?? defaults[k]
      }
      return node
    }
    exportJSON(): SerializedLexicalNode & Props {
      const out: Props = { type, version: 1 }
      for (const k of propKeys) {
        out[k] = (this as any)[`__${k}`]
      }
      return out as SerializedLexicalNode & Props
    }
    createDOM(_config: EditorConfig): HTMLElement {
      return stubDOM()
    }
    updateDOM(): boolean {
      return false
    }
    decorate(_editor: LexicalEditor, _config: EditorConfig): null {
      return null
    }
    isInline(): boolean {
      return inline
    }
  }
  return Node as unknown as Klass<LexicalNode>
}

// ── Simple property-based nodes ──

export const ImageNode = headlessDecorator(
  'image',
  ['src', 'altText', 'width', 'height', 'caption', 'thumbhash', 'accent'],
  {
    src: '',
    altText: '',
    width: undefined,
    height: undefined,
    caption: undefined,
    thumbhash: undefined,
    accent: undefined,
  },
)

export const VideoNode = headlessDecorator(
  'video',
  ['src', 'poster', 'width', 'height'],
  { src: '', poster: undefined, width: undefined, height: undefined },
)

export const LinkCardNode = headlessDecorator(
  'link-card',
  ['url', 'source', 'id', 'title', 'description', 'favicon', 'image'],
  {
    url: '',
    source: undefined,
    id: undefined,
    title: undefined,
    description: undefined,
    favicon: undefined,
    image: undefined,
  },
)

export const KaTeXInlineNode = headlessDecorator(
  'katex-inline',
  ['equation'],
  { equation: '' },
  true,
)

export const KaTeXBlockNode = headlessDecorator('katex-block', ['equation'], {
  equation: '',
})

export const MermaidNode = headlessDecorator('mermaid', ['diagram'], {
  diagram: '',
})

export const MentionNode = headlessDecorator(
  'mention',
  ['platform', 'handle', 'displayName'],
  { platform: '', handle: '', displayName: undefined },
  true,
)

export const CodeBlockNode = headlessDecorator(
  'code-block',
  ['code', 'language'],
  { code: '', language: '' },
)

export const FootnoteNode = headlessDecorator(
  'footnote',
  ['identifier'],
  { identifier: '' },
  true,
)

export const FootnoteSectionNode = headlessDecorator(
  'footnote-section',
  ['definitions'],
  { definitions: {} },
)

export const EmbedNode = headlessDecorator('embed', ['url', 'source'], {
  url: '',
  source: null,
})

export const CodeSnippetNode = headlessDecorator('code-snippet', ['files'], {
  files: [],
})

export const GalleryNode = headlessDecorator('gallery', ['images', 'layout'], {
  images: [],
  layout: 'grid',
})

export const ExcalidrawNode = headlessDecorator('excalidraw', ['snapshot'], {
  snapshot: '',
})

// ── Nested content nodes ──

export class BannerNode extends DecoratorNode<null> {
  __bannerType = 'note'
  __contentState: unknown = null

  static getType(): string {
    return 'banner'
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static clone(node: BannerNode): BannerNode {
    const n = new BannerNode((node as any).__key)
    n.__bannerType = node.__bannerType
    n.__contentState = node.__contentState
    return n
  }
  static importJSON(
    json: SerializedLexicalNode & {
      bannerType?: string
      content?: unknown
    },
  ): BannerNode {
    const node = new BannerNode()
    node.__bannerType = json.bannerType ?? 'note'
    node.__contentState = json.content ?? null
    return node
  }
  exportJSON(): SerializedLexicalNode {
    return {
      type: 'banner',
      version: 1,
      bannerType: this.__bannerType,
      content: this.__contentState,
    } as SerializedLexicalNode
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  decorate(): null {
    return null
  }
  getTextContent(): string {
    return extractText(this.__contentState)
  }
}

export class AlertQuoteNode extends DecoratorNode<null> {
  __alertType = 'note'
  __contentState: unknown = null

  static getType(): string {
    return 'alert-quote'
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static clone(node: AlertQuoteNode): AlertQuoteNode {
    const n = new AlertQuoteNode((node as any).__key)
    n.__alertType = node.__alertType
    n.__contentState = node.__contentState
    return n
  }
  static importJSON(
    json: SerializedLexicalNode & {
      alertType?: string
      content?: unknown
    },
  ): AlertQuoteNode {
    const node = new AlertQuoteNode()
    node.__alertType = json.alertType ?? 'note'
    node.__contentState = json.content ?? null
    return node
  }
  exportJSON(): SerializedLexicalNode {
    return {
      type: 'alert-quote',
      version: 1,
      alertType: this.__alertType,
      content: this.__contentState,
    } as SerializedLexicalNode
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  decorate(): null {
    return null
  }
  getTextContent(): string {
    return extractText(this.__contentState)
  }
}

export class NestedDocNode extends DecoratorNode<null> {
  __contentState: unknown = null

  static getType(): string {
    return 'nested-doc'
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static clone(node: NestedDocNode): NestedDocNode {
    const n = new NestedDocNode((node as any).__key)
    n.__contentState = node.__contentState
    return n
  }
  static importJSON(
    json: SerializedLexicalNode & { content?: unknown },
  ): NestedDocNode {
    const node = new NestedDocNode()
    node.__contentState = json.content ?? null
    return node
  }
  exportJSON(): SerializedLexicalNode {
    return {
      type: 'nested-doc',
      version: 1,
      content: this.__contentState,
    } as SerializedLexicalNode
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  decorate(): null {
    return null
  }
  getTextContent(): string {
    return extractText(this.__contentState)
  }
}

export class GridContainerNode extends DecoratorNode<null> {
  __cols = 2
  __gap = '16px'
  __cells: unknown[] = []

  static getType(): string {
    return 'grid-container'
  }
  constructor(key?: NodeKey) {
    super(key)
  }
  static clone(node: GridContainerNode): GridContainerNode {
    const n = new GridContainerNode((node as any).__key)
    n.__cols = node.__cols
    n.__gap = node.__gap
    n.__cells = node.__cells
    return n
  }
  static importJSON(
    json: SerializedLexicalNode & {
      cols?: number
      gap?: string | number
      cells?: unknown[]
    },
  ): GridContainerNode {
    const node = new GridContainerNode()
    node.__cols = json.cols ?? 2
    const rawGap = json.gap
    node.__gap = typeof rawGap === 'number' ? `${rawGap}px` : (rawGap ?? '16px')
    node.__cells = json.cells ?? []
    return node
  }
  exportJSON(): SerializedLexicalNode {
    return {
      type: 'grid-container',
      version: 1,
      cols: this.__cols,
      gap: this.__gap,
      cells: this.__cells,
    } as SerializedLexicalNode
  }
  createDOM(): HTMLElement {
    return stubDOM()
  }
  updateDOM(): boolean {
    return false
  }
  decorate(): null {
    return null
  }
  getTextContent(): string {
    return this.__cells.map((cell) => extractText(cell)).join('\n')
  }
}

// ── Aggregate ──

export const customHeadlessNodes: Klass<LexicalNode>[] = [
  SpoilerNode,
  RubyNode,
  DetailsNode,
  ImageNode,
  VideoNode,
  LinkCardNode,
  KaTeXInlineNode,
  KaTeXBlockNode,
  MermaidNode,
  MentionNode,
  CodeBlockNode,
  FootnoteNode,
  FootnoteSectionNode,
  EmbedNode,
  CodeSnippetNode,
  GalleryNode,
  ExcalidrawNode,
  BannerNode,
  AlertQuoteNode,
  NestedDocNode,
  GridContainerNode,
]

export const allHeadlessNodes: Klass<LexicalNode>[] = [
  ...builtinNodes,
  ...customHeadlessNodes,
]

// ── Transformers (Lexical → Markdown) ──

export { $toMarkdown, allHeadlessTransformers } from './transformers'
