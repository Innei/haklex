import { SPOILER_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers'
import type { TextMatchTransformer } from '@lexical/markdown'
import { $createTextNode } from 'lexical'

import { $createSpoilerNode, SpoilerNode } from '../nodes/SpoilerNode'

export const SPOILER_TRANSFORMER: TextMatchTransformer = {
  ...BASE,
  dependencies: [SpoilerNode],
  replace: (textNode, match) => {
    const spoilerNode = $createSpoilerNode()
    spoilerNode.append($createTextNode(match[1]))
    textNode.replace(spoilerNode)
  },
}
