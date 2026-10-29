import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { useEffect } from 'react';

import type { MentionMenuItem } from './MentionMenuItem';
import * as css from './styles.css';

interface MentionMenuListProps {
  anchorElement: HTMLElement;
  heading?: string;
  hint?: string;
  options: MentionMenuItem[];
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: MentionMenuItem) => void;
  setHighlightedIndex: (index: number) => void;
}

export function MentionMenuList({
  anchorElement,
  heading,
  hint,
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: MentionMenuListProps) {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['top-start'], padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    refs.setReference(anchorElement);
  }, [anchorElement, refs]);

  return (
    <div className={css.mentionMenu} ref={refs.setFloating} style={floatingStyles}>
      {heading && <div className={css.mentionMenuHeading}>{heading}</div>}
      {options.length === 0 ? (
        <div className={css.mentionMenuEmpty}>{hint ?? 'No matches'}</div>
      ) : (
        <ul className={css.mentionMenuList} role="listbox">
          {options.map((item, index) => (
            <li
              aria-selected={index === selectedIndex}
              className={css.mentionMenuItem}
              key={item.key}
              ref={item.setRefElement}
              role="option"
              tabIndex={-1}
              aria-label={
                item.type === 'confirm' ? `${item.handleText} · ${item.label}` : undefined
              }
              onClick={() => selectOptionAndCleanUp(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span aria-hidden className={css.mentionMenuItemIcon}>
                {item.icon}
              </span>
              <span className={css.mentionMenuItemTitle}>
                {item.type === 'confirm' ? item.handleText : item.label}
              </span>
              <span className={css.mentionMenuItemEnd}>
                {item.type === 'confirm' ? item.label : item.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
