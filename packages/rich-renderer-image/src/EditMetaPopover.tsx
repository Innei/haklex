import { ActionBar, ActionButton } from '@haklex/rich-editor-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { Captions, ImageIcon, Type } from 'lucide-react';
import { useEffect, useRef } from 'react';

import {
  editAltTextAtom,
  editCaptionAtom,
  editSrcAtom,
  focusCaptionOnOpenAtom,
  metaOpenAtom,
} from './atoms';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

export function EditMetaPopover() {
  const editSrc = useAtomValue(editSrcAtom);
  const setEditSrc = useSetAtom(editSrcAtom);
  const editAltText = useAtomValue(editAltTextAtom);
  const setEditAltText = useSetAtom(editAltTextAtom);
  const editCaption = useAtomValue(editCaptionAtom);
  const setEditCaption = useSetAtom(editCaptionAtom);
  const setMetaOpen = useSetAtom(metaOpenAtom);
  const { commitMeta } = useImageActions();

  const captionInputRef = useRef<HTMLInputElement>(null);
  const focusCaptionOnOpen = useAtomValue(focusCaptionOnOpenAtom);
  const setFocusCaptionOnOpen = useSetAtom(focusCaptionOnOpenAtom);

  useEffect(() => {
    if (focusCaptionOnOpen && captionInputRef.current) {
      captionInputRef.current.focus();
      captionInputRef.current.select();
      setFocusCaptionOnOpen(false);
    }
  }, [focusCaptionOnOpen, setFocusCaptionOnOpen]);

  return (
    <>
      <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
        <ImageIcon
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          placeholder="Image URL"
          type="url"
          value={editSrc}
          onChange={(event) => setEditSrc(event.target.value)}
        />
      </div>
      <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
        <Type
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          placeholder="Alt text"
          type="text"
          value={editAltText}
          onChange={(event) => setEditAltText(event.target.value)}
        />
      </div>
      <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
        <Captions
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          placeholder="Caption (optional)"
          ref={captionInputRef}
          type="text"
          value={editCaption}
          onChange={(event) => setEditCaption(event.target.value)}
        />
      </div>
      <ActionBar>
        <ActionButton onClick={() => setMetaOpen(false)}>Close</ActionButton>
        <ActionButton variant="accent" onClick={commitMeta}>
          Save
        </ActionButton>
      </ActionBar>
    </>
  );
}
