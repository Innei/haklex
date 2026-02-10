import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState } from 'lexical'
import { useEffect, useRef } from 'react'

interface OnChangePluginProps {
  onChange?: (state: SerializedEditorState) => void
  debounceMs?: number
}

export function OnChangePlugin({ onChange, debounceMs }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const fn = onChangeRef.current
      if (!fn) return

      if (debounceMs && debounceMs > 0) {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          fn(editorState.toJSON())
        }, debounceMs)
      } else {
        fn(editorState.toJSON())
      }
    })

    return () => {
      clearTimeout(timerRef.current)
      unregister()
    }
  }, [editor, debounceMs])

  return null
}
