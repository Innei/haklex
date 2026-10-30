import { ActionButton, AnimatedCheckbox } from '@haklex/rich-editor-ui';
import { Pencil, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import * as css from './image-dialog.css';
import type { FileRow, ReviewRow } from './image-dialog-model';
import { formatBytes, isEditableImage, urlFileName } from './image-dialog-model';

interface ImageInfo {
  height: number;
  url: string;
  width: number;
}

function useFileImageInfo(file: File): { failed: boolean; info: ImageInfo | null } {
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(file);
    let active = true;
    setFailed(false);
    const image = new Image();
    image.onload = () => {
      if (active) setInfo({ height: image.naturalHeight, url, width: image.naturalWidth });
    };
    image.onerror = () => {
      if (active) setFailed(true);
    };
    image.src = url;
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return { failed, info };
}

interface RowActionsProps {
  editLabel?: string;
  name: string;
  onEdit?: () => void;
  onRemove: () => void;
}

function RowActions({ editLabel = 'Edit', name, onEdit, onRemove }: RowActionsProps) {
  return (
    <>
      {onEdit && (
        <ActionButton size="sm" variant="outline" onClick={onEdit}>
          <Pencil aria-hidden size={14} />
          {editLabel}
        </ActionButton>
      )}
      <ActionButton icon aria-label={`Remove ${name}`} size="sm" title="Remove" onClick={onRemove}>
        <X aria-hidden size={16} />
      </ActionButton>
    </>
  );
}

interface FileRowItemProps {
  canEdit: boolean;
  failed: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleGps: (removeGps: boolean) => void;
  row: FileRow;
}

function FileRowItem({ canEdit, failed, onEdit, onRemove, onToggleGps, row }: FileRowItemProps) {
  const { failed: decodeFailed, info } = useFileImageInfo(row.current);
  const edited = row.current !== row.original;
  const editable = canEdit && isEditableImage(row.current) && !decodeFailed;
  const type = row.current.type.replace('image/', '').toUpperCase();
  const meta = [
    edited ? row.summary || null : null,
    info ? `${info.width} × ${info.height}` : null,
    formatBytes(row.current.size),
    edited ? null : type || null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={failed ? `${css.row} ${css.rowFailed}` : css.row} data-image-dialog-row="">
      {info ? <img alt="" className={css.thumb} src={info.url} /> : <div className={css.thumb} />}
      <div className={css.rowBody}>
        <div className={css.rowTitle}>
          <span className={css.fileName} title={row.original.name}>
            {row.original.name}
          </span>
          {edited && <span className={css.editedTag}>Edited</span>}
        </div>
        <span className={css.meta}>{meta}</span>
        {canEdit && !isEditableImage(row.current) && (
          <span className={css.meta}>Animated or vector — editing would flatten it</span>
        )}
        {!edited && row.gps && (
          <div className={css.locationRow}>
            <AnimatedCheckbox
              checked={row.removeGps}
              label="Remove GPS before upload"
              onChange={onToggleGps}
            />
          </div>
        )}
        {failed && <span className={css.errorText}>Could not remove location from this image</span>}
      </div>
      <RowActions
        editLabel={edited ? 'Re-edit' : 'Edit'}
        name={row.original.name}
        onEdit={editable ? onEdit : undefined}
        onRemove={onRemove}
      />
    </div>
  );
}

export interface ImageDialogReviewProps {
  canAddMore: boolean;
  canEdit: boolean;
  failedIds: string[];
  onAddMore: () => void;
  onEdit: (row: FileRow) => void;
  onRemove: (id: string) => void;
  onToggleGps: (id: string, removeGps: boolean) => void;
  rows: ReviewRow[];
}

export function ImageDialogReview({
  canAddMore,
  canEdit,
  failedIds,
  onAddMore,
  onEdit,
  onRemove,
  onToggleGps,
  rows,
}: ImageDialogReviewProps) {
  return (
    <>
      <div className={css.rows}>
        {rows.map((row) =>
          row.kind === 'file' ? (
            <FileRowItem
              canEdit={canEdit}
              failed={row.removeGps && failedIds.includes(row.id)}
              key={row.id}
              row={row}
              onEdit={() => onEdit(row)}
              onRemove={() => onRemove(row.id)}
              onToggleGps={(next) => onToggleGps(row.id, next)}
            />
          ) : (
            <div className={css.row} data-image-dialog-row="" key={row.id}>
              <img alt="" className={css.thumb} src={row.src} />
              <div className={css.rowBody}>
                <span className={css.fileName} title={row.src}>
                  {urlFileName(row.src)}
                </span>
                <span className={css.meta}>
                  {row.width} × {row.height} · from link
                </span>
              </div>
              <RowActions name={urlFileName(row.src)} onRemove={() => onRemove(row.id)} />
            </div>
          ),
        )}
      </div>
      {canAddMore && (
        <ActionButton className={css.addMore} size="md" variant="ghost" onClick={onAddMore}>
          <Plus aria-hidden size={14} />
          Add more
        </ActionButton>
      )}
    </>
  );
}
