import type { CodeFile } from '@shiro/rich-editor'
import { useColorScheme } from '@shiro/rich-editor'
import { presentDialog } from '@shiro/rich-editor-ui'
import { usePortalTheme } from '@shiro/rich-style-token'
import { Pencil } from 'lucide-react'
import type { FC } from 'react'
import { useCallback } from 'react'

import { CodeEditorModal } from './CodeEditorModal'
import { CodeSnippetRenderer } from './CodeSnippetRenderer'
import { codeSnippetDialogPopup } from './styles.css'

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
    <div className="rcs-edit-container">
      <CodeSnippetRenderer files={files} />
      <button
        type="button"
        className="rcs-edit-overlay"
        onClick={handleEdit}
        aria-label="Edit code snippet"
      >
        <span className="rcs-edit-label">
          <Pencil size={14} />
          Edit
        </span>
      </button>
    </div>
  )
}
