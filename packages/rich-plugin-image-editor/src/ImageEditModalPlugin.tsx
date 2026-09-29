import type { ImagePreprocessFn } from '@haklex/rich-editor/plugins';
import { useImagePreprocess } from '@haklex/rich-editor/plugins';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import type { ImageEditResult } from './ImageEditModal';
import { ImageEditModal } from './ImageEditModal';
import { ImageInsertSheet } from './ImageInsertSheet';
import type { ImageEditPrivacy } from './insert-sheet-model';
import { sheetCopy } from './insert-sheet-model';
import * as sheetCss from './sheet.css';
import * as css from './styles.css';

export interface ImageEditModalPluginProps {
  privacy?: ImageEditPrivacy;
}

export const ImageEditModalPlugin: FC<ImageEditModalPluginProps> = ({ privacy }) => {
  const preprocess = useImagePreprocess();
  const portalTheme = usePortalTheme();
  const portalThemeRef = useRef(portalTheme);
  portalThemeRef.current = portalTheme;
  const privacyRef = useRef(privacy);
  privacyRef.current = privacy;

  useEffect(() => {
    if (!preprocess) return;

    const openEditor = (file: File) =>
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

    const fn: ImagePreprocessFn = (files, { source }) =>
      new Promise<File[] | null>((resolve) => {
        let settled = false;
        const settle = (result: File[] | null) => {
          if (settled) return;
          settled = true;
          resolve(result);
        };

        const dismiss = presentDialog({
          className: sheetCss.sheetPopup,
          clickOutsideToDismiss: false,
          content: () => (
            <ImageInsertSheet
              files={files}
              privacy={privacyRef.current}
              source={source}
              onEdit={openEditor}
              onCancel={() => {
                settle(null);
                dismiss();
              }}
              onInsert={(result) => {
                settle(result);
                dismiss();
              }}
            />
          ),
          description: 'Check before it goes up. Nothing is uploaded yet.',
          // Esc / programmatic dismissal funnels through the dialog store's
          // open->closed transition; resolves the preprocess promise with null.
          onClose: () => settle(null),
          portalClassName: portalThemeRef.current.className,
          showCloseButton: false,
          theme: portalThemeRef.current.theme,
          title: sheetCopy(source, files.length).title,
        });
      });

    return preprocess.register(fn);
  }, [preprocess]);

  return null;
};
