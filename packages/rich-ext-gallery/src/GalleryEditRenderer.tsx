import { useImagePreprocess, useImageUpload } from '@haklex/rich-editor/plugins';
import { useColorScheme } from '@haklex/rich-editor/static';
import { confirmDiscardChanges, presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { ImageIcon, Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useCallback } from 'react';

import { GalleryEditorDialog } from './GalleryEditorDialog';
import { GalleryRenderer } from './GalleryRenderer';
import * as css from './styles.css';
import type { GalleryRendererProps } from './types';

export const GalleryEditRenderer: FC<GalleryRendererProps> = ({
  aspect,
  fit,
  images,
  layout,
  maxItemHeight,
  onAspectChange,
  onFitChange,
  onImagesChange,
  onLayoutChange,
  onMaxItemHeightChange,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const theme = useColorScheme();
  const uploader = useImageUpload();
  const preprocess = useImagePreprocess();

  const handleOpenEditor = useCallback(() => {
    if (!onImagesChange || !onLayoutChange) return;
    let dirty = false;
    const setDirty = (next: boolean) => {
      dirty = next;
    };
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <GalleryEditorDialog
          dismiss={dismiss}
          initialAspect={aspect ?? 'auto'}
          initialFit={fit ?? 'cover'}
          initialImages={images}
          initialLayout={layout}
          initialMaxItemHeight={maxItemHeight}
          preprocess={preprocess}
          requestDismiss={requestDismiss}
          uploader={uploader}
          onAspectChange={onAspectChange}
          onDirtyChange={setDirty}
          onFitChange={onFitChange}
          onImagesChange={onImagesChange}
          onLayoutChange={onLayoutChange}
          onMaxItemHeightChange={onMaxItemHeightChange}
        />
      ),
      className: css.galleryDialogPopup,
      portalClassName,
      theme,
      width: 896,
      sheet: 'auto',
      showCloseButton: false,
      confirmDismiss: () => !dirty || confirmDiscardChanges(),
    });
  }, [
    aspect,
    fit,
    images,
    layout,
    maxItemHeight,
    onAspectChange,
    onFitChange,
    onImagesChange,
    onLayoutChange,
    onMaxItemHeightChange,
    portalClassName,
    preprocess,
    theme,
    uploader,
  ]);

  if (!onImagesChange) {
    return (
      <GalleryRenderer
        aspect={aspect}
        fit={fit}
        images={images}
        layout={layout}
        maxItemHeight={maxItemHeight}
      />
    );
  }

  return (
    <div className={css.galleryEditContainer}>
      {images.length === 0 ? (
        <div className={css.galleryEmptyState}>
          <ImageIcon size={32} />
          <span>Empty gallery</span>
        </div>
      ) : (
        <GalleryRenderer
          aspect={aspect}
          fit={fit}
          images={images}
          layout={layout}
          maxItemHeight={maxItemHeight}
        />
      )}
      <button
        aria-label="Edit gallery"
        className={css.galleryEditOverlay}
        type="button"
        onClick={handleOpenEditor}
      >
        <span className={css.galleryEditLabel}>
          <Pencil size={16} />
          Edit gallery
        </span>
      </button>
    </div>
  );
};
