import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import {
  useFootnoteContent,
  useFootnoteDisplayNumber,
} from '../../context/FootnoteDefinitionsContext';
import { semanticClassNames, sharedStyles } from '../../styles/shared.css';
import { clsx } from '../utils';

export interface FootnoteStaticRendererProps {
  identifier: string;
}

export function FootnoteStaticRenderer({ identifier }: FootnoteStaticRendererProps) {
  const content = useFootnoteContent(identifier);
  const displayNumber = useFootnoteDisplayNumber(identifier);

  const referenceId = `footnote-ref-${identifier}`;
  const targetId = `footnote-${identifier}`;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const target =
        document.getElementById(targetId) || document.getElementById(`fn-${identifier}`);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add(semanticClassNames.footnoteHighlight, sharedStyles.footnoteHighlight);

      window.setTimeout(() => {
        target.classList.remove(
          semanticClassNames.footnoteHighlight,
          sharedStyles.footnoteHighlight,
        );
      }, 1200);
    },
    [identifier, targetId],
  );

  const label = displayNumber ?? identifier;

  return (
    <span className={clsx(semanticClassNames.footnoteRefWrapper, sharedStyles.footnoteRefWrapper)}>
      <a
        aria-label={content ? `Footnote ${label}: ${content}` : `Footnote ${label}`}
        className={clsx(semanticClassNames.footnoteRef, sharedStyles.footnoteRef)}
        data-footnote-ref={identifier}
        href={`#${targetId}`}
        id={referenceId}
        role="doc-noteref"
        onClick={handleClick}
      >
        {label}
      </a>
    </span>
  );
}
