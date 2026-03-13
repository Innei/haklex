import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import { useFootnoteDefinitions } from '../../context/FootnoteDefinitionsContext';
import { semanticClassNames, sharedStyles } from '../../styles/shared.css';
import { clsx } from '../utils';

export interface FootnoteSectionRendererProps {
  definitions: Record<string, string>;
  nodeKey: string;
}

export function FootnoteSectionRenderer({ definitions }: FootnoteSectionRendererProps) {
  const { displayNumberMap } = useFootnoteDefinitions();

  const sortedEntries = Object.entries(definitions).sort(
    ([a], [b]) => (displayNumberMap[a] ?? 0) - (displayNumberMap[b] ?? 0),
  );

  if (sortedEntries.length === 0) return null;

  return (
    <div
      role="doc-endnotes"
      className={clsx(
        'rich-footnote-section-content',
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
            <FootnoteSectionItem
              content={content}
              displayNum={displayNum}
              identifier={identifier}
              key={identifier}
            />
          );
        })}
      </ol>
    </div>
  );
}

function FootnoteSectionItem({
  identifier,
  content,
  displayNum,
}: {
  identifier: string;
  content: string;
  displayNum: number | string;
}) {
  const targetId = `footnote-${identifier}`;
  const refId = `footnote-ref-${identifier}`;

  const handleBackClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const refElement = document.getElementById(refId);
      if (!refElement) return;
      refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refElement.classList.add(
        semanticClassNames.footnoteHighlight,
        sharedStyles.footnoteHighlight,
      );
      window.setTimeout(() => {
        refElement.classList.remove(
          semanticClassNames.footnoteHighlight,
          sharedStyles.footnoteHighlight,
        );
      }, 1200);
    },
    [refId],
  );

  return (
    <li
      className={clsx(semanticClassNames.footnoteSectionItem, sharedStyles.footnoteSectionItem)}
      id={targetId}
      value={typeof displayNum === 'number' ? displayNum : undefined}
    >
      <span className="rich-footnote-section-item-content">{content}</span>
      <a
        aria-label={`Back to reference ${displayNum}`}
        className={clsx(semanticClassNames.footnoteBackRef, sharedStyles.footnoteBackRef)}
        href={`#${refId}`}
        role="doc-backlink"
        onClick={handleBackClick}
      >
        ↩
      </a>
    </li>
  );
}
