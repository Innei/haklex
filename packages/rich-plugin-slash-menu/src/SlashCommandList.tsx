import { Kbd } from '@haklex/rich-editor-ui';
import type { CSSProperties, ReactElement, Ref } from 'react';
import { useMemo } from 'react';

import type { SlashMenuItem } from './SlashMenuItem';
import * as css from './styles.css';

export interface SlashCommandListProps {
  className?: string;
  escapeHint?: boolean;
  id?: string;
  items: SlashMenuItem[];
  onHighlight: (index: number) => void;
  onSelect: (item: SlashMenuItem) => void;
  query: string;
  ref?: Ref<HTMLDivElement>;
  selectedIndex: number | null;
  style?: CSSProperties;
  variant?: 'floating' | 'embedded';
}

interface SectionGroup {
  items: { globalIndex: number; item: SlashMenuItem }[];
  label: string;
}

function groupBySection(options: SlashMenuItem[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  const seen = new Map<string, SectionGroup>();
  options.forEach((item, index) => {
    let group = seen.get(item.section);
    if (!group) {
      group = { label: item.section, items: [] };
      seen.set(item.section, group);
      groups.push(group);
    }
    group.items.push({ item, globalIndex: index });
  });
  return groups;
}

export function slashCommandItemId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}

export function SlashCommandList({
  className,
  escapeHint,
  id,
  items,
  onHighlight,
  onSelect,
  query,
  ref,
  selectedIndex,
  style,
  variant = 'floating',
}: SlashCommandListProps): ReactElement {
  const sections = useMemo(() => groupBySection(items), [items]);
  const classes = [css.slashMenu, variant === 'embedded' ? css.slashMenuEmbedded : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} ref={ref} style={style}>
      {items.length === 0 ? (
        <div className={css.slashMenuEmpty} data-slot="slash-menu-empty" role="status">
          <span>{query ? `No blocks match “${query}”` : 'No blocks'}</span>
          {escapeHint && (
            <span className={css.slashMenuEmptyHint}>
              <Kbd keys="Esc" size="sm" tone="muted" />
              keep as text
            </span>
          )}
        </div>
      ) : (
        <ul className={css.slashMenuList} id={id} role="listbox">
          {sections.map((section, sectionIndex) => (
            <li className={css.slashMenuSectionWrapper} key={section.label} role="presentation">
              {sectionIndex > 0 && <div className={css.slashMenuSectionDivider} />}
              <div className={css.slashMenuSection} data-slot="slash-menu-section">
                {section.label}
              </div>
              <ul aria-label={section.label} className={css.slashMenuItems} role="group">
                {section.items.map(({ item, globalIndex }) => (
                  <li
                    aria-selected={globalIndex === selectedIndex}
                    className={css.slashMenuItem}
                    id={id ? slashCommandItemId(id, globalIndex) : undefined}
                    key={item.key}
                    ref={item.setRefElement}
                    role="option"
                    tabIndex={-1}
                    onClick={() => onSelect(item)}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => onHighlight(globalIndex)}
                  >
                    <span className={css.slashMenuItemIcon}>{item.icon}</span>
                    <span className={css.slashMenuItemText}>
                      <span className={css.slashMenuItemTitle}>{item.title}</span>
                      {item.description && (
                        <span className={css.slashMenuItemDescription}>{item.description}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
