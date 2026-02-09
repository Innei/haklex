import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { TabsRenderer } from '../components/renderers/TabsRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export interface TabItem {
  label: string
  content: string
}

export type SerializedTabsNode = Spread<
  {
    tabs: TabItem[]
  },
  SerializedLexicalNode
>

export class TabsNode extends DecoratorNode<ReactElement> {
  __tabs: TabItem[]

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
    return createElement(RendererWrapper as any, {
      rendererKey: 'Tabs',
      defaultRenderer: TabsRenderer,
      props: {
        tabs: this.__tabs,
      },
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
