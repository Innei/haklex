import type { ImageEditPrivacy, ImagePreprocessSource } from '@haklex/rich-editor/plugins';
import { ImageDialog } from '@haklex/rich-editor/plugins';
import type { FC } from 'react';
import { useMemo } from 'react';

import type { ImageEditResult } from './ImageEditModal';

export interface ImageInsertSheetProps {
  files: File[];
  onCancel: () => void;
  onEdit: (file: File) => Promise<ImageEditResult | null>;
  onInsert: (files: File[]) => void;
  privacy?: ImageEditPrivacy;
  source?: ImagePreprocessSource;
}

export const ImageInsertSheet: FC<ImageInsertSheetProps> = ({
  files,
  onCancel,
  onEdit,
  onInsert,
  privacy,
  source = 'paste',
}) => {
  const editor = useMemo(() => ({ edit: onEdit, privacy }), [onEdit, privacy]);

  return (
    <ImageDialog
      allowUrl={false}
      editor={editor}
      initialFiles={files}
      mode={source === 'replace' ? 'replace' : 'insert'}
      onCancel={onCancel}
      onSubmit={(entries) =>
        onInsert(entries.flatMap((entry) => (entry.kind === 'file' ? [entry.file] : [])))
      }
    />
  );
};
