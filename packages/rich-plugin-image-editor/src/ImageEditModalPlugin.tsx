import type { ImagePreprocessFn, ImagePreprocessResult } from '@haklex/rich-editor/plugins';
import { useImagePreprocess } from '@haklex/rich-editor/plugins';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { ImageEditModal } from './ImageEditModal';
import * as css from './styles.css';

export const ImageEditModalPlugin: FC = () => {
  const preprocess = useImagePreprocess();
  const portalTheme = usePortalTheme();
  const portalThemeRef = useRef(portalTheme);
  portalThemeRef.current = portalTheme;

  useEffect(() => {
    if (!preprocess) return;

    const fn: ImagePreprocessFn = (file) =>
      new Promise<ImagePreprocessResult>((resolve) => {
        let settled = false;
        const settle = (result: ImagePreprocessResult) => {
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
              onConfirm={(edited) => {
                settle(edited);
                dismiss();
              }}
              onSkip={() => {
                settle('skip');
                dismiss();
              }}
            />
          ),
          // Esc / backdrop dismissal funnels through the dialog store's
          // open->closed transition; resolves the preprocess promise with null.
          onClose: () => settle(null),
          portalClassName: portalThemeRef.current.className,
          showCloseButton: false,
          theme: portalThemeRef.current.theme,
        });
      });

    return preprocess.register(fn);
  }, [preprocess]);

  return null;
};
