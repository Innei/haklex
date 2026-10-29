import {
  type ImagePreprocessContextValue,
  type ImageUploadFn,
  resolvePreprocessTargets,
} from '@haklex/rich-editor/plugins';
import { toast } from '@haklex/rich-editor-ui';
import type { ChangeEvent, Dispatch, DragEvent as ReactDragEvent, SetStateAction } from 'react';
import { useCallback, useRef, useState } from 'react';

import type { ImageEntry } from './gallery-files';
import { extractImageFiles, fileToGalleryImage, genId } from './gallery-files';
import type { GalleryImage } from './types';

function uploadFailedTitle(count: number) {
  return count === 1 ? 'Couldn’t upload image' : `Couldn’t upload ${count} images`;
}

const hasFiles = (e: ReactDragEvent<HTMLElement>) => !!e.dataTransfer?.types.includes('Files');

export function useGalleryUpload({
  preprocess,
  uploader,
  setEntries,
  onAddUrl,
}: {
  preprocess: ImagePreprocessContextValue | null;
  uploader: ImageUploadFn | null;
  setEntries: Dispatch<SetStateAction<ImageEntry[]>>;
  onAddUrl: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropActive, setDropActive] = useState(false);
  const dragDepthRef = useRef(0);

  const appendFiles = useCallback(
    async (picked: File[]) => {
      const files = await resolvePreprocessTargets(
        picked,
        'gallery',
        preprocess?.ref.current ?? null,
      );
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
      const failed = results.filter((r) => !r?.src).length;
      if (failed) toast({ title: uploadFailedTitle(failed), tone: 'error' });
      const fresh = results
        .filter((r): r is GalleryImage => !!r && !!r.src)
        .map((image) => ({ id: genId(), image }));
      if (fresh.length) setEntries((prev) => [...prev, ...fresh]);
    },
    [preprocess, uploader, setEntries],
  );

  const replaceEntryFile = useCallback(
    async (index: number, picked: File) => {
      const [file] = await resolvePreprocessTargets(
        [picked],
        'gallery',
        preprocess?.ref.current ?? null,
      );
      if (!file) return;
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
        toast({ title: uploadFailedTitle(1), tone: 'error' });
      }
    },
    [preprocess, uploader, setEntries],
  );

  const handleAddImages = useCallback(() => {
    if (uploader) fileInputRef.current?.click();
    else onAddUrl();
  }, [uploader, onAddUrl]);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = extractImageFiles(e.target.files);
    e.target.value = '';
    if (files.length) void appendFiles(files);
  };

  const dropHandlers = {
    onDragEnter: (e: ReactDragEvent<HTMLDivElement>) => {
      if (!hasFiles(e)) return;
      dragDepthRef.current += 1;
      setDropActive(true);
    },
    onDragOver: (e: ReactDragEvent<HTMLDivElement>) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (e: ReactDragEvent<HTMLDivElement>) => {
      if (!hasFiles(e)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setDropActive(false);
    },
    onDrop: (e: ReactDragEvent<HTMLDivElement>) => {
      const files = extractImageFiles(e.dataTransfer?.files);
      dragDepthRef.current = 0;
      setDropActive(false);
      if (!files.length) return;
      e.preventDefault();
      void appendFiles(files);
    },
  };

  return {
    dropActive,
    dropHandlers,
    fileInputRef,
    handleAddImages,
    handleFileInputChange,
    replaceEntryFile,
  };
}
