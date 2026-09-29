import { MapPin, Pencil, X } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { SheetRow } from './insert-sheet-model';
import { formatBytes, isEditableImage } from './insert-sheet-model';
import * as css from './sheet.css';
import * as editorCss from './styles.css';

interface ImageInfo {
  height: number;
  url: string;
  width: number;
}

function useImageInfo(file: File): { failed: boolean; info: ImageInfo | null } {
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
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

export interface SheetRowItemProps {
  failed: boolean;
  onEdit: () => void;
  onRemove: () => void;
  row: SheetRow;
}

export const SheetRowItem: FC<SheetRowItemProps> = ({ failed, onEdit, onRemove, row }) => {
  const { failed: decodeFailed, info } = useImageInfo(row.current);
  const edited = row.current !== row.original;
  const editable = isEditableImage(row.current) && !decodeFailed;
  const type = row.current.type.replace('image/', '').toUpperCase();
  const meta = [
    info ? `${info.width} × ${info.height}` : null,
    formatBytes(row.current.size),
    type || null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={failed ? `${css.row} ${css.rowFailed}` : css.row}>
      {info ? <img alt="" className={css.thumb} src={info.url} /> : <div className={css.thumb} />}
      <div className={css.rowBody}>
        <div className={css.rowTitle}>
          <span className={css.fileName} title={row.original.name}>
            {row.original.name}
          </span>
          {edited && <span className={css.badge}>Edited</span>}
        </div>
        <span className={css.meta}>{meta}</span>
        {edited && row.summary && <span className={css.meta}>{row.summary}</span>}
        {!edited && row.gps && (
          <span className={css.gpsTag}>
            <MapPin aria-hidden size={13} />
            Has location
          </span>
        )}
        {!isEditableImage(row.current) && (
          <span className={css.meta}>Animated or vector — editing would flatten it</span>
        )}
        {failed && <span className={css.errorText}>Could not remove location from this image</span>}
      </div>
      <button
        className={editorCss.secondaryButton}
        disabled={!editable}
        type="button"
        onClick={onEdit}
      >
        <Pencil aria-hidden size={14} style={{ marginRight: 6 }} />
        {edited ? 'Re-edit' : 'Edit…'}
      </button>
      <button
        aria-label={`Remove ${row.original.name}`}
        className={css.iconButton}
        title="Remove"
        type="button"
        onClick={onRemove}
      >
        <X aria-hidden size={16} />
      </button>
    </div>
  );
};
