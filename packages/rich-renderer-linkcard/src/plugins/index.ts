import type { LinkCardPlugin, PluginRegistry } from '../types'
import { arxivPlugin } from './academic'
import { leetcodePlugin } from './code'
import {
  githubCommitPlugin,
  githubDiscussionPlugin,
  githubIssuePlugin,
  githubPrPlugin,
  githubRepoPlugin,
} from './github'
import {
  bangumiPlugin,
  neteaseMusicPlugin,
  qqMusicPlugin,
  tmdbPlugin,
} from './media'

export const plugins: PluginRegistry = [
  githubRepoPlugin,
  githubCommitPlugin,
  githubPrPlugin,
  githubIssuePlugin,
  githubDiscussionPlugin,
  arxivPlugin,
  tmdbPlugin,
  bangumiPlugin,
  qqMusicPlugin,
  neteaseMusicPlugin,
  leetcodePlugin,
].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

export function getPluginByName(name: string): LinkCardPlugin | undefined {
  return plugins.find((p) => p.name === name)
}

export const pluginMap = new Map<string, LinkCardPlugin>(
  plugins.map((p) => [p.name, p]),
)

export {
  arxivPlugin,
  bangumiPlugin,
  githubCommitPlugin,
  githubDiscussionPlugin,
  githubIssuePlugin,
  githubPrPlugin,
  githubRepoPlugin,
  leetcodePlugin,
  neteaseMusicPlugin,
  qqMusicPlugin,
  tmdbPlugin,
}

export type { MxSpacePluginConfig } from './self'
export { createMxSpacePlugin } from './self'
