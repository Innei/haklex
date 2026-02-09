import { useCallback, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { pluginMap } from '../plugins'
import type { LinkCardData } from '../types'

export interface UseCardFetcherOptions {
  source: string
  id: string
  fallbackUrl?: string
  enabled?: boolean
}

export interface UseCardFetcherResult {
  loading: boolean
  isError: boolean
  cardInfo: LinkCardData | undefined
  fullUrl: string
  isValid: boolean
}

/**
 * Hook to fetch card data using plugin system
 */
export function useCardFetcher(
  options: UseCardFetcherOptions,
): UseCardFetcherResult {
  const { source, id, fallbackUrl, enabled = true } = options

  const [loading, setLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [fullUrl] = useState(fallbackUrl || 'javascript:;')
  const [cardInfo, setCardInfo] = useState<LinkCardData>()

  // Get plugin
  const plugin = pluginMap.get(source)

  const isValid = useMemo(() => {
    if (!enabled || !plugin) return false
    return plugin.isValidId(id)
  }, [plugin, enabled, id])

  const fetchInfo = useCallback(async () => {
    if (!plugin || !isValid) return

    setLoading(true)
    setIsError(false)

    try {
      const data = await plugin.fetch(id)
      setCardInfo(data)
    } catch (err) {
      console.error(`[LinkCard] Error fetching ${source} data:`, err)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }, [plugin, isValid, id, source])

  const { ref } = useInView({
    triggerOnce: true,
    onChange(inView) {
      if (!inView || !enabled) return
      fetchInfo()
    },
  })

  // Expose ref for lazy loading
   
  const _ref = ref

  return {
    loading,
    isError,
    cardInfo,
    fullUrl,
    isValid,
  }
}
