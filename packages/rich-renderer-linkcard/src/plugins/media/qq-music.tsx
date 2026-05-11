import { vars } from '@haklex/rich-style-token';
import { Disc3, Mic2 } from 'lucide-react';

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
  shape: 'wide',
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mic2 aria-hidden size={12} strokeWidth={2} />
            <span style={{ color: '#525252', fontWeight: 500 }}>歌手</span>
            <span>{songInfo.singer.map((p: any) => p.name).join(' / ')}</span>
          </span>
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}
          >
            <Disc3 aria-hidden size={12} strokeWidth={2} />
            <span style={{ color: '#525252', fontWeight: 500 }}>专辑</span>
            <span>{songInfo.album.name}</span>
          </span>
        </>
      ),
      image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumId}.jpg?max_age=2592000`,
      color: '#31c27c',
    };
  },
};
