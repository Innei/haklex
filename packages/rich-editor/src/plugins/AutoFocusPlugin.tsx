import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

export function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const root = editor.getRootElement()
    if (root) {
      root.focus({ preventScroll: true })
    } else {
      editor.focus()
    }
  }, [editor])

  return null
}
