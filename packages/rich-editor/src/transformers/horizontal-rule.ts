import { HORIZONTAL_RULE_BLOCK_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers'
import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/extension'
import type { ElementTransformer } from '@lexical/markdown'
import { $createParagraphNode } from 'lexical'

export const HORIZONTAL_RULE_REGEX = /^(---|\*\*\*|___)\s?$/

export const HORIZONTAL_RULE_BLOCK_TRANSFORMER: ElementTransformer = {
  ...BASE,
  dependencies: [HorizontalRuleNode],
  regExp: HORIZONTAL_RULE_REGEX,
  replace: (parentNode) => {
    const hrNode = $createHorizontalRuleNode()
    const paragraph = $createParagraphNode()
    parentNode.replace(hrNode)
    hrNode.insertAfter(paragraph)
    paragraph.selectStart()
  },
}
