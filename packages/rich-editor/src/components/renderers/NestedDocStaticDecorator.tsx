import type { SerializedEditorState } from 'lexical'
import { useMemo, useState } from 'react'

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext'
import { truncateEditorState } from '../../utils/truncateEditorState'

const TRUNCATE_THRESHOLD = 10

interface NestedDocStaticDecoratorProps {
  contentState: SerializedEditorState
}

export function NestedDocStaticDecorator({
  contentState,
}: NestedDocStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer()
  const [collapsed, setCollapsed] = useState(true)

  const children = contentState.root?.children
  const needsTruncation = children.length > TRUNCATE_THRESHOLD
  const truncatedState = useMemo(() => {
    if (!needsTruncation) return contentState
    return truncateEditorState(contentState, TRUNCATE_THRESHOLD)
  }, [contentState, needsTruncation])
  if (!children || children.length === 0) {
    return null
  }

  const displayState =
    collapsed && needsTruncation ? truncatedState : contentState

  return (
    <>
      <div className="rich-nested-doc-content" data-expanded={!collapsed}>
        {renderContent(displayState)}
      </div>
      {needsTruncation && (
        <div className="rich-nested-doc-mask" data-expanded={!collapsed}>
          <button
            type="button"
            className="rich-nested-doc-toggle"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      )}
    </>
  )
}
