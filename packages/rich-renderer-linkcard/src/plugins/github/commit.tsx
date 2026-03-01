import { vars } from '@haklex/rich-style-token'

import type { LinkCardData, LinkCardPlugin, UrlMatchResult } from '../../types'
import { camelcaseKeys, fetchGitHubApi } from '../../utils'

export const githubCommitPlugin: LinkCardPlugin = {
  name: 'gh-commit',
  displayName: 'GitHub Commit',
  priority: 95,
  typeClass: 'github',
  provider: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 4 || parts[2] !== 'commit') return null
    const [owner, repo, , commitId] = parts
    return {
      id: `${owner}/${repo}/commit/${commitId}`,
      fullUrl: url.toString(),
    }
  },

  isValidId(id: string): boolean {
    const parts = id.split('/')
    return (
      parts.length === 4 &&
      parts.every((p) => p.length > 0) &&
      parts[2] === 'commit'
    )
  },

  async fetch(id: string, _meta, context): Promise<LinkCardData> {
    const [owner, repo, , commitId] = id.split('/')
    const response = await fetchGitHubApi(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitId}`,
      context,
    )
    const data = camelcaseKeys(response)

    return {
      title: (
        <span style={{ fontWeight: 'normal' }}>
          {data.commit.message.replace(/Signed-off-by:.+/s, '').trim()}
        </span>
      ),
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
              gap: '8px',
            }}
          >
            <span style={{ color: '#238636' }}>+{data.stats.additions}</span>
            <span style={{ color: '#f85149' }}>-{data.stats.deletions}</span>
          </span>
          <span style={{ fontSize: vars.typography.fontSizeMd }}>
            {data.sha.slice(0, 7)}
          </span>
          <span style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.8 }}>
            {owner}/{repo}
          </span>
        </span>
      ),
      image: data.author?.avatarUrl,
    }
  },
}
