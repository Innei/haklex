import './styles.css'

import type { Klass, LexicalNode } from 'lexical'

import { KaTeXBlockEditNode } from './KaTeXBlockEditNode'
import { KaTeXInlineEditNode } from './KaTeXInlineEditNode'

export { KaTeXBlockEditNode } from './KaTeXBlockEditNode'
export { KaTeXEditDecorator } from './KaTeXEditDecorator'
export { KaTeXInlineEditNode } from './KaTeXInlineEditNode'

export const katexEditNodes: Array<Klass<LexicalNode>> = [
  KaTeXBlockEditNode,
  KaTeXInlineEditNode,
]
