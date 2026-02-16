import type { ElementTransformer } from '@lexical/markdown'
import type { LexicalNode, SerializedEditorState } from 'lexical'
import { $createParagraphNode, $createTextNode } from 'lexical'

import type { BannerType } from '../nodes/BannerNode'
import {
  $createBannerNode,
  $isBannerNode,
  BannerNode,
} from '../nodes/BannerNode'
import {
  $createDetailsNode,
  $isDetailsNode,
  DetailsNode,
} from '../nodes/DetailsNode'

/**
 * Container transformer: ::: type {params}\ncontent\n::: → Container nodes
 *
 * Supported types:
 * - ::: note / tip / important / warning / caution → BannerNode
 * - ::: details → DetailsNode
 */

const BANNER_TYPE_MAP: Record<string, BannerType> = {
  note: 'note',
  info: 'note',
  tip: 'tip',
  success: 'tip',
  important: 'important',
  warning: 'warning',
  warn: 'warning',
  error: 'caution',
  danger: 'caution',
  caution: 'caution',
}

export const CONTAINER_TRANSFORMER: ElementTransformer = {
  dependencies: [BannerNode, DetailsNode],
  export: (node: LexicalNode) => {
    if ($isBannerNode(node)) {
      const type = node.getBannerType()
      const content = node.getTextContent()
      return `::: ${type}\n${content}\n:::`
    }

    if ($isDetailsNode(node)) {
      const summary = node.getSummary()
      const content = node.getTextContent()
      return `::: details{summary="${summary}"}\n${content}\n:::`
    }

    return null
  },
  regExp: /^:::\s*(\w+)(?:\{([^}]*)\})?\s*$/,
  replace: (parentNode, children, match) => {
    const type = match[1]
    const params = match[2]

    if (type in BANNER_TYPE_MAP) {
      const bannerType = BANNER_TYPE_MAP[type]
      const banner = $createBannerNode(bannerType)

      const serializedChildren = children.map((child: LexicalNode) =>
        child.exportJSON(),
      )
      const content = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: serializedChildren,
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState

      const editorState = banner.getContentEditor().parseEditorState(content)
      banner.getContentEditor().setEditorState(editorState)

      parentNode.replace(banner)
      return
    }

    if (type === 'details') {
      const summaryMatch = params?.match(/summary="([^"]*)"/)
      const summary = summaryMatch ? summaryMatch[1] : 'Details'

      const details = $createDetailsNode(summary)

      children.forEach((child) => {
        details.append(child)
      })

      parentNode.replace(details)
      return
    }

    const paragraph = $createParagraphNode()
    paragraph.append($createTextNode(`::: ${type}`))
    children.forEach((child) => {
      paragraph.append(child)
    })
    parentNode.replace(paragraph)
  },
  type: 'element',
}
