import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createKaTeXBlockNode } from '../nodes/KaTeXBlockNode'
import { $createKaTeXInlineNode } from '../nodes/KaTeXInlineNode'

export const INSERT_KATEX_INLINE_COMMAND = createCommand<string>(
  'INSERT_KATEX_INLINE',
)
export const INSERT_KATEX_BLOCK_COMMAND =
  createCommand<string>('INSERT_KATEX_BLOCK')

export function KaTeXPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const unregisterInline = editor.registerCommand(
      INSERT_KATEX_INLINE_COMMAND,
      (equation) => {
        const node = $createKaTeXInlineNode(equation)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    const unregisterBlock = editor.registerCommand(
      INSERT_KATEX_BLOCK_COMMAND,
      (equation) => {
        const node = $createKaTeXBlockNode(equation)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    return () => {
      unregisterInline()
      unregisterBlock()
    }
  }, [editor])

  return null
}
