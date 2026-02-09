import type { LinkCardPlugin, PluginRegistry } from '../types'
import { githubRepoPlugin } from './github-repo'

/**
 * All registered plugins - sorted by priority (higher = checked first)
 *
 * TODO: 从主项目迁移所有 12 个 plugins:
 * - GitHub: commit, pr, issue, discussion
 * - Media: tmdb, bangumi, qq-music, netease-music
 * - Academic: arxiv
 * - Code: leetcode
 * - Self: mx-space
 */
export const plugins: PluginRegistry = [
  githubRepoPlugin,
  // TODO: 添加其他 plugins
].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

/**
 * Plugin map for O(1) lookup by name
 */
export const pluginMap = new Map<string, LinkCardPlugin>(
  plugins.map((p) => [p.name, p]),
)

/**
 * Get plugin by name (for explicit source usage)
 */
export function getPluginByName(name: string): LinkCardPlugin | undefined {
  return plugins.find((p) => p.name === name)
}

// Re-export individual plugins
export { githubRepoPlugin }
