import type { ElementTransformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { $createParagraphNode, $createTextNode } from 'lexical'

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
 * - ::: note / info / success / warning / error → BannerNode
 * - ::: details → DetailsNode
 *
 * Note: Gallery and Grid containers are more complex and may require
 * separate handling or plugin-based transformation.
 *
 * Example:
 * ::: warning
 * This is a warning message
 * :::
 */

type BannerType = 'info' | 'success' | 'warning' | 'error'

const BANNER_TYPE_MAP: Record<string, BannerType> = {
  note: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  warn: 'warning',
  error: 'error',
  danger: 'error',
}

export const CONTAINER_TRANSFORMER: ElementTransformer = {
  dependencies: [BannerNode, DetailsNode],
  export: (node: LexicalNode) => {
    if ($isBannerNode(node)) {
      const type = node.getBannerType()
      const typeKey = Object.keys(BANNER_TYPE_MAP).find(
        (key) => BANNER_TYPE_MAP[key] === type,
      )
      const content = node.getTextContent()
      return `::: ${typeKey || 'info'}\n${content}\n:::`
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

    // Banner types
    if (type in BANNER_TYPE_MAP) {
      const bannerType = BANNER_TYPE_MAP[type]
      const banner = $createBannerNode(bannerType)

      // Append children
      children.forEach((child) => {
        banner.append(child)
      })

      parentNode.replace(banner)
      return
    }

    // Details/collapse
    if (type === 'details') {
      // Parse summary from params
      const summaryMatch = params?.match(/summary="([^"]*)"/)
      const summary = summaryMatch ? summaryMatch[1] : 'Details'

      const details = $createDetailsNode(summary)

      children.forEach((child) => {
        details.append(child)
      })

      parentNode.replace(details)
      return
    }

    // Unknown container type - keep as paragraph
    const paragraph = $createParagraphNode()
    paragraph.append($createTextNode(`::: ${type}`))
    children.forEach((child) => {
      paragraph.append(child)
    })
    parentNode.replace(paragraph)
  },
  type: 'element',
}
