import { vars } from '@haklex/rich-style-token';

import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types';
import { fetchJsonWithContext } from '../../utils';

export const qqMusicPlugin: LinkCardPlugin = {
  name: 'qq-music-song',
  displayName: 'QQ Music Song',
  priority: 60,
  typeClass: 'wide',
  provider: 'qq-music',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'y.qq.com') return null;
    if (!url.pathname.includes('/songDetail/')) return null;
    const parts = url.pathname.split('/');
    const songDetailIndex = parts.indexOf('songDetail');
    if (songDetailIndex === -1 || !parts[songDetailIndex + 1]) return null;
    return { id: parts[songDetailIndex + 1], fullUrl: url.toString() };
  },

  isValidId(id: string): boolean {
    return typeof id === 'string' && id.length > 0;
  },

  async fetch(
    id: string,
    _meta?: Record<string, unknown>,
    context?: LinkCardFetchContext,
  ): Promise<LinkCardData> {
    const songData = await fetchJsonWithContext(`https://y.qq.com/song/${id}`, context, 'qq-music');

    const songInfo = songData.data[0];
    const albumId = songInfo.album.mid;

    return {
      title: (
        <>
          <span>{songInfo.title}</span>
          {songInfo.subtitle && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: vars.typography.fontSizeMd,
                color: '#a3a3a3',
              }}
            >
              {songInfo.subtitle}
            </span>
          )}
        </>
      ),
      desc: (
        <>
          <span style={{ display: 'block' }}>
            <span style={{ fontWeight: 'bold' }}>歌手：</span>
            <span>{songInfo.singer.map((p: any) => p.name).join(' / ')}</span>
          </span>
          <span style={{ display: 'block' }}>
            <span style={{ fontWeight: 'bold' }}>专辑：</span>
            <span>{songInfo.album.name}</span>
          </span>
        </>
      ),
      image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumId}.jpg?max_age=2592000`,
      color: '#31c27c',
    };
  },
};
