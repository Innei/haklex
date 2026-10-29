import { toast, updateToast } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { COMMAND_PRIORITY_CRITICAL, PASTE_COMMAND } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import { useEditorBlock } from '../context/EditorBlockContext';
import { $createVideoNode } from '../nodes/VideoNode';
import * as css from './image-upload.css';
import { $createInsertionCursor, $insertAtCursor, type InsertionCursor } from './insertion-cursor';

export interface VideoUploadResult {
  src: string;
}

export type VideoUploadFn = (
  file: File,
  opts?: { onProgress?: (percent: number) => void },
) => Promise<VideoUploadResult>;

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

function hasVideoData(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;

  if ([...dataTransfer.files].some(isVideoFile)) return true;
  return [...dataTransfer.items].some((item) => item.type.startsWith('video/'));
}

const ERROR_TOAST_DURATION = 6000;

interface VideoUploadPluginProps {
  onUpload: VideoUploadFn;
}

export function VideoUploadPlugin({ onUpload }: VideoUploadPluginProps) {
  const block = useEditorBlock();
  const blockRef = useRef(block);
  blockRef.current = block;
  const [editor] = useLexicalComposerContext();
  const uploadRef = useRef(onUpload);
  uploadRef.current = onUpload;

  const uploadVideo = useCallback(
    async (file: File, cursor: InsertionCursor) => {
      const release = blockRef.current?.retain();
      const id = toast({ title: 'Uploading video…', tone: 'loading' });

      try {
        const result = await uploadRef.current(file, {
          onProgress: (percent) => {
            updateToast(id, { title: `Uploading video… ${Math.round(percent)}%` });
          },
        });

        editor.update(() => {
          $insertAtCursor(cursor, [$createVideoNode({ src: result.src })]);
        });
        updateToast(id, { title: 'Video uploaded', tone: 'success' });
      } catch (err: unknown) {
        console.error('[VideoUploadPlugin]', err);
        updateToast(id, {
          action: { label: 'Retry', onClick: () => void uploadVideo(file, cursor) },
          duration: ERROR_TOAST_DURATION,
          title: 'Video upload failed',
          tone: 'error',
        });
      } finally {
        queueMicrotask(() => release?.());
      }
    },
    [editor],
  );

  const handleFiles = useCallback(
    (files: File[]): boolean => {
      const videos = files.filter(isVideoFile);
      if (videos.length === 0) return false;

      const cursor = $createInsertionCursor();
      for (const file of videos) {
        void uploadVideo(file, cursor);
      }
      // Mixed drops keep propagating so ImageUploadPlugin can claim the rest.
      return videos.length === files.length;
    },
    [uploadVideo],
  );

  useEffect(() => {
    const unregisterDragDrop = editor.registerCommand(
      DRAG_DROP_PASTE,
      (files: File[]) => handleFiles(files),
      COMMAND_PRIORITY_CRITICAL,
    );

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | InputEvent | KeyboardEvent) => {
        const clipboardData =
          'clipboardData' in event ? (event as ClipboardEvent).clipboardData : null;
        if (!clipboardData) return false;

        const files = [...clipboardData.files];
        if (files.some(isVideoFile)) {
          return handleFiles(files);
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const rootElement = editor.getRootElement();
    const wrapper = rootElement?.parentElement ?? null;
    if (!rootElement || !wrapper) {
      return () => {
        unregisterDragDrop();
        unregisterPaste();
      };
    }

    let dragCounter = 0;

    const onDragEnter = (event: DragEvent) => {
      if (!hasVideoData(event.dataTransfer)) return;
      dragCounter += 1;
      wrapper.classList.add(css.draggingWrapperClass);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasVideoData(event.dataTransfer)) return;
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
      wrapper.classList.remove(css.draggingWrapperClass);
      rootElement.removeEventListener('dragenter', onDragEnter);
      rootElement.removeEventListener('dragover', onDragOver);
      rootElement.removeEventListener('dragleave', onDragLeave);
      rootElement.removeEventListener('drop', onDrop);
    };
  }, [editor, handleFiles]);

  return null;
}
