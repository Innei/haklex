import { vars } from '@haklex/rich-style-token';
import { MessagesSquare } from 'lucide-react';

import type { LinkCardData, LinkCardPlugin, UrlMatchResult } from '../../types';
import { camelcaseKeys, fetchGitHubApi } from '../../utils';

export const githubDiscussionPlugin: LinkCardPlugin = {
  name: 'gh-discussion',
  displayName: 'GitHub Discussion',
  priority: 95,
  shape: 'compact',
  provider: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null;
    if (!url.pathname.includes('/discussions/')) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 4 || parts[2] !== 'discussions') return null;
    const discussionNumber = parts[3];
    if (!/^\d+$/.test(discussionNumber)) return null;
    const [owner, repo] = parts;
    return {
      id: `${owner}/${repo}/${discussionNumber}`,
      fullUrl: url.toString(),
    };
  },

  isValidId(id: string): boolean {
    const parts = id.split('/');
    return parts.length === 3 && parts.every((p) => p.length > 0) && /^\d+$/.test(parts[2]);
  },

  async fetch(id: string, _meta, context): Promise<LinkCardData> {
    const [owner, repo, discussionNumber] = id.split('/');
    const response = await fetchGitHubApi(
      `https://api.github.com/repos/${owner}/${repo}/discussions/${discussionNumber}`,
      context,
    );
    const data = camelcaseKeys(response);
    const categoryName = data.category?.name || 'Discussion';

    return {
      title: `Discussion: ${data.title}`,
      desc: (
        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px 12px',
            fontFamily: vars.typography.fontMono,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              borderRadius: '4px',
              backgroundColor: 'rgba(128,128,128,0.15)',
              padding: '2px 6px',
              fontSize: vars.typography.fontSizeXs,
            }}
          >
            <MessagesSquare aria-hidden size={11} strokeWidth={2} />
            {categoryName}
          </span>
          <span style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.8 }}>
            #{discussionNumber} · {owner}/{repo}
          </span>
        </span>
      ),
      image: data.user?.avatarUrl,
    };
  },
};
