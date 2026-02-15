import * as TabsPrimitive from '@radix-ui/react-tabs'
import { m } from 'motion/react'
import { useEffect, useId, useState } from 'react'

import { useColorScheme } from '../../context/ColorSchemeContext'
import { useRendererConfig } from '../../context/RendererConfigContext'
import type { TabItem } from '../../nodes/TabsNode'
import { RichRenderer } from '../RichRenderer'

export interface TabsRendererProps {
  tabs: TabItem[]
}

export function TabsRenderer({ tabs }: TabsRendererProps) {
  const id = useId()
  const [activeTab, setActiveTab] = useState(tabs[0]?.label ?? '')
  const colorScheme = useColorScheme()
  const rendererConfig = useRendererConfig()

  useEffect(() => {
    if (tabs.length === 0) return
    if (tabs.some((tab) => tab.label === activeTab)) return
    setActiveTab(tabs[0]?.label ?? '')
  }, [activeTab, tabs])

  if (tabs.length === 0) return null

  return (
    <TabsPrimitive.Root
      className="rich-tabs"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsPrimitive.List className="rich-tabs-list">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.label}
            value={tab.label}
            className="rich-tabs-trigger"
          >
            {tab.label}
            {activeTab === tab.label && (
              <m.div
                layoutId={`tab${id}`}
                layout
                className="rich-tabs-underline"
              />
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.label}
          value={tab.label}
          className="rich-tabs-content"
        >
          <RichRenderer
            value={tab.content}
            theme={colorScheme}
            rendererConfig={rendererConfig}
          />
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
