import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $nodesOfType } from 'lexical';
import { useCallback } from 'react';

import { useFootnoteDefinitions } from '../../context/FootnoteDefinitionsContext';
import { FootnoteSectionNode } from '../../nodes/FootnoteSectionNode';
import { semanticClassNames, sharedStyles } from '../../styles/shared.css';
import { clsx } from '../utils';

export interface FootnoteSectionEditRendererProps {
  definitions: Record<string, string>;
  nodeKey: string;
}

export function FootnoteSectionEditRenderer({ definitions }: FootnoteSectionEditRendererProps) {
  const [editor] = useLexicalComposerContext();
  const { displayNumberMap } = useFootnoteDefinitions();

  const sortedEntries = Object.entries(definitions).sort(
    ([a], [b]) => (displayNumberMap[a] ?? 0) - (displayNumberMap[b] ?? 0),
  );

  const handleContentChange = useCallback(
    (identifier: string, newContent: string) => {
      editor.update(() => {
        const sectionNodes = $nodesOfType(FootnoteSectionNode);
        if (sectionNodes.length > 0) {
          sectionNodes[0].setDefinition(identifier, newContent);
        }
      });
    },
    [editor],
  );

  const handleRemove = useCallback(
    (identifier: string) => {
      editor.update(() => {
        const sectionNodes = $nodesOfType(FootnoteSectionNode);
        if (sectionNodes.length > 0) {
          sectionNodes[0].removeDefinition(identifier);
        }
      });
    },
    [editor],
  );

  if (sortedEntries.length === 0) return null;

  return (
    <div
      role="doc-endnotes"
      className={clsx(
        'rich-footnote-section-content',
        'rich-footnote-section-edit',
        semanticClassNames.footnoteSection,
        sharedStyles.footnoteSection,
      )}
    >
      <hr
        className={clsx(
          semanticClassNames.footnoteSectionDivider,
          sharedStyles.footnoteSectionDivider,
        )}
      />
      <ol
        className={clsx(semanticClassNames.footnoteSectionList, sharedStyles.footnoteSectionList)}
      >
        {sortedEntries.map(([identifier, content]) => {
          const displayNum = displayNumberMap[identifier] ?? identifier;
          return (
            <li
              id={`footnote-${identifier}`}
              key={identifier}
              className={clsx(
                semanticClassNames.footnoteSectionItem,
                sharedStyles.footnoteSectionItem,
                semanticClassNames.footnoteSectionItemEdit,
                sharedStyles.footnoteSectionItemEdit,
              )}
            >
              <span
                className={clsx(
                  semanticClassNames.footnoteSectionItemNum,
                  sharedStyles.footnoteSectionItemNum,
                )}
              >
                {displayNum}.
              </span>
              <input
                placeholder={`Footnote content for [^${identifier}]`}
                type="text"
                value={content}
                className={clsx(
                  semanticClassNames.footnoteSectionItemInput,
                  sharedStyles.footnoteSectionItemInput,
                )}
                onChange={(e) => handleContentChange(identifier, e.target.value)}
              />
              <button
                aria-label={`Remove footnote ${identifier}`}
                type="button"
                className={clsx(
                  semanticClassNames.footnoteSectionItemRemove,
                  sharedStyles.footnoteSectionItemRemove,
                )}
                onClick={() => handleRemove(identifier)}
              >
                ×
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
