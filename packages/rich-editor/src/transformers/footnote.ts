import type { TextMatchTransformer } from '@lexical/markdown'

import {
  $createFootnoteNode,
  $isFootnoteNode,
  FootnoteNode,
} from '../nodes/FootnoteNode'

/**
 * Footnote reference transformer: [^1] → FootnoteNode
 *
 * Note: This only handles inline references. Footnote definitions
 * ([^1]: content) are typically handled separately in a container
 * at the end of the document.
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
