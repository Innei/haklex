import { Check, ChevronDown, Copy } from 'lucide-react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLanguageDisplayName, languageToColorMap, normalizeLanguage } from './constants';
import * as styles from './styles.css';

const CopyIcon = <Copy size={16} />;
const CheckIcon = <Check size={16} />;
const ExpandIcon = <ChevronDown size={14} />;

interface CodeBlockCardProps {
  children: ReactNode;
  className?: string;
  code: string;
  collapsible?: boolean;
  language?: string;
  showCopyButton?: boolean;
  static?: boolean;
}

export function CodeBlockCard({
  children,
  className,
  code,
  collapsible = true,
  language,
  showCopyButton = true,
  static: staticMode = false,
}: CodeBlockCardProps): ReactElement {
  const normalizedLanguage = normalizeLanguage(language);
  const languageLabel = getLanguageDisplayName(normalizedLanguage);
  const accent = languageToColorMap[normalizedLanguage] || '#737373';

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

  const cardStyle = useMemo(() => ({ '--rr-code-accent': accent }) as CSSProperties, [accent]);

  const scrollClassName = [
    styles.scroll,
    collapsible && isCollapsed && isOverflow && styles.scrollCollapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`${styles.card}${className ? ` ${className}` : ''}`}
      style={cardStyle}
    >
      {language && normalizedLanguage !== 'text' && (
        <div aria-hidden className={styles.lang}>
          <span>{languageLabel}</span>
        </div>
      )}

      {showCopyButton && (
        <button
          aria-label={copied ? 'Copied' : 'Copy code'}
          className={styles.copyButton}
          type="button"
          onClick={handleCopy}
        >
          {copied ? CheckIcon : CopyIcon}
        </button>
      )}

      <div className={staticMode ? styles.bodyBackgroundStatic : styles.bodyBackground}>
        <div className={scrollClassName} ref={scrollRef}>
          {children}
        </div>

        {collapsible && isOverflow && isCollapsed && (
          <div className={styles.expandWrap}>
            <button
              className={styles.expandButton}
              type="button"
              onClick={() => setIsCollapsed(false)}
            >
              {ExpandIcon}
              <span>Expand</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
