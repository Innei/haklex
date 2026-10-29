import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePortalTheme } from '@haklex/rich-style-token';
import type { Dispatch, FC, ReactNode, RefObject, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ImageEntry } from './gallery-files';
import { DragOverlayCard, SortableImageCard } from './GalleryImageCard';
import * as css from './styles.css';
import type { GalleryImage } from './types';

export const GalleryImageList: FC<{
  children?: ReactNode;
  entries: ImageEntry[];
  lastInputRef: RefObject<HTMLInputElement | null>;
  setEntries: Dispatch<SetStateAction<ImageEntry[]>>;
  onDropFile: (index: number, file: File) => void;
}> = ({ children, entries, lastInputRef, setEntries, onDropFile }) => {
  const { className: portalClassName } = usePortalTheme();
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleRemove = useCallback(
    (index: number) => {
      setEntries((prev) => prev.filter((_, i) => i !== index));
    },
    [setEntries],
  );

  const handleUpdate = useCallback(
    (index: number, field: keyof GalleryImage, value: string) => {
      setEntries((prev) =>
        prev.map((entry, i) =>
          i === index ? { ...entry, image: { ...entry.image, [field]: value } } : entry,
        ),
      );
    },
    [setEntries],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDragActiveId(null);
      if (!over || active.id === over.id) return;
      setEntries((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === String(active.id));
        const newIndex = prev.findIndex((e) => e.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [setEntries],
  );

  const dragActiveEntry = dragActiveId ? entries.find((e) => e.id === dragActiveId) : null;

  return (
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
        <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {entries.map((entry, index) => (
            <SortableImageCard
              id={entry.id}
              image={entry.image}
              index={index}
              isLast={index === entries.length - 1}
              key={entry.id}
              lastInputRef={lastInputRef}
              onDropFile={onDropFile}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
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
      {children}
    </div>
  );
};
