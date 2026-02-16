import type {
  EditorConfig,
  LexicalEditor,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { BannerEditDecorator } from '../components/decorators/BannerEditDecorator'
import {
  BannerNode,
  normalizeBannerType,
  type SerializedBannerNode,
} from './BannerNode'

interface LegacySerializedBannerEditNode extends SerializedBannerNode {
  children?: SerializedLexicalNode[]
}

export class BannerEditNode extends BannerNode {
  static clone(node: BannerEditNode): BannerEditNode {
    return new BannerEditNode(
      node.__bannerType,
      node.__contentEditor,
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedBannerNode): BannerEditNode {
    const legacy = serializedNode as LegacySerializedBannerEditNode
    const bannerType = normalizeBannerType(serializedNode.bannerType)
    const node = new BannerEditNode(bannerType)

    if (serializedNode.content) {
      const editorState = node.__contentEditor.parseEditorState(
        serializedNode.content,
      )
      node.__contentEditor.setEditorState(editorState)
    } else if (legacy.children) {
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

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(BannerEditDecorator, {
      nodeKey: this.__key,
      bannerType: this.__bannerType,
      contentEditor: this.__contentEditor,
    })
  }
}
