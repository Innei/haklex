import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { $insertNodes, COMMAND_PRIORITY_CRITICAL, PASTE_COMMAND } from 'lexical';
import { Check, Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { $createVideoNode } from '../nodes/VideoNode';
import * as css from './image-upload.css';

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

interface VideoUploadPluginProps {
  onUpload: VideoUploadFn;
}

export function VideoUploadPlugin({ onUpload }: VideoUploadPluginProps) {
  const [editor] = useLexicalComposerContext();
  const uploadRef = useRef(onUpload);
  uploadRef.current = onUpload;
  const toastTimerRef = useRef<number | null>(null);
  const nextUploadIdRef = useRef(0);

  const [uploads, setUploads] = useState<ReadonlyMap<number, number>>(new Map());
  const [rootDragActive, setRootDragActive] = useState(false);
  const [toast, setToast] = useState<null | {
    kind: 'success' | 'error';
    message: string;
  }>(null);

  const pushToast = useCallback((kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(setToast, 2200, null);
  }, []);

  const uploadVideo = useCallback(
    async (file: File) => {
      const id = nextUploadIdRef.current++;
      setUploads((prev) => new Map(prev).set(id, 0));

      try {
        const result = await uploadRef.current(file, {
          onProgress: (percent) => {
            setUploads((prev) => new Map(prev).set(id, percent));
          },
        });

        editor.update(() => {
          $insertNodes([$createVideoNode({ src: result.src })]);
        });
        pushToast('success', 'Video uploaded');
      } catch (err: unknown) {
        console.error('[VideoUploadPlugin]', err);
        pushToast('error', 'Video upload failed');
      } finally {
        setUploads((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [editor, pushToast],
  );

  const handleFiles = useCallback(
    (files: File[]): boolean => {
      const videos = files.filter(isVideoFile);
      if (videos.length === 0) return false;

      for (const file of videos) {
        void uploadVideo(file);
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
    if (!wrapper) {
      return () => {
        unregisterDragDrop();
        unregisterPaste();
      };
    }

    let dragCounter = 0;

    const setWrapperDragging = (next: boolean) => {
      setRootDragActive(next);
      wrapper.classList.toggle(css.draggingWrapperClass, next);
    };

    const onDragEnter = (event: DragEvent) => {
      if (!hasVideoData(event.dataTransfer)) return;
      dragCounter += 1;
      setWrapperDragging(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasVideoData(event.dataTransfer)) return;
      event.preventDefault();
    };

    const onDragLeave = () => {
      dragCounter = Math.max(dragCounter - 1, 0);
      if (dragCounter === 0) {
        setWrapperDragging(false);
      }
    };

    const onDrop = () => {
      dragCounter = 0;
      setWrapperDragging(false);
    };

    rootElement?.addEventListener('dragenter', onDragEnter);
    rootElement?.addEventListener('dragover', onDragOver);
    rootElement?.addEventListener('dragleave', onDragLeave);
    rootElement?.addEventListener('drop', onDrop);

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      unregisterDragDrop();
      unregisterPaste();
      setWrapperDragging(false);
      rootElement?.removeEventListener('dragenter', onDragEnter);
      rootElement?.removeEventListener('dragover', onDragOver);
      rootElement?.removeEventListener('dragleave', onDragLeave);
      rootElement?.removeEventListener('drop', onDrop);
    };
  }, [editor, handleFiles]);

  const helperMessage = (() => {
    if (uploads.size === 1) {
      const percent = [...uploads.values()][0] ?? 0;
      return `Uploading video... ${Math.round(percent)}%`;
    }
    if (uploads.size > 1) {
      return `Uploading ${uploads.size} videos...`;
    }
    if (rootDragActive) return 'Drop video files to upload';
    return null;
  })();

  if (!helperMessage && !toast) return null;

  return (
    <div className={css.toastStack}>
      {helperMessage && (
        <div className={`${css.toast} ${css.toastVariant.info}`}>
          <span className={css.spinner} />
          {helperMessage}
        </div>
      )}
      {toast && (
        <div className={`${css.toast} ${css.toastVariant[toast.kind]}`}>
          {toast.kind === 'success' ? <Check size={12} /> : <Info size={12} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
