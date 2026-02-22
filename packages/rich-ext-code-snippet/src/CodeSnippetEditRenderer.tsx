import type { CodeFile } from '@haklex/rich-editor'
import { useColorScheme } from '@haklex/rich-editor'
import { presentDialog } from '@haklex/rich-editor-ui'
import { usePortalTheme } from '@haklex/rich-style-token'
import { Pencil } from 'lucide-react'
import type { FC } from 'react'
import { useCallback } from 'react'

import { CodeEditorModal } from './CodeEditorModal'
import { CodeSnippetRenderer } from './CodeSnippetRenderer'
import {
  codeSnippetDialogPopup,
  editContainer,
  editLabel,
  editOverlay,
  semanticClassNames,
} from './styles.css'

export interface CodeSnippetEditRendererProps {
  files: CodeFile[]
  onFilesChange?: (files: CodeFile[]) => void
}

export const CodeSnippetEditRenderer: FC<CodeSnippetEditRendererProps> = ({
  files,
  onFilesChange,
}) => {
  const { className: portalClassName } = usePortalTheme()
  const colorScheme = useColorScheme()

  const handleEdit = useCallback(() => {
    presentDialog({
      content: ({ dismiss }) => (
        <CodeEditorModal
          files={files}
          onFilesChange={onFilesChange}
          dismiss={dismiss}
          colorScheme={colorScheme}
        />
      ),
      className: codeSnippetDialogPopup,
      portalClassName,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    })
  }, [files, onFilesChange, portalClassName, colorScheme])

  return (
    <div className={`${editContainer} ${semanticClassNames.editContainer}`}>
      <CodeSnippetRenderer files={files} />
      <button
        type="button"
        className={`${editOverlay} ${semanticClassNames.editOverlay}`}
        onClick={handleEdit}
        aria-label="Edit code snippet"
      >
        <span className={`${editLabel} ${semanticClassNames.editLabel}`}>
          <Pencil size={14} />
          Edit
        </span>
      </button>
    </div>
  )
}
