import { useState } from 'react'

import type { TabItem } from '../../nodes/TabsNode'

export interface TabsRendererProps {
  tabs: TabItem[]
}

export function TabsRenderer({ tabs }: TabsRendererProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (tabs.length === 0) return null

  return (
    <div className="rich-tabs">
      <div className="rich-tabs-header" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            className={`rich-tabs-tab ${index === activeIndex ? 'rich-tabs-tab-active' : ''}`}
            aria-selected={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rich-tabs-content" role="tabpanel">
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
          {tabs[activeIndex]?.content}
        </pre>
      </div>
    </div>
  )
}
