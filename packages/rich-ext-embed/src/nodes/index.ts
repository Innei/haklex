import type { Klass, LexicalNode } from 'lexical'

import { EmbedEditNode } from './EmbedEditNode'
import { EmbedNode } from './EmbedNode'

export const embedNodes: Array<Klass<LexicalNode>> = [EmbedNode]
export const embedEditNodes: Array<Klass<LexicalNode>> = [EmbedEditNode]
