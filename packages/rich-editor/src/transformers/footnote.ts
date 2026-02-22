import {
  FOOTNOTE_SECTION_TRANSFORMER as SECTION_BASE,
  FOOTNOTE_TRANSFORMER as BASE,
} from '@haklex/rich-headless/transformers'
import type {
  ElementTransformer,
  TextMatchTransformer,
} from '@lexical/markdown'

import { $createFootnoteNode, FootnoteNode } from '../nodes/FootnoteNode'
import {
  $createFootnoteSectionNode,
  $isFootnoteSectionNode,
  FootnoteSectionNode,
} from '../nodes/FootnoteSectionNode'

export const FOOTNOTE_TRANSFORMER: TextMatchTransformer = {
  ...BASE,
  dependencies: [FootnoteNode],
  replace: (textNode, match) => {
    const footnoteNode = $createFootnoteNode(match[1])
    textNode.replace(footnoteNode)
  },
}

export const FOOTNOTE_SECTION_TRANSFORMER: ElementTransformer = {
  ...SECTION_BASE,
  dependencies: [FootnoteSectionNode],
  regExp: /^\[\^(\w+)\]:\s+(.+)$/,
  replace: (parentNode, _children, match) => {
    const identifier = match[1]
    const content = match[2]

    const root = parentNode.getParent()
    if (root) {
      const children = root.getChildren()
      for (const child of children) {
        if ($isFootnoteSectionNode(child)) {
          child.setDefinition(identifier, content)
          parentNode.remove()
          return
        }
      }
    }

    const sectionNode = $createFootnoteSectionNode({ [identifier]: content })
    parentNode.replace(sectionNode)
  },
}
