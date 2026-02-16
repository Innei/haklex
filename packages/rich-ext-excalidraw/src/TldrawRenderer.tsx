import type { FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as css from './styles.css'

export interface TldrawRendererProps {
  snapshot: string
  onSnapshotChange?: (snapshot: string) => void
}

export const TldrawRenderer: FC<TldrawRendererProps> = ({
  snapshot,
  onSnapshotChange,
}) => {
  const isEditable = !!onSnapshotChange

  if (isEditable) {
    return (
      <TldrawEditorCanvas
        snapshot={snapshot}
        onSnapshotChange={onSnapshotChange}
      />
    )
  }

  return <TldrawReadOnly snapshot={snapshot} />
}

// Read-only: uses TldrawImage component for static SVG rendering
const TldrawReadOnly: FC<{ snapshot: string }> = ({ snapshot }) => {
  const [TldrawImageComponent, setTldrawImageComponent] =
    useState<FC<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    import('tldraw')
      .then((mod) => {
        setTldrawImageComponent(() => mod.TldrawImage)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tldraw')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className={css.tldrawLoading}>Loading tldraw...</div>
  }

  if (error || !TldrawImageComponent) {
    return <div className={css.tldrawError}>{error || 'Failed to load'}</div>
  }

  let parsedSnapshot: Record<string, any> | undefined
  try {
    const parsed = JSON.parse(snapshot)
    if (parsed && typeof parsed === 'object') {
      parsedSnapshot = parsed
    }
  } catch {
    return <div className={css.tldrawError}>Invalid snapshot data</div>
  }

  return (
    <div className={css.tldrawContainer}>
      <TldrawImageComponent snapshot={parsedSnapshot} format="svg" />
    </div>
  )
}

// Interactive editor for edit mode
const TldrawEditorCanvas: FC<{
  snapshot: string
  onSnapshotChange: (snapshot: string) => void
}> = ({ snapshot, onSnapshotChange }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [TldrawComponent, setTldrawComponent] = useState<FC<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const initialSnapshotRef = useRef(snapshot)

  useEffect(() => {
    import('tldraw').then((mod) => {
      setTldrawComponent(() => mod.Tldraw)
      setLoading(false)
    })
  }, [])

  const handleChange = useCallback(
    (editor: any) => {
      try {
        const doc = editor.store.getSnapshot()
        onSnapshotChange(JSON.stringify(doc))
      } catch {
        // ignore serialization errors
      }
    },
    [onSnapshotChange],
  )

  if (loading || !TldrawComponent) {
    return <div className={css.tldrawLoading}>Loading tldraw editor...</div>
  }

  let snapshotProp: Record<string, any> | undefined
  try {
    const parsed = JSON.parse(initialSnapshotRef.current)
    if (parsed && typeof parsed === 'object') {
      snapshotProp = parsed
    }
  } catch {
    // start with empty canvas
  }

  return (
    <div ref={containerRef} className={css.tldrawEditorContainer}>
      <TldrawComponent
        snapshot={snapshotProp}
        onMount={(editor: any) => {
          editor.store.listen(() => handleChange(editor), {
            scope: 'document',
          })
        }}
      />
    </div>
  )
}
