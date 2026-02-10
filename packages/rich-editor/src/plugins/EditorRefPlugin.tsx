import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalEditor } from 'lexical'
import { useEffect, useRef } from 'react'

interface EditorRefPluginProps {
  onEditorReady?: (editor: LexicalEditor | null) => void
}

export function EditorRefPlugin({ onEditorReady }: EditorRefPluginProps) {
  const [editor] = useLexicalComposerContext()
  const callbackRef = useRef(onEditorReady)
  callbackRef.current = onEditorReady

  useEffect(() => {
    callbackRef.current?.(editor)
    return () => callbackRef.current?.(null)
  }, [editor])

  return null
}
