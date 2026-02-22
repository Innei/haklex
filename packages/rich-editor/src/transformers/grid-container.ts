import type { ElementTransformer } from '@lexical/markdown'
import { $getRoot, type LexicalNode } from 'lexical'

import { $isGridContainerNode } from '../nodes/GridContainerNode'

function quoteAttr(value: string): string {
  return value.replaceAll('"', '\\"')
}

export const GRID_CONTAINER_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isGridContainerNode(node)) return null
    const cells = node.getCellEditors().map((editor) =>
      editor.getEditorState().read(() => {
        return $getRoot().getTextContent()
      }),
    )
    const body = cells.map((content) => `::: cell\n${content}\n:::`).join('\n')
    return `::: grid{cols=${node.getCols()} gap="${quoteAttr(node.getGap())}"}\n${body}\n:::`
  },
  regExp: /a^/,
  replace: () => {},
  type: 'element',
}
