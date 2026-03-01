/**
 * Demo: 业务扩展 LinkCard 插件
 *
 * 展示如何创建自定义 LinkCardPlugin 并通过 plugins prop 合并到内置插件中。
 * 传入的 plugins 会与内置 12 个插件合并（同名覆盖，按 priority 排序）。
 */
import type {
  LinkCardData,
  LinkCardPlugin,
  PluginRegistry,
  UrlMatchResult,
} from '@haklex/rich-renderer-linkcard/static'

/**
 * 示例 1: 豆瓣读书插件
 * 匹配 book.douban.com/subject/{id} URL，返回 mock 书籍卡片数据
 */
export const doubanBookPlugin: LinkCardPlugin = {
  name: 'douban-book',
  displayName: 'Douban Book',
  priority: 75,
  typeClass: 'media',
  provider: 'douban',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'book.douban.com') return null
    const match = url.pathname.match(/^\/subject\/(\d+)/)
    if (!match) return null
    return { id: match[1], fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    return /^\d+$/.test(id)
  },

  async fetch(id: string): Promise<LinkCardData> {
    // Mock data for demo
    return {
      title: `《代码大全》`,
      desc: `豆瓣评分 9.3 · Steve McConnell · 软件开发的百科全书 (ID: ${id})`,
      image: `https://picsum.photos/seed/douban-${id}/200/280`,
      color: '#319046',
      classNames: {
        image: 'link-card__image--poster',
        cardRoot: 'link-card--reversed',
      },
    }
  },
}

/**
 * 示例 2: 内部工单系统插件
 * 匹配 issues.example.com/PROJ-{number} 格式
 */
export const internalIssuePlugin: LinkCardPlugin = {
  name: 'internal-issue',
  displayName: 'Internal Issue Tracker',
  priority: 50,

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'issues.example.com') return null
    const match = url.pathname.match(/^\/([\w-]+-\d+)/)
    if (!match) return null
    return { id: match[1], fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    return /^[\w-]+-\d+$/.test(id)
  },

  async fetch(id: string): Promise<LinkCardData> {
    return {
      title: `${id}: Implement dark mode for dashboard`,
      desc: 'Status: In Progress · Assignee: @innei · Sprint 24',
      color: '#6366f1',
    }
  },
}

/**
 * 示例 3: 覆盖内置 GitHub repo 插件（同名 "gh-repo" 替换内置）
 * 演示同名覆盖机制
 */
export const customGithubRepoPlugin: LinkCardPlugin = {
  name: 'gh-repo',
  displayName: 'Custom GitHub Repo',
  priority: 100,
  typeClass: 'github',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'github.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length !== 2) return null
    return { id: `${parts[0]}/${parts[1]}`, fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    return /^[\w.-]+\/[\w.-]+$/.test(id)
  },

  async fetch(id: string): Promise<LinkCardData> {
    return {
      title: `${id} (custom plugin)`,
      desc: 'This card is rendered by the overridden gh-repo plugin',
      image: `https://opengraph.githubassets.com/1/${id}`,
      color: '#238636',
    }
  },
}

/**
 * 导出业务扩展插件列表
 * 使用方式：<LinkCardRenderer plugins={extraLinkCardPlugins} />
 * 内部会与 12 个内置插件合并（同名覆盖，按 priority 排序）
 */
export const extraLinkCardPlugins: PluginRegistry = [
  doubanBookPlugin,
  internalIssuePlugin,
]
