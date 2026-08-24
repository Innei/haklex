import { $createFileNode, $isFileNode, fileExtFromName } from '@haklex/rich-editor/nodes';
import { useFileUpload, useFileUploadEntry } from '@haklex/rich-editor/plugins';
import type { FileRendererProps } from '@haklex/rich-editor/renderers';
import { fileMetaText } from '@haklex/rich-editor/renderers';
import { useRendererMode } from '@haklex/rich-editor/static';
import {
  ActionBar,
  ActionButton,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getNodeByKey } from 'lexical';
import {
  AlertCircle,
  Download,
  Link2,
  Paperclip,
  Pencil,
  Pilcrow,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { FileCardContent, FileChipContent, FileRenderer } from './FileRenderer';
import * as styles from './styles.css';

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
  const fileUpload = useFileUpload();
  const uploadEntry = useFileUploadEntry(editor, nodeKey);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [replacing, setReplacing] = useState(false);
  const [replacePercent, setReplacePercent] = useState(0);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  const commitName = useCallback(() => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === name) {
      setEditName(name);
      return;
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileNode(node)) node.setName(trimmed);
    });
  }, [editor, editName, name, nodeKey]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
    setOpen(false);
  }, [editor, nodeKey]);

  const handleToggleDisplay = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isFileNode(node)) return;
      const payload = node.getPayload();
      const nextDisplay = payload.display === 'inline' ? 'block' : 'inline';
      const replacement = $createFileNode({ ...payload, display: nextDisplay });
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
  }, [editor, nodeKey]);

  const handleCopyLink = useCallback(() => {
    if (src) void navigator.clipboard.writeText(src);
    setOpen(false);
  }, [src]);

  const handleDownload = useCallback(() => {
    if (!src) return;
    const anchor = document.createElement('a');
    anchor.href = src;
    anchor.download = name;
    anchor.rel = 'noopener noreferrer';
    anchor.target = '_blank';
    anchor.click();
  }, [src, name]);

  const handleReplaceFile = useCallback(
    async (file: File | null) => {
      if (!file || !fileUpload) return;

      setReplacing(true);
      setReplacePercent(0);
      setReplaceError(null);

      try {
        const result = await fileUpload(file, {
          onProgress: (percent) => setReplacePercent(Math.round(percent)),
        });
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (!$isFileNode(node)) return;
          node.setFilePayload({
            src: result.src,
            name: file.name,
            size: file.size,
            mimeType: file.type || undefined,
            ext: fileExtFromName(file.name),
          });
        });
        setEditName(file.name);
        setOpen(false);
      } catch (err: unknown) {
        console.error('[FileEditRenderer]', err);
        setReplaceError('Upload failed');
      } finally {
        setReplacing(false);
      }
    },
    [editor, fileUpload, nodeKey],
  );

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
    return (
      <span
        className={`${styles.card} ${uploadEntry.status === 'error' ? styles.cardError : ''} ${styles.semanticClassNames.card}`}
      >
        {uploadEntry.status === 'error' ? (
          <AlertCircle className={`${styles.cardIcon} ${styles.cardErrorText}`} size={20} />
        ) : (
          <Paperclip className={styles.cardIcon} />
        )}
        <span className={`${styles.cardMeta} ${styles.semanticClassNames.cardMeta}`}>
          <span className={`${styles.cardName} ${styles.semanticClassNames.cardName}`}>{name}</span>
          {uploadEntry.status === 'error' ? (
            <span className={`${styles.cardSub} ${styles.cardErrorText}`}>
              {uploadEntry.error ?? 'Upload failed'}
            </span>
          ) : (
            <>
              <span className={`${styles.cardSub} ${styles.semanticClassNames.cardSub}`}>
                <span>Uploading...</span>
                <span>{uploadEntry.percent}%</span>
              </span>
              <span className={`${styles.cardProgress} ${styles.semanticClassNames.cardProgress}`}>
                <span
                  className={`${styles.cardProgressFill} ${styles.semanticClassNames.cardProgressFill}`}
                  style={{ width: `${uploadEntry.percent}%` }}
                />
              </span>
            </>
          )}
        </span>
        {uploadEntry.status === 'error' && (
          <ActionBar>
            <ActionButton onClick={uploadEntry.retry}>
              <RefreshCw size={14} />
              Retry
            </ActionButton>
            <ActionButton danger onClick={uploadEntry.remove}>
              Remove
            </ActionButton>
          </ActionBar>
        )}
      </span>
    );
  }

  const isInline = display === 'inline';

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setEditName(name);
          setReplaceError(null);
        } else {
          commitName();
        }
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
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
        side="bottom"
        sideOffset={8}
      >
        <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
          <Pencil className={styles.editFieldIcon} size={14} />
          <input
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            placeholder="File name"
            value={editName}
            onBlur={commitName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitName();
                setOpen(false);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setEditName(name);
                setOpen(false);
              }
            }}
          />
        </div>
        {fileMetaText(name, size, ext) && (
          <span className={styles.cardSub}>{fileMetaText(name, size, ext)}</span>
        )}
        {replaceError && (
          <span className={`${styles.editError} ${styles.semanticClassNames.editError}`}>
            {replaceError}
          </span>
        )}
        <ActionBar>
          {fileUpload && (
            <>
              <input
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
                onChange={(e) => {
                  void handleReplaceFile(e.currentTarget.files?.[0] ?? null);
                  e.currentTarget.value = '';
                }}
              />
              <ActionButton disabled={replacing} onClick={() => fileInputRef.current?.click()}>
                <RefreshCw size={14} />
                {replacing ? `Uploading ${replacePercent}%` : 'Replace'}
              </ActionButton>
            </>
          )}
          <ActionButton onClick={handleToggleDisplay}>
            <Pilcrow size={14} />
            {isInline ? 'To block' : 'To inline'}
          </ActionButton>
          <ActionButton disabled={!src} onClick={handleCopyLink}>
            <Link2 size={14} />
            Copy link
          </ActionButton>
          <ActionButton disabled={!src} onClick={handleDownload}>
            <Download size={14} />
          </ActionButton>
          <ActionButton danger onClick={handleDelete}>
            <Trash2 size={14} />
          </ActionButton>
        </ActionBar>
      </PopoverPanel>
    </Popover>
  );
}
