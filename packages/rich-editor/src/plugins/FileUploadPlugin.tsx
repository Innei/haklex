import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import type { LexicalEditor } from 'lexical';
import {
  $getNodeByKey,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import { $createFileNode, $isFileNode, fileExtFromName } from '../nodes/FileNode';
import { OPEN_FILE_PICKER_COMMAND } from './file-upload-command';
import { setFileUploadEntry } from './file-upload-store';

export interface FileUploadResult {
  src: string;
}

export type FileUploadFn = (
  file: File,
  opts?: { onProgress?: (percent: number) => void },
) => Promise<FileUploadResult>;

function isMediaFile(file: File): boolean {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
}

interface FileUploadPluginProps {
  onUpload: FileUploadFn;
}

export function FileUploadPlugin({ onUpload }: FileUploadPluginProps) {
  const [editor] = useLexicalComposerContext();
  const uploadRef = useRef(onUpload);
  uploadRef.current = onUpload;
  const targetEditorRef = useRef<LexicalEditor>(editor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback((file: File, target: LexicalEditor) => {
    let nodeKey = '';
    target.update(() => {
      const node = $createFileNode({
        src: '',
        name: file.name,
        size: file.size,
        mimeType: file.type || undefined,
        ext: fileExtFromName(file.name),
      });
      $insertNodes([node]);
      nodeKey = node.getKey();
    });

    const remove = () => {
      setFileUploadEntry(target, nodeKey, null);
      target.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) node.remove();
      });
    };

    const run = async () => {
      const base = { percent: 0, retry: () => void run(), remove };
      setFileUploadEntry(target, nodeKey, { ...base, status: 'uploading' });
      try {
        const result = await uploadRef.current(file, {
          onProgress: (percent) => {
            setFileUploadEntry(target, nodeKey, {
              ...base,
              status: 'uploading',
              percent: Math.round(percent),
            });
          },
        });
        target.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isFileNode(node)) node.setSrc(result.src);
        });
        setFileUploadEntry(target, nodeKey, null);
      } catch (err: unknown) {
        console.error('[FileUploadPlugin]', err);
        setFileUploadEntry(target, nodeKey, { ...base, status: 'error', error: 'Upload failed' });
      }
    };

    void run();
  }, []);

  const handleFiles = useCallback(
    (files: File[], target: LexicalEditor): boolean => {
      const plainFiles = files.filter((file) => !isMediaFile(file));
      if (plainFiles.length === 0) return false;

      for (const file of plainFiles) {
        uploadFile(file, target);
      }
      return plainFiles.length === files.length;
    },
    [uploadFile],
  );

  useEffect(() => {
    const unregisterDragDrop = editor.registerCommand(
      DRAG_DROP_PASTE,
      (files: File[], fromEditor) => handleFiles(files, fromEditor),
      COMMAND_PRIORITY_LOW,
    );

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | InputEvent | KeyboardEvent, fromEditor) => {
        const clipboardData =
          'clipboardData' in event ? (event as ClipboardEvent).clipboardData : null;
        if (!clipboardData) return false;

        const files = [...clipboardData.files];
        if (files.some((file) => !isMediaFile(file))) {
          return handleFiles(files, fromEditor);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterOpenPicker = editor.registerCommand(
      OPEN_FILE_PICKER_COMMAND,
      (_payload, fromEditor) => {
        targetEditorRef.current = fromEditor;
        fileInputRef.current?.click();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterDragDrop();
      unregisterPaste();
      unregisterOpenPicker();
    };
  }, [editor, handleFiles]);

  return (
    <input
      multiple
      ref={fileInputRef}
      style={{ display: 'none' }}
      type="file"
      onChange={(event) => {
        const files = [...(event.currentTarget.files ?? [])];
        for (const file of files) {
          uploadFile(file, targetEditorRef.current);
        }
        event.currentTarget.value = '';
      }}
    />
  );
}
