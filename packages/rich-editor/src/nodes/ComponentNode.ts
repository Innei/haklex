import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $getNodeByKey, DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'

import { ComponentRenderer } from '../components/renderers/ComponentRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'

export type SerializedComponentNode = Spread<
  {
    dls: string
    shadow: boolean
    injectHostStyles: boolean
  },
  SerializedLexicalNode
>

export class ComponentNode extends DecoratorNode<ReactElement> {
  __dls: string
  __shadow: boolean
  __injectHostStyles: boolean

  static getType(): string {
    return 'component'
  }

  static clone(node: ComponentNode): ComponentNode {
    return new ComponentNode(
      node.__dls,
      node.__shadow,
      node.__injectHostStyles,
      node.__key,
    )
  }

  constructor(
    dls: string,
    shadow = true,
    injectHostStyles = true,
    key?: NodeKey,
  ) {
    super(key)
    this.__dls = dls
    this.__shadow = shadow
    this.__injectHostStyles = injectHostStyles
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-component-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedComponentNode): ComponentNode {
    return $createComponentNode(
      serializedNode.dls,
      serializedNode.shadow,
      serializedNode.injectHostStyles,
    )
  }

  exportJSON(): SerializedComponentNode {
    return {
      ...super.exportJSON(),
      type: 'component',
      dls: this.__dls,
      shadow: this.__shadow,
      injectHostStyles: this.__injectHostStyles,
      version: 1,
    }
  }

  getDls(): string {
    return this.__dls
  }

  setDls(dls: string): void {
    const writable = this.getWritable()
    writable.__dls = dls
  }

  getShadow(): boolean {
    return this.__shadow
  }

  setShadow(shadow: boolean): void {
    const writable = this.getWritable()
    writable.__shadow = shadow
  }

  getInjectHostStyles(): boolean {
    return this.__injectHostStyles
  }

  setInjectHostStyles(injectHostStyles: boolean): void {
    const writable = this.getWritable()
    writable.__injectHostStyles = injectHostStyles
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const nodeKey = this.__key
    return createRendererDecoration('Component', ComponentRenderer, {
      dls: this.__dls,
      shadow: this.__shadow,
      injectHostStyles: this.__injectHostStyles,
      onDlsChange: (newDls: string) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as ComponentNode | null
          if (node) {
            node.setDls(newDls)
          }
        })
      },
    })
  }
}

export function $createComponentNode(
  dls: string,
  shadow = true,
  injectHostStyles = true,
): ComponentNode {
  return new ComponentNode(dls, shadow, injectHostStyles)
}

export function $isComponentNode(
  node: LexicalNode | null | undefined,
): node is ComponentNode {
  return node instanceof ComponentNode
}
