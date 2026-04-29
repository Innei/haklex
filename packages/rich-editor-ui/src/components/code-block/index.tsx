import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { CodeBlockCard } from './CodeBlockCard';
import { normalizeLanguage } from './constants';
import { getHighlighterWithLang, SHIKI_DUAL_THEMES } from './shiki';
import * as styles from './styles.css';

export interface CodeBlockProps {
  className?: string;
  code: string;
  collapsible?: boolean;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
}

export function CodeBlock({
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

    (async () => {
      const highlighter = await getHighlighterWithLang(normalizedLanguage);
      if (cancelled) return;

      const loaded: string[] = highlighter.getLoadedLanguages();
      const lang = loaded.includes(normalizedLanguage) ? normalizedLanguage : 'text';
      const result = highlighter.codeToHtml(code, {
        lang,
        themes: SHIKI_DUAL_THEMES,
      });

      if (!cancelled) {
        setHtml(result);
      }
    })();

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
