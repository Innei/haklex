import { useColorScheme } from '@haklex/rich-editor/static'
import { usePortalTheme } from '@haklex/rich-style-token'
import type { SerializedEditorState } from 'lexical'
import { Maximize2 } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { NestedDocRenderer } from './NestedDocRenderer'
import * as css from './styles.css'
import { hasRenderableEditorState, truncateEditorState } from './utils'

const PREVIEW_NODE_LIMIT = 6

interface NestedDocStaticDecoratorProps {
  contentState: SerializedEditorState
}

export function NestedDocStaticDecorator({
  contentState,
}: NestedDocStaticDecoratorProps) {
  const colorScheme = useColorScheme()
  const { className: portalClassName } = usePortalTheme()

  const children = contentState.root?.children ?? []
  const needsTruncation = children.length > PREVIEW_NODE_LIMIT
  const previewState = useMemo(
    () => truncateEditorState(contentState, PREVIEW_NODE_LIMIT),
    [contentState],
  )
  const hasPreview = hasRenderableEditorState(contentState)

  const handleOpen = useCallback(async () => {
    const { presentDialog } = await import('@haklex/rich-editor-ui')

    presentDialog({
      content: () => (
        <div className={css.staticDialogBody}>
          <NestedDocRenderer value={contentState} />
        </div>
      ),
      className: css.staticDialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: true,
      clickOutsideToDismiss: true,
    })
  }, [colorScheme, contentState, portalClassName])

  if (!hasPreview) {
    return null
  }

  return (
    <div
      className={css.staticOverlayRoot}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOpen()
        }
      }}
    >
      <div className="rich-nested-doc-content">
        <div className={css.previewSurface}>
          <NestedDocRenderer value={previewState} />
        </div>
      </div>
      {needsTruncation && (
        <div className={css.staticGradientMask} aria-hidden />
      )}
      <div className={css.staticOverlay} aria-hidden>
        <Maximize2 size={24} />
      </div>
    </div>
  )
}
