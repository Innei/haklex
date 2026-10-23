import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, NodeKey } from 'lexical';
import { useEffect } from 'react';

import { registerNestedEditorSync } from '../../utils/nested-editor-sync';

export function useNestedEditorSync(nestedEditors: LexicalEditor[], ownerKey: NodeKey): void {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const unregisters = nestedEditors.map((nested) =>
      registerNestedEditorSync(editor, nested, ownerKey),
    );
    return () => unregisters.forEach((unregister) => unregister());
  }, [editor, nestedEditors, ownerKey]);
}
