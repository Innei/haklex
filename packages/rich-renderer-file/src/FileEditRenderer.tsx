import type { FileDisplay } from '@haklex/rich-editor/nodes';
import { $createFileNode, $isFileNode } from '@haklex/rich-editor/nodes';
import { useFileUploadEntry } from '@haklex/rich-editor/plugins';
import type { FileRendererProps } from '@haklex/rich-editor/renderers';
import { fileMetaText } from '@haklex/rich-editor/renderers';
import { useRendererMode } from '@haklex/rich-editor/static';
import {
  Field,
  Kbd,
  Popover,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  SegmentedControl,
  TextInput,
  toast,
  useLiveEdit,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getNodeByKey, HISTORY_MERGE_TAG, UNDO_COMMAND } from 'lexical';
import { Paperclip } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { FileActionsMenu } from './FileActionsMenu';
import { FileCardContent, FileChipContent, FileRenderer } from './FileRenderer';
import { FileReplaceButton, useFileReplace } from './FileReplaceButton';
import { FileUploadCard } from './FileUploadCard';
import * as styles from './styles.css';

const DISPLAY_ITEMS: { label: string; value: FileDisplay }[] = [
  { value: 'block', label: 'Block' },
  { value: 'inline', label: 'Inline' },
];

export function FileEditRenderer(props: FileRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor' || !props.nodeKey) {
    return <FileRenderer {...props} />;
  }

  return <FileEditRendererInner {...props} nodeKey={props.nodeKey} />;
}

function FileEditRendererInner({
  src,
  name,
  size,
  mimeType,
  ext,
  display,
  nodeKey,
}: FileRendererProps & { nodeKey: string }) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();
  const uploadEntry = useFileUploadEntry(editor, nodeKey);
  const id = useId();

  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name);

  const values = useMemo(() => ({ name }), [name]);
  const applyName = useCallback(
    (patch: Partial<{ name: string }>, merge: boolean) => {
      if (patch.name === undefined) return;
      const next = patch.name;
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if ($isFileNode(node)) node.setName(next);
        },
        merge ? { tag: HISTORY_MERGE_TAG } : undefined,
      );
    },
    [editor, nodeKey],
  );
  const { apply, revert } = useLiveEdit(values, open, applyName);

  useEffect(() => {
    if (open) setEditName(name);
  }, [open]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
    setOpen(false);
    toast({
      title: 'File deleted',
      action: {
        label: 'Undo',
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
    });
  }, [editor, nodeKey]);

  const handleSetDisplay = useCallback(
    (nextDisplay: FileDisplay) => {
      if (nextDisplay === display) return;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isFileNode(node)) return;
        const replacement = $createFileNode({ ...node.getPayload(), display: nextDisplay });
        if (nextDisplay === 'inline') {
          const paragraph = $createParagraphNode();
          paragraph.append(replacement);
          node.replace(paragraph);
        } else {
          node.getTopLevelElementOrThrow().insertAfter(replacement);
          node.remove();
        }
      });
      setOpen(false);
    },
    [display, editor, nodeKey],
  );

  const handleReplaced = useCallback((fileName: string) => {
    setEditName(fileName);
    setOpen(false);
  }, []);
  const { available: canReplace, ...replace } = useFileReplace(nodeKey, handleReplaced);

  if (!editable) {
    return (
      <FileRenderer
        display={display}
        ext={ext}
        mimeType={mimeType}
        name={name}
        size={size}
        src={src}
      />
    );
  }

  if (uploadEntry) {
    return <FileUploadCard entry={uploadEntry} name={name} />;
  }

  const isInline = display === 'inline';
  const nameInvalid = editName.trim() === '';
  const meta = fileMetaText(name, size, ext);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details?.reason === 'escape-key') revert();
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          isInline ? (
            <span
              className={`${styles.editTriggerInline} ${styles.semanticClassNames.editTrigger}`}
            />
          ) : (
            <div className={`${styles.editTrigger} ${styles.semanticClassNames.editTrigger}`} />
          )
        }
      >
        {isInline ? (
          <span className={`${styles.chip} ${styles.semanticClassNames.chip}`}>
            <FileChipContent name={name} />
          </span>
        ) : (
          <span className={`${styles.card} ${styles.semanticClassNames.card}`}>
            <FileCardContent ext={ext} name={name} size={size} />
          </span>
        )}
      </PopoverTrigger>
      <PopoverPanel
        flush
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        side="bottom"
        size="md"
      >
        <PopoverHeader
          actions={<FileActionsMenu name={name} src={src} onDelete={handleDelete} />}
          icon={<Paperclip />}
          title="File"
        />
        <PopoverBody>
          <Field
            error={nameInvalid ? 'Enter a file name' : undefined}
            hint={meta || undefined}
            id={`${id}-name`}
            label="Name"
          >
            <TextInput
              id={`${id}-name`}
              invalid={nameInvalid}
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (e.target.value.trim()) apply({ name: e.target.value });
              }}
            />
          </Field>
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorLabel} id={`${id}-display`}>
              Display as
            </span>
            <div aria-labelledby={`${id}-display`} role="group">
              <SegmentedControl
                items={DISPLAY_ITEMS}
                value={display ?? 'block'}
                onChange={handleSetDisplay}
              />
            </div>
          </div>
          {canReplace && <FileReplaceButton {...replace} />}
        </PopoverBody>
        <PopoverFooter hint="Changes apply as you type">
          <Kbd keys="Esc" size="sm" tone="muted" />
          <span className={styles.footerNote}>revert</span>
        </PopoverFooter>
      </PopoverPanel>
    </Popover>
  );
}
