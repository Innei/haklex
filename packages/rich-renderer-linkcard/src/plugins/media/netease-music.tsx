import { vars } from '@haklex/rich-style-token';
import { Disc3, Mic2 } from 'lucide-react';

import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types';
import { fetchJsonWithContext } from '../../utils';

export const neteaseMusicPlugin: LinkCardPlugin = {
  name: 'netease-music-song',
  displayName: 'Netease Music Song',
  priority: 60,
  shape: 'wide',
  provider: 'netease-music',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'music.163.com') return null;
    if (!url.pathname.includes('/song') && !url.hash.includes('/song')) return null;
    const urlString = url.toString().replaceAll('/#/', '/');
    const _url = new URL(urlString);
    const id = _url.searchParams.get('id');
    if (!id) return null;
    return { id, fullUrl: url.toString() };
  },

  isValidId(id: string): boolean {
    return id.length > 0;
  },

  async fetch(
    id: string,
    _meta?: Record<string, unknown>,
    context?: LinkCardFetchContext,
  ): Promise<LinkCardData> {
    const songData = await fetchJsonWithContext(
      `https://music.163.com/song/${id}`,
      context,
      'netease-music',
    );

    const songInfo = songData.songs[0];
    const albumInfo = songInfo.al;
    const singerInfo = songInfo.ar;

    return {
      title: (
        <>
          <span>{songInfo.name}</span>
          {songInfo.tns && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: vars.typography.fontSizeMd,
                color: '#a3a3a3',
              }}
            >
              {songInfo.tns[0]}
            </span>
          )}
        </>
      ),
      desc: (
        <>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mic2 aria-hidden size={12} strokeWidth={2} />
            <span style={{ color: '#525252', fontWeight: 500 }}>歌手</span>
            <span>{singerInfo.map((p: any) => p.name).join(' / ')}</span>
          </span>
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}
          >
            <Disc3 aria-hidden size={12} strokeWidth={2} />
            <span style={{ color: '#525252', fontWeight: 500 }}>专辑</span>
            <span>{albumInfo.name}</span>
          </span>
        </>
      ),
      image: albumInfo.picUrl,
      color: '#e72d2c',
    };
  },
};
