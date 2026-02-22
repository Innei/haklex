import {
  $createHorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/extension'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { useEffect } from 'react'

export function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
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
  }, [editor])

  return null
}
