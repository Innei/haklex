import type { CodeBlockRendererProps } from '@haklex/rich-editor'
import { useVariant } from '@haklex/rich-editor'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { CodeBlockCard } from './CodeBlockCard'
import { normalizeLanguage } from './constants'
import { getHighlighterWithLang, SHIKI_DUAL_THEMES } from './shiki'
import * as styles from './styles.css'

export const CodeBlockRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers: showLineNumbersProp,
}) => {
  const variant = useVariant()
  const showLineNumbers = showLineNumbersProp ?? variant !== 'comment'
  const normalizedLanguage = normalizeLanguage(language)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const highlighter = await getHighlighterWithLang(normalizedLanguage)
      if (cancelled) return

      const loaded: string[] = highlighter.getLoadedLanguages()
      const lang = loaded.includes(normalizedLanguage)
        ? normalizedLanguage
        : 'text'

      const result = highlighter.codeToHtml(code, {
        lang,
        themes: SHIKI_DUAL_THEMES,
      })
      if (!cancelled) setHtml(result)
    })()

    return () => {
      cancelled = true
    }
  }, [code, normalizedLanguage])

  const fallbackLines = useMemo(() => code.split('\n'), [code])

  const linedClassName = [
    showLineNumbers && styles.lined,
    showLineNumbers && styles.semanticClassNames.lined,
    showLineNumbers && styles.linedWithNumbers,
    showLineNumbers && styles.semanticClassNames.linedWithNumbers,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <CodeBlockCard code={code} language={language}>
      {html ? (
        <div
          className={linedClassName}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className={linedClassName}>
          <code>
            {fallbackLines.map((line, i) => (
              <span key={i} className="line">
                {line}
              </span>
            ))}
          </code>
        </pre>
      )}
    </CodeBlockCard>
  )
}

export default CodeBlockRenderer
