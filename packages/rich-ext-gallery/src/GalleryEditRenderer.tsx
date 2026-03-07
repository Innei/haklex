import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { GalleryImage, GalleryRendererProps } from '@haklex/rich-editor'
import { useColorScheme } from '@haklex/rich-editor'
import { presentDialog, SegmentedControl } from '@haklex/rich-editor-ui'
import { usePortalTheme, vars } from '@haklex/rich-style-token'
import {
  GripVertical,
  ImageIcon,
  Images,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type { CSSProperties, FC } from 'react'
import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { GalleryRenderer } from './GalleryRenderer'
import * as css from './styles.css'

type LayoutType = 'grid' | 'masonry' | 'carousel'

const layoutItems = [
  { value: 'grid' as const, label: 'Grid' },
  { value: 'masonry' as const, label: 'Masonry' },
  { value: 'carousel' as const, label: 'Carousel' },
]

// ── ID helper ────────────────────────────────────────────────

let nextId = 0
function genId() {
  return `img-${++nextId}`
}

interface ImageEntry {
  id: string
  image: GalleryImage
}

// ── SortableImageCard ────────────────────────────────────────

const SortableImageCard: FC<{
  id: string
  image: GalleryImage
  index: number
  isLast: boolean
  lastInputRef: React.RefObject<HTMLInputElement | null>
  onUpdate: (index: number, field: keyof GalleryImage, value: string) => void
  onRemove: (index: number) => void
}> = ({ id, image, index, isLast, lastInputRef, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={css.galleryImageCard}>
      <div
        className={css.galleryImageDragHandle}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </div>

      <div className={css.galleryImageThumb}>
        {image.src ? (
          <img src={image.src} alt={image.alt || ''} />
        ) : (
          <span className={css.galleryImageThumbPlaceholder}>
            <ImageIcon size={20} />
          </span>
        )}
      </div>

      <div className={css.galleryImageFields}>
        <input
          ref={isLast ? lastInputRef : undefined}
          className={css.galleryImageInput}
          type="text"
          placeholder="Image URL"
          value={image.src}
          onChange={(e) => onUpdate(index, 'src', e.target.value)}
        />
        <input
          className={css.galleryImageInput}
          type="text"
          placeholder="Alt text (optional)"
          value={image.alt || ''}
          onChange={(e) => onUpdate(index, 'alt', e.target.value)}
        />
      </div>

      <div className={css.galleryImageActions}>
        <button
          type="button"
          className={css.galleryImageDeleteBtn}
          onClick={() => onRemove(index)}
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Drag overlay card ────────────────────────────────────────

const DragOverlayCard: FC<{ image: GalleryImage }> = ({ image }) => (
  <div className={css.galleryImageCard} style={{ opacity: 0.9 }}>
    <div className={css.galleryImageDragHandle}>
      <GripVertical size={14} />
    </div>
    <div className={css.galleryImageThumb}>
      {image.src ? (
        <img src={image.src} alt={image.alt || ''} />
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
)

// ── Dialog content ───────────────────────────────────────────

const GalleryEditorDialogContent: FC<{
  dismiss: () => void
  initialImages: GalleryImage[]
  initialLayout: LayoutType
  onImagesChange: (images: GalleryImage[]) => void
  onLayoutChange: (layout: LayoutType) => void
}> = ({
  dismiss,
  initialImages,
  initialLayout,
  onImagesChange,
  onLayoutChange,
}) => {
  const { className: portalClassName } = usePortalTheme()
  const [entries, setEntries] = useState<ImageEntry[]>(() =>
    initialImages.map((img) => ({ id: genId(), image: { ...img } })),
  )
  const [layout, setLayout] = useState<LayoutType>(initialLayout)
  const newInputRef = useRef<HTMLInputElement>(null)
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)

  const itemIds = entries.map((e) => e.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleAddImage = useCallback(() => {
    setEntries((prev) => [
      ...prev,
      { id: genId(), image: { src: '', alt: '' } },
    ])
    requestAnimationFrame(() => {
      newInputRef.current?.focus()
    })
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateImage = useCallback(
    (index: number, field: keyof GalleryImage, value: string) => {
      setEntries((prev) =>
        prev.map((entry, i) =>
          i === index
            ? { ...entry, image: { ...entry.image, [field]: value } }
            : entry,
        ),
      )
    },
    [],
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDragActiveId(null)
    if (!over || active.id === over.id) return
    setEntries((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === String(active.id))
      const newIndex = prev.findIndex((e) => e.id === String(over.id))
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const handleSave = useCallback(() => {
    const filtered = entries.map((e) => e.image).filter((img) => img.src.trim())
    onImagesChange(filtered)
    onLayoutChange(layout)
    dismiss()
  }, [entries, layout, onImagesChange, onLayoutChange, dismiss])

  const dragActiveEntry = dragActiveId
    ? entries.find((e) => e.id === dragActiveId)
    : null

  return (
    <>
      {/* Header */}
      <div className={css.galleryDialogHeader}>
        <div className={css.galleryDialogTitle}>
          <Images size={18} />
          <span>Gallery Editor</span>
        </div>

        <div className={css.galleryHeaderActions}>
          <SegmentedControl
            items={layoutItems}
            value={layout}
            onChange={setLayout}
          />
        </div>

        <button
          type="button"
          className={css.galleryHeaderClose}
          onClick={dismiss}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className={css.galleryDialogBody}>
        {entries.length === 0 ? (
          <div className={css.galleryDialogEmpty}>
            <ImageIcon size={32} />
            <span>Add your first image</span>
            <button
              type="button"
              className={css.galleryAddBtn}
              onClick={handleAddImage}
              style={{ maxWidth: 200 }}
            >
              <Plus size={14} />
              Add Image
            </button>
          </div>
        ) : (
          <div className={css.galleryImageList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => {
                setDragActiveId(String(event.active.id))
              }}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setDragActiveId(null)}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {entries.map((entry, index) => (
                  <SortableImageCard
                    key={entry.id}
                    id={entry.id}
                    image={entry.image}
                    index={index}
                    isLast={index === entries.length - 1}
                    lastInputRef={newInputRef}
                    onUpdate={handleUpdateImage}
                    onRemove={handleRemoveImage}
                  />
                ))}
              </SortableContext>
              {typeof document !== 'undefined'
                ? createPortal(
                    <div className={portalClassName}>
                      <DragOverlay dropAnimation={null}>
                        {dragActiveEntry ? (
                          <DragOverlayCard image={dragActiveEntry.image} />
                        ) : null}
                      </DragOverlay>
                    </div>,
                    document.body,
                  )
                : null}
            </DndContext>

            <button
              type="button"
              className={css.galleryAddBtn}
              onClick={handleAddImage}
            >
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
          <button
            type="button"
            className={css.galleryFooterBtnCancel}
            onClick={dismiss}
          >
            Cancel
          </button>
          <button
            type="button"
            className={css.galleryFooterBtnSave}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main component ───────────────────────────────────────────

export const GalleryEditRenderer: FC<GalleryRendererProps> = ({
  images,
  layout,
  onImagesChange,
  onLayoutChange,
}) => {
  const { className: portalClassName } = usePortalTheme()
  const theme = useColorScheme()

  const handleOpenEditor = useCallback(() => {
    if (!onImagesChange || !onLayoutChange) return
    presentDialog({
      content: ({ dismiss }) => (
        <GalleryEditorDialogContent
          dismiss={dismiss}
          initialImages={images}
          initialLayout={layout}
          onImagesChange={onImagesChange}
          onLayoutChange={onLayoutChange}
        />
      ),
      className: css.galleryDialogPopup,
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    })
  }, [images, layout, onImagesChange, onLayoutChange, portalClassName, theme])

  if (!onImagesChange) {
    return <GalleryRenderer images={images} layout={layout} />
  }

  if (images.length === 0) {
    return (
      <div className={css.galleryEditContainer}>
        <div className={css.galleryEmptyState}>
          <ImageIcon size={32} />
          <span>Empty gallery</span>
        </div>
        <button
          type="button"
          className={css.galleryEditOverlay}
          onClick={handleOpenEditor}
        >
          <span className={css.galleryEditLabel}>
            <Pencil size={16} />
            Edit Gallery
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className={css.galleryEditContainer}>
      <GalleryRenderer images={images} layout={layout} />
      <button
        type="button"
        className={css.galleryEditOverlay}
        onClick={handleOpenEditor}
      >
        <span className={css.galleryEditLabel}>
          <Pencil size={16} />
          Edit Gallery
        </span>
      </button>
    </div>
  )
}
