import './styles.css'

import type { CodeBlockRendererProps } from '@shiro/rich-editor'
import { useColorScheme } from '@shiro/rich-editor'
import type { ComponentType, CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  getLanguageDisplayName,
  languageToColorMap,
  languageToIconMap,
  normalizeLanguage,
} from './constants'
import { getHighlighterWithLang, SHIKI_THEMES } from './shiki'

const CopyIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ExpandIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
)

export const CodeBlockRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers = true,
  editable = false,
  onCodeChange,
}) => {
  const colorScheme = useColorScheme()
  const normalizedLanguage = normalizeLanguage(language)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isOverflow, setIsOverflow] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const onCodeChangeRef = useRef(onCodeChange)
  onCodeChangeRef.current = onCodeChange

  const latestPropsRef = useRef({
    code,
    normalizedLanguage,
    colorScheme,
    showLineNumbers,
    editable,
  })
  latestPropsRef.current = {
    code,
    normalizedLanguage,
    colorScheme,
    showLineNumbers,
    editable,
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      const halfVh = window.innerHeight / 2
      setIsOverflow(el.scrollHeight >= halfVh)
    }
    const raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [code])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let inputCleanup: (() => void) | null = null

    ;(async () => {
      const props = latestPropsRef.current
      const [highlighter, { shikiCode }] = await Promise.all([
        getHighlighterWithLang(props.normalizedLanguage),
        import('shikicode'),
      ])

      if (disposed) return

      const theme = SHIKI_THEMES[props.colorScheme]
      const loaded: string[] = highlighter.getLoadedLanguages()
      const lang = loaded.includes(props.normalizedLanguage)
        ? props.normalizedLanguage
        : 'text'

      const editor = shikiCode()
        .withOptions({
          readOnly: !props.editable,
          lineNumbers: props.showLineNumbers ? 'on' : 'off',
        })
        .create(container, highlighter, {
          value: props.code,
          language: lang,
          theme,
        })

      if (!props.editable) {
        editor.input.tabIndex = -1
      }

      const handleInput = () => {
        onCodeChangeRef.current?.(editor.input.value)
      }
      editor.input.addEventListener('input', handleInput)
      inputCleanup = () =>
        editor.input.removeEventListener('input', handleInput)

      editorRef.current = editor
    })()

    return () => {
      disposed = true
      inputCleanup?.()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    let cancelled = false

    ;(async () => {
      const { highlighter } = editor
      const loaded: string[] = highlighter.getLoadedLanguages()

      if (
        normalizedLanguage !== 'text' &&
        normalizedLanguage !== 'plaintext' &&
        !loaded.includes(normalizedLanguage)
      ) {
        try {
          await highlighter.loadLanguage(normalizedLanguage)
        } catch {
          // fallback
        }
      }

      if (cancelled) return

      const resolvedLang = highlighter
        .getLoadedLanguages()
        .includes(normalizedLanguage)
        ? normalizedLanguage
        : 'text'

      if (editor.input.value !== code) {
        editor.input.value = code
      }

      editor.updateOptions({
        language: resolvedLang,
        theme: SHIKI_THEMES[colorScheme],
        lineNumbers: showLineNumbers ? 'on' : 'off',
        readOnly: !editable,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [code, normalizedLanguage, colorScheme, showLineNumbers, editable])

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

  const languageIcon = languageToIconMap[normalizedLanguage] || ''
  const languageLabel = getLanguageDisplayName(normalizedLanguage)
  const accent = languageToColorMap[normalizedLanguage] || '#64748b'

  const cardStyle = useMemo(
    () => ({ '--rr-code-accent': accent }) as CSSProperties,
    [accent],
  )

  const scrollClassName = [
    'rr-code-scroll',
    isCollapsed && isOverflow && 'rr-code-scroll-collapsed',
  ]
    .filter(Boolean)
    .join(' ')

  const bodyClassName = ['rr-code-body', !editable && 'rr-code-readonly']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="rr-code-card" style={cardStyle}>
      {normalizedLanguage !== 'text' && (
        <div className="rr-code-lang" aria-hidden>
          {languageIcon || languageLabel}
        </div>
      )}

      <button
        type="button"
        className="rr-code-copy"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? CheckIcon : CopyIcon}
      </button>

      <div className="rr-code-bg">
        <div ref={scrollRef} className={scrollClassName}>
          <div ref={containerRef} className={bodyClassName} />
        </div>

        {isOverflow && isCollapsed && (
          <div className="rr-code-expand-wrap">
            <button
              type="button"
              className="rr-code-expand"
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
