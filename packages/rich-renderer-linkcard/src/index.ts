export type { EnhancedLinkCardProps } from './LinkCardRenderer'
export { LinkCardRenderer } from './LinkCardRenderer'
export { LinkCardSkeleton } from './LinkCardSkeleton'

// Export types for plugin development
export type {
  LinkCardData,
  LinkCardPlugin,
  LinkCardTypeClass,
  PluginRegistry,
  UrlMatchResult,
} from './types'

// Export plugin system
export { getPluginByName, pluginMap, plugins } from './plugins'

// Export individual plugins
export { githubRepoPlugin } from './plugins'

/**
 * TODO: 从主项目迁移所有 plugins:
 *
 * GitHub plugins (5):
 * - githubCommitPlugin
 * - githubPrPlugin
 * - githubIssuePlugin
 * - githubDiscussionPlugin
 * - githubRepoPlugin ✅
 *
 * Media plugins (4):
 * - tmdbPlugin
 * - bangumiPlugin
 * - qqMusicPlugin
 * - neteaseMusicPlugin
 *
 * Academic plugins (1):
 * - arxivPlugin
 *
 * Code plugins (1):
 * - leetcodePlugin
 *
 * Self plugins (1):
 * - mxSpacePlugin
 */
