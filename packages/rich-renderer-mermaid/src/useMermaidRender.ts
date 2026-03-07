import type { ColorScheme } from '@haklex/rich-editor'
import { useColorScheme } from '@haklex/rich-editor'
import { useEffect, useId, useState } from 'react'

import { darkTheme, darkTokens, lightTheme, lightTokens } from './mermaid-theme'
import { postProcessMermaidSvg } from './svg-post-process'

export function useMermaidRender(
  content: string,
  preferredColorScheme?: ColorScheme,
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [svg, setSvg] = useState('')
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()

  const colorScheme = useColorScheme()
  const effectiveColorScheme = preferredColorScheme ?? colorScheme
  const id = useId().split(':').join('')

  useEffect(() => {
    if (!content) return
    setError('')
    setLoading(true)

    let cancelled = false

    import('mermaid').then(async (mo) => {
      const mermaid = mo.default
      const themeConfig =
        effectiveColorScheme === 'dark' ? darkTheme : lightTheme
      const tokens = effectiveColorScheme === 'dark' ? darkTokens : lightTokens

      mermaid.initialize({
        startOnLoad: false,
        theme: themeConfig.theme,
        themeVariables: themeConfig.themeVariables,
        darkMode: effectiveColorScheme === 'dark',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 20,
          nodeSpacing: 24,
          rankSpacing: 48,
        },
        sequence: {
          actorMargin: 80,
          messageMargin: 40,
        },
        gantt: {
          titleTopMargin: 16,
          barHeight: 24,
          barGap: 6,
        },
      })

      let result
      try {
        result = await mermaid.render(`mermaid-${id}`, content)
      } catch (err) {
        document.getElementById(`dmermaid-${id}`)?.remove()
        if (err instanceof Error) {
          setError(err.message)
        }
        setSvg('')
        setWidth(undefined)
        setHeight(undefined)
      }

      if (cancelled) return

      if (result) {
        // Apply beautiful-mermaid inspired visual post-processing
        const processedSvg = postProcessMermaidSvg(result.svg, tokens)

        setSvg(processedSvg)
        const match = processedSvg.match(/viewBox="[^"]*\s([\d.]+)\s([\d.]+)"/)
        if (match?.[1] && match?.[2]) {
          setWidth(Number.parseInt(match[1]))
          setHeight(Number.parseInt(match[2]))
        }
        setError('')
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id, content, effectiveColorScheme])

  let imgSrc = ''
  if (svg) {
    const encoder = new TextEncoder()
    const data = encoder.encode(svg)
    imgSrc = `data:image/svg+xml;base64,${btoa(String.fromCodePoint(...new Uint8Array(data)))}`
  }

  return { loading, error, imgSrc, svg, width, height }
}
