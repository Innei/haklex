import { useEffect, useMemo, useState } from 'react'

import { useExcalidrawConfig } from './ExcalidrawConfigContext'
import type { ExcalidrawSnapshot } from './types'
import { parseSnapshot } from './types'

export interface ExcalidrawDataState {
  snapshot: Record<string, any> | undefined
  loading: boolean
  error: string
  /** The base reference line (URL or ref:file/xxx) when snapshot is remote or incremental */
  baseRef?: string
  /** The raw base data before delta patch (for computing new diffs in edit mode) */
  baseData?: Record<string, any>
}

type ParsedData =
  | { type: 'empty' }
  | { type: 'inline'; snapshot: Record<string, any> }
  | { type: 'remote'; fetchUrl: string; refLine: string }
  | { type: 'incremental'; fetchUrl: string; refLine: string; delta: object }
  | { type: 'error'; error: string }

function resolveUrl(
  url: string,
  apiUrl: string | undefined,
): { fetchUrl: string; refLine: string } | { error: string } {
  const refLine = url
  if (url.startsWith('http') || url.startsWith('blob:')) {
    return { fetchUrl: url, refLine }
  }
  if (url.startsWith('ref:') && apiUrl) {
    return { fetchUrl: `${apiUrl}/objects/${url.slice(4)}`, refLine }
  }
  return {
    error: url.startsWith('ref:')
      ? 'Missing apiUrl for ref resolution'
      : 'Unrecognized snapshot format',
  }
}

function typedToParsed(
  typed: ExcalidrawSnapshot,
  apiUrl: string | undefined,
): ParsedData {
  switch (typed.type) {
    case 'inline':
      return { type: 'inline', snapshot: typed.data }
    case 'remote': {
      const result = resolveUrl(typed.url, apiUrl)
      if ('error' in result) return { type: 'error', error: result.error }
      return {
        type: 'remote',
        fetchUrl: result.fetchUrl,
        refLine: result.refLine,
      }
    }
    case 'delta': {
      const result = resolveUrl(typed.baseUrl, apiUrl)
      if ('error' in result) return { type: 'error', error: result.error }
      return {
        type: 'incremental',
        fetchUrl: result.fetchUrl,
        refLine: result.refLine,
        delta: typed.delta,
      }
    }
  }
}

function stringToParsed(data: string, apiUrl: string | undefined): ParsedData {
  const typed = parseSnapshot(data)
  if (!typed) return { type: 'empty' }
  return typedToParsed(typed, apiUrl)
}

export function useExcalidrawData(
  data: string | ExcalidrawSnapshot | null,
): ExcalidrawDataState {
  const { apiUrl } = useExcalidrawConfig()

  const parsed = useMemo((): ParsedData => {
    if (data === null || data === undefined) return { type: 'empty' }
    if (typeof data === 'string') return stringToParsed(data, apiUrl)
    return typedToParsed(data, apiUrl)
  }, [data, apiUrl])

  const [remoteSnapshot, setRemoteSnapshot] = useState<
    Record<string, any> | undefined
  >()
  const [baseData, setBaseData] = useState<Record<string, any> | undefined>()
  const [loading, setLoading] = useState(
    parsed.type === 'remote' || parsed.type === 'incremental',
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (parsed.type !== 'remote' && parsed.type !== 'incremental') return

    const { fetchUrl } = parsed
    const delta = parsed.type === 'incremental' ? parsed.delta : undefined

    let cancelled = false
    setLoading(true)
    setError('')

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(async (json) => {
        if (cancelled) return
        setBaseData(json)

        const deltaKeys = delta
          ? Object.keys(delta as Record<string, unknown>)
          : []
        if (deltaKeys.length > 0) {
          const { patch } = await import('jsondiffpatch')
          if (cancelled) return
          const patched = patch(structuredClone(json), delta as any)
          setRemoteSnapshot(patched as Record<string, any>)
        } else {
          setRemoteSnapshot(json)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [parsed])

  if (parsed.type === 'inline') {
    return { snapshot: parsed.snapshot, loading: false, error: '' }
  }

  if (parsed.type === 'remote' || parsed.type === 'incremental') {
    return {
      snapshot: remoteSnapshot,
      loading,
      error,
      baseRef: parsed.refLine,
      baseData,
    }
  }

  if (parsed.type === 'error') {
    return { snapshot: undefined, loading: false, error: parsed.error }
  }

  return { snapshot: undefined, loading: false, error: '' }
}
