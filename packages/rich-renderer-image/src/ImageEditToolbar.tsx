import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useAtomValue, useSetAtom } from 'jotai';
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { CopyPlus, Download, ExternalLink, Replace, Trash2, Type } from 'lucide-react';

import {
  altTextAtom,
  captionAtom,
  editAltTextAtom,
  editCaptionAtom,
  editSrcAtom,
  metaOpenAtom,
  replaceOpenAtom,
  replacePreviewAtom,
  replaceUrlAtom,
  srcAtom,
  toolbarVisibleAtom,
} from './atoms';
import { EditMetaPopover } from './EditMetaPopover';
import { getEditorHistoryShortcut } from './history-shortcuts';
import { ImageLayoutControl, ImageSizeControl } from './ImageLayoutControls';
import { ReplacePanel } from './ReplacePanel';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

export function ImageEditToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarVisible = useAtomValue(toolbarVisibleAtom);
  const metaOpen = useAtomValue(metaOpenAtom);
  const setMetaOpen = useSetAtom(metaOpenAtom);
  const replaceOpen = useAtomValue(replaceOpenAtom);
  const src = useAtomValue(srcAtom);
  const altText = useAtomValue(altTextAtom);
  const caption = useAtomValue(captionAtom);
  const editSrc = useAtomValue(editSrcAtom);
  const editAltText = useAtomValue(editAltTextAtom);
  const editCaption = useAtomValue(editCaptionAtom);
  const replaceUrl = useAtomValue(replaceUrlAtom);
  const replacePreview = useAtomValue(replacePreviewAtom);
  const { handleReplaceOpenChange, handleOpen, handleDuplicate, handleDownload, handleDelete } =
    useImageActions();

  const dispatchHistoryShortcut = (shortcut: 'redo' | 'undo') => {
    editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
  };

  const handleMetaPanelKeyDown = (event: React.KeyboardEvent) => {
    const shortcut = getEditorHistoryShortcut(event, {
      isDirty: editSrc !== src || editAltText !== altText || editCaption !== (caption || ''),
    });
    if (!shortcut) return;

    event.preventDefault();
    event.stopPropagation();
    dispatchHistoryShortcut(shortcut);
  };

  const handleReplacePanelKeyDown = (event: React.KeyboardEvent) => {
    const shortcut = getEditorHistoryShortcut(event, {
      isDirty: replaceUrl !== '' || replacePreview !== null,
    });
    if (!shortcut) return;

    event.preventDefault();
    event.stopPropagation();
    dispatchHistoryShortcut(shortcut);
  };

  return (
    <div
      className={`${styles.editToolbar} ${styles.semanticClassNames.editToolbar} ${toolbarVisible ? `${styles.editToolbarVisible} ${styles.semanticClassNames.editToolbarVisible}` : ''}`}
    >
      <ImageSizeControl />
      <ImageLayoutControl />

      <Popover
        open={metaOpen}
        onOpenChange={(nextOpen) => {
          setMetaOpen(nextOpen);
          if (nextOpen) handleReplaceOpenChange(false);
        }}
      >
        <PopoverTrigger
          className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`}
          title="Edit details"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Type size={14} />
        </PopoverTrigger>
        <PopoverPanel
          className={styles.editPanel}
          side="bottom"
          sideOffset={8}
          onKeyDown={handleMetaPanelKeyDown}
        >
          <EditMetaPopover />
        </PopoverPanel>
      </Popover>

      <Popover
        open={replaceOpen}
        onOpenChange={(nextOpen) => {
          handleReplaceOpenChange(nextOpen);
          if (nextOpen) setMetaOpen(false);
        }}
      >
        <PopoverTrigger
          className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`}
          title="Replace image"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Replace size={14} />
        </PopoverTrigger>
        <PopoverPanel
          className={styles.editPanel}
          side="bottom"
          sideOffset={8}
          onKeyDown={handleReplacePanelKeyDown}
        >
          <ReplacePanel />
        </PopoverPanel>
      </Popover>

      <button
        className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`}
        title="Duplicate"
        type="button"
        onClick={handleDuplicate}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CopyPlus size={14} />
      </button>

      <button
        className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`}
        title="Open source"
        type="button"
        onClick={handleOpen}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ExternalLink size={14} />
      </button>

      <button
        className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`}
        title="Download"
        type="button"
        onClick={handleDownload}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Download size={14} />
      </button>

      <button
        className={`${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton} ${styles.editToolbarButtonDanger} ${styles.semanticClassNames.editToolbarButtonDanger}`}
        title="Remove image"
        type="button"
        onClick={handleDelete}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
