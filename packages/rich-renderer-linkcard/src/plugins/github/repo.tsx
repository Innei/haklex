import { vars } from '@haklex/rich-style-token';
import { Star } from 'lucide-react';

import type { LinkCardData, LinkCardPlugin, UrlMatchResult } from '../../types';
import { camelcaseKeys, fetchGitHubApi, LanguageToColorMap } from '../../utils';

function formatStargazers(n: number): string {
  return n.toLocaleString('en-US');
}

export const githubRepoPlugin: LinkCardPlugin = {
  name: 'gh-repo',
  displayName: 'GitHub Repository',
  priority: 100,
  shape: 'compact',
  provider: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) return null;
    const [owner, repo] = parts;
    if (!owner || !repo) return null;
    return { id: `${owner}/${repo}`, fullUrl: url.toString() };
  },

  isValidId(id: string): boolean {
    const parts = id.split('/');
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  },

  async fetch(id: string, _meta, context): Promise<LinkCardData> {
    const [owner, repo] = id.split('/');
    const response = await fetchGitHubApi(`https://api.github.com/repos/${owner}/${repo}`, context);
    const data = camelcaseKeys(response);

    return {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1 }}>{data.name}</span>
          <span style={{ flexShrink: 0 }}>
            {data.stargazersCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: vars.typography.fontSizeMd,
                  color: '#fb923c',
                }}
              >
                <Star aria-hidden size={14} strokeWidth={2} />
                <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
                  {formatStargazers(data.stargazersCount)}
                </span>
              </span>
            )}
          </span>
        </span>
      ),
      desc: data.description,
      image: data.owner.avatarUrl,
      color: (LanguageToColorMap as any)[data.language?.toLowerCase()],
    };
  },
};
