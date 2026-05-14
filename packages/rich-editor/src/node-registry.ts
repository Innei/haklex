import type { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical';

import { allEditNodes } from './config-edit';

type EditorNodeConfig = Klass<LexicalNode> | LexicalNodeReplacement;

let _resolvedEditNodes: Array<EditorNodeConfig> | null = null;

export function setResolvedEditNodes(nodes: Array<EditorNodeConfig>): void {
  _resolvedEditNodes = nodes;
}

export function getResolvedEditNodes(): Array<EditorNodeConfig> {
  return _resolvedEditNodes ?? allEditNodes;
}
