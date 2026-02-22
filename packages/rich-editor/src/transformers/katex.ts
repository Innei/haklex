import {
  KATEX_BLOCK_TRANSFORMER as BLOCK_BASE,
  KATEX_INLINE_TRANSFORMER as INLINE_BASE,
} from '@haklex/rich-headless/transformers'
import type { TextMatchTransformer } from '@lexical/markdown'

import { $createKaTeXBlockNode, KaTeXBlockNode } from '../nodes/KaTeXBlockNode'
import {
  $createKaTeXInlineNode,
  KaTeXInlineNode,
} from '../nodes/KaTeXInlineNode'

export const KATEX_INLINE_TRANSFORMER: TextMatchTransformer = {
  ...INLINE_BASE,
  dependencies: [KaTeXInlineNode],
  replace: (textNode, match) => {
    const katexNode = $createKaTeXInlineNode(match[1])
    textNode.replace(katexNode)
  },
}

export const KATEX_BLOCK_TRANSFORMER: TextMatchTransformer = {
  ...BLOCK_BASE,
  dependencies: [KaTeXBlockNode],
  replace: (textNode, match) => {
    const katexNode = $createKaTeXBlockNode(match[1])
    textNode.replace(katexNode)
  },
}
