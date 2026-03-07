import { ActionBar, ActionButton, SegmentedControl } from '@haklex/rich-editor-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { ImageIcon, Loader2, Upload } from 'lucide-react';

import {
  fileInputRefAtom,
  replaceErrorAtom,
  replaceLoadingAtom,
  type ReplaceMode,
  replaceModeAtom,
  replacePreviewAtom,
  replaceUrlAtom,
} from './atoms';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

const replaceModeItems: Array<{ value: ReplaceMode; label: string }> = [
  { value: 'upload', label: 'Upload' },
  { value: 'url', label: 'URL' },
];

export function ReplacePanel() {
  const replaceMode = useAtomValue(replaceModeAtom);
  const setReplaceMode = useSetAtom(replaceModeAtom);
  const replaceUrl = useAtomValue(replaceUrlAtom);
  const setReplaceUrl = useSetAtom(replaceUrlAtom);
  const replacePreview = useAtomValue(replacePreviewAtom);
  const replaceError = useAtomValue(replaceErrorAtom);
  const replaceLoading = useAtomValue(replaceLoadingAtom);
  const fileInputRef = useAtomValue(fileInputRefAtom);
  const { handleReplaceFile, handlePreviewUrl, handleReplaceByUrl } = useImageActions();

  return (
    <>
      <SegmentedControl
        fullWidth
        items={replaceModeItems}
        value={replaceMode}
        onChange={setReplaceMode}
      />

      {replaceMode === 'upload' ? (
        <>
          <input
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] ?? null;
              void handleReplaceFile(file);
              event.currentTarget.value = '';
            }}
          />
          <button
            className={`${styles.replaceUploadArea} ${styles.semanticClassNames.replaceUploadArea}`}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            {replaceLoading ? (
              <>
                <Loader2 size={16} />
                <span>Uploading image...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Click to upload image</span>
              </>
            )}
          </button>
        </>
      ) : (
        <>
          <div className={`${styles.editField} ${styles.semanticClassNames.editField}`}>
            <ImageIcon
              className={`${styles.editFieldIcon} ${styles.semanticClassNames.editFieldIcon}`}
              size={14}
            />
            <input
              className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
              placeholder="https://example.com/image.jpg"
              type="url"
              value={replaceUrl}
              onChange={(event) => setReplaceUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handlePreviewUrl();
                }
              }}
            />
          </div>
          <ActionBar>
            <ActionButton
              disabled={replaceLoading || !replaceUrl.trim()}
              onClick={handlePreviewUrl}
            >
              Preview
            </ActionButton>
            <ActionButton disabled={!replacePreview} variant="accent" onClick={handleReplaceByUrl}>
              Apply
            </ActionButton>
          </ActionBar>
        </>
      )}

      {replaceError && (
        <span className={`${styles.panelHint} ${styles.semanticClassNames.panelHint}`}>
          {replaceError}
        </span>
      )}

      {replacePreview && (
        <div className={`${styles.replacePreview} ${styles.semanticClassNames.replacePreview}`}>
          <img alt="Replace preview" src={replacePreview} />
        </div>
      )}
    </>
  );
}
