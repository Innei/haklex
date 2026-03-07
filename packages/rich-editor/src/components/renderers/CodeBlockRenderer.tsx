import { useCallback, useEffect, useRef, useState } from 'react';

import { useColorScheme } from '../../context/ColorSchemeContext';
import { useVariant } from '../../context/RendererConfigContext';
import type { CodeToHtmlFn } from '../../utils/shiki';
import { loadCodeToHtml } from '../../utils/shiki';

export interface CodeBlockRendererProps {
  code: string;
  cursorPlacement?: 'start' | 'end';
  editable?: boolean;
  language: string;
  onCodeChange?: (code: string) => void;
  onDelete?: () => void;
  onExitBlock?: (direction: 'before' | 'after') => void;
  onLanguageChange?: (language: string) => void;
  selected?: boolean;
  showLineNumbers?: boolean;
}

export function CodeBlockRenderer({
  code,
  language,
  showLineNumbers: showLineNumbersProp,
}: CodeBlockRendererProps) {
  const variant = useVariant();
  const showLineNumbers = showLineNumbersProp ?? variant !== 'comment';
  const colorScheme = useColorScheme();
  const shikiTheme = colorScheme === 'dark' ? 'github-dark' : 'github-light';
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    setHighlightedHtml(null);

    loadCodeToHtml()
      .then((toHtml: CodeToHtmlFn) =>
        toHtml(code, {
          lang: language,
          theme: shikiTheme,
        }),
      )
      .then((html: string) => {
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHighlightedHtml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language, shikiTheme]);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [code]);

  const header = language ? (
    <div className="rich-code-block-header">
      <span className="rich-code-block-lang">{language}</span>
      <button
        aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        className="rich-code-block-copy"
        type="button"
        onClick={handleCopy}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  ) : null;

  const wrapperClass = showLineNumbers
    ? 'rich-code-block rich-code-block-numbered'
    : 'rich-code-block';

  if (highlightedHtml) {
    return (
      <div className={wrapperClass}>
        {header}
        <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </div>
    );
  }

  const lines = code.split('\n');
  return (
    <div className={wrapperClass}>
      {header}
      <pre>
        <code>
          {lines.map((line, i) => (
            <span className="line" key={i}>
              {line}
              {i < lines.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
