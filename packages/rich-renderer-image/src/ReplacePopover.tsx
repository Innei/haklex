import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useAtomValue } from 'jotai';
import { ImageIcon } from 'lucide-react';

import { replaceOpenAtom } from './atoms';
import { ReplacePanel } from './ReplacePanel';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

export function ReplacePopover() {
  const replaceOpen = useAtomValue(replaceOpenAtom);
  const { handleReplaceOpenChange } = useImageActions();

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
      <PopoverPanel className={styles.editPanel} side="bottom" sideOffset={8}>
        <ReplacePanel />
      </PopoverPanel>
    </Popover>
  );
}
