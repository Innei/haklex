import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type ImageUploadFn, useImageUpload } from '@haklex/rich-editor/plugins';
import { useColorScheme } from '@haklex/rich-editor/static';
import { presentDialog, SegmentedControl } from '@haklex/rich-editor-ui';
import { usePortalTheme, vars } from '@haklex/rich-style-token';
import { GripVertical, ImageIcon, Images, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { CSSProperties, DragEvent as ReactDragEvent, FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { GalleryDialogSubHeader } from './GalleryDialogSubHeader';
import { GalleryRenderer } from './GalleryRenderer';
import { parseMaxItemHeightInput } from './maxItemHeight';
import * as css from './styles.css';
import type { GalleryAspect, GalleryFit, GalleryImage, GalleryRendererProps } from './types';

type LayoutType = 'grid' | 'masonry' | 'carousel';

const layoutItems = [
  { value: 'grid' as const, label: 'Grid' },
  { value: 'masonry' as const, label: 'Masonry' },
  { value: 'carousel' as const, label: 'Carousel' },
];

// ── ID helper ────────────────────────────────────────────────

let nextId = 0;
function genId() {
  return `img-${++nextId}`;
}

interface ImageEntry {
  id: string;
  image: GalleryImage;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

async function fileToGalleryImage(
  file: File,
  uploader: ImageUploadFn | null,
): Promise<GalleryImage> {
  if (uploader) {
    const result = await uploader(file);
    return { src: result.src, alt: result.altText ?? file.name };
  }
  return { src: await readAsDataUrl(file), alt: file.name };
}

function extractImageFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  const files: File[] = [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f && f.type.startsWith('image/')) files.push(f);
  }
  return files;
}

// ── SortableImageCard ────────────────────────────────────────

const SortableImageCard: FC<{
  id: string;
  image: GalleryImage;
  index: number;
  isLast: boolean;
  lastInputRef: React.RefObject<HTMLInputElement | null>;
  onUpdate: (index: number, field: keyof GalleryImage, value: string) => void;
  onRemove: (index: number) => void;
  onDropFile: (index: number, file: File) => void;
}> = ({ id, image, index, isLast, lastInputRef, onUpdate, onRemove, onDropFile }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [dropActive, setDropActive] = useState(false);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.4 : 1,
    outline: dropActive ? `2px dashed ${vars.color.accent}` : undefined,
    outlineOffset: dropActive ? 2 : undefined,
  };

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!dropActive) setDropActive(true);
  };
  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropActive(false);
  };
  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    const files = extractImageFiles(e.dataTransfer?.files);
    setDropActive(false);
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    onDropFile(index, files[0]);
  };

  return (
    <div
      className={css.galleryImageCard}
      ref={setNodeRef}
      style={style}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={css.galleryImageDragHandle} {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>

      <div className={css.galleryImageThumb} title="Drop an image here to replace">
        {image.src ? (
          <img alt={image.alt || ''} src={image.src} />
        ) : (
          <span className={css.galleryImageThumbPlaceholder}>
            <ImageIcon size={20} />
          </span>
        )}
      </div>

      <div className={css.galleryImageFields}>
        <input
          className={css.galleryImageInput}
          placeholder="Image URL"
          ref={isLast ? lastInputRef : undefined}
          type="text"
          value={image.src}
          onChange={(e) => onUpdate(index, 'src', e.target.value)}
        />
        <input
          className={css.galleryImageInput}
          placeholder="Alt text (optional)"
          type="text"
          value={image.alt || ''}
          onChange={(e) => onUpdate(index, 'alt', e.target.value)}
        />
      </div>

      <div className={css.galleryImageActions}>
        <button
          className={css.galleryImageDeleteBtn}
          title="Remove"
          type="button"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ── Drag overlay card ────────────────────────────────────────

const DragOverlayCard: FC<{ image: GalleryImage }> = ({ image }) => (
  <div className={css.galleryImageCard} style={{ opacity: 0.9 }}>
    <div className={css.galleryImageDragHandle}>
      <GripVertical size={14} />
    </div>
    <div className={css.galleryImageThumb}>
      {image.src ? (
        <img alt={image.alt || ''} src={image.src} />
      ) : (
        <span className={css.galleryImageThumbPlaceholder}>
          <ImageIcon size={20} />
        </span>
      )}
    </div>
    <div className={css.galleryImageFields}>
      <span
        style={{
          fontSize: vars.typography.fontSizeSm,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {image.src || 'No URL'}
      </span>
    </div>
  </div>
);

// ── Dialog content ───────────────────────────────────────────

const GalleryEditorDialogContent: FC<{
  dismiss: () => void;
  initialAspect: GalleryAspect;
  initialFit: GalleryFit;
  initialImages: GalleryImage[];
  initialLayout: LayoutType;
  initialMaxItemHeight: number | undefined;
  uploader: ImageUploadFn | null;
  onAspectChange?: (aspect: GalleryAspect) => void;
  onFitChange?: (fit: GalleryFit) => void;
  onImagesChange: (images: GalleryImage[]) => void;
  onLayoutChange: (layout: LayoutType) => void;
  onMaxItemHeightChange?: (maxItemHeight: number | undefined) => void;
}> = ({
  dismiss,
  initialAspect,
  initialFit,
  initialImages,
  initialLayout,
  initialMaxItemHeight,
  uploader,
  onAspectChange,
  onFitChange,
  onImagesChange,
  onLayoutChange,
  onMaxItemHeightChange,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const [entries, setEntries] = useState<ImageEntry[]>(() =>
    initialImages.map((img) => ({ id: genId(), image: { ...img } })),
  );
  const [layout, setLayout] = useState<LayoutType>(initialLayout);
  const [aspect, setAspect] = useState<GalleryAspect>(initialAspect);
  const [fit, setFit] = useState<GalleryFit>(initialFit);
  const [maxItemHeightInput, setMaxItemHeightInput] = useState(
    initialMaxItemHeight === undefined ? '' : String(initialMaxItemHeight),
  );
  const newInputRef = useRef<HTMLInputElement>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [bodyDropActive, setBodyDropActive] = useState(false);
  const dragDepthRef = useRef(0);

  const itemIds = entries.map((e) => e.id);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAddImage = useCallback(() => {
    setEntries((prev) => [...prev, { id: genId(), image: { src: '', alt: '' } }]);
    requestAnimationFrame(() => {
      newInputRef.current?.focus();
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const appendFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            return await fileToGalleryImage(file, uploader);
          } catch {
            return null;
          }
        }),
      );
      const fresh = results
        .filter((r): r is GalleryImage => !!r && !!r.src)
        .map((image) => ({ id: genId(), image }));
      if (fresh.length) setEntries((prev) => [...prev, ...fresh]);
    },
    [uploader],
  );

  const replaceEntryFile = useCallback(
    async (index: number, file: File) => {
      try {
        const next = await fileToGalleryImage(file, uploader);
        setEntries((prev) =>
          prev.map((entry, i) =>
            i === index
              ? { ...entry, image: { src: next.src, alt: next.alt || entry.image.alt || '' } }
              : entry,
          ),
        );
      } catch {
        // swallow upload errors
      }
    },
    [uploader],
  );

  const handleUpdateImage = useCallback(
    (index: number, field: keyof GalleryImage, value: string) => {
      setEntries((prev) =>
        prev.map((entry, i) =>
          i === index ? { ...entry, image: { ...entry.image, [field]: value } } : entry,
        ),
      );
    },
    [],
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDragActiveId(null);
    if (!over || active.id === over.id) return;
    setEntries((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === String(active.id));
      const newIndex = prev.findIndex((e) => e.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

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

  const dragActiveEntry = dragActiveId ? entries.find((e) => e.id === dragActiveId) : null;

  const handleBodyDragEnter = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    dragDepthRef.current += 1;
    setBodyDropActive(true);
  };
  const handleBodyDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  const handleBodyDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setBodyDropActive(false);
  };
  const handleBodyDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    const files = extractImageFiles(e.dataTransfer?.files);
    dragDepthRef.current = 0;
    setBodyDropActive(false);
    if (!files.length) return;
    e.preventDefault();
    void appendFiles(files);
  };

  return (
    <>
      {/* Header */}
      <div className={css.galleryDialogHeader}>
        <div className={css.galleryDialogTitle}>
          <Images size={18} />
          <span>Gallery Editor</span>
        </div>

        <div className={css.galleryHeaderActions}>
          <SegmentedControl items={layoutItems} value={layout} onChange={setLayout} />
        </div>

        <button className={css.galleryHeaderClose} type="button" onClick={dismiss}>
          <X size={18} />
        </button>
      </div>

      <GalleryDialogSubHeader
        aspect={aspect}
        fit={fit}
        layout={layout}
        maxItemHeightInput={maxItemHeightInput}
        onAspectChange={setAspect}
        onFitChange={setFit}
        onMaxItemHeightInputChange={setMaxItemHeightInput}
      />

      {/* Body */}
      <div
        className={css.galleryDialogBody}
        style={
          bodyDropActive
            ? {
                outline: `2px dashed ${vars.color.accent}`,
                outlineOffset: -8,
                borderRadius: 8,
              }
            : undefined
        }
        onDragEnter={handleBodyDragEnter}
        onDragLeave={handleBodyDragLeave}
        onDragOver={handleBodyDragOver}
        onDrop={handleBodyDrop}
      >
        {entries.length === 0 ? (
          <div className={css.galleryDialogEmpty}>
            <ImageIcon size={32} />
            <span>Add your first image or drop files here</span>
            <button
              className={css.galleryAddBtn}
              style={{ maxWidth: 200 }}
              type="button"
              onClick={handleAddImage}
            >
              <Plus size={14} />
              Add Image
            </button>
          </div>
        ) : (
          <div className={css.galleryImageList}>
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragCancel={() => setDragActiveId(null)}
              onDragEnd={handleDragEnd}
              onDragStart={(event) => {
                setDragActiveId(String(event.active.id));
              }}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {entries.map((entry, index) => (
                  <SortableImageCard
                    id={entry.id}
                    image={entry.image}
                    index={index}
                    isLast={index === entries.length - 1}
                    key={entry.id}
                    lastInputRef={newInputRef}
                    onDropFile={replaceEntryFile}
                    onRemove={handleRemoveImage}
                    onUpdate={handleUpdateImage}
                  />
                ))}
              </SortableContext>
              {typeof document !== 'undefined'
                ? createPortal(
                    <div className={portalClassName}>
                      <DragOverlay dropAnimation={null}>
                        {dragActiveEntry ? <DragOverlayCard image={dragActiveEntry.image} /> : null}
                      </DragOverlay>
                    </div>,
                    document.body,
                  )
                : null}
            </DndContext>

            <button className={css.galleryAddBtn} type="button" onClick={handleAddImage}>
              <Plus size={14} />
              Add Image
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={css.galleryDialogFooter}>
        <span className={css.galleryFooterInfo}>
          {`${entries.filter((e) => e.image.src.trim()).length} ${entries.filter((e) => e.image.src.trim()).length !== 1 ? 'images' : 'image'}`}
        </span>
        <div className={css.galleryFooterActions}>
          <button className={css.galleryFooterBtnCancel} type="button" onClick={dismiss}>
            Cancel
          </button>
          <button className={css.galleryFooterBtnSave} type="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

// ── Main component ───────────────────────────────────────────

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

  const handleOpenEditor = useCallback(() => {
    if (!onImagesChange || !onLayoutChange) return;
    presentDialog({
      content: ({ dismiss }) => (
        <GalleryEditorDialogContent
          dismiss={dismiss}
          initialAspect={aspect ?? 'auto'}
          initialFit={fit ?? 'cover'}
          initialImages={images}
          initialLayout={layout}
          initialMaxItemHeight={maxItemHeight}
          uploader={uploader}
          onAspectChange={onAspectChange}
          onFitChange={onFitChange}
          onImagesChange={onImagesChange}
          onLayoutChange={onLayoutChange}
          onMaxItemHeightChange={onMaxItemHeightChange}
        />
      ),
      className: css.galleryDialogPopup,
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
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

  if (images.length === 0) {
    return (
      <div className={css.galleryEditContainer}>
        <div className={css.galleryEmptyState}>
          <ImageIcon size={32} />
          <span>Empty gallery</span>
        </div>
        <button className={css.galleryEditOverlay} type="button" onClick={handleOpenEditor}>
          <span className={css.galleryEditLabel}>
            <Pencil size={16} />
            Edit Gallery
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={css.galleryEditContainer}>
      <GalleryRenderer
        aspect={aspect}
        fit={fit}
        images={images}
        layout={layout}
        maxItemHeight={maxItemHeight}
      />
      <button className={css.galleryEditOverlay} type="button" onClick={handleOpenEditor}>
        <span className={css.galleryEditLabel}>
          <Pencil size={16} />
          Edit Gallery
        </span>
      </button>
    </div>
  );
};
