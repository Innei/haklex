import { confirmDiscardChanges, presentDialog } from '@haklex/rich-editor-ui';
import { useSyncExternalStore } from 'react';

import * as css from './image-dialog.css';
import type {
  ImageDialogEntry,
  ImageDialogMode,
  ImageEditorCapability,
} from './image-dialog-model';
import { IMAGE_DIALOG_WIDTH, imageDialogCopy } from './image-dialog-model';
import { ImageDialog } from './ImageDialog';

export type {
  GpsInfo,
  ImageDialogEntry,
  ImageDialogMode,
  ImageEditorCapability,
  ImageEditPrivacy,
} from './image-dialog-model';
export {
  getImageEditor,
  keepsOriginal,
  markKeepOriginal,
  registerImageEditor,
} from './image-dialog-model';
export { ImageDialog, type ImageDialogProps } from './ImageDialog';

export interface ImageDialogOptions {
  allowUrl?: boolean;
  editor?: ImageEditorCapability | null;
  files?: File[];
  mode?: ImageDialogMode;
  portalClassName?: string;
  theme?: 'light' | 'dark';
}

function createTitleStore(initial: string) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: string) => {
      if (next === value) return;
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

type TitleStore = ReturnType<typeof createTitleStore>;

function DialogTitleText({ store }: { store: TitleStore }) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function presentImageDialog({
  allowUrl = true,
  editor = null,
  files,
  mode = 'insert',
  portalClassName,
  theme,
}: ImageDialogOptions = {}): Promise<ImageDialogEntry[] | null> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (result: ImageDialogEntry[] | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    let dirty = false;
    const setDirty = (next: boolean) => {
      dirty = next;
    };
    const title = createTitleStore(imageDialogCopy(mode, files?.length ?? 1).title);

    presentDialog({
      className: css.popup,
      confirmDismiss: () => !dirty || confirmDiscardChanges(),
      onClose: () => settle(null),
      portalClassName,
      sheet: 'auto',
      theme,
      title: <DialogTitleText store={title} />,
      width: IMAGE_DIALOG_WIDTH,
      content: ({ dismiss, requestDismiss }) => (
        <ImageDialog
          allowUrl={allowUrl}
          editor={editor}
          initialFiles={files}
          mode={mode}
          onCancel={() => void requestDismiss()}
          onDirtyChange={setDirty}
          onTitleChange={title.set}
          onSubmit={(entries) => {
            settle(entries);
            dismiss();
          }}
        />
      ),
    });
  });
}
