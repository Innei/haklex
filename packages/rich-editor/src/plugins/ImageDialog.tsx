import { ActionButton, AnimatedCheckbox, Kbd } from '@haklex/rich-editor-ui';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import * as css from './image-dialog.css';
import type {
  FileRow,
  GpsInfo,
  ImageDialogEntry,
  ImageDialogMode,
  ImageEditorCapability,
  ReviewRow,
} from './image-dialog-model';
import {
  finalizeRows,
  IMAGE_FORMATS_HINT,
  imageDialogCopy,
  isImageFile,
  markKeepOriginal,
} from './image-dialog-model';
import { ImageDialogReview } from './ImageDialogReview';
import { ImageDialogSource } from './ImageDialogSource';

export interface ImageDialogProps {
  allowUrl?: boolean;
  editor?: ImageEditorCapability | null;
  initialFiles?: File[];
  mode?: ImageDialogMode;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmit: (entries: ImageDialogEntry[]) => void;
  onTitleChange?: (title: string) => void;
}

let rowCounter = 0;

function toFileRow(file: File): FileRow {
  return {
    current: file,
    gps: null,
    id: `image-row-${++rowCounter}`,
    kind: 'file',
    original: file,
    removeGps: true,
    summary: '',
  };
}

function initialRows(files: File[] | undefined, mode: ImageDialogMode): ReviewRow[] {
  const images = (files ?? []).filter(isImageFile);
  return (mode === 'replace' ? images.slice(0, 1) : images).map(toFileRow);
}

function withGps(rows: ReviewRow[], found: Map<string, GpsInfo | null>): ReviewRow[] {
  return rows.map((row) =>
    row.kind === 'file' && found.has(row.id) ? { ...row, gps: found.get(row.id) ?? null } : row,
  );
}

export function ImageDialog({
  allowUrl = true,
  editor = null,
  initialFiles,
  mode = 'insert',
  onCancel,
  onDirtyChange,
  onSubmit,
  onTitleChange,
}: ImageDialogProps) {
  const startedWithFiles = Boolean(initialFiles?.some(isImageFile));
  const [rows, setRows] = useState<ReviewRow[]>(() => initialRows(initialFiles, mode));
  const [step, setStep] = useState<'source' | 'review'>(startedWithFiles ? 'review' : 'source');
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [inserting, setInserting] = useState(false);
  const [keepOriginal, setKeepOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detections = useRef(new Map<string, Promise<GpsInfo | null>>());
  const privacy = editor?.privacy;
  const copy = imageDialogCopy(mode, step === 'review' ? rows.length : 1);
  const dirty =
    rows.some((row) => row.kind === 'file' && row.current !== row.original) ||
    (!startedWithFiles && rows.length > 0);

  useEffect(() => {
    onTitleChange?.(copy.title);
  }, [copy.title, onTitleChange]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!privacy) return;
    for (const row of rows) {
      if (row.kind !== 'file' || detections.current.has(row.id)) continue;
      const detection = privacy.detectGps(row.original).catch(() => null);
      detections.current.set(row.id, detection);
      void detection.then((gps) => {
        setRows((current) => withGps(current, new Map([[row.id, gps]])));
      });
    }
  }, [privacy, rows]);

  const addFiles = (files: File[]) => {
    const images = files.filter(isImageFile);
    if (images.length === 0) return;
    setFailedIds([]);
    setRows((current) =>
      mode === 'replace' ? [toFileRow(images[0])] : [...current, ...images.map(toFileRow)],
    );
    setStep('review');
  };

  const addUrl = (entry: { height: number; src: string; width: number }) => {
    const row: ReviewRow = { ...entry, id: `image-row-${++rowCounter}`, kind: 'url' };
    setRows((current) => (mode === 'replace' ? [row] : [...current, row]));
    setStep('review');
  };

  const removeRow = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    setRows(next);
    if (next.length > 0) return;
    if (startedWithFiles) onCancel();
    else setStep('source');
  };

  const editRow = async (target: FileRow) => {
    if (!editor) return;
    const result = await editor.edit(target.current);
    if (!result || result.file === target.current) return;
    setRows((current) =>
      current.map((row) =>
        row.id === target.id && row.kind === 'file'
          ? {
              ...row,
              current: result.file,
              summary: [row.summary, result.summary].filter(Boolean).join(' · '),
            }
          : row,
      ),
    );
  };

  const toggleGps = (id: string, removeGps: boolean) => {
    setRows((current) =>
      current.map((row) => (row.id === id && row.kind === 'file' ? { ...row, removeGps } : row)),
    );
  };

  const blocked = failedIds.some((id) =>
    rows.some(
      (row) =>
        row.id === id &&
        row.kind === 'file' &&
        row.removeGps &&
        row.gps &&
        row.current === row.original,
    ),
  );

  const insert = async () => {
    if (inserting || blocked || rows.length === 0) return;
    setInserting(true);
    const ids = [...detections.current.keys()];
    const found = await Promise.all(ids.map((id) => detections.current.get(id)!));
    const merged = withGps(rows, new Map(ids.map((id, index) => [id, found[index]])));
    const result = await finalizeRows(merged, privacy?.stripGps);
    setInserting(false);
    if (result.failedIds.length > 0) {
      setRows(merged);
      setFailedIds(result.failedIds);
      return;
    }
    if (keepOriginal) {
      for (const entry of result.entries) {
        if (entry.kind === 'file') markKeepOriginal(entry.file);
      }
    }
    onSubmit(result.entries);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (step !== 'review' || event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    void insert();
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const files = [...(event.clipboardData?.files ?? [])].filter(isImageFile);
    if (files.length === 0) return;
    event.preventDefault();
    addFiles(files);
  };

  const pickFiles = () => fileInputRef.current?.click();

  return (
    <div className={css.root} onKeyDown={handleKeyDown} onPaste={handlePaste}>
      <input
        accept="image/*"
        className={css.hiddenInput}
        multiple={mode !== 'replace'}
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          addFiles([...(event.currentTarget.files ?? [])]);
          event.currentTarget.value = '';
        }}
      />
      <div className={css.body}>
        {step === 'source' ? (
          <ImageDialogSource
            allowUrl={allowUrl}
            onAddUrl={addUrl}
            onPickFiles={pickFiles}
            onReceiveFiles={addFiles}
          />
        ) : (
          <ImageDialogReview
            canAddMore={mode !== 'replace'}
            canEdit={Boolean(editor)}
            failedIds={failedIds}
            rows={rows}
            onAddMore={pickFiles}
            onEdit={(row) => void editRow(row)}
            onRemove={removeRow}
            onToggleGps={toggleGps}
          />
        )}
        {step === 'review' &&
          editor?.allowKeepOriginal &&
          rows.some((row) => row.kind === 'file') && (
            <div className={css.keepOriginal}>
              <AnimatedCheckbox
                checked={keepOriginal}
                label="Keep original (skip compression)"
                onChange={setKeepOriginal}
              />
            </div>
          )}
      </div>
      <div className={css.footer}>
        {step === 'source' ? (
          <>
            <span className={css.footerHint}>{IMAGE_FORMATS_HINT}</span>
            {rows.length > 0 && (
              <ActionButton size="md" variant="outline" onClick={() => setStep('review')}>
                Continue
              </ActionButton>
            )}
          </>
        ) : (
          <>
            <span className={blocked ? css.errorHint : css.footerHint}>
              {blocked
                ? 'Keep the location or remove the flagged images to continue'
                : 'Nothing is uploaded until you insert'}
            </span>
            {startedWithFiles ? (
              <ActionButton size="md" variant="outline" onClick={onCancel}>
                Cancel
              </ActionButton>
            ) : (
              <ActionButton size="md" variant="outline" onClick={() => setStep('source')}>
                Back
              </ActionButton>
            )}
            <ActionButton
              autoFocus
              disabled={inserting || blocked}
              size="md"
              variant="solid"
              onClick={() => void insert()}
            >
              {copy.action}
              <Kbd keys={['mod', 'enter']} size="sm" tone="inverted" />
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
}
