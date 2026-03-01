import { vars } from '@haklex/rich-style-token'

import type { LinkCardData, LinkCardPlugin, UrlMatchResult } from '../../types'
import { camelcaseKeys, fetchGitHubApi } from '../../utils'

const stateColors: Record<string, string> = {
  open: '#238636',
  closed: '#f85149',
}

const stateTextMap: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
}

export const githubIssuePlugin: LinkCardPlugin = {
  name: 'gh-issue',
  displayName: 'GitHub Issue',
  priority: 95,
  typeClass: 'github',
  provider: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null
    if (!url.pathname.includes('/issues/')) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 4 || parts[2] !== 'issues') return null
    const issueNumber = parts[3]
    if (!/^\d+$/.test(issueNumber)) return null
    const [owner, repo] = parts
    return { id: `${owner}/${repo}/${issueNumber}`, fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    const parts = id.split('/')
    return (
      parts.length === 3 &&
      parts.every((p) => p.length > 0) &&
      /^\d+$/.test(parts[2])
    )
  },

  async fetch(id: string, _meta, context): Promise<LinkCardData> {
    const [owner, repo, issueNumber] = id.split('/')
    const response = await fetchGitHubApi(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      context,
    )
    const data = camelcaseKeys(response)
    const color = stateColors[data.state] || '#6b7280'
    const stateText = stateTextMap[data.state] || data.state

    return {
      title: `Issue: ${data.title}`,
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
          <span style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.8 }}>
            #{issueNumber} · {owner}/{repo}
          </span>
        </span>
      ),
      image: data.user?.avatarUrl,
    }
  },
}
