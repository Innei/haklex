import { ActionButton, Field, Kbd, TextInput } from '@haklex/rich-editor-ui';
import { Upload } from 'lucide-react';
import type { DragEvent, KeyboardEvent } from 'react';
import { useEffect, useId, useState } from 'react';

import * as css from './image-dialog.css';
import { isImageFile, isSafeImageUrl, loadImageByUrl } from './image-dialog-model';

const PREVIEW_DEBOUNCE_MS = 300;

type UrlState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { height: number; status: 'loaded'; width: number };

function hasImageData(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;
  if ([...dataTransfer.files].some(isImageFile)) return true;
  return [...dataTransfer.items].some((item) => item.type.startsWith('image/'));
}

function useUrlPreview(url: string): UrlState {
  const [state, setState] = useState<UrlState>({ status: 'idle' });

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setState({ status: 'idle' });
      return;
    }
    if (!isSafeImageUrl(trimmed)) {
      setState({ message: 'Unsupported URL scheme', status: 'error' });
      return;
    }
    setState({ status: 'loading' });
    let active = true;
    const timer = setTimeout(() => {
      loadImageByUrl(trimmed).then(
        ({ height, width }) => {
          if (active) setState({ height, status: 'loaded', width });
        },
        () => {
          if (active) setState({ message: 'Could not load this image URL', status: 'error' });
        },
      );
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [url]);

  return state;
}

export interface ImageDialogSourceProps {
  allowUrl: boolean;
  onAddUrl: (entry: { height: number; src: string; width: number }) => void;
  onPickFiles: () => void;
  onReceiveFiles: (files: File[]) => void;
}

export function ImageDialogSource({
  allowUrl,
  onAddUrl,
  onPickFiles,
  onReceiveFiles,
}: ImageDialogSourceProps) {
  const urlId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const preview = useUrlPreview(url);
  const src = url.trim();

  const addUrl = () => {
    if (preview.status !== 'loaded') return;
    onAddUrl({ height: preview.height, src, width: preview.width });
    setUrl('');
  };

  const handleZoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onPickFiles();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!hasImageData(event.dataTransfer)) return;
    event.preventDefault();
    setDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const files = [...event.dataTransfer.files].filter(isImageFile);
    if (files.length > 0) onReceiveFiles(files);
  };

  const hint =
    preview.status === 'loaded'
      ? `Loaded · ${preview.width} × ${preview.height}`
      : preview.status === 'loading'
        ? 'Loading preview…'
        : undefined;

  return (
    <>
      <div
        aria-label="Drop images here or choose files"
        className={css.dropzone}
        data-drag-active={dragActive || undefined}
        role="button"
        tabIndex={0}
        onDragEnter={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={handleZoneKeyDown}
      >
        <span aria-hidden className={css.dropIcon}>
          <Upload size={18} />
        </span>
        <span className={css.dropTitle}>Drop images here</span>
        <ActionButton size="md" tabIndex={-1} variant="outline" onClick={onPickFiles}>
          Choose files
        </ActionButton>
        <span className={css.pasteHint}>
          or press <Kbd keys={['mod', 'v']} size="sm" /> to paste
        </span>
      </div>

      {allowUrl && (
        <>
          <div className={css.divider}>or from a link</div>
          <Field
            error={preview.status === 'error' ? preview.message : undefined}
            hint={hint}
            id={urlId}
            label="Image URL"
          >
            <div className={css.urlRow}>
              <TextInput
                className={css.urlInput}
                id={urlId}
                invalid={preview.status === 'error'}
                placeholder="https://example.com/image.jpg"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  addUrl();
                }}
              />
              {preview.status === 'loaded' && <img alt="" className={css.urlThumb} src={src} />}
              <ActionButton
                disabled={preview.status !== 'loaded'}
                size="md"
                variant="solid"
                onClick={addUrl}
              >
                Add
              </ActionButton>
            </div>
          </Field>
        </>
      )}
    </>
  );
}
