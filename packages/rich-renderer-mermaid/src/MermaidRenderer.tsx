import type { ColorScheme, MermaidRendererProps } from '@haklex/rich-editor'
import type { FC } from 'react'

import * as css from './styles.css'
import { useMermaidRender } from './useMermaidRender'

export const MermaidRenderer: FC<
  MermaidRendererProps & { colorScheme?: ColorScheme }
> = ({ content, colorScheme }) => {
  const { loading, error, imgSrc, width, height } = useMermaidRender(
    content,
    colorScheme,
  )

  if (loading) {
    return (
      <pre className={css.mermaidLoading}>
        <code>{content}</code>
      </pre>
    )
  }

  if (!imgSrc) {
    return <div className={css.mermaidError}>{error || 'Render failed'}</div>
  }

  return (
    <div className={css.mermaidContainer} style={{ cursor: 'default' }}>
      <img src={imgSrc} alt="Mermaid diagram" width={width} height={height} />
    </div>
  )
}

export default MermaidRenderer
