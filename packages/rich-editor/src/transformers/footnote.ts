import type {
  ElementTransformer,
  TextMatchTransformer,
} from '@lexical/markdown'

import {
  $createFootnoteNode,
  $isFootnoteNode,
  FootnoteNode,
} from '../nodes/FootnoteNode'
import {
  $createFootnoteSectionNode,
  $isFootnoteSectionNode,
  FootnoteSectionNode,
} from '../nodes/FootnoteSectionNode'

/**
 * Footnote reference transformer: [^1] → FootnoteNode
 */
export const FOOTNOTE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [FootnoteNode],
  export: (node) => {
    if (!$isFootnoteNode(node)) return null
    return `[^${node.getIdentifier()}]`
  },
  importRegExp: /\[\^(\w+)\]/,
  regExp: /\[\^(\w+)\]$/,
  replace: (textNode, match) => {
    const footnoteNode = $createFootnoteNode(match[1])
    textNode.replace(footnoteNode)
  },
  trigger: ']',
  type: 'text-match',
}

/**
 * Footnote section transformer: [^id]: content → FootnoteSectionNode
 */
export const FOOTNOTE_SECTION_TRANSFORMER: ElementTransformer = {
  dependencies: [FootnoteSectionNode],
  export: (node) => {
    if (!$isFootnoteSectionNode(node)) return null
    const definitions = node.getDefinitions()
    return Object.entries(definitions)
      .map(([id, content]) => `[^${id}]: ${content}`)
      .join('\n')
  },
  regExp: /^\[\^(\w+)\]:\s+(.+)$/,
  replace: (parentNode, _children, match) => {
    const identifier = match[1]
    const content = match[2]

    const root = parentNode.getParent()
    if (root) {
      const children = root.getChildren()
      for (const child of children) {
        if ($isFootnoteSectionNode(child)) {
          child.setDefinition(identifier, content)
          parentNode.remove()
          return
        }
      }
    }

    const sectionNode = $createFootnoteSectionNode({ [identifier]: content })
    parentNode.replace(sectionNode)
  },
  type: 'element',
}
