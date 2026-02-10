import { useCallback, useEffect, useRef, useState } from 'react'

import { useColorScheme } from '../../context/ColorSchemeContext'

type CodeToHtmlFn = (
  code: string,
  options: { lang: string; theme: string },
) => Promise<string>

let codeToHtmlFn: CodeToHtmlFn | null = null
let shikiLoadPromise: Promise<CodeToHtmlFn> | null = null

function loadCodeToHtml(): Promise<CodeToHtmlFn> {
  if (codeToHtmlFn) return Promise.resolve(codeToHtmlFn)
  if (!shikiLoadPromise) {
    shikiLoadPromise = import('shiki/bundle/web')
      .then((mod: { codeToHtml: CodeToHtmlFn }) => {
        codeToHtmlFn = mod.codeToHtml
        return mod.codeToHtml
      })
      .catch((err) => {
        shikiLoadPromise = null
        throw err
      })
  }
  return shikiLoadPromise
}

export interface CodeBlockRendererProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

export function CodeBlockRenderer({
  code,
  language,
  showLineNumbers,
}: CodeBlockRendererProps) {
  const colorScheme = useColorScheme()
  const shikiTheme = colorScheme === 'dark' ? 'github-dark' : 'github-light'
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false
    setHighlightedHtml(null)

    loadCodeToHtml()
      .then((toHtml: CodeToHtmlFn) =>
        toHtml(code, {
          lang: language,
          theme: shikiTheme,
        }),
      )
      .then((html: string) => {
        if (!cancelled) {
          setHighlightedHtml(html)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHighlightedHtml(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [code, language, shikiTheme])

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

  const header = language ? (
    <div className="rich-code-block-header">
      <span className="rich-code-block-lang">{language}</span>
      <button
        type="button"
        className="rich-code-block-copy"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  ) : null

  const wrapperClass = showLineNumbers
    ? 'rich-code-block rich-code-block-numbered'
    : 'rich-code-block'

  if (highlightedHtml) {
    return (
      <div className={wrapperClass}>
        {header}
        <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </div>
    )
  }

  const lines = code.split('\n')
  return (
    <div className={wrapperClass}>
      {header}
      <pre>
        <code>
          {lines.map((line, i) => (
            <span key={i} className="line">
              {line}
              {i < lines.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
