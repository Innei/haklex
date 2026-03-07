import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { useEffect, useMemo } from 'react';

import type { SlashMenuItem } from './SlashMenuItem';
import * as css from './styles.css';

interface SlashMenuListProps {
  anchorElement: HTMLElement;
  options: SlashMenuItem[];
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: SlashMenuItem) => void;
  setHighlightedIndex: (index: number) => void;
}

interface SectionGroup {
  items: { item: SlashMenuItem; globalIndex: number }[];
  label: string;
}

function groupBySection(options: SlashMenuItem[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  const seen = new Map<string, SectionGroup>();

  options.forEach((item, index) => {
    const label = item.section;
    let group = seen.get(label);
    if (!group) {
      group = { label, items: [] };
      seen.set(label, group);
      groups.push(group);
    }
    group.items.push({ item, globalIndex: index });
  });

  return groups;
}

export function SlashMenuList({
  anchorElement,
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: SlashMenuListProps) {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: ['top-start'],
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    refs.setReference(anchorElement);
  }, [anchorElement, refs]);

  const sections = useMemo(() => groupBySection(options), [options]);

  if (options.length === 0) {
    return (
      <div className={css.slashMenu} ref={refs.setFloating} style={floatingStyles}>
        <div className={css.slashMenuEmpty}>No matching commands</div>
      </div>
    );
  }

  return (
    <ul className={css.slashMenu} ref={refs.setFloating} role="listbox" style={floatingStyles}>
      {sections.map((section, sectionIndex) => (
        <li className={css.slashMenuSectionWrapper} key={section.label} role="presentation">
          {sectionIndex > 0 && <div className={css.slashMenuSectionDivider} />}
          <div className={css.slashMenuSection}>{section.label}</div>
          <ul className={css.slashMenuItems} role="group">
            {section.items.map(({ item, globalIndex }) => (
              <li
                aria-selected={globalIndex === selectedIndex}
                className={css.slashMenuItem}
                key={item.key}
                ref={item.setRefElement}
                role="option"
                tabIndex={-1}
                onClick={() => selectOptionAndCleanUp(item)}
                onMouseEnter={() => setHighlightedIndex(globalIndex)}
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
  );
}
