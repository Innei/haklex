import { useAtom } from 'jotai';
import { ImageIcon } from 'lucide-react';
import { useEffect } from 'react';

import { replaceOpenAtom } from './atoms';
import { useReplaceImageDialog } from './ReplacePanel';
import * as styles from './styles.css';

export function ReplacePopover() {
  const [replaceOpen, setReplaceOpen] = useAtom(replaceOpenAtom);
  const openReplaceDialog = useReplaceImageDialog();

  useEffect(() => {
    if (!replaceOpen) return;
    setReplaceOpen(false);
    void openReplaceDialog();
  }, [openReplaceDialog, replaceOpen, setReplaceOpen]);

  return (
    <button
      className={`${styles.editPlaceholder} ${styles.semanticClassNames.editPlaceholder}`}
      type="button"
      onClick={() => void openReplaceDialog()}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ImageIcon size={24} />
      <span>Click to add image</span>
    </button>
  );
}
