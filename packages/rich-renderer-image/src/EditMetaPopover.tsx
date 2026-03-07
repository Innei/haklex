import { useAtomValue, useSetAtom } from 'jotai'
import { Captions, ImageIcon, Type } from 'lucide-react'
import { useEffect, useRef } from 'react'

import {
  editAltTextAtom,
  editCaptionAtom,
  editSrcAtom,
  focusCaptionOnOpenAtom,
  metaOpenAtom,
} from './atoms'
import * as styles from './styles.css'
import { useImageActions } from './useImageActions'

export function EditMetaPopover() {
  const editSrc = useAtomValue(editSrcAtom)
  const setEditSrc = useSetAtom(editSrcAtom)
  const editAltText = useAtomValue(editAltTextAtom)
  const setEditAltText = useSetAtom(editAltTextAtom)
  const editCaption = useAtomValue(editCaptionAtom)
  const setEditCaption = useSetAtom(editCaptionAtom)
  const setMetaOpen = useSetAtom(metaOpenAtom)
  const { commitMeta } = useImageActions()

  const captionInputRef = useRef<HTMLInputElement>(null)
  const focusCaptionOnOpen = useAtomValue(focusCaptionOnOpenAtom)
  const setFocusCaptionOnOpen = useSetAtom(focusCaptionOnOpenAtom)

  useEffect(() => {
    if (focusCaptionOnOpen && captionInputRef.current) {
      captionInputRef.current.focus()
      captionInputRef.current.select()
      setFocusCaptionOnOpen(false)
    }
  }, [focusCaptionOnOpen, setFocusCaptionOnOpen])

  return (
    <>
      <div
        className={`${styles.editField} ${styles.semanticClassNames.editField}`}
      >
        <ImageIcon
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          type="url"
          value={editSrc}
          onChange={(event) => setEditSrc(event.target.value)}
          placeholder="Image URL"
        />
      </div>
      <div
        className={`${styles.editField} ${styles.semanticClassNames.editField}`}
      >
        <Type
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          type="text"
          value={editAltText}
          onChange={(event) => setEditAltText(event.target.value)}
          placeholder="Alt text"
        />
      </div>
      <div
        className={`${styles.editField} ${styles.semanticClassNames.editField}`}
      >
        <Captions
          className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
          size={14}
        />
        <input
          ref={captionInputRef}
          className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
          type="text"
          value={editCaption}
          onChange={(event) => setEditCaption(event.target.value)}
          placeholder="Caption (optional)"
        />
      </div>
      <div
        className={`${styles.editActions} ${styles.semanticClassNames.editActions}`}
      >
        <button
          className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton}`}
          type="button"
          onClick={commitMeta}
        >
          Save
        </button>
        <button
          className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton} ${styles.editActionButtonEnd} ${styles.semanticClassNames.editActionButtonEnd}`}
          type="button"
          onClick={() => setMetaOpen(false)}
        >
          Close
        </button>
      </div>
    </>
  )
}
