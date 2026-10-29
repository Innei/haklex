import { useColorScheme } from '@haklex/rich-editor/static';
import {
  confirmDiscardChanges,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  presentDialog,
} from '@haklex/rich-editor-ui';
import { PortalContainerProvider, usePortalTheme } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import { $getNodeByKey, $getRoot } from 'lexical';
import { FileText, Pencil } from 'lucide-react';
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNestedDocDialogEditor } from './NestedDocDialogEditorContext';
import { $isNestedDocNode } from './NestedDocNode';
import { NestedDocRenderer } from './NestedDocRenderer';
import * as css from './styles.css';
import { countWords, hasRenderableEditorState, truncateEditorState } from './utils';

const PREVIEW_NODE_LIMIT = 6;

const EMPTY_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState;

interface NestedDocEditDecoratorProps {
  contentEditor: LexicalEditor;
  contentState: SerializedEditorState;
  nodeKey: string;
}

export function NestedDocEditDecorator({
  nodeKey,
  contentEditor,
  contentState,
}: NestedDocEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const colorScheme = useColorScheme();
  const { className: portalClassName } = usePortalTheme();
  const DialogEditor = useNestedDocDialogEditor();

  const previewState = useMemo(
    () => truncateEditorState(contentState, PREVIEW_NODE_LIMIT),
    [contentState],
  );
  const hasPreview = hasRenderableEditorState(previewState);

  const handleOpenDialog = useCallback(() => {
    if (!DialogEditor) return;

    let dirty = false;
    const initialState = contentEditor.getEditorState().toJSON();
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <NestedDocDialogContent
          DialogEditor={DialogEditor}
          contentEditor={contentEditor}
          initialState={initialState}
          nodeKey={nodeKey}
          parentEditor={editor}
          onDismiss={dismiss}
          onRequestDismiss={requestDismiss}
          onDirtyChange={(next) => {
            dirty = next;
          }}
        />
      ),
      className: css.dialogPopup,
      portalClassName,
      theme: colorScheme,
      width: 900,
      sheet: 'auto',
      showCloseButton: false,
      confirmDismiss: () => !dirty || confirmDiscardChanges(),
    });
  }, [DialogEditor, colorScheme, contentEditor, editor, nodeKey, portalClassName]);

  return (
    <div
      aria-label="Open nested document editor"
      className={css.editOverlayRoot}
      role="button"
      tabIndex={0}
      onClick={handleOpenDialog}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenDialog();
        }
      }}
    >
      <div className={`${css.rendererContent} rich-nested-doc-content`}>
        {hasPreview ? (
          <div className={css.previewSurface}>
            <NestedDocRenderer value={previewState} />
          </div>
        ) : (
          <p className={css.previewEmpty}>Empty nested document. Click to edit.</p>
        )}
      </div>
      <div aria-hidden className={css.editOverlay}>
        <Pencil size={24} />
      </div>
    </div>
  );
}

function NestedDocDialogContent({
  initialState,
  parentEditor,
  nodeKey,
  contentEditor,
  onDismiss,
  onRequestDismiss,
  onDirtyChange,
  DialogEditor,
}: {
  initialState: SerializedEditorState;
  parentEditor: LexicalEditor;
  nodeKey: string;
  contentEditor: LexicalEditor;
  onDismiss: () => void;
  onRequestDismiss: () => void;
  onDirtyChange: (dirty: boolean) => void;
  DialogEditor: React.ComponentType<{
    initialValue: SerializedEditorState;
    onEditorReady: (editor: LexicalEditor | null) => void;
  }>;
}) {
  const [dialogEditor, setDialogEditor] = useState<LexicalEditor | null>(null);
  const dialogEditorRef = useRef<LexicalEditor | null>(null);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const [dirty, setDirty] = useState(false);
  const [words, setWords] = useState(0);

  const safeInitialState = useMemo(
    () => (initialState?.root?.children?.length > 0 ? initialState : EMPTY_EDITOR_STATE),
    [initialState],
  );

  useEffect(() => {
    if (!dialogEditor) return;
    const baseline = JSON.stringify(dialogEditor.getEditorState().toJSON());
    const measure = () => {
      setWords(dialogEditor.getEditorState().read(() => countWords($getRoot().getTextContent())));
    };
    measure();
    return dialogEditor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      setDirty(JSON.stringify(editorState.toJSON()) !== baseline);
      measure();
    });
  }, [dialogEditor]);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const handleSave = useCallback(() => {
    const editor = dialogEditorRef.current;
    if (editor) {
      const newState = editor.getEditorState().toJSON();
      const parsed = contentEditor.parseEditorState(newState);
      contentEditor.setEditorState(parsed);
      parentEditor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isNestedDocNode(node)) {
          node.setContentState(newState);
        }
      });
    }
    onDismiss();
  }, [contentEditor, nodeKey, onDismiss, parentEditor]);

  const handleKeyDownCapture = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) return;

      if (event.key === 'Enter' || event.key.toLowerCase() === 's') {
        event.preventDefault();
        event.stopPropagation();
        handleSave();
      }
    },
    [handleSave],
  );

  const handleEditorReady = useCallback((editor: LexicalEditor | null) => {
    dialogEditorRef.current = editor;
    setDialogEditor(editor);
  }, []);

  return (
    <div className={css.dialogShell} ref={setShellEl} onKeyDownCapture={handleKeyDownCapture}>
      <ModalShell>
        <ModalShellHeader icon={<FileText />} title="Nested document" onClose={onRequestDismiss} />

        <ModalShellBody className={css.editorArea}>
          {shellEl && (
            <PortalContainerProvider value={shellEl}>
              <DialogEditor initialValue={safeInitialState} onEditorReady={handleEditorReady} />
            </PortalContainerProvider>
          )}
        </ModalShellBody>

        <ModalShellFooter
          dirty={dirty}
          status={`${words.toLocaleString('en-US')} ${words === 1 ? 'word' : 'words'}`}
          onCancel={onRequestDismiss}
          onSave={handleSave}
        />
      </ModalShell>
    </div>
  );
}
