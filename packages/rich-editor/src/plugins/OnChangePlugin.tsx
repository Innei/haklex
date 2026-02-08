import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState } from 'lexical'
import { useEffect } from 'react'

interface OnChangePluginProps {
  onChange?: (state: SerializedEditorState) => void
}

export function OnChangePlugin({ onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!onChange) return
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState.toJSON())
    })
  }, [editor, onChange])

  return null
}
