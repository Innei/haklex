import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from 'lexical'
import { useEffect } from 'react'

interface SubmitShortcutPluginProps {
  onSubmit?: () => void
}

export function SubmitShortcutPlugin({ onSubmit }: SubmitShortcutPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!onSubmit) return
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (event && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          onSubmit()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, onSubmit])

  return null
}
