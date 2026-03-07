import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { Copy, Download, ExternalLink, Replace, Trash2, Type } from 'lucide-react';

import { metaOpenAtom, replaceOpenAtom, toolbarVisibleAtom } from './atoms';
import { EditMetaPopover } from './EditMetaPopover';
import { ReplacePanel } from './ReplacePanel';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

export function ImageEditToolbar() {
  const toolbarVisible = useAtomValue(toolbarVisibleAtom);
  const metaOpen = useAtomValue(metaOpenAtom);
  const setMetaOpen = useSetAtom(metaOpenAtom);
  const replaceOpen = useAtomValue(replaceOpenAtom);
  const { handleReplaceOpenChange, handleOpen, handleDuplicate, handleDownload, handleDelete } =
    useImageActions();

  return (
    <div
      className={`${styles.editToolbar} ${styles.semanticClassNames.editToolbar} ${toolbarVisible ? `${styles.editToolbarVisible} ${styles.semanticClassNames.editToolbarVisible}` : ''}`}
    >
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
        >
          <Type size={14} />
        </PopoverTrigger>
        <PopoverPanel className={styles.editPanel} side="bottom" sideOffset={8}>
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
        >
          <Replace size={14} />
        </PopoverTrigger>
        <PopoverPanel className={styles.editPanel} side="bottom" sideOffset={8}>
          <ReplacePanel />
        </PopoverPanel>
      </Popover>

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
        title="Duplicate"
        type="button"
        onClick={handleDuplicate}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Copy size={14} />
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
