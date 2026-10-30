import { usePortalTheme } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import {
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  type LexicalEditor,
  PASTE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import { useEditorBlock } from '../context/EditorBlockContext';
import { useImagePreprocess } from '../context/ImagePreprocessContext';
import { $createImageNode } from '../nodes/ImageNode';
import { $withAdaptiveImageDisplayWidth } from '../utils/image-insertion';
import { resolvePreprocessTargets } from '../utils/image-preprocess';
import { computeImageMeta } from '../utils/thumbhash';
import { getImageEditor, isImageFile, keepsOriginal } from './image-dialog-model';
import * as css from './image-upload.css';
import { OPEN_IMAGE_UPLOAD_DIALOG_COMMAND } from './image-upload-command';
import { reportImageUploads } from './image-upload-toast';
import { $insertAtCursor, type InsertionCursor, readInsertionCursor } from './insertion-cursor';
import { presentImageDialog } from './present-image-dialog';

export interface ImageUploadResult {
  altText?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export interface ImageUploadOptions {
  keepOriginal?: boolean;
}

export type ImageUploadFn = (
  file: File,
  options?: ImageUploadOptions,
) => Promise<ImageUploadResult>;

export function uploadImageFile(upload: ImageUploadFn, file: File): Promise<ImageUploadResult> {
  return keepsOriginal(file) ? upload(file, { keepOriginal: true }) : upload(file);
}

function hasImageData(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;

  if ([...dataTransfer.files].some(isImageFile)) return true;
  return [...dataTransfer.items].some((item) => item.type.startsWith('image/'));
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export async function defaultImageUpload(file: File): Promise<ImageUploadResult> {
  return {
    src: await readAsDataUrl(file),
    altText: file.name,
  };
}

interface ImageUploadPluginProps {
  onUpload: ImageUploadFn;
}

export function ImageUploadPlugin({ onUpload }: ImageUploadPluginProps) {
  const block = useEditorBlock();
  const blockRef = useRef(block);
  blockRef.current = block;
  const [editor] = useLexicalComposerContext();
  const uploadRef = useRef(onUpload);
  uploadRef.current = onUpload;
  const preprocessContext = useImagePreprocess();
  const preprocessContextRef = useRef(preprocessContext);
  preprocessContextRef.current = preprocessContext;
  const portalTheme = usePortalTheme();
  const portalThemeRef = useRef(portalTheme);
  portalThemeRef.current = portalTheme;

  const uploadAndInsert = useCallback(
    async (file: File, target: LexicalEditor, cursor: InsertionCursor, after: Promise<unknown>) => {
      const release = blockRef.current?.retain();
      try {
        const [result, meta] = await Promise.all([
          uploadImageFile(uploadRef.current, file),
          computeImageMeta(file),
        ]);
        await after;
        target.update(() => {
          $insertAtCursor(cursor, [
            $createImageNode(
              $withAdaptiveImageDisplayWidth({
                src: result.src,
                altText: result.altText ?? file.name,
                width: result.width ?? meta.width,
                height: result.height ?? meta.height,
                thumbhash: result.thumbhash ?? meta.thumbhash,
              }),
            ),
          ]);
        });
      } finally {
        queueMicrotask(() => release?.());
      }
    },
    [],
  );

  const uploadFiles = useCallback(
    (files: File[], target: LexicalEditor, cursor: InsertionCursor) =>
      reportImageUploads(files, async (batch) => {
        let previous: Promise<unknown> = Promise.resolve();
        const results = batch.map((file) => {
          const current = uploadAndInsert(
            file,
            target,
            cursor,
            previous.catch(() => {}),
          );
          previous = current;
          return current;
        });
        const settled = await Promise.allSettled(results);
        return batch.filter((_, index) => {
          const outcome = settled[index];
          if (outcome.status === 'fulfilled') return false;
          console.error('[ImageUploadPlugin]', outcome.reason);
          return true;
        });
      }),
    [uploadAndInsert],
  );

  const handleFiles = useCallback(
    (files: File[], source: 'drop' | 'paste', target: LexicalEditor): boolean => {
      const images = files.filter(isImageFile);
      if (images.length === 0) return false;
      const cursor = readInsertionCursor(editor, target);

      void (async () => {
        const release = blockRef.current?.retain();
        try {
          const preprocess = preprocessContextRef.current?.ref.current ?? null;
          const targets = await resolvePreprocessTargets(images, source, preprocess);
          if (targets.length > 0) await uploadFiles(targets, target, cursor);
        } finally {
          queueMicrotask(() => release?.());
        }
      })();
      return true;
    },
    [editor, uploadFiles],
  );

  const openDialog = useCallback(
    async (target: LexicalEditor, cursor: InsertionCursor) => {
      const release = blockRef.current?.retain();
      try {
        const scope = preprocessContextRef.current;
        const imageEditor = getImageEditor(scope);
        const entries = await presentImageDialog({
          editor: imageEditor,
          portalClassName: portalThemeRef.current.className,
          theme: portalThemeRef.current.theme,
        });
        if (!entries) return;

        const urls = entries.flatMap((entry) => (entry.kind === 'url' ? [entry] : []));
        if (urls.length > 0) {
          target.update(() => {
            $insertAtCursor(
              cursor,
              urls.map((entry) =>
                $createImageNode(
                  $withAdaptiveImageDisplayWidth({
                    src: entry.src,
                    altText: '',
                    width: entry.width,
                    height: entry.height,
                  }),
                ),
              ),
            );
          });
        }

        const picked = entries.flatMap((entry) => (entry.kind === 'file' ? [entry.file] : []));
        const files = imageEditor
          ? picked
          : await resolvePreprocessTargets(picked, 'dialog', scope?.ref.current ?? null);
        if (files.length > 0) await uploadFiles(files, target, cursor);
      } finally {
        queueMicrotask(() => release?.());
      }
    },
    [uploadFiles],
  );

  useEffect(() => {
    const unregisterDragDrop = editor.registerCommand(
      DRAG_DROP_PASTE,
      (files: File[], fromEditor) => handleFiles(files, 'drop', fromEditor),
      COMMAND_PRIORITY_HIGH,
    );

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | InputEvent | KeyboardEvent, fromEditor) => {
        const clipboardData =
          'clipboardData' in event ? (event as ClipboardEvent).clipboardData : null;
        if (!clipboardData) return false;

        const files = [...clipboardData.files];
        if (files.some(isImageFile)) {
          return handleFiles(files, 'paste', fromEditor);
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregisterOpenDialog = editor.registerCommand(
      OPEN_IMAGE_UPLOAD_DIALOG_COMMAND,
      (_payload, fromEditor) => {
        void openDialog(fromEditor, readInsertionCursor(editor, fromEditor));
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const rootElement = editor.getRootElement();
    const wrapper = rootElement?.parentElement ?? null;
    if (!rootElement || !wrapper) {
      return () => {
        unregisterDragDrop();
        unregisterPaste();
        unregisterOpenDialog();
      };
    }

    let dragCounter = 0;

    const onDragEnter = (event: DragEvent) => {
      if (!hasImageData(event.dataTransfer)) return;
      dragCounter += 1;
      wrapper.classList.add(css.draggingWrapperClass);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasImageData(event.dataTransfer)) return;
      event.preventDefault();
    };

    const onDragLeave = () => {
      dragCounter = Math.max(dragCounter - 1, 0);
      if (dragCounter === 0) wrapper.classList.remove(css.draggingWrapperClass);
    };

    const onDrop = () => {
      dragCounter = 0;
      wrapper.classList.remove(css.draggingWrapperClass);
    };

    rootElement.addEventListener('dragenter', onDragEnter);
    rootElement.addEventListener('dragover', onDragOver);
    rootElement.addEventListener('dragleave', onDragLeave);
    rootElement.addEventListener('drop', onDrop);

    return () => {
      unregisterDragDrop();
      unregisterPaste();
      unregisterOpenDialog();
      wrapper.classList.remove(css.draggingWrapperClass);
      rootElement.removeEventListener('dragenter', onDragEnter);
      rootElement.removeEventListener('dragover', onDragOver);
      rootElement.removeEventListener('dragleave', onDragLeave);
      rootElement.removeEventListener('drop', onDrop);
    };
  }, [editor, handleFiles, openDialog]);

  return null;
}
