import { $isFileNode, fileExtFromName } from '@haklex/rich-editor/nodes';
import { useFileUpload } from '@haklex/rich-editor/plugins';
import { ActionButton, toast } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { RefreshCw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export function useFileReplace(nodeKey: string, onReplaced: (fileName: string) => void) {
  const [editor] = useLexicalComposerContext();
  const fileUpload = useFileUpload();
  const [replacing, setReplacing] = useState(false);
  const [replacePercent, setReplacePercent] = useState(0);

  const handleReplaceFile = useCallback(
    async (file: File | null) => {
      if (!file || !fileUpload) return;

      setReplacing(true);
      setReplacePercent(0);

      try {
        const result = await fileUpload(file, {
          onProgress: (percent) => setReplacePercent(Math.round(percent)),
        });
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (!$isFileNode(node)) return;
          node.setFilePayload({
            src: result.src,
            name: file.name,
            size: file.size,
            mimeType: file.type || undefined,
            ext: fileExtFromName(file.name),
          });
        });
        onReplaced(file.name);
        toast({ title: 'File replaced', tone: 'success' });
      } catch (err: unknown) {
        console.error('[FileEditRenderer]', err);
        toast({ title: 'Upload failed', tone: 'error' });
      } finally {
        setReplacing(false);
      }
    },
    [editor, fileUpload, nodeKey, onReplaced],
  );

  return { available: !!fileUpload, handleReplaceFile, replacePercent, replacing };
}

type FileReplaceButtonProps = Omit<ReturnType<typeof useFileReplace>, 'available'>;

export function FileReplaceButton({
  handleReplaceFile,
  replacePercent,
  replacing,
}: FileReplaceButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        onChange={(e) => {
          void handleReplaceFile(e.currentTarget.files?.[0] ?? null);
          e.currentTarget.value = '';
        }}
      />
      <ActionButton
        disabled={replacing}
        size="md"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <RefreshCw />
        {replacing ? `Uploading ${replacePercent}%` : 'Replace file…'}
      </ActionButton>
    </>
  );
}
