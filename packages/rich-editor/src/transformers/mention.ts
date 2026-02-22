import { MENTION_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers'
import type { TextMatchTransformer } from '@lexical/markdown'

import { $createMentionNode, MentionNode } from '../nodes/MentionNode'

export const MENTION_TRANSFORMER: TextMatchTransformer = {
  ...BASE,
  dependencies: [MentionNode],
  replace: (textNode, match) => {
    const displayName = match[1] || undefined
    const mentionNode = $createMentionNode(match[2], match[3], displayName)
    textNode.replace(mentionNode)
  },
}
