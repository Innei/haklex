import { vars } from '@haklex/rich-style-token';
import { Star } from 'lucide-react';

import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types';
import { fetchJsonWithContext, generateColor } from '../../utils';

const TMDB_LANGUAGE_BY_LOCALE: Record<string, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
};

const getCurrentLocale = () => {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement?.lang?.trim();
    if (lang) return lang;
  }
  if (typeof window !== 'undefined') {
    const firstSegment = window.location.pathname.split('/').find((s) => s.length > 0);
    if (firstSegment) return firstSegment;
  }
  return 'en';
};

export const tmdbPlugin: LinkCardPlugin = {
  name: 'tmdb',
  displayName: 'The Movie Database',
  priority: 70,
  shape: 'poster',
  provider: 'tmdb',

  matchUrl(url: URL): UrlMatchResult | null {
    if (!url.hostname.includes('themoviedb.org')) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const [type, realId] = parts;
    const canParsedTypes = ['tv', 'movie'];
    if (!canParsedTypes.includes(type) || !realId) return null;
    return { id: `${type}/${realId}`, fullUrl: url.toString(), meta: { type } };
  },

  isValidId(id: string): boolean {
    const [type, realId] = id.split('/');
    const canParsedTypes = ['tv', 'movie'];
    return canParsedTypes.includes(type) && realId?.length > 0;
  },

  async fetch(id: string, _meta, context?: LinkCardFetchContext): Promise<LinkCardData> {
    const [type, realId] = id.split('/');
    const locale = getCurrentLocale();
    const userLanguage =
      TMDB_LANGUAGE_BY_LOCALE[locale] ||
      (typeof navigator !== 'undefined' ? navigator.language : 'en-US') ||
      'en-US';

    const json = await fetchJsonWithContext(
      `https://api.themoviedb.org/3/${type}/${realId}?language=${userLanguage}`,
      context,
      'tmdb',
    );

    const title = type === 'tv' ? json.name : json.title;
    const originalTitle = type === 'tv' ? json.original_name : json.original_title;

    return {
      title: (
        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          <span>{title}</span>
          {title !== originalTitle && (
            <span style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.7 }}>
              ({originalTitle})
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              flexShrink: 0,
              alignItems: 'center',
              gap: '4px',
              alignSelf: 'center',
              fontSize: vars.typography.fontSizeXs,
              color: '#fb923c',
            }}
          >
            <Star aria-hidden size={13} strokeWidth={2} />
            <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
              {json.vote_average > 0 && json.vote_average.toFixed(1)}
            </span>
          </span>
        </span>
      ),
      desc: <span style={{ overflow: 'visible', whiteSpace: 'pre-wrap' }}>{json.overview}</span>,
      image: `https://image.tmdb.org/t/p/w500${json.poster_path}`,
      color: generateColor(title || originalTitle || id),
    };
  },
};
