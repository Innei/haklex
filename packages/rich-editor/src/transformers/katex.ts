import type { TextMatchTransformer } from '@lexical/markdown'

import {
  $createKaTeXBlockNode,
  $isKaTeXBlockNode,
  KaTeXBlockNode,
} from '../nodes/KaTeXBlockNode'
import {
  $createKaTeXInlineNode,
  $isKaTeXInlineNode,
  KaTeXInlineNode,
} from '../nodes/KaTeXInlineNode'

export const KATEX_INLINE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [KaTeXInlineNode],
  export: (node) => {
    if (!$isKaTeXInlineNode(node)) return null
    return `$${node.getEquation()}$`
  },
  importRegExp: /\$([^$\n]+)\$/,
  regExp: /\$([^$\n]+)\$$/,
  replace: (textNode, match) => {
    const katexNode = $createKaTeXInlineNode(match[1])
    textNode.replace(katexNode)
  },
  trigger: '$',
  type: 'text-match',
}

export const KATEX_BLOCK_TRANSFORMER: TextMatchTransformer = {
  dependencies: [KaTeXBlockNode],
  export: (node) => {
    if (!$isKaTeXBlockNode(node)) return null
    return `$$${node.getEquation()}$$`
  },
  importRegExp: /\$\$([^$]+)\$\$/,
  regExp: /\$\$([^$]+)\$\$$/,
  replace: (textNode, match) => {
    const katexNode = $createKaTeXBlockNode(match[1])
    textNode.replace(katexNode)
  },
  trigger: '$',
  type: 'text-match',
}
