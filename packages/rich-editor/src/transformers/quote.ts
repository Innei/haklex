import type { ElementTransformer } from '@lexical/markdown'
import { $createQuoteNode, $isQuoteNode, QuoteNode } from '@lexical/rich-text'
import { $createLineBreakNode, $createParagraphNode } from 'lexical'

export const QUOTE_TRANSFORMER: ElementTransformer = {
  dependencies: [QuoteNode],
  export: (node, exportChildren) => {
    if (!$isQuoteNode(node)) {
      return null
    }
    const lines = exportChildren(node).split('\n')
    return lines.map((line) => `> ${line}`).join('\n')
  },
  regExp: /^>\s/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) {
      const previousNode = parentNode.getPreviousSibling()
      if ($isQuoteNode(previousNode)) {
        previousNode.splice(previousNode.getChildrenSize(), 0, [
          $createLineBreakNode(),
          ...children,
        ])
        parentNode.remove()
        return
      }
    }

    const node = $createQuoteNode()
    const paragraph = $createParagraphNode()
    paragraph.append(...children)
    node.append(paragraph)
    parentNode.replace(node)

    if (!isImport) {
      paragraph.select(0, 0)
    }
  },
  type: 'element',
}
