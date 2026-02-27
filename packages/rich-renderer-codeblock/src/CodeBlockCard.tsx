import { Check, ChevronDown, Copy } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  getLanguageDisplayName,
  languageToColorMap,
  normalizeLanguage,
} from './constants'
import { hasLanguageIcon, LanguageIcon } from './icons'
import * as styles from './styles.css'

const CopyIcon = <Copy size={16} />
const CheckIcon = <Check size={16} />
const ExpandIcon = <ChevronDown size={14} />

interface CodeBlockCardProps {
  code: string
  language: string
  collapsible?: boolean
  editable?: boolean
  onLanguageChange?: (language: string) => void
  children: ReactNode
}

export function CodeBlockCard({
  code,
  language,
  collapsible = true,
  editable = false,
  onLanguageChange,
  children,
}: CodeBlockCardProps) {
  const normalizedLanguage = normalizeLanguage(language)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isOverflow, setIsOverflow] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!collapsible) {
      setIsOverflow(false)
      return
    }

    const el = scrollRef.current
    if (!el) return
    const check = () => {
      const halfVh = window.innerHeight / 2
      setIsOverflow(el.scrollHeight >= halfVh)
    }
    const raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [code, collapsible])

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current)
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }, [code])

  const languageLabel = getLanguageDisplayName(normalizedLanguage)
  const accent = languageToColorMap[normalizedLanguage] || '#737373'

  const cardStyle = useMemo(
    () => ({ '--rr-code-accent': accent }) as CSSProperties,
    [accent],
  )

  const scrollClassName = [
    styles.scroll,
    styles.semanticClassNames.scroll,
    collapsible && isCollapsed && isOverflow && styles.scrollCollapsed,
    collapsible &&
      isCollapsed &&
      isOverflow &&
      styles.semanticClassNames.scrollCollapsed,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={`${styles.card} ${styles.semanticClassNames.card}`}
      style={cardStyle}
    >
      {editable ? (
        <div className={`${styles.lang} ${styles.semanticClassNames.lang}`}>
          {hasLanguageIcon(normalizedLanguage) && (
            <LanguageIcon language={normalizedLanguage} size={14} />
          )}
          <input
            className={styles.langInput}
            value={language}
            placeholder="language"
            onChange={(e) => onLanguageChange?.(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Escape' || e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
          />
        </div>
      ) : (
        normalizedLanguage !== 'text' && (
          <div
            className={`${styles.lang} ${styles.semanticClassNames.lang}`}
            aria-hidden
          >
            {hasLanguageIcon(normalizedLanguage) ? (
              <LanguageIcon language={normalizedLanguage} size={14} />
            ) : (
              <span>{languageLabel}</span>
            )}
          </div>
        )
      )}

      <button
        type="button"
        className={`${styles.copyButton} ${styles.semanticClassNames.copyButton}`}
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? CheckIcon : CopyIcon}
      </button>

      <div
        className={`${styles.bodyBackground} ${styles.semanticClassNames.bodyBackground}`}
      >
        <div ref={scrollRef} className={scrollClassName}>
          {children}
        </div>

        {collapsible && isOverflow && isCollapsed && (
          <div
            className={`${styles.expandWrap} ${styles.semanticClassNames.expandWrap}`}
          >
            <button
              type="button"
              className={`${styles.expandButton} ${styles.semanticClassNames.expandButton}`}
              onClick={() => setIsCollapsed(false)}
            >
              {ExpandIcon}
              <span>展开</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
