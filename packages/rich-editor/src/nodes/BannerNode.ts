import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $getRoot, $insertNodes, createEditor, DecoratorNode } from 'lexical'
import { Flag } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { BannerReadOnlyDecorator } from '../components/renderers/BannerReadOnlyDecorator'
import { editorTheme } from '../styles/theme'
import type { SlashMenuItemConfig } from '../types/slash-menu'
import { NESTED_EDITOR_NODES } from './shared'

export type BannerType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const LEGACY_TYPE_MAP: Record<string, BannerType> = {
  info: 'note',
  success: 'tip',
  error: 'caution',
}

export function normalizeBannerType(type: string): BannerType {
  if (type in LEGACY_TYPE_MAP) return LEGACY_TYPE_MAP[type]
  return (type as BannerType) || 'note'
}

export const BANNER_TYPES: BannerType[] = [
  'note',
  'tip',
  'important',
  'warning',
  'caution',
]

export const BANNER_LABELS: Record<BannerType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

function createContentEditor(): LexicalEditor {
  return createEditor({
    namespace: 'BannerContent',
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('[BannerContent]', error)
    },
  })
}

export type SerializedBannerNode = Spread<
  {
    bannerType: BannerType
    content: SerializedEditorState
  },
  SerializedLexicalNode
>

interface LegacySerializedBannerNode extends SerializedBannerNode {
  children?: SerializedLexicalNode[]
}

export class BannerNode extends DecoratorNode<ReactElement> {
  __bannerType: BannerType
  __contentEditor: LexicalEditor

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Banner',
      icon: createElement(Flag, { size: 20 }),
      description: 'Highlighted banner block',
      keywords: ['banner', 'notice', 'announcement'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createBannerNode('note')])
        })
      },
    },
  ]

  static getType(): string {
    return 'banner'
  }

  static clone(node: BannerNode): BannerNode {
    return new BannerNode(node.__bannerType, node.__contentEditor, node.__key)
  }

  constructor(
    bannerType: BannerType,
    contentEditor?: LexicalEditor,
    key?: NodeKey,
  ) {
    super(key)
    this.__bannerType = bannerType
    this.__contentEditor = contentEditor || createContentEditor()
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = `rich-banner rich-banner-${this.__bannerType}`
    return div
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = `rich-banner rich-banner-${this.__bannerType}`
    }
    return false
  }

  isInline(): boolean {
    return false
  }

  getBannerType(): BannerType {
    return this.__bannerType
  }

  setBannerType(bannerType: BannerType): void {
    const writable = this.getWritable()
    writable.__bannerType = bannerType
  }

  getContentEditor(): LexicalEditor {
    return this.__contentEditor
  }

  getTextContent(): string {
    return this.__contentEditor.getEditorState().read(() => {
      return $getRoot().getTextContent()
    })
  }

  static importJSON(serializedNode: SerializedBannerNode): BannerNode {
    const legacy = serializedNode as LegacySerializedBannerNode
    const bannerType = normalizeBannerType(serializedNode.bannerType)
    const node = new BannerNode(bannerType)

    if (serializedNode.content) {
      const editorState = node.__contentEditor.parseEditorState(
        serializedNode.content,
      )
      node.__contentEditor.setEditorState(editorState)
    } else if (legacy.children) {
      // Legacy ElementNode format: wrap children into editor state
      const content = {
        root: {
          children: legacy.children,
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState
      const editorState = node.__contentEditor.parseEditorState(content)
      node.__contentEditor.setEditorState(editorState)
    }

    return node
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      type: 'banner',
      bannerType: this.__bannerType,
      content: this.__contentEditor.getEditorState().toJSON(),
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(BannerReadOnlyDecorator, {
      bannerType: this.__bannerType,
      contentEditor: this.__contentEditor,
    })
  }
}

export function $createBannerNode(bannerType: BannerType): BannerNode {
  return new BannerNode(bannerType)
}

export function $isBannerNode(
  node: LexicalNode | null | undefined,
): node is BannerNode {
  return node instanceof BannerNode
}
