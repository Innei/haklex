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

export function collectNodeSlashItems(editor: LexicalEditor): SlashMenuItem[] {
  const configs = collectCommandItems(editor);
  return configs
    .filter((c) => !c.placement || c.placement.includes('slash'))
    .map(
      (c) =>
        new SlashMenuItemClass(c.title, {
          description: c.description,
          icon: isValidElement(c.icon) ? c.icon : undefined,
          keywords: c.keywords,
          nested: c.nested,
          section: c.section,
          onSelect: c.onSelect,
        }),
    );
}

function filterItems(query: string, items: SlashMenuItem[]): SlashMenuItem[] {
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
    let combined: SlashMenuItem[];
    if (items) {
      combined = items;
    } else {
      const builtins = getBuiltinItems();
      const nodeItems = collectNodeSlashItems(editor);
      combined = extraItems
        ? [...builtins, ...nodeItems, ...extraItems]
        : [...builtins, ...nodeItems];
    }
    return nested ? combined.filter((item) => item.nested !== false) : combined;
  }, [items, extraItems, nested, editor]);

  const filteredItems = useMemo(
    () => filterItems(queryString ?? '', allItems),
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
      ) => {
        const anchorElement = anchorElementRef.current;
        if (!anchorElement || filteredItems.length === 0) {
          return null;
        }
        return createPortal(
          <PortalThemeWrapper>
            <SlashMenuList
              anchorElement={anchorElement}
              options={filteredItems}
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
