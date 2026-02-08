import type { TextMatchTransformer } from '@lexical/markdown'

import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from '../nodes/MentionNode'

export const MENTION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [MentionNode],
  export: (node) => {
    if (!$isMentionNode(node)) return null
    return `{${node.getPlatform()}@${node.getHandle()}}`
  },
  importRegExp: /\{(\w+)@(\w[\w.-]*)\}/,
  regExp: /\{(\w+)@(\w[\w.-]*)\}$/,
  replace: (textNode, match) => {
    const mentionNode = $createMentionNode(match[1], match[2])
    textNode.replace(mentionNode)
  },
  trigger: '}',
  type: 'text-match',
}
