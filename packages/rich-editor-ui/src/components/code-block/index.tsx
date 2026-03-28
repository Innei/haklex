import { Check, Copy } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  codeBlockWrapper,
  codeContent,
  codeHeader,
  codePre,
  copyButton,
  languageLabel,
} from './styles.css';

export interface CodeBlockProps {
  className?: string;
  code: string;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
}

let shikiHighlighter: any = null;
let shikiLoading: Promise<any> | null = null;

async function getHighlighter() {
  if (shikiHighlighter) return shikiHighlighter;
  if (shikiLoading) return shikiLoading;
  shikiLoading = import('shiki').then(async ({ createHighlighter }) => {
    shikiHighlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [],
    });
    return shikiHighlighter;
  });
  return shikiLoading;
}

export function CodeBlock({
  code,
  language,
  showCopyButton = true,
  className,
}: CodeBlockProps): ReactElement {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!language) return;
    let cancelled = false;
    getHighlighter().then(async (highlighter) => {
      if (cancelled) return;
      const loadedLangs = highlighter.getLoadedLanguages();
      if (!loadedLangs.includes(language)) {
        try {
          await highlighter.loadLanguage(language);
        } catch {
          return;
        }
      }
      if (cancelled) return;
      const result = highlighter.codeToHtml(code, {
        lang: language,
        themes: { light: 'github-light', dark: 'github-dark' },
      });
      setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={`${codeBlockWrapper}${className ? ` ${className}` : ''}`}>
      {(language || showCopyButton) && (
        <div className={codeHeader}>
          <span className={languageLabel}>{language || ''}</span>
          {showCopyButton && (
            <button className={copyButton} type="button" onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <div className={codeContent}>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className={codePre}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
