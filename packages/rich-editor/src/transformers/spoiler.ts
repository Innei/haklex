import type { TextMatchTransformer } from '@lexical/markdown'
import { $createTextNode } from 'lexical'

import {
  $createSpoilerNode,
  $isSpoilerNode,
  SpoilerNode,
} from '../nodes/SpoilerNode'

export const SPOILER_TRANSFORMER: TextMatchTransformer = {
  dependencies: [SpoilerNode],
  export: (node) => {
    if (!$isSpoilerNode(node)) return null
    const textContent = node.getTextContent()
    return `||${textContent}||`
  },
  importRegExp: /\|\|(.+?)\|\|/,
  regExp: /\|\|(.+?)\|\|$/,
  replace: (textNode, match) => {
    const spoilerNode = $createSpoilerNode()
    spoilerNode.append($createTextNode(match[1]))
    textNode.replace(spoilerNode)
  },
  trigger: '|',
  type: 'text-match',
}
