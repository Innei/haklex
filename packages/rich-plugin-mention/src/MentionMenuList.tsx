import type { MentionMenuItem } from './MentionMenuItem'
import * as css from './styles.css'

interface MentionMenuListProps {
  options: MentionMenuItem[]
  selectedIndex: number | null
  selectOptionAndCleanUp: (option: MentionMenuItem) => void
  setHighlightedIndex: (index: number) => void
  phase: 1 | 2
}

export function MentionMenuList({
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
  phase,
}: MentionMenuListProps) {
  if (phase === 2) {
    const item = options[0]
    if (!item) return null

    return (
      <div className={css.mentionMenu}>
        <div className={css.phase2Container}>
          <div className={css.platformTag}>
            <span className={css.platformTagIcon}>{item.icon}</span>
            {item.description.split(' — ')[0]}
          </div>
          {item.handleText ? (
            <ul
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
              role="listbox"
            >
              <li
                className={css.mentionMenuItem}
                role="option"
                aria-selected={selectedIndex === 0}
                onClick={() => selectOptionAndCleanUp(item)}
                onMouseEnter={() => setHighlightedIndex(0)}
                ref={item.setRefElement}
                tabIndex={-1}
                style={{ margin: 0 }}
              >
                <span className={css.mentionMenuItemText}>
                  <span className={css.mentionMenuItemTitle}>
                    @{item.handleText}
                  </span>
                  <span className={css.mentionMenuItemDescription}>
                    Enter to confirm
                  </span>
                </span>
              </li>
            </ul>
          ) : (
            <div className={css.phase2Hint}>
              Type username, Enter to confirm
            </div>
          )}
        </div>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className={css.mentionMenu}>
        <div className={css.mentionMenuHint}>No matching platforms</div>
      </div>
    )
  }

  return (
    <ul className={css.mentionMenu} role="listbox">
      {options.map((item, index) => (
        <li
          key={item.key}
          className={css.mentionMenuItem}
          role="option"
          aria-selected={index === selectedIndex}
          onClick={() => selectOptionAndCleanUp(item)}
          onMouseEnter={() => setHighlightedIndex(index)}
          ref={item.setRefElement}
          tabIndex={-1}
        >
          <span className={css.mentionMenuItemIcon}>{item.icon}</span>
          <span className={css.mentionMenuItemText}>
            <span className={css.mentionMenuItemTitle}>{item.label}</span>
            <span className={css.mentionMenuItemDescription}>
              {item.description}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
