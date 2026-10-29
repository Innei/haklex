import type { ImagePreprocessContextValue, ImageUploadFn } from '@haklex/rich-editor/plugins';
import {
  ActionButton,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  SegmentedControl,
} from '@haklex/rich-editor-ui';
import { ImageIcon, Images, Link, Plus } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ImageEntry } from './gallery-files';
import { genId, imageCountLabel } from './gallery-files';
import { GalleryDialogSubHeader } from './GalleryDialogSubHeader';
import { GalleryImageList } from './GalleryImageList';
import { parseMaxItemHeightInput } from './maxItemHeight';
import * as css from './styles.css';
import type { GalleryAspect, GalleryFit, GalleryImage, GalleryLayout } from './types';
import { useGalleryUpload } from './useGalleryUpload';

const layoutItems = [
  { value: 'grid' as const, label: 'Grid' },
  { value: 'masonry' as const, label: 'Masonry' },
  { value: 'carousel' as const, label: 'Carousel' },
];

export interface GalleryEditorDialogProps {
  dismiss: () => void;
  initialAspect: GalleryAspect;
  initialFit: GalleryFit;
  initialImages: GalleryImage[];
  initialLayout: GalleryLayout;
  initialMaxItemHeight: number | undefined;
  onAspectChange?: (aspect: GalleryAspect) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onFitChange?: (fit: GalleryFit) => void;
  onImagesChange: (images: GalleryImage[]) => void;
  onLayoutChange: (layout: GalleryLayout) => void;
  onMaxItemHeightChange?: (maxItemHeight: number | undefined) => void;
  preprocess: ImagePreprocessContextValue | null;
  requestDismiss?: () => void;
  uploader: ImageUploadFn | null;
}

export const GalleryEditorDialog: FC<GalleryEditorDialogProps> = ({
  dismiss,
  requestDismiss,
  initialAspect,
  initialFit,
  initialImages,
  initialLayout,
  initialMaxItemHeight,
  preprocess,
  uploader,
  onAspectChange,
  onDirtyChange,
  onFitChange,
  onImagesChange,
  onLayoutChange,
  onMaxItemHeightChange,
}) => {
  const [entries, setEntries] = useState<ImageEntry[]>(() =>
    initialImages.map((img) => ({ id: genId(), image: { ...img } })),
  );
  const [layout, setLayout] = useState<GalleryLayout>(initialLayout);
  const [aspect, setAspect] = useState<GalleryAspect>(initialAspect);
  const [fit, setFit] = useState<GalleryFit>(initialFit);
  const initialMaxItemHeightInput =
    initialMaxItemHeight === undefined ? '' : String(initialMaxItemHeight);
  const [maxItemHeightInput, setMaxItemHeightInput] = useState(initialMaxItemHeightInput);
  const newInputRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(
    () =>
      layout !== initialLayout ||
      aspect !== initialAspect ||
      fit !== initialFit ||
      maxItemHeightInput !== initialMaxItemHeightInput ||
      JSON.stringify(entries.map((e) => e.image)) !== JSON.stringify(initialImages),
    [
      entries,
      layout,
      aspect,
      fit,
      maxItemHeightInput,
      initialImages,
      initialLayout,
      initialAspect,
      initialFit,
      initialMaxItemHeightInput,
    ],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const imageCount = entries.filter((e) => e.image.src.trim()).length;

  const handleAddUrl = useCallback(() => {
    setEntries((prev) => [...prev, { id: genId(), image: { src: '', alt: '' } }]);
    requestAnimationFrame(() => {
      newInputRef.current?.focus();
    });
  }, []);

  const {
    dropActive,
    dropHandlers,
    fileInputRef,
    handleAddImages,
    handleFileInputChange,
    replaceEntryFile,
  } = useGalleryUpload({ preprocess, uploader, setEntries, onAddUrl: handleAddUrl });

  const handleSave = useCallback(() => {
    const filtered = entries.map((e) => e.image).filter((img) => img.src.trim());
    onImagesChange(filtered);
    onLayoutChange(layout);
    onAspectChange?.(aspect);
    onFitChange?.(fit);
    onMaxItemHeightChange?.(parseMaxItemHeightInput(maxItemHeightInput));
    dismiss();
  }, [
    entries,
    layout,
    aspect,
    fit,
    maxItemHeightInput,
    onImagesChange,
    onLayoutChange,
    onAspectChange,
    onFitChange,
    onMaxItemHeightChange,
    dismiss,
  ]);

  const handleCancel = requestDismiss ?? dismiss;

  const addActions = (
    <div className={css.galleryAddActions}>
      <ActionButton size="md" variant="outline" onClick={handleAddImages}>
        <Plus />
        Add images
      </ActionButton>
      {uploader && (
        <ActionButton size="md" onClick={handleAddUrl}>
          <Link />
          Add URL
        </ActionButton>
      )}
    </div>
  );

  return (
    <ModalShell onSave={handleSave}>
      <ModalShellHeader
        center={<SegmentedControl items={layoutItems} value={layout} onChange={setLayout} />}
        icon={<Images />}
        title="Gallery"
        onClose={handleCancel}
      />

      <GalleryDialogSubHeader
        aspect={aspect}
        fit={fit}
        layout={layout}
        maxItemHeightInput={maxItemHeightInput}
        onAspectChange={setAspect}
        onFitChange={setFit}
        onMaxItemHeightInputChange={setMaxItemHeightInput}
      />

      <ModalShellBody className={css.galleryDialogBody}>
        <div
          className={css.galleryDropZone}
          data-drop-active={dropActive || undefined}
          {...dropHandlers}
        >
          <input
            hidden
            multiple
            accept="image/*"
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
            onChange={handleFileInputChange}
          />
          {entries.length === 0 ? (
            <div className={css.galleryDialogEmpty}>
              <ImageIcon size={32} />
              <span>Add images or drop files here</span>
              {addActions}
            </div>
          ) : (
            <GalleryImageList
              entries={entries}
              lastInputRef={newInputRef}
              setEntries={setEntries}
              onDropFile={replaceEntryFile}
            >
              {addActions}
            </GalleryImageList>
          )}
        </div>
      </ModalShellBody>

      <ModalShellFooter
        dirty={dirty}
        status={imageCountLabel(imageCount)}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </ModalShell>
  );
};
