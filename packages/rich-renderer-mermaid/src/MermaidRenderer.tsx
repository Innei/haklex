import type { MermaidRendererProps } from '@shiro/rich-editor'
import { useColorScheme } from '@shiro/rich-editor'
import type { FC } from 'react'
import { useEffect, useId, useState } from 'react'

import * as css from './styles.css'

export const MermaidRenderer: FC<MermaidRendererProps> = ({ content }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [svg, setSvg] = useState('')
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()

  const colorScheme = useColorScheme()
  const id = useId().split(':').join('')

  useEffect(() => {
    import('mermaid').then((mo) => {
      mo.default.initialize({
        theme: colorScheme === 'dark' ? 'dark' : 'default',
      })
    })
  }, [colorScheme])

  useEffect(() => {
    if (!content) return
    setError('')
    setLoading(true)

    let cancelled = false

    import('mermaid').then(async (mo) => {
      const mermaid = mo.default
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
        setSvg(result.svg)
        const match = result.svg.match(/viewBox="[^"]*\s([\d.]+)\s([\d.]+)"/)
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
  }, [id, content])

  if (loading) {
    return <div className={css.mermaidLoading}>Mermaid Loading</div>
  }

  if (!svg) {
    return <div className={css.mermaidError}>{error || 'Render failed'}</div>
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(svg)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)))
  const imgSrc = `data:image/svg+xml;base64,${base64}`

  return (
    <div className={css.mermaidContainer}>
      <img src={imgSrc} alt="Mermaid diagram" width={width} height={height} />
    </div>
  )
}

export default MermaidRenderer
