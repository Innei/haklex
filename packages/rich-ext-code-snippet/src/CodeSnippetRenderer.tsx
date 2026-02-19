import type { CodeSnippetRendererProps } from '@shiro/rich-editor'
import { useColorScheme } from '@shiro/rich-editor'
import { normalizeLanguage } from '@shiro/rich-renderer-codeblock/constants'
import {
  getHighlighterWithLang,
  SHIKI_THEMES,
} from '@shiro/rich-renderer-codeblock/shiki'
import { Check, Copy } from 'lucide-react'
import type { ComponentType, FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FileIcon } from './FileIcon'
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
      className="rcs-copy-btn"
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
  const colorScheme = useColorScheme()

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
          theme: SHIKI_THEMES[colorScheme],
        })
      }

      if (!cancelled) setHtmlMap(newHtmlMap)
    })()

    return () => {
      cancelled = true
    }
  }, [files, colorScheme])

  if (!activeFile) return null

  return (
    <div className="rcs-container" role="region" aria-label="Code snippet">
      {/* Header */}
      <div className="rcs-header">
        {isMultiFile ? (
          <div className="rcs-tabs" role="tablist" aria-label="Code file tabs">
            {files.map((file, index) => (
              <button
                key={file.filename}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`rcs-tab ${index === activeIndex ? 'rcs-tab-active' : ''}`}
              >
                <FileIcon filename={file.filename} size={14} />
                <span>{file.filename}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rcs-title-bar">
            <FileIcon filename={activeFile.filename} size={14} />
            <span>{activeFile.filename}</span>
          </div>
        )}

        <div className="rcs-header-actions">
          <CopyButton text={activeFile.code} />
        </div>
      </div>

      {/* Separator */}
      <div className="rcs-separator" />

      {/* Code panels */}
      {files.map((file, index) => {
        const html = htmlMap[file.filename]
        return (
          <div
            key={file.filename}
            role={isMultiFile ? 'tabpanel' : undefined}
            className="rcs-code-panel"
            style={{ display: index === activeIndex ? 'block' : 'none' }}
          >
            <div className="rcs-code-scroll">
              {html ? (
                <div
                  className="rcs-code-body"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <pre className="rcs-code-body">
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
  )
}
