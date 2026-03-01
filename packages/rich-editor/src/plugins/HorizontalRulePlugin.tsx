import {
  $createHorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/extension'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

import { HORIZONTAL_RULE_REGEX } from '../transformers/horizontal-rule'

export function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const unregisterInsert = editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        const focusNode = selection.focus.getNode()
        const topLevel = focusNode.getTopLevelElement()
        if (!topLevel) return false

        const hrNode = $createHorizontalRuleNode()
        const paragraph = $createParagraphNode()
        topLevel.insertAfter(hrNode)
        hrNode.insertAfter(paragraph)
        paragraph.selectStart()
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false
        }

        const anchorNode = selection.anchor.getNode()
        if (!$isTextNode(anchorNode)) return false

        const textContent = anchorNode.getTextContent()
        if (!HORIZONTAL_RULE_REGEX.test(textContent)) return false

        const parentNode = anchorNode.getParent()
        if (!parentNode) return false

        event?.preventDefault()

        const hrNode = $createHorizontalRuleNode()
        const paragraph = $createParagraphNode()
        parentNode.replace(hrNode)
        hrNode.insertAfter(paragraph)
        paragraph.selectStart()
        return true
      },
      COMMAND_PRIORITY_LOW,
    )

    return () => {
      unregisterInsert()
      unregisterEnter()
    }
  }, [editor])

  return null
}
