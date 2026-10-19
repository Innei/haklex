import { Check, ChevronDown, Copy } from 'lucide-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLanguageDisplayName, languageToColorMap, normalizeLanguage } from './constants';
import * as styles from './styles.css';

const CopyIcon = <Copy size={14} />;
const CheckIcon = <Check size={14} />;
const ExpandIcon = <ChevronDown size={14} />;

export type CodeBlockChrome = 'bar' | 'compact';

interface CodeBlockCardProps {
  children: ReactNode;
  chrome?: CodeBlockChrome;
  className?: string;
  code: string;
  collapsible?: boolean;
  language?: string;
  showCopyButton?: boolean;
  static?: boolean;
}

export function CodeBlockCard({
  children,
  chrome = 'bar',
  className,
  code,
  collapsible = true,
  language,
  showCopyButton = true,
  static: staticMode = false,
}: CodeBlockCardProps): ReactElement {
  const normalizedLanguage = normalizeLanguage(language);
  const hasLanguage = !!language && normalizedLanguage !== 'text';
  const languageLabel =
    chrome === 'compact' ? normalizedLanguage : getLanguageDisplayName(normalizedLanguage);
  const languageColor = languageToColorMap[normalizedLanguage] || '#737373';
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const gutterStyle = useMemo(
    () => ({ '--rc-ln-digits': Math.max(2, String(lineCount).length) }) as CSSProperties,
    [lineCount],
  );

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOverflow, setIsOverflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsible) {
      setIsOverflow(false);
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      const halfVh = window.innerHeight / 2;
      setIsOverflow(el.scrollHeight >= halfVh);
    };

    const raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [children, code, collapsible]);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

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

  const isCollapsedOverflow = collapsible && isOverflow && isCollapsed;
  const scrollClassName = [styles.scroll, isCollapsedOverflow && styles.scrollCollapsed]
    .filter(Boolean)
    .join(' ');

  const showHeader = hasLanguage || showCopyButton;

  return (
    <div
      className={`${styles.card}${className ? ` ${className}` : ''}`}
      data-chrome={chrome}
      style={gutterStyle}
    >
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.lang}>
            {hasLanguage && (
              <>
                <span
                  aria-hidden
                  className={styles.langMark}
                  style={{ backgroundColor: languageColor }}
                />
                <span>{languageLabel}</span>
              </>
            )}
          </div>
          {showCopyButton && (
            <button
              aria-label={copied ? 'Copied' : 'Copy code'}
              className={styles.copyButton}
              type="button"
              onClick={handleCopy}
            >
              {copied ? CheckIcon : CopyIcon}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      )}

      <div className={staticMode ? styles.bodyBackgroundStatic : styles.bodyBackground}>
        <div className={scrollClassName} ref={scrollRef}>
          {children}
        </div>
        {isCollapsedOverflow && <div aria-hidden className={styles.expandFade} />}
      </div>

      {isCollapsedOverflow && (
        <button className={styles.expandButton} type="button" onClick={() => setIsCollapsed(false)}>
          <span>{`Expand all · ${lineCount} lines`}</span>
          {ExpandIcon}
        </button>
      )}
    </div>
  );
}
