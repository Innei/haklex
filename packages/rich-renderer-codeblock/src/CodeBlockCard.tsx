import { Check, ChevronDown, Copy } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLanguageDisplayName, languageToColorMap, normalizeLanguage } from './constants';
import { hasLanguageIcon, LanguageIcon } from './icons';
import * as styles from './styles.css';

const CopyIcon = <Copy size={14} />;
const CheckIcon = <Check size={14} />;
const ExpandIcon = <ChevronDown size={14} />;

interface CodeBlockCardProps {
  children: ReactNode;
  code: string;
  collapsible?: boolean;
  langSlot?: ReactNode;
  language: string;
  /** Use bodyBackgroundStatic (with paddingBlock) when true. Set by static CodeBlockRenderer. */
  static?: boolean;
}

export function CodeBlockCard({
  code,
  language,
  collapsible = true,
  langSlot,
  children,
  static: staticMode = false,
}: CodeBlockCardProps) {
  const normalizedLanguage = normalizeLanguage(language);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOverflow, setIsOverflow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const gutterStyle = useMemo(
    () => ({ '--rc-ln-digits': Math.max(2, String(lineCount).length) }) as CSSProperties,
    [lineCount],
  );

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
  }, [code, collapsible]);

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

  const languageLabel = getLanguageDisplayName(normalizedLanguage);
  const languageColor = languageToColorMap[normalizedLanguage] || '#737373';
  const isCollapsedOverflow = collapsible && isCollapsed && isOverflow;

  const scrollClassName = [
    styles.scroll,
    styles.semanticClassNames.scroll,
    isCollapsedOverflow && styles.scrollCollapsed,
    isCollapsedOverflow && styles.semanticClassNames.scrollCollapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`${styles.card} ${styles.semanticClassNames.card}`}
      data-chrome="bar"
      style={gutterStyle}
    >
      <div className={`${styles.header} ${styles.semanticClassNames.header}`}>
        {langSlot ?? (
          <div className={`${styles.lang} ${styles.semanticClassNames.lang}`}>
            {normalizedLanguage !== 'text' &&
              (hasLanguageIcon(normalizedLanguage) ? (
                <LanguageIcon language={normalizedLanguage} size={14} />
              ) : (
                <span
                  aria-hidden
                  className={styles.langMark}
                  style={{ backgroundColor: languageColor }}
                />
              ))}
            {normalizedLanguage !== 'text' && <span>{languageLabel}</span>}
          </div>
        )}
        <button
          aria-label={copied ? 'Copied' : 'Copy code'}
          className={`${styles.copyButton} ${styles.semanticClassNames.copyButton}`}
          type="button"
          onClick={handleCopy}
        >
          {copied ? CheckIcon : CopyIcon}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div
        className={`${staticMode ? styles.bodyBackgroundStatic : styles.bodyBackground} ${styles.semanticClassNames.bodyBackground}`}
      >
        <div className={scrollClassName} ref={scrollRef}>
          {children}
        </div>
        {isCollapsedOverflow && (
          <div
            aria-hidden
            className={`${styles.expandWrap} ${styles.semanticClassNames.expandWrap}`}
          />
        )}
      </div>

      {isCollapsedOverflow && (
        <button
          className={`${styles.expandButton} ${styles.semanticClassNames.expandButton}`}
          type="button"
          onClick={() => setIsCollapsed(false)}
        >
          <span>{`Expand all · ${lineCount} lines`}</span>
          {ExpandIcon}
        </button>
      )}
    </div>
  );
}
