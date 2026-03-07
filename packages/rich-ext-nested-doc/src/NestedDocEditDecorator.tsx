import { useColorScheme } from '@haklex/rich-editor';
import { ActionBar, ActionButton } from '@haklex/rich-editor-ui';
import { PortalContainerProvider, usePortalTheme } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import { $getNodeByKey } from 'lexical';
import { FileText, Pencil, X } from 'lucide-react';
import { type KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react';

import { useNestedDocDialogEditor } from './NestedDocDialogEditorContext';
import { $isNestedDocNode } from './NestedDocNode';
import { NestedDocRenderer } from './NestedDocRenderer';
import * as css from './styles.css';
import { hasRenderableEditorState, truncateEditorState } from './utils';

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

  const handleOpenDialog = useCallback(async () => {
    if (!DialogEditor) return;

    const { presentDialog } = await import('@haklex/rich-editor-ui');

    presentDialog({
      content: ({ dismiss }) => (
        <NestedDocDialogContent
          DialogEditor={DialogEditor}
          contentEditor={contentEditor}
          initialState={contentEditor.getEditorState().toJSON()}
          nodeKey={nodeKey}
          parentEditor={editor}
          onDismiss={dismiss}
        />
      ),
      className: css.dialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
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
  DialogEditor,
}: {
  initialState: SerializedEditorState;
  parentEditor: LexicalEditor;
  nodeKey: string;
  contentEditor: LexicalEditor;
  onDismiss: () => void;
  DialogEditor: React.ComponentType<{
    initialValue: SerializedEditorState;
    onEditorReady: (editor: LexicalEditor | null) => void;
  }>;
}) {
  const dialogEditorRef = useRef<LexicalEditor | null>(null);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);

  const safeInitialState =
    initialState?.root?.children?.length > 0 ? initialState : EMPTY_EDITOR_STATE;

  const handleDone = useCallback(() => {
    const dialogEditor = dialogEditorRef.current;
    if (dialogEditor) {
      const newState = dialogEditor.getEditorState().toJSON();
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
        handleDone();
      }
    },
    [handleDone],
  );

  const handleEditorReady = useCallback((editor: LexicalEditor | null) => {
    dialogEditorRef.current = editor;
  }, []);

  return (
    <div className={css.dialogShell} ref={setShellEl} onKeyDownCapture={handleKeyDownCapture}>
      <div className={css.dialogHeader}>
        <div className={css.dialogHeaderLeft}>
          <h3 className={css.dialogTitle}>
            <FileText size={18} />
            <span>Nested document</span>
          </h3>
        </div>
        <div className={css.dialogHeaderRight}>
          <button
            className={css.dialogHeaderCloseBtn}
            title="Close"
            type="button"
            onClick={onDismiss}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={css.editorArea}>
        {shellEl && (
          <PortalContainerProvider value={shellEl}>
            <DialogEditor initialValue={safeInitialState} onEditorReady={handleEditorReady} />
          </PortalContainerProvider>
        )}
      </div>

      <div className={css.dialogFooter}>
        <ActionBar>
          <ActionButton size="md" variant="ghost" onClick={onDismiss}>
            Cancel
          </ActionButton>
          <ActionButton size="md" variant="accent" onClick={handleDone}>
            Save
          </ActionButton>
        </ActionBar>
      </div>
    </div>
  );
}
