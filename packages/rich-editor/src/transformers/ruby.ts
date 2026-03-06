import { RUBY_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers'
import type { TextMatchTransformer } from '@lexical/markdown'
import { $createTextNode } from 'lexical'

import { $createRubyNode, RubyNode } from '../nodes/RubyNode'

export const RUBY_TRANSFORMER: TextMatchTransformer = {
  ...BASE,
  dependencies: [RubyNode],
  replace: (textNode, match) => {
    const rubyNode = $createRubyNode(match[2] ?? '')
    const baseText = match[1] ?? ''

    if (baseText) {
      rubyNode.append($createTextNode(baseText))
    }

    textNode.replace(rubyNode)
  },
}
