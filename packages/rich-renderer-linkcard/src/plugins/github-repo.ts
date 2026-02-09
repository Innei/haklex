import type { LinkCardPlugin } from '../types'

/**
 * GitHub Repository Plugin
 * 支持格式: https://github.com/owner/repo
 */
export const githubRepoPlugin: LinkCardPlugin = {
  name: 'github-repo',
  displayName: 'GitHub Repository',
  priority: 100,
  typeClass: 'github',

  matchUrl(url: URL): { id: string; fullUrl: string } | null {
    if (url.hostname !== 'github.com') return null

    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/)
    if (!match) return null

    const [, owner, repo] = match
    return {
      id: `${owner}/${repo}`,
      fullUrl: url.href,
    }
  },

  isValidId(id: string): boolean {
    return /^[^/]+\/[^/]+$/.test(id)
  },

  async fetch(id: string) {
    const [owner, repo] = id.split('/')

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      )
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()

      return {
        title: data.full_name || `${owner}/${repo}`,
        desc: data.description || 'No description',
        image: data.owner?.avatar_url,
        color: '#238636', // GitHub green
      }
    } catch {
      // Fallback if API fails
      return {
        title: `${owner}/${repo}`,
        desc: 'GitHub Repository',
        color: '#238636',
      }
    }
  },
}
