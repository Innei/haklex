import { getVariantClass } from '@haklex/rich-editor'
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static'
import { useState } from 'react'

import { Panel } from '../components/Panel'
import { useTheme } from '../context/ThemeContext'
import {
  customGithubRepoPlugin,
  extraLinkCardPlugins,
} from '../fixtures/extra-linkcard-plugins'

interface DemoCard {
  key: string
  label: string
  url: string
  description: string
  title?: string
  useOverride?: boolean
}

const demoCards: DemoCard[] = [
  {
    key: 'douban',
    label: 'Douban Book (custom plugin)',
    url: 'https://book.douban.com/subject/1477390',
    description:
      'doubanBookPlugin 匹配 book.douban.com，与内置 12 个插件合并后生效',
  },
  {
    key: 'issue',
    label: 'Internal Issue (custom plugin)',
    url: 'https://issues.example.com/PROJ-1234',
    description:
      'internalIssuePlugin 匹配 issues.example.com，新增插件不影响内置',
  },
  {
    key: 'github',
    label: 'GitHub Repo (builtin)',
    url: 'https://github.com/facebook/react',
    description: '内置 gh-repo 插件自动匹配，无需额外配置',
  },
  {
    key: 'github-override',
    label: 'GitHub Repo (overridden)',
    url: 'https://github.com/vercel/next.js',
    description:
      '传入同名 "gh-repo" 插件覆盖内置实现，卡片标题带 (custom plugin) 标记',
    useOverride: true,
  },
  {
    key: 'static',
    label: 'Static fallback (no plugin match)',
    url: 'https://example.com/article',
    title: 'Example Article',
    description: '无插件匹配时降级为静态 props 渲染',
  },
]

export function LinkCardPluginsPage() {
  const theme = useTheme()
  const [showOverride, setShowOverride] = useState(false)

  return (
    <div className="page">
      <div className="showcase-intro">
        <h2>LinkCard Plugin Extension Demo</h2>
        <p>
          <code>plugins</code> prop 传入的插件会与内置 12
          个插件合并（同名覆盖，按 priority 排序）。
          业务方只需提供额外插件，无需重复声明内置插件。
        </p>
      </div>

      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Override</span>
          <button
            className={showOverride ? 'btn btn-active' : 'btn'}
            onClick={() => setShowOverride((v) => !v)}
          >
            Override gh-repo
          </button>
        </div>
      </div>

      <section className="showcase-section">
        <h3 className="showcase-section-title">Extra Plugins (merge)</h3>
        <p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 14 }}>
          plugins={'{[doubanBookPlugin, internalIssuePlugin]}'} — 合并后共{' '}
          {12 + extraLinkCardPlugins.length} 个插件
        </p>
        <div className="showcase-grid" data-theme={theme} style={{ gap: 16 }}>
          {demoCards
            .filter((c) => !c.useOverride || showOverride)
            .map((card) => (
              <Panel key={card.key} title={card.label} badge="linkcard">
                <p className="node-description">{card.description}</p>
                <div
                  className={`node-render ${getVariantClass('article')}`}
                  data-theme={theme}
                  style={{ marginTop: 8 }}
                >
                  <LinkCardRenderer
                    url={card.url}
                    title={card.title}
                    plugins={
                      card.useOverride
                        ? [...extraLinkCardPlugins, customGithubRepoPlugin]
                        : extraLinkCardPlugins
                    }
                  />
                </div>
              </Panel>
            ))}
        </div>
      </section>

      <section className="showcase-section">
        <h3 className="showcase-section-title">Plugin Source</h3>
        <pre
          style={{
            padding: 16,
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 13,
            lineHeight: 1.6,
            background: 'var(--demo-surface, #f5f5f5)',
          }}
        >
          {`import type { LinkCardPlugin, PluginRegistry } from '@haklex/rich-renderer-linkcard/static'

// 1. 定义业务插件
const doubanBookPlugin: LinkCardPlugin = {
  name: 'douban-book',
  displayName: 'Douban Book',
  priority: 75,
  typeClass: 'media',
  matchUrl(url) {
    if (url.hostname !== 'book.douban.com') return null
    const m = url.pathname.match(/^\\/subject\\/(\\d+)/)
    return m ? { id: m[1], fullUrl: url.toString() } : null
  },
  isValidId: (id) => /^\\d+$/.test(id),
  async fetch(id) {
    const data = await fetchBookInfo(id)
    return { title: data.title, desc: data.rating, image: data.cover }
  },
}

// 2. 传入 plugins — 自动与内置 12 个插件合并
<LinkCardRenderer
  url="https://book.douban.com/subject/1477390"
  plugins={[doubanBookPlugin]}
/>`}
        </pre>
      </section>
    </div>
  )
}
