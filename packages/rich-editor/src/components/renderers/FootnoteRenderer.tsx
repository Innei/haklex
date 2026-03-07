import { TooltipContent, TooltipRoot, TooltipTrigger } from '@haklex/rich-editor-ui';
import type { HTMLAttributes, MouseEvent } from 'react';
import { useCallback } from 'react';

import {
  useFootnoteContent,
  useFootnoteDisplayNumber,
} from '../../context/FootnoteDefinitionsContext';

export interface FootnoteRendererProps {
  identifier: string;
}

export function FootnoteRenderer({ identifier }: FootnoteRendererProps) {
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
      target.classList.add('rich-footnote-highlight');

      window.setTimeout(() => {
        target.classList.remove('rich-footnote-highlight');
      }, 1200);
    },
    [identifier, targetId],
  );

  const label = displayNumber ?? identifier;

  return (
    <span className="rich-footnote-ref-wrapper">
      <TooltipRoot>
        <TooltipTrigger
          render={(props: HTMLAttributes<HTMLElement>) => (
            <a
              {...props}
              aria-label={content ? `Footnote ${label}: ${content}` : `Footnote ${label}`}
              className="rich-footnote-ref"
              data-footnote-ref={identifier}
              href={`#${targetId}`}
              id={referenceId}
              role="doc-noteref"
              onClick={handleClick}
            >
              {label}
            </a>
          )}
        />
        {content ? <TooltipContent>{content}</TooltipContent> : null}
      </TooltipRoot>
    </span>
  );
}
