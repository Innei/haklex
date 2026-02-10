import * as TabsPrimitive from '@radix-ui/react-tabs'
import { LayoutGroup, m } from 'motion/react'
import { useEffect, useId, useState } from 'react'

import { useColorScheme } from '../../context/ColorSchemeContext'
import type { TabItem } from '../../nodes/TabsNode'
import type { CodeToHtmlFn } from '../../utils/shiki'
import { loadCodeToHtml } from '../../utils/shiki'

export interface TabsRendererProps {
  tabs: TabItem[]
}

function TabCodeContent({
  code,
  language,
}: {
  code: string
  language: string
}) {
  const colorScheme = useColorScheme()
  const shikiTheme = colorScheme === 'dark' ? 'github-dark' : 'github-light'
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setHtml(null)

    loadCodeToHtml()
      .then((toHtml: CodeToHtmlFn) =>
        toHtml(code, { lang: language, theme: shikiTheme }),
      )
      .then((result: string) => {
        if (!cancelled) setHtml(result)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })

    return () => {
      cancelled = true
    }
  }, [code, language, shikiTheme])

  if (html) {
    return (
      <div
        className="rich-code-block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="rich-code-block">
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function TabsRenderer({ tabs }: TabsRendererProps) {
  const id = useId()
  const [activeTab, setActiveTab] = useState(tabs[0]?.label ?? '')

  if (tabs.length === 0) return null

  return (
    <TabsPrimitive.Root
      className="rich-tabs"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsPrimitive.List className="rich-tabs-list">
        <LayoutGroup id={id}>
          {tabs.map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.label}
              value={tab.label}
              className={`rich-tabs-trigger ${activeTab === tab.label ? 'rich-tabs-trigger-active' : ''}`}
            >
              <span className="rich-tabs-trigger-text">{tab.label}</span>
              {activeTab === tab.label && (
                <m.span
                  layoutId={`rich-tab-underline-${id}`}
                  className="rich-tabs-underline"
                />
              )}
            </TabsPrimitive.Trigger>
          ))}
        </LayoutGroup>
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.label}
          value={tab.label}
          className="rich-tabs-content"
        >
          {tab.language ? (
            <TabCodeContent code={tab.content} language={tab.language} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {tab.content}
            </pre>
          )}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
