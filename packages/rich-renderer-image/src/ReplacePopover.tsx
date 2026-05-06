import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useAtomValue } from 'jotai';
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { ImageIcon } from 'lucide-react';

import { replaceOpenAtom, replacePreviewAtom, replaceUrlAtom } from './atoms';
import { getEditorHistoryShortcut } from './history-shortcuts';
import { ReplacePanel } from './ReplacePanel';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

export function ReplacePopover() {
  const [editor] = useLexicalComposerContext();
  const replaceOpen = useAtomValue(replaceOpenAtom);
  const replaceUrl = useAtomValue(replaceUrlAtom);
  const replacePreview = useAtomValue(replacePreviewAtom);
  const { handleReplaceOpenChange } = useImageActions();

  const handlePanelKeyDown = (event: React.KeyboardEvent) => {
    const shortcut = getEditorHistoryShortcut(event, {
      isDirty: replaceUrl !== '' || replacePreview !== null,
    });
    if (!shortcut) return;

    event.preventDefault();
    event.stopPropagation();
    editor.dispatchCommand(shortcut === 'undo' ? UNDO_COMMAND : REDO_COMMAND, undefined);
  };

  return (
    <Popover open={replaceOpen} onOpenChange={handleReplaceOpenChange}>
      <PopoverTrigger
        className={`${styles.editPlaceholder} ${styles.semanticClassNames.editPlaceholder}`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ImageIcon size={24} />
        <span>Click to add image</span>
      </PopoverTrigger>
      <PopoverPanel
        className={styles.editPanel}
        side="bottom"
        sideOffset={8}
        onKeyDown={handlePanelKeyDown}
      >
        <ReplacePanel />
      </PopoverPanel>
    </Popover>
  );
}
