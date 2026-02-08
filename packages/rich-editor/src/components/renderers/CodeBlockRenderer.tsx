import { useEffect, useState } from 'react'

type CodeToHtmlFn = (
  code: string,
  options: { lang: string; theme: string },
) => Promise<string>

let codeToHtmlFn: CodeToHtmlFn | null = null
let shikiLoadPromise: Promise<CodeToHtmlFn> | null = null

function loadCodeToHtml(): Promise<CodeToHtmlFn> {
  if (codeToHtmlFn) return Promise.resolve(codeToHtmlFn)
  if (!shikiLoadPromise) {
    shikiLoadPromise = import('shiki/bundle/web').then(
      (mod: { codeToHtml: CodeToHtmlFn }) => {
        codeToHtmlFn = mod.codeToHtml
        return mod.codeToHtml
      },
    )
  }
  return shikiLoadPromise
}

export interface CodeBlockRendererProps {
  code: string
  language: string
}

export function CodeBlockRenderer({ code, language }: CodeBlockRendererProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadCodeToHtml()
      .then((toHtml: CodeToHtmlFn) =>
        toHtml(code, {
          lang: language,
          theme: 'github-dark',
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
  }, [code, language])

  if (highlightedHtml) {
    return (
      <div
        className="rich-code-block"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    )
  }

  return (
    <div className="rich-code-block">
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}
