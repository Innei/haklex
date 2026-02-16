import type { SlashMenuItemConfig } from '@shiro/rich-editor'
import type { EditorConfig, LexicalEditor, LexicalNode } from 'lexical'
import { $insertNodes } from 'lexical'
import { Code } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { EmbedLinkRenderer } from '../renderers/EmbedLinkRenderer'
import type { EmbedType } from '../url-matchers'
import { EmbedNode, type SerializedEmbedNode } from './EmbedNode'

export class EmbedEditNode extends EmbedNode {
  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Embed',
      icon: createElement(Code, { size: 20 }),
      description: 'Embed external content (Tweet, YouTube, Bilibili, etc.)',
      keywords: [
        'embed',
        'tweet',
        'youtube',
        'bilibili',
        'codesandbox',
        'thinking',
      ],
      section: 'EMBED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createEmbedEditNode('', null)])
        })
      },
    },
  ]

  static clone(node: EmbedEditNode): EmbedEditNode {
    return new EmbedEditNode(node.__url, node.__source, node.__key)
  }

  static importJSON(serializedNode: SerializedEmbedNode): EmbedEditNode {
    return new EmbedEditNode(serializedNode.url, serializedNode.source)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(EmbedLinkRenderer, {
      type: this.__source,
      url: this.__url,
      nodeKey: this.__key,
    })
  }
}

export function $createEmbedEditNode(
  url: string,
  source: EmbedType | null,
): EmbedEditNode {
  return new EmbedEditNode(url, source)
}

export function $isEmbedEditNode(
  node: LexicalNode | null | undefined,
): node is EmbedEditNode {
  return node instanceof EmbedEditNode
}
