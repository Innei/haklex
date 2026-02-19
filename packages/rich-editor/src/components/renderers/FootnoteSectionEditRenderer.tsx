import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $nodesOfType } from 'lexical'
import { useCallback } from 'react'

import { useFootnoteDefinitions } from '../../context/FootnoteDefinitionsContext'
import { FootnoteSectionNode } from '../../nodes/FootnoteSectionNode'

export interface FootnoteSectionEditRendererProps {
  definitions: Record<string, string>
  nodeKey: string
}

export function FootnoteSectionEditRenderer({
  definitions,
}: FootnoteSectionEditRendererProps) {
  const [editor] = useLexicalComposerContext()
  const { displayNumberMap } = useFootnoteDefinitions()

  const sortedEntries = Object.entries(definitions).sort(
    ([a], [b]) => (displayNumberMap[a] ?? 0) - (displayNumberMap[b] ?? 0),
  )

  const handleContentChange = useCallback(
    (identifier: string, newContent: string) => {
      editor.update(() => {
        const sectionNodes = $nodesOfType(FootnoteSectionNode)
        if (sectionNodes.length > 0) {
          sectionNodes[0].setDefinition(identifier, newContent)
        }
      })
    },
    [editor],
  )

  const handleRemove = useCallback(
    (identifier: string) => {
      editor.update(() => {
        const sectionNodes = $nodesOfType(FootnoteSectionNode)
        if (sectionNodes.length > 0) {
          sectionNodes[0].removeDefinition(identifier)
        }
      })
    },
    [editor],
  )

  if (sortedEntries.length === 0) return null

  return (
    <div
      className="rich-footnote-section-content rich-footnote-section-edit"
      role="doc-endnotes"
    >
      <hr className="rich-footnote-section-divider" />
      <ol className="rich-footnote-section-list">
        {sortedEntries.map(([identifier, content]) => {
          const displayNum = displayNumberMap[identifier] ?? identifier
          return (
            <li
              key={identifier}
              id={`footnote-${identifier}`}
              className="rich-footnote-section-item rich-footnote-section-item-edit"
            >
              <span className="rich-footnote-section-item-num">
                {displayNum}.
              </span>
              <input
                type="text"
                className="rich-footnote-section-item-input"
                value={content}
                onChange={(e) =>
                  handleContentChange(identifier, e.target.value)
                }
                placeholder={`Footnote content for [^${identifier}]`}
              />
              <button
                type="button"
                className="rich-footnote-section-item-remove"
                onClick={() => handleRemove(identifier)}
                aria-label={`Remove footnote ${identifier}`}
              >
                ×
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
