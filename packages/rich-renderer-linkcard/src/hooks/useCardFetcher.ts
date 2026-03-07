import { useCallback, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import type { LinkCardData, LinkCardFetchContext, LinkCardPlugin } from '../types';

export interface UseCardFetcherOptions {
  context?: LinkCardFetchContext;
  enabled?: boolean;
  fallbackUrl?: string;
  id: string;
  plugin?: LinkCardPlugin;
  source?: string;
}

export interface UseCardFetcherResult {
  cardInfo: LinkCardData | undefined;
  fullUrl: string;
  isError: boolean;
  isValid: boolean;
  loading: boolean;
  ref: (node?: Element | null) => void;
}

export function useCardFetcher(options: UseCardFetcherOptions): UseCardFetcherResult {
  const { source, plugin, id, fallbackUrl, enabled = true, context } = options;

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [fullUrl] = useState(fallbackUrl || 'javascript:;');
  const [cardInfo, setCardInfo] = useState<LinkCardData>();

  const isValid = useMemo(() => {
    if (!enabled || !plugin) return false;
    return plugin.isValidId(id);
  }, [plugin, enabled, id]);

  const fetchInfo = useCallback(async () => {
    if (!plugin || !isValid) return;

    setLoading(true);
    setIsError(false);

    try {
      const data = await plugin.fetch(id, undefined, context);
      setCardInfo(data);
    } catch (err) {
      console.error(`[LinkCard] Error fetching ${source || plugin.name} data:`, err);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [context, plugin, isValid, id, source]);

  const { ref } = useInView({
    triggerOnce: true,
    onChange(inView) {
      if (!inView || !enabled) return;
      fetchInfo();
    },
  });

  return {
    loading,
    isError,
    cardInfo,
    fullUrl,
    isValid,
    ref,
  };
}
