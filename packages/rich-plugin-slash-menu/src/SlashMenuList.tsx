import { useMemo } from 'react'

import type { SlashMenuItem } from './SlashMenuItem'
import * as css from './styles.css'

interface SlashMenuListProps {
  options: SlashMenuItem[]
  selectedIndex: number | null
  selectOptionAndCleanUp: (option: SlashMenuItem) => void
  setHighlightedIndex: (index: number) => void
}

interface SectionGroup {
  label: string
  items: { item: SlashMenuItem; globalIndex: number }[]
}

function groupBySection(options: SlashMenuItem[]): SectionGroup[] {
  const groups: SectionGroup[] = []
  const seen = new Map<string, SectionGroup>()

  options.forEach((item, index) => {
    const label = item.section
    let group = seen.get(label)
    if (!group) {
      group = { label, items: [] }
      seen.set(label, group)
      groups.push(group)
    }
    group.items.push({ item, globalIndex: index })
  })

  return groups
}

export function SlashMenuList({
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: SlashMenuListProps) {
  const sections = useMemo(() => groupBySection(options), [options])

  if (options.length === 0) {
    return (
      <div className={css.slashMenu}>
        <div className={css.slashMenuEmpty}>No matching commands</div>
      </div>
    )
  }

  return (
    <ul className={css.slashMenu} role="listbox">
      {sections.map((section) => (
        <li key={section.label} role="presentation">
          <div className={css.slashMenuSection}>{section.label}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} role="group">
            {section.items.map(({ item, globalIndex }) => (
              <li
                key={item.key}
                className={css.slashMenuItem}
                role="option"
                aria-selected={globalIndex === selectedIndex}
                onClick={() => selectOptionAndCleanUp(item)}
                onMouseEnter={() => setHighlightedIndex(globalIndex)}
                ref={item.setRefElement}
                tabIndex={-1}
              >
                <span className={css.slashMenuItemIcon}>{item.icon}</span>
                <span className={css.slashMenuItemText}>
                  <span className={css.slashMenuItemTitle}>{item.title}</span>
                  {item.description && (
                    <span className={css.slashMenuItemDescription}>
                      {item.description}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
