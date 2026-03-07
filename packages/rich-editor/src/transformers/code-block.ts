import type { MultilineElementTransformer } from '@lexical/markdown';
import type { Klass, LexicalNode } from 'lexical';
import { $createNodeSelection, $setSelection } from 'lexical';

import { getResolvedEditNodes } from '../node-registry';
import { CodeBlockNode } from '../nodes/CodeBlockNode';

function findCodeBlockKlass(nodes: Array<Klass<LexicalNode>>): Klass<LexicalNode> {
  return nodes.find((n: any) => n.getType?.() === 'code-block') || CodeBlockNode;
}

export const CODE_BLOCK_MULTILINE_TRANSFORMER: MultilineElementTransformer = {
  dependencies: [],
  regExpEnd: {
    optional: true,
    regExp: /[\t ]*```$/,
  },
  regExpStart: /^[\t ]*```([\w-]+)?/,
  replace: (rootNode, _children, startMatch, _endMatch, linesInBetween) => {
    const lang = startMatch[1] || '';
    let code = '';

    if (linesInBetween) {
      const lines = [...linesInBetween];
      while (lines.length > 0 && !lines[0].length) lines.shift();
      while (lines.length > 0 && !lines.at(-1)?.length) lines.pop();
      code = lines.join('\n');
    }

    const Klass = findCodeBlockKlass(getResolvedEditNodes());
    const node = new (Klass as any)(code, lang);
    rootNode.replace(node);

    const selection = $createNodeSelection();
    selection.add(node.getKey());
    $setSelection(selection);
  },
  type: 'multiline-element',
};
