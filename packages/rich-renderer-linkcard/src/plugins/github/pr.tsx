import { vars } from '@haklex/rich-style-token'

import type { LinkCardData, LinkCardPlugin, UrlMatchResult } from '../../types'
import { camelcaseKeys, fetchGitHubApi } from '../../utils'

type PrState = 'open' | 'merged' | 'closed'

const getPrState = (data: { state: string; merged: boolean }): PrState => {
  if (data.merged) return 'merged'
  return data.state as PrState
}

const stateColorMap: Record<PrState, string> = {
  open: '#238636',
  merged: '#8957e5',
  closed: '#f85149',
}

const stateTextMap: Record<PrState, string> = {
  open: 'Open',
  merged: 'Merged',
  closed: 'Closed',
}

export const githubPrPlugin: LinkCardPlugin = {
  name: 'gh-pr',
  displayName: 'GitHub Pull Request',
  priority: 95,
  typeClass: 'github',
  provider: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null
    if (!url.pathname.includes('/pull/')) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 4 || parts[2] !== 'pull') return null
    const [owner, repo, , prNumber] = parts
    return { id: `${owner}/${repo}/${prNumber}`, fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    const parts = id.split('/')
    return parts.length === 3 && parts.every((p) => p.length > 0)
  },

  async fetch(id: string, _meta, context): Promise<LinkCardData> {
    const [owner, repo, prNumber] = id.split('/')
    const response = await fetchGitHubApi(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      context,
    )
    const data = camelcaseKeys(response)
    const state = getPrState(data)
    const color = stateColorMap[state]
    const stateText = stateTextMap[state]

    return {
      title: `PR: ${data.title}`,
      color,
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
          <span style={{ color }}>{stateText}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#238636' }}>+{data.additions}</span>
            <span style={{ color: '#f85149' }}>-{data.deletions}</span>
          </span>
          <span style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.8 }}>
            {owner}/{repo}
          </span>
        </span>
      ),
      image: data.user.avatarUrl,
    }
  },
}
