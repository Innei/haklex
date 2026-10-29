import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionButton, TextInput } from '@haklex/rich-editor-ui';
import { vars } from '@haklex/rich-style-token';
import { GripVertical, ImageIcon, Trash2 } from 'lucide-react';
import type { CSSProperties, DragEvent as ReactDragEvent, FC, RefObject } from 'react';
import { useState } from 'react';

import { extractImageFiles } from './gallery-files';
import * as css from './styles.css';
import type { GalleryImage } from './types';

const Thumb: FC<{ image: GalleryImage }> = ({ image }) => (
  <div className={css.galleryImageThumb} title="Drop an image here to replace">
    {image.src ? (
      <img alt={image.alt || ''} src={image.src} />
    ) : (
      <span className={css.galleryImageThumbPlaceholder}>
        <ImageIcon size={20} />
      </span>
    )}
  </div>
);

export const SortableImageCard: FC<{
  id: string;
  image: GalleryImage;
  index: number;
  isLast: boolean;
  lastInputRef: RefObject<HTMLInputElement | null>;
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
      <div
        aria-label="Reorder image"
        className={css.galleryImageDragHandle}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </div>

      <Thumb image={image} />

      <div className={css.galleryImageFields}>
        <TextInput
          aria-label="Image URL"
          placeholder="Image URL"
          ref={isLast ? lastInputRef : undefined}
          value={image.src}
          onChange={(e) => onUpdate(index, 'src', e.target.value)}
        />
        <TextInput
          aria-label="Alt text"
          placeholder="Alt text (optional)"
          value={image.alt || ''}
          onChange={(e) => onUpdate(index, 'alt', e.target.value)}
        />
      </div>

      <ActionButton
        danger
        icon
        aria-label="Remove image"
        size="md"
        title="Remove image"
        onClick={() => onRemove(index)}
      >
        <Trash2 />
      </ActionButton>
    </div>
  );
};

export const DragOverlayCard: FC<{ image: GalleryImage }> = ({ image }) => (
  <div className={`${css.galleryImageCard} ${css.galleryDragOverlay}`}>
    <div className={css.galleryImageDragHandle}>
      <GripVertical size={14} />
    </div>
    <Thumb image={image} />
    <div className={css.galleryImageFields}>
      <span className={css.galleryDragOverlayText}>{image.src || 'No URL'}</span>
    </div>
  </div>
);
