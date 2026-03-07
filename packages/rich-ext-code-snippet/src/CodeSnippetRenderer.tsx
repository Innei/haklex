import type { CodeSnippetRendererProps } from '@haklex/rich-editor'
import { normalizeLanguage } from '@haklex/rich-renderer-codeblock/constants'
import { FileIcon } from '@haklex/rich-renderer-codeblock/icons'
import {
  getHighlighterWithLang,
  SHIKI_DUAL_THEMES,
} from '@haklex/rich-renderer-codeblock/shiki'
import { Check, Copy } from 'lucide-react'
import type { ComponentType, FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as styles from './styles.css'
import { getLanguageFromFilename } from './utils'

const CopyButton: FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      type="button"
      className={`${styles.copyButton} ${styles.semanticClassNames.copyButton}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export const CodeSnippetRenderer: ComponentType<CodeSnippetRendererProps> = ({
  files,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [htmlMap, setHtmlMap] = useState<Record<string, string>>({})

  const activeFile = files[activeIndex] ?? files[0]
  const isMultiFile = files.length > 1

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const newHtmlMap: Record<string, string> = {}

      for (const file of files) {
        const lang = normalizeLanguage(
          file.language ?? getLanguageFromFilename(file.filename),
        )
        const highlighter = await getHighlighterWithLang(lang)
        if (cancelled) return

        const loaded: string[] = highlighter.getLoadedLanguages()
        const resolvedLang = loaded.includes(lang) ? lang : 'text'

        newHtmlMap[file.filename] = highlighter.codeToHtml(file.code, {
          lang: resolvedLang,
          themes: SHIKI_DUAL_THEMES,
        })
      }

      if (!cancelled) setHtmlMap(newHtmlMap)
    })()

    return () => {
      cancelled = true
    }
  }, [files])

  if (!activeFile) return null

  return (
    <div
      className={`${styles.container} ${styles.semanticClassNames.container}`}
      role="region"
      aria-label="Code snippet"
    >
      {/* Header */}
      <div className={`${styles.header} ${styles.semanticClassNames.header}`}>
        {isMultiFile ? (
          <div
            className={`${styles.tabs} ${styles.semanticClassNames.tabs}`}
            role="tablist"
            aria-label="Code file tabs"
          >
            {files.map((file, index) => (
              <button
                key={file.filename}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`${styles.tab({ active: index === activeIndex })} ${styles.semanticClassNames.tab} ${index === activeIndex ? styles.semanticClassNames.tabActive : ''}`.trim()}
              >
                <FileIcon
                  filename={file.filename}
                  size={14}
                  className={`${styles.fileIcon} ${styles.semanticClassNames.fileIcon}`}
                />
                <span>{file.filename}</span>
              </button>
            ))}
          </div>
        ) : (
          <div
            className={`${styles.titleBar} ${styles.semanticClassNames.titleBar}`}
          >
            <FileIcon
              filename={activeFile.filename}
              size={14}
              className={`${styles.fileIcon} ${styles.semanticClassNames.fileIcon}`}
            />
            <span>{activeFile.filename}</span>
          </div>
        )}

        <div
          className={`${styles.headerActions} ${styles.semanticClassNames.headerActions}`}
        >
          <CopyButton text={activeFile.code} />
        </div>
      </div>

      {/* Separator */}
      <div
        className={`${styles.separator} ${styles.semanticClassNames.separator}`}
      />

      {/* Code panels - allow-discrete + @starting-style for height transition */}
      <div
        className={`${styles.codePanelsWrapper} ${styles.semanticClassNames.codePanelsWrapper}`}
      >
        {files.map((file, index) => {
          const html = htmlMap[file.filename]
          return (
            <div
              key={file.filename}
              role={isMultiFile ? 'tabpanel' : undefined}
              data-active={index === activeIndex}
              className={`${styles.codePanel} ${styles.semanticClassNames.codePanel}`}
            >
              <div
                className={`${styles.codeScroll} ${styles.semanticClassNames.codeScroll}`}
              >
                {html ? (
                  <div
                    className={`${styles.codeBody} ${styles.semanticClassNames.codeBody}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <pre
                    className={`${styles.codeBody} ${styles.semanticClassNames.codeBody}`}
                  >
                    <code>
                      {file.code.split('\n').map((line, i) => (
                        <span key={i} className="line">
                          {line}
                        </span>
                      ))}
                    </code>
                  </pre>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
