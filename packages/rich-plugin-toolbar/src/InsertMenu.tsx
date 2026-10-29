import {
  Popover,
  PopoverPanel,
  PopoverTrigger,
  TextInput,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import type { SlashMenuItem } from '@haklex/rich-plugin-slash-menu';
import {
  filterSlashItems,
  slashCommandItemId,
  SlashCommandList,
} from '@haklex/rich-plugin-slash-menu';
import { Plus, Search } from 'lucide-react';
import type { KeyboardEvent, ReactElement } from 'react';
import { useEffect, useId, useMemo, useState } from 'react';

import * as css from './styles.css';
import type { ToolbarTooltipHandle, ToolbarTooltipPayload } from './types';

export interface InsertMenuProps {
  handle?: ToolbarTooltipHandle;
  items: SlashMenuItem[];
  onSelect: (item: SlashMenuItem) => void;
}

const TITLE = 'Insert';

export function InsertMenu({ handle, items, onSelect }: InsertMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const listId = useId();
  const filtered = useMemo(() => filterSlashItems(query, items), [query, items]);
  const activeIndex = filtered.length === 0 ? null : Math.min(highlighted, filtered.length - 1);

  useEffect(() => {
    if (activeIndex === null) return;
    filtered[activeIndex]?.ref?.current?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, filtered]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setHighlighted(0);
    }
  };

  const select = (item: SlashMenuItem) => {
    onOpenChange(false);
    onSelect(item);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;
    const current = activeIndex ?? 0;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((current + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      select(filtered[current]);
    }
  };

  const trigger = (
    <PopoverTrigger
      aria-label={TITLE}
      className={css.toolbarButton}
      render={<button type="button" />}
    />
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {handle ? (
        <TooltipTrigger
          handle={handle as any}
          payload={{ title: TITLE } satisfies ToolbarTooltipPayload}
          render={trigger}
        >
          <Plus size={16} />
        </TooltipTrigger>
      ) : (
        <PopoverTrigger
          aria-label={TITLE}
          className={css.toolbarButton}
          render={<button type="button" />}
        >
          <Plus size={16} />
        </PopoverTrigger>
      )}
      <PopoverPanel flush align="start" side="bottom" size="md">
        <div className={css.insertSearch}>
          <Search aria-hidden className={css.insertSearchIcon} size={14} />
          <TextInput
            aria-controls={listId}
            aria-label="Search blocks"
            className={css.insertSearchInput}
            placeholder="Search blocks"
            type="search"
            value={query}
            aria-activedescendant={
              activeIndex === null ? undefined : slashCommandItemId(listId, activeIndex)
            }
            onKeyDown={onKeyDown}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlighted(0);
            }}
          />
        </div>
        <SlashCommandList
          id={listId}
          items={filtered}
          query={query}
          selectedIndex={activeIndex}
          variant="embedded"
          onHighlight={setHighlighted}
          onSelect={select}
        />
      </PopoverPanel>
    </Popover>
  );
}
