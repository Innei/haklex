import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalEditor } from 'lexical'
import { useEffect } from 'react'

interface EditorRefPluginProps {
  onEditorReady?: (editor: LexicalEditor | null) => void
}

export function EditorRefPlugin({ onEditorReady }: EditorRefPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    onEditorReady?.(editor)
    return () => onEditorReady?.(null)
  }, [editor, onEditorReady])

  return null
}
