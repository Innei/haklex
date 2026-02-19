import type { Klass, LexicalNode } from 'lexical'

import { allEditNodes } from './config-edit'

let _resolvedEditNodes: Array<Klass<LexicalNode>> | null = null

export function setResolvedEditNodes(nodes: Array<Klass<LexicalNode>>): void {
  _resolvedEditNodes = nodes
}

export function getResolvedEditNodes(): Array<Klass<LexicalNode>> {
  return _resolvedEditNodes ?? allEditNodes
}
