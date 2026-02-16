import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $insertNodes, DecoratorNode } from 'lexical'
import { PanelTop } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { TabsRenderer } from '../components/renderers/TabsRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import type { SlashMenuItemConfig } from '../types/slash-menu'

export interface TabItem {
  label: string
  content: SerializedEditorState
}

export type SerializedTabsNode = Spread<
  {
    tabs: TabItem[]
  },
  SerializedLexicalNode
>

export class TabsNode extends DecoratorNode<ReactElement> {
  __tabs: TabItem[]

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Tabs',
      icon: createElement(PanelTop, { size: 20 }),
      description: 'Tabbed content panels',
      keywords: ['tabs', 'panel', 'switch'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          const emptyState = editor.parseEditorState(
            '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
          )
          $insertNodes([
            $createTabsNode([
              { label: 'Tab 1', content: emptyState.toJSON() },
              { label: 'Tab 2', content: emptyState.toJSON() },
            ]),
          ])
        })
      },
    },
  ]

  static getType(): string {
    return 'tabs'
  }

  static clone(node: TabsNode): TabsNode {
    return new TabsNode(
      node.__tabs.map((t) => ({ ...t })),
      node.__key,
    )
  }

  constructor(tabs: TabItem[], key?: NodeKey) {
    super(key)
    this.__tabs = tabs
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-tabs-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedTabsNode): TabsNode {
    return $createTabsNode(serializedNode.tabs)
  }

  exportJSON(): SerializedTabsNode {
    return {
      ...super.exportJSON(),
      type: 'tabs',
      tabs: this.__tabs,
      version: 1,
    }
  }

  getTabs(): TabItem[] {
    return this.getLatest().__tabs
  }

  setTabs(tabs: TabItem[]): void {
    const writable = this.getWritable()
    writable.__tabs = tabs
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration('Tabs', TabsRenderer, {
      tabs: this.__tabs,
    })
  }
}

export function $createTabsNode(tabs: TabItem[]): TabsNode {
  return new TabsNode(tabs)
}

export function $isTabsNode(
  node: LexicalNode | null | undefined,
): node is TabsNode {
  return node instanceof TabsNode
}
