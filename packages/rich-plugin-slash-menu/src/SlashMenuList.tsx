import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { useEffect } from 'react';

import { SlashCommandList } from './SlashCommandList';
import type { SlashMenuItem } from './SlashMenuItem';

interface SlashMenuListProps {
  anchorElement: HTMLElement;
  options: SlashMenuItem[];
  query?: string;
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: SlashMenuItem) => void;
  setHighlightedIndex: (index: number) => void;
}

export function SlashMenuList({
  anchorElement,
  options,
  query = '',
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

  return (
    <SlashCommandList
      escapeHint
      items={options}
      query={query}
      ref={refs.setFloating}
      selectedIndex={selectedIndex}
      style={floatingStyles}
      onHighlight={setHighlightedIndex}
      onSelect={selectOptionAndCleanUp}
    />
  );
}
