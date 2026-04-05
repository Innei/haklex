import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedEditorState } from 'lexical';
import { useEffect, useRef } from 'react';

import { normalizeSerializedEditorState } from '../utils/normalizeSerializedEditorState';

interface OnChangePluginProps {
  debounceMs?: number;
  onChange?: (state: SerializedEditorState) => void;
}

export function OnChangePlugin({ onChange, debounceMs }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const fn = onChangeRef.current;
      if (!fn) return;

      const serializedState = normalizeSerializedEditorState(editorState.toJSON());

      if (debounceMs && debounceMs > 0) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          fn(serializedState);
        }, debounceMs);
      } else {
        fn(serializedState);
      }
    });

    return () => {
      clearTimeout(timerRef.current);
      unregister();
    };
  }, [editor, debounceMs]);

  return null;
}
