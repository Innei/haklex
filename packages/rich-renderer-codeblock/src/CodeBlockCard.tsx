import { Check, ChevronDown, Copy } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getLanguageDisplayName, languageToColorMap, normalizeLanguage } from './constants';
import { hasLanguageIcon, LanguageIcon } from './icons';
import * as styles from './styles.css';

const CopyIcon = <Copy size={16} />;
const CheckIcon = <Check size={16} />;
const ExpandIcon = <ChevronDown size={14} />;

interface CodeBlockCardProps {
  children: ReactNode;
  code: string;
  collapsible?: boolean;
  langSlot?: ReactNode;
  language: string;
}

export function CodeBlockCard({
  code,
  language,
  collapsible = true,
  langSlot,
  children,
}: CodeBlockCardProps) {
  const normalizedLanguage = normalizeLanguage(language);
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
  const accent = languageToColorMap[normalizedLanguage] || '#737373';

  const cardStyle = useMemo(() => ({ '--rr-code-accent': accent }) as CSSProperties, [accent]);

  const scrollClassName = [
    styles.scroll,
    styles.semanticClassNames.scroll,
    collapsible && isCollapsed && isOverflow && styles.scrollCollapsed,
    collapsible && isCollapsed && isOverflow && styles.semanticClassNames.scrollCollapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.card} ${styles.semanticClassNames.card}`} style={cardStyle}>
      {langSlot ??
        (normalizedLanguage !== 'text' && (
          <div aria-hidden className={`${styles.lang} ${styles.semanticClassNames.lang}`}>
            {hasLanguageIcon(normalizedLanguage) ? (
              <LanguageIcon language={normalizedLanguage} size={14} />
            ) : (
              <span>{languageLabel}</span>
            )}
          </div>
        ))}

      <button
        aria-label={copied ? 'Copied' : 'Copy code'}
        className={`${styles.copyButton} ${styles.semanticClassNames.copyButton}`}
        type="button"
        onClick={handleCopy}
      >
        {copied ? CheckIcon : CopyIcon}
      </button>

      <div className={`${styles.bodyBackground} ${styles.semanticClassNames.bodyBackground}`}>
        <div className={scrollClassName} ref={scrollRef}>
          {children}
        </div>

        {collapsible && isOverflow && isCollapsed && (
          <div className={`${styles.expandWrap} ${styles.semanticClassNames.expandWrap}`}>
            <button
              className={`${styles.expandButton} ${styles.semanticClassNames.expandButton}`}
              type="button"
              onClick={() => setIsCollapsed(false)}
            >
              {ExpandIcon}
              <span>展开</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
