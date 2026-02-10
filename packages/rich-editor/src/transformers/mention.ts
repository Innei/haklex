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
    const displayName = node.getDisplayName()
    const base = `{${node.getPlatform()}@${node.getHandle()}}`
    return displayName ? `[${displayName}]${base}` : base
  },
  importRegExp: /(?:\[([^\]]+)\])?\{(\w+)@(\w[\w.-]*)\}/,
  regExp: /(?:\[([^\]]+)\])?\{(\w+)@(\w[\w.-]*)\}$/,
  replace: (textNode, match) => {
    const displayName = match[1] || undefined
    const mentionNode = $createMentionNode(match[2], match[3], displayName)
    textNode.replace(mentionNode)
  },
  trigger: '}',
  type: 'text-match',
}
