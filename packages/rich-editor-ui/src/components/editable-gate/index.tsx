import type { LexicalEditor } from 'lexical';
import type { ReactNode } from 'react';
import { useCallback, useSyncExternalStore } from 'react';

export interface EditableGateProps {
  editable: ReactNode;
  editor: LexicalEditor;
  readOnly: ReactNode;
}

// decorate() is not re-run when editability flips, so the branch must live in a component.
export function EditableGate({ editable, editor, readOnly }: EditableGateProps) {
  const subscribe = useCallback(
    (onChange: () => void) => editor.registerEditableListener(onChange),
    [editor],
  );
  const getEditable = useCallback(() => editor.isEditable(), [editor]);
  const isEditable = useSyncExternalStore(subscribe, getEditable, getEditable);
  return <>{isEditable ? editable : readOnly}</>;
}
