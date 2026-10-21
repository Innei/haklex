import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { CodeBlockChrome } from './CodeBlockCard';
import { CodeBlockCard } from './CodeBlockCard';
import { normalizeLanguage } from './constants';
import { highlightCode } from './highlight';
import * as styles from './styles.css';

export type { CodeBlockChrome } from './CodeBlockCard';
export type { HighlightColorScheme } from './highlight';
export { highlightCode } from './highlight';
export type { CodeLanguage } from './languages';
export { codeLanguages } from './languages';
export { streamdownCodePlugin } from './streamdown-plugin';

export interface CodeBlockProps {
  chrome?: CodeBlockChrome;
  className?: string;
  code: string;
  collapsible?: boolean;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  chrome,
  className,
  collapsible = true,
  code,
  language,
  showCopyButton = true,
  showLineNumbers = false,
}: CodeBlockProps): ReactElement {
  const normalizedLanguage = normalizeLanguage(language);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setHtml(null);

    highlightCode(code, normalizedLanguage)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [code, normalizedLanguage]);

  const fallbackLines = useMemo(() => code.split('\n'), [code]);

  const linedClassName = [
    showLineNumbers && styles.lined,
    showLineNumbers && styles.linedWithNumbers,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CodeBlockCard
      static
      chrome={chrome}
      className={className}
      code={code}
      collapsible={collapsible}
      language={language}
      showCopyButton={showCopyButton}
    >
      {html ? (
        <div className={linedClassName} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className={linedClassName}>
          <code>
            {fallbackLines.map((line, i) => (
              <span className="line" key={i}>
                {line}
              </span>
            ))}
          </code>
        </pre>
      )}
    </CodeBlockCard>
  );
}
