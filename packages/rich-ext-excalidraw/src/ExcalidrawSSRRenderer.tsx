import { ViewportGate } from '@haklex/rich-editor-ui'
import type { FC } from 'react'
import { lazy, Suspense } from 'react'

import * as css from './styles.css'

export interface ExcalidrawSSRRendererProps {
  snapshot: string
}

const LazyDisplayRenderer = lazy(() =>
  import('./ExcalidrawDisplayRenderer').then((m) => ({
    default: m.ExcalidrawDisplayRenderer,
  })),
)

const ExcalidrawPlaceholder: FC<{ snapshot: string }> = ({ snapshot }) => {
  let label = 'Excalidraw Whiteboard'
  try {
    const data = JSON.parse(snapshot)
    if (data && typeof data === 'object') {
      const elementCount = Array.isArray(data.elements)
        ? data.elements.length
        : 0
      if (elementCount > 0) {
        label = `Excalidraw Whiteboard (${elementCount} elements)`
      }
    }
  } catch {
    // snapshot may be a URL ref, delta format (URL\ndelta-json), or invalid JSON
  }

  return (
    <div className={css.excalidrawPlaceholder} aria-label={label}>
      <span>{label}</span>
    </div>
  )
}

export const ExcalidrawSSRRenderer: FC<ExcalidrawSSRRendererProps> = ({
  snapshot,
}) => {
  return (
    <ViewportGate fallback={<ExcalidrawPlaceholder snapshot={snapshot} />}>
      <Suspense fallback={<ExcalidrawPlaceholder snapshot={snapshot} />}>
        <LazyDisplayRenderer snapshot={snapshot} />
      </Suspense>
    </ViewportGate>
  )
}
