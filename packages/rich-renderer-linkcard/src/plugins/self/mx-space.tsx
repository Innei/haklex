import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types';
import { fetchJsonWithContext, generateColor, stripMarkdown } from '../../utils';

export interface MxSpacePluginConfig {
  webUrl: string;
}

export function createMxSpacePlugin(config: MxSpacePluginConfig): LinkCardPlugin {
  const webHost = new URL(config.webUrl).hostname;

  return {
    name: 'self',
    displayName: 'MxSpace Article',
    priority: 10,
    shape: 'compact',
    provider: 'mx-space',

    matchUrl(url: URL): UrlMatchResult | null {
      if (webHost !== url.hostname) return null;
      if (!url.pathname.startsWith('/posts/') && !url.pathname.startsWith('/notes/')) {
        return null;
      }
      return { id: url.pathname.slice(1), fullUrl: url.toString() };
    },

    isValidId(id: string): boolean {
      const [type, ...rest] = id.split('/');
      if (type !== 'posts' && type !== 'notes') return false;
      if (type === 'posts') return rest.length === 2;
      return rest.length === 1;
    },

    async fetch(
      id: string,
      _meta?: Record<string, unknown>,
      context?: LinkCardFetchContext,
    ): Promise<LinkCardData> {
      const [type, ...rest] = id.split('/');
      let data: {
        title: string;
        text: string;
        images?: { src: string }[];
        meta?: Record<string, any>;
        cover?: string;
        summary?: string | null;
      } = { title: '', text: '' };

      if (type === 'posts') {
        const [cate, slug] = rest;
        data = await fetchJsonWithContext(`posts/${cate}/${slug}`, context, 'mx-space');
      } else if (type === 'notes') {
        const [nid] = rest;
        const response = await fetchJsonWithContext(`notes/${nid}`, context, 'mx-space');
        data = response.data || response;
      }

      const coverImage = data.cover || data.meta?.cover;
      const spotlightColor = generateColor(data.title);

      return {
        title: data.title,
        desc: data.summary || `${stripMarkdown(data.text).slice(0, 50)}...`,
        image: coverImage || data.images?.[0]?.src,
        color: spotlightColor,
      };
    },
  };
}
