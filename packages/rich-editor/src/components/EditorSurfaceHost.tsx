import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { EditorSurfaceProps } from '../context/EditorSurfaceContext';
import { useEditorSurface } from '../context/EditorSurfaceContext';
import { AutoFocusPlugin } from '../plugins/AutoFocusPlugin';
import { ContentEditable } from './ContentEditable';

function StandardSurface({
  className,
  hasHeader,
  placeholder,
  plugins,
  autoFocus,
  onActiveEditorChange,
}: EditorSurfaceProps) {
  const [editor] = useLexicalComposerContext();
  useLayoutEffect(() => {
    onActiveEditorChange(editor);
    return () => onActiveEditorChange(null);
  }, [editor, onActiveEditorChange]);
  return (
    <>
      <RichTextPlugin
        ErrorBoundary={LexicalErrorBoundary}
        contentEditable={
          <ContentEditable className={className} hasHeader={hasHeader} placeholder={placeholder} />
        }
      />
      {plugins}
      {autoFocus && <AutoFocusPlugin />}
    </>
  );
}
export function EditorSurfaceHost(
  props: Omit<EditorSurfaceProps, 'plugins' | 'onActiveEditorChange' | 'retainSurface'>,
) {
  const { surface, plugins, setActiveEditor, retainSurface } = useEditorSurface();
  const current = useRef(surface);
  current.current = surface;
  const onActiveEditorChange = useCallback(
    (editor: Parameters<typeof setActiveEditor>[0]) => {
      if (current.current === surface) setActiveEditor(editor);
    },
    [setActiveEditor, surface],
  );
  const [ready, setReady] = useState(false);
  // Layout registration finishes before the first editable DOM is created.
  useLayoutEffect(() => setReady(true), []);
  if (!ready) return null;
  const Surface = surface ?? StandardSurface;
  return (
    <Surface
      {...props}
      plugins={plugins}
      retainSurface={retainSurface}
      onActiveEditorChange={onActiveEditorChange}
    />
  );
}
