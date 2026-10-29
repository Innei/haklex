import { useAtomValue, useSetAtom } from 'jotai';
import { Replace } from 'lucide-react';
import { useState } from 'react';

import { metaOpenAtom, toolbarVisibleAtom } from './atoms';
import { ImageActionsMenu } from './ImageActionsMenu';
import { ImageLayoutControl } from './ImageLayoutControls';
import { ImageSizeControl, inspectorFocusAtom } from './ImageSizeControl';
import { useReplaceImageDialog } from './ReplacePanel';
import * as styles from './styles.css';
import { ToolbarButton } from './ToolbarButton';
import { useImageSelected } from './useImageSelection';

function ToolbarSeparator() {
  return <span aria-hidden className={styles.toolbarSeparator} />;
}

export function ImageEditToolbar() {
  const toolbarVisible = useAtomValue(toolbarVisibleAtom);
  const selected = useImageSelected();
  const [menuOpen, setMenuOpen] = useState(false);
  const setMetaOpen = useSetAtom(metaOpenAtom);
  const setInspectorFocus = useSetAtom(inspectorFocusAtom);
  const openReplaceDialog = useReplaceImageDialog();

  const visible = toolbarVisible || selected || menuOpen;

  return (
    <div
      aria-label="Image"
      className={`${styles.editToolbar} ${styles.semanticClassNames.editToolbar} ${visible ? `${styles.editToolbarVisible} ${styles.semanticClassNames.editToolbarVisible}` : ''}`}
      role="toolbar"
    >
      <ImageSizeControl />
      <ToolbarSeparator />
      <ImageLayoutControl />
      <ToolbarSeparator />
      <ToolbarButton
        className={styles.textButton}
        icon={false}
        label="Alt text"
        onClick={() => {
          setInspectorFocus('alt');
          setMetaOpen(true);
        }}
      >
        Alt
      </ToolbarButton>
      <ToolbarButton label="Replace image" onClick={() => void openReplaceDialog()}>
        <Replace />
      </ToolbarButton>
      <ToolbarSeparator />
      <ImageActionsMenu onOpenChange={setMenuOpen} />
    </div>
  );
}
