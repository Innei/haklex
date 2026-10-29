import { normalizeCommandItems } from '@haklex/rich-editor/command-registry';
import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import { collectCommandItems } from '@haklex/rich-editor/commands';
import { PortalThemeWrapper } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor, TextNode } from 'lexical';
import { $getSelection, $isRangeSelection } from 'lexical';
import { isValidElement, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { getBuiltinItems } from './builtinItems';
import type { SlashMenuItem } from './SlashMenuItem';
import { SlashMenuItem as SlashMenuItemClass } from './SlashMenuItem';
import { SlashMenuList } from './SlashMenuList';

export interface SlashMenuPluginProps {
  extraItems?: SlashMenuItem[];
  items?: SlashMenuItem[];
  nested?: boolean;
  triggerChar?: string;
}

function toSlashItem(config: CommandItemConfig): SlashMenuItem {
  return new SlashMenuItemClass(config.title, {
    description: config.description,
    icon: isValidElement(config.icon) ? config.icon : undefined,
    keywords: config.keywords,
    nested: config.nested,
    section: config.section,
    onSelect: config.onSelect,
  });
}

export function normalizeSlashItems(items: SlashMenuItem[]): SlashMenuItem[] {
  return normalizeCommandItems(
    items.map((item) => ({
      title: item.title,
      description: item.description || undefined,
      icon: item.icon,
      keywords: item.keywords,
      nested: item.nested,
      section: item.section,
      onSelect: item.onSelect,
    })),
  ).map(toSlashItem);
}

export function collectNodeSlashItems(editor: LexicalEditor): SlashMenuItem[] {
  const configs = collectCommandItems(editor).filter(
    (c) => !c.placement || c.placement.includes('slash'),
  );
  return normalizeCommandItems(configs).map(toSlashItem);
}

export function getDefaultSlashItems(
  editor: LexicalEditor,
  extraItems?: SlashMenuItem[],
): SlashMenuItem[] {
  return normalizeSlashItems([
    ...getBuiltinItems(),
    ...collectNodeSlashItems(editor),
    ...(extraItems ?? []),
  ]);
}

export function filterSlashItems(query: string, items: SlashMenuItem[]): SlashMenuItem[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter((item) => {
    if (item.title.toLowerCase().includes(lower)) return true;
    return item.keywords.some((kw) => kw.toLowerCase().includes(lower));
  });
}

export function SlashMenuPlugin({
  items,
  extraItems,
  nested,
  triggerChar = '/',
}: SlashMenuPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const allItems = useMemo(() => {
    const combined = items ?? getDefaultSlashItems(editor, extraItems);
    return nested ? combined.filter((item) => item.nested !== false) : combined;
  }, [items, extraItems, nested, editor]);

  const filteredItems = useMemo(
    () => filterSlashItems(queryString ?? '', allItems),
    [queryString, allItems],
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(triggerChar, {
    minLength: 0,
  });

  const onSelectOption = useCallback(
    (
      option: SlashMenuItem,
      textNodeContainingQuery: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        if (textNodeContainingQuery) {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            textNodeContainingQuery.remove();
          }
        }
      });
      closeMenu();
      option.onSelect(editor, matchingString);
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashMenuItem>
      options={filteredItems}
      triggerFn={checkForTriggerMatch}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        matchingString,
      ) => {
        const anchorElement = anchorElementRef.current;
        if (!anchorElement) return null;
        return createPortal(
          <PortalThemeWrapper>
            <SlashMenuList
              anchorElement={anchorElement}
              options={filteredItems}
              query={matchingString}
              selectOptionAndCleanUp={selectOptionAndCleanUp}
              selectedIndex={selectedIndex}
              setHighlightedIndex={setHighlightedIndex}
            />
          </PortalThemeWrapper>,
          anchorElement,
        );
      }}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
    />
  );
}
