import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { LinkCardEditDecorator } from '../components/decorators/LinkCardEditDecorator'
import { LinkCardRenderer } from '../components/renderers/LinkCardRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import { LinkCardNode, type SerializedLinkCardNode } from './LinkCardNode'

export class LinkCardEditNode extends LinkCardNode {
  static clone(node: LinkCardEditNode): LinkCardEditNode {
    return new LinkCardEditNode(
      {
        url: node.__url,
        title: node.__title,
        description: node.__description,
        favicon: node.__favicon,
        image: node.__image,
      },
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedLinkCardNode): LinkCardEditNode {
    return new LinkCardEditNode({
      url: serializedNode.url,
      title: serializedNode.title,
      description: serializedNode.description,
      favicon: serializedNode.favicon,
      image: serializedNode.image,
    })
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const payload = {
      url: this.__url,
      title: this.__title,
      description: this.__description,
      favicon: this.__favicon,
      image: this.__image,
    }
    const rendererEl = createRendererDecoration(
      'LinkCard',
      LinkCardRenderer,
      payload,
    )
    return createElement(LinkCardEditDecorator, {
      nodeKey: this.__key,
      payload,
      children: rendererEl,
    })
  }
}
