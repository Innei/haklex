import type { ElementTransformer } from '@lexical/markdown';
import type { LexicalNode } from 'lexical';

import { $isGridContainerNode } from '../nodes/GridContainerNode';
import { extractTextContent } from '../utils/extractTextContent';

function quoteAttr(value: string): string {
  return value.replaceAll('"', '\\"');
}

export const GRID_CONTAINER_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isGridContainerNode(node)) return null;
    const cells = node.getCellStates().map((state) => extractTextContent(state));
    const body = cells.map((content) => `::: cell\n${content}\n:::`).join('\n');
    return `::: grid{cols=${node.getCols()} gap="${quoteAttr(node.getGap())}"}\n${body}\n:::`;
  },
  regExp: /\b\B/,
  replace: () => {},
  type: 'element',
};
