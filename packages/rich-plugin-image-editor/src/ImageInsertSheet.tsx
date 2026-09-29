import { MapPin } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { ImageEditResult } from './ImageEditModal';
import type { GpsInfo, ImageEditPrivacy, SheetRow } from './insert-sheet-model';
import { finalizeRows } from './insert-sheet-model';
import * as css from './sheet.css';
import { SheetRowItem } from './SheetRowItem';
import * as editorCss from './styles.css';
import { useEscapeDismissesTopDialog } from './useEscapeDismissesTopDialog';

export interface ImageInsertSheetProps {
  files: File[];
  onCancel: () => void;
  onEdit: (file: File) => Promise<ImageEditResult | null>;
  onInsert: (files: File[]) => void;
  privacy?: ImageEditPrivacy;
}

function mapUrl({ latitude, longitude }: { latitude: number; longitude: number }) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
}

function withDetectedGps(rows: SheetRow[], files: File[], found: (GpsInfo | null)[]) {
  return rows.map((row) => {
    const index = files.indexOf(row.original);
    return index === -1 ? row : { ...row, gps: found[index] ?? null };
  });
}

export const ImageInsertSheet: FC<ImageInsertSheetProps> = ({
  files,
  onCancel,
  onEdit,
  onInsert,
  privacy,
}) => {
  const [rows, setRows] = useState<SheetRow[]>(() =>
    files.map((file, index) => ({
      current: file,
      gps: null,
      id: `${index}-${file.name}`,
      original: file,
      summary: '',
    })),
  );
  const [removeGps, setRemoveGps] = useState(true);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [inserting, setInserting] = useState(false);
  useEscapeDismissesTopDialog();
  const detectionRef = useRef<Promise<(GpsInfo | null)[]>>(Promise.resolve([]));

  useEffect(() => {
    if (!privacy) return;
    let active = true;
    const detection = Promise.all(files.map((file) => privacy.detectGps(file).catch(() => null)));
    detectionRef.current = detection;
    void detection.then((found) => {
      if (active) setRows((current) => withDetectedGps(current, files, found));
    });
    return () => {
      active = false;
    };
  }, [files, privacy]);

  const gpsRows = rows.filter((row) => row.gps && row.current === row.original);
  const blocked = removeGps && failedIds.some((id) => gpsRows.some((row) => row.id === id));

  const handleRemove = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    if (next.length === 0) {
      onCancel();
      return;
    }
    setRows(next);
  };

  const handleEdit = async (target: SheetRow) => {
    const result = await onEdit(target.current);
    if (!result || result.file === target.current) return;
    setRows((current) =>
      current.map((row) =>
        row.id === target.id
          ? {
              ...row,
              current: result.file,
              summary: [row.summary, result.summary].filter(Boolean).join(' · '),
            }
          : row,
      ),
    );
  };

  const handleInsert = async () => {
    setInserting(true);
    const found = await detectionRef.current;
    const result = await finalizeRows(
      withDetectedGps(rows, files, found),
      removeGps,
      privacy?.stripGps,
    );
    setInserting(false);
    if (result.failedIds.length > 0) {
      setFailedIds(result.failedIds);
      return;
    }
    onInsert(result.files);
  };

  const single = rows.length === 1 ? gpsRows[0] : undefined;

  return (
    <div className={css.sheet}>
      <div className={css.rows}>
        {rows.map((row) => (
          <SheetRowItem
            failed={removeGps && failedIds.includes(row.id)}
            key={row.id}
            row={row}
            onEdit={() => void handleEdit(row)}
            onRemove={() => handleRemove(row.id)}
          />
        ))}
      </div>
      {gpsRows.length > 0 && (
        <div className={css.gpsPanel}>
          <div className={css.gpsHeading}>
            <MapPin aria-hidden color="#d97706" size={16} />
            {single
              ? 'This photo records where it was taken'
              : `${gpsRows.length} of ${rows.length} record where they were taken`}
          </div>
          {single?.gps && (
            <div className={css.gpsCoords}>
              <span>
                {single.gps.latitude.toFixed(4)}, {single.gps.longitude.toFixed(4)}
              </span>
              <a href={mapUrl(single.gps)} rel="noreferrer" target="_blank">
                View on map
              </a>
            </div>
          )}
          <label className={css.gpsToggle}>
            <input
              checked={removeGps}
              type="checkbox"
              onChange={(event) => setRemoveGps(event.currentTarget.checked)}
            />
            Remove location before upload
          </label>
        </div>
      )}
      <div className={css.footer}>
        <span className={css.hint}>
          {blocked
            ? 'Remove the flagged images or keep their location to continue'
            : 'Edited images drop all metadata'}
        </span>
        <button className={editorCss.ghostButton} type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          autoFocus
          className={editorCss.primaryButton}
          disabled={inserting || blocked}
          type="button"
          onClick={() => void handleInsert()}
        >
          {rows.length > 1 ? `Insert ${rows.length} images` : 'Insert'}
        </button>
      </div>
    </div>
  );
};
