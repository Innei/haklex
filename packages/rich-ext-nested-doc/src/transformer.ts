import { extractTextContent } from '@haklex/rich-editor/commands';
import type { ElementTransformer } from '@lexical/markdown';
import type { LexicalNode } from 'lexical';

import { $isNestedDocNode } from './NestedDocNode';

export const NESTED_DOC_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isNestedDocNode(node)) return null;
    const text = extractTextContent(node.getContentState());
    return `<nested-doc>\n${text}\n</nested-doc>`;
  },
  // eslint-disable-next-line regexp/no-useless-assertions -- intentionally never-matching regex for export-only transformer
  regExp: /a^/,
  replace: () => {},
  type: 'element',
};
