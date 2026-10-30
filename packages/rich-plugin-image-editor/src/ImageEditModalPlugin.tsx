import type {
  ImageEditorCapability,
  ImageEditPrivacy,
  ImagePreprocessFn,
} from '@haklex/rich-editor/plugins';
import {
  presentImageDialog,
  registerImageEditor,
  useImagePreprocess,
} from '@haklex/rich-editor/plugins';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import type { ImageEditResult } from './ImageEditModal';
import { ImageEditModal } from './ImageEditModal';
import * as css from './styles.css';

export interface ImageEditModalPluginProps {
  allowKeepOriginal?: boolean;
  privacy?: ImageEditPrivacy;
}

export const ImageEditModalPlugin: FC<ImageEditModalPluginProps> = ({
  allowKeepOriginal,
  privacy,
}) => {
  const preprocess = useImagePreprocess();
  const portalTheme = usePortalTheme();
  const portalThemeRef = useRef(portalTheme);
  portalThemeRef.current = portalTheme;
  const privacyRef = useRef(privacy);
  privacyRef.current = privacy;
  const allowKeepOriginalRef = useRef(allowKeepOriginal);
  allowKeepOriginalRef.current = allowKeepOriginal;

  useEffect(() => {
    if (!preprocess) return;

    const edit = (file: File) =>
      new Promise<ImageEditResult | null>((resolve) => {
        let settled = false;
        const settle = (result: ImageEditResult | null) => {
          if (settled) return;
          settled = true;
          resolve(result);
        };
        const dismiss = presentDialog({
          className: css.fullscreenPopup,
          content: () => (
            <ImageEditModal
              file={file}
              onCancel={() => {
                settle(null);
                dismiss();
              }}
              onConfirm={(result) => {
                settle(result);
                dismiss();
              }}
            />
          ),
          onClose: () => settle(null),
          portalClassName: portalThemeRef.current.className,
          showCloseButton: false,
          theme: portalThemeRef.current.theme,
        });
      });

    const capability: ImageEditorCapability = {
      get allowKeepOriginal() {
        return allowKeepOriginalRef.current;
      },
      edit,
      get privacy() {
        return privacyRef.current;
      },
    };

    const review: ImagePreprocessFn = async (files, { source }) => {
      const entries = await presentImageDialog({
        allowUrl: false,
        editor: capability,
        files,
        mode: source === 'replace' ? 'replace' : 'insert',
        portalClassName: portalThemeRef.current.className,
        theme: portalThemeRef.current.theme,
      });
      return entries?.flatMap((entry) => (entry.kind === 'file' ? [entry.file] : [])) ?? null;
    };

    const unregisterEditor = registerImageEditor(preprocess, capability);
    const unregisterReview = preprocess.register(review);
    return () => {
      unregisterReview();
      unregisterEditor();
    };
  }, [preprocess]);

  return null;
};
