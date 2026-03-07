import {
  type CommandItemConfig,
  createRendererDecoration,
  LinkCardNode,
  type LinkCardNodePayload,
  LinkCardRenderer,
  type SerializedLinkCardNode,
} from '@haklex/rich-editor'
import type { EditorConfig, Klass, LexicalEditor, LexicalNode } from 'lexical'
import { $insertNodes } from 'lexical'
import { Link } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { LinkCardEditDecorator } from './LinkCardEditDecorator'

export class LinkCardEditNode extends LinkCardNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Link Card',
      icon: createElement(Link, { size: 20 }),
      description: 'Link preview card',
      keywords: ['link', 'card', 'bookmark', 'embed'],
      section: 'MEDIA',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createLinkCardEditNode({ url: '' })])
        })
      },
    },
  ]

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

export function $createLinkCardEditNode(
  payload: LinkCardNodePayload,
): LinkCardEditNode {
  return new LinkCardEditNode(payload)
}

export const linkCardEditNodes: Array<Klass<LexicalNode>> = [LinkCardEditNode]
