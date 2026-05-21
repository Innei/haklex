import { useColorScheme } from '@haklex/rich-editor/static';
import { presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useCallback } from 'react';

import { CodeEditorModal } from './CodeEditorModal';
import { CodeSnippetRenderer } from './CodeSnippetRenderer';
import {
  codeSnippetDialogPopup,
  editContainer,
  editLabel,
  editOverlay,
  semanticClassNames,
} from './styles.css';
import type { CodeFile } from './types';

export interface CodeSnippetEditRendererProps {
  files: CodeFile[];
  onFilesChange?: (files: CodeFile[]) => void;
}

export const CodeSnippetEditRenderer: FC<CodeSnippetEditRendererProps> = ({
  files,
  onFilesChange,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const colorScheme = useColorScheme();

  const handleEdit = useCallback(() => {
    presentDialog({
      content: ({ dismiss }) => (
        <CodeEditorModal
          colorScheme={colorScheme}
          dismiss={dismiss}
          files={files}
          onFilesChange={onFilesChange}
        />
      ),
      className: codeSnippetDialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    });
  }, [files, onFilesChange, portalClassName, colorScheme]);

  return (
    <div className={`${editContainer} ${semanticClassNames.editContainer}`}>
      <CodeSnippetRenderer files={files} />
      <button
        aria-label="Edit code snippet"
        className={`${editOverlay} ${semanticClassNames.editOverlay}`}
        type="button"
        onClick={handleEdit}
      >
        <span className={`${editLabel} ${semanticClassNames.editLabel}`}>
          <Pencil size={14} />
          Edit
        </span>
      </button>
    </div>
  );
};
