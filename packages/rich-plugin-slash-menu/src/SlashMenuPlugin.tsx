import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import type { TextNode } from 'lexical';
import { $getSelection, $isRangeSelection } from 'lexical'
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { getDefaultItems } from './defaultItems'
import type { SlashMenuItem } from './SlashMenuItem'
import { SlashMenuList } from './SlashMenuList'

export interface SlashMenuPluginProps {
  items?: SlashMenuItem[]
  extraItems?: SlashMenuItem[]
  triggerChar?: string
}

function filterItems(query: string, items: SlashMenuItem[]): SlashMenuItem[] {
  if (!query) return items
  const lower = query.toLowerCase()
  return items.filter((item) => {
    if (item.title.toLowerCase().includes(lower)) return true
    return item.keywords.some((kw) => kw.toLowerCase().includes(lower))
  })
}

export function SlashMenuPlugin({
  items,
  extraItems,
  triggerChar = '/',
}: SlashMenuPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const allItems = useMemo(() => {
    if (items) return items
    const defaults = getDefaultItems()
    return extraItems ? [...defaults, ...extraItems] : defaults
  }, [items, extraItems])

  const filteredItems = useMemo(
    () => filterItems(queryString ?? '', allItems),
    [queryString, allItems],
  )

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(triggerChar, {
    minLength: 0,
  })

  const onSelectOption = useCallback(
    (
      option: SlashMenuItem,
      textNodeContainingQuery: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        if (textNodeContainingQuery) {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            textNodeContainingQuery.remove()
          }
        }
      })
      closeMenu()
      option.onSelect(editor, matchingString)
    },
    [editor],
  )

  return (
    <LexicalTypeaheadMenuPlugin<SlashMenuItem>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={filteredItems}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current || filteredItems.length === 0) {
          return null
        }
        return createPortal(
          <SlashMenuList
            options={filteredItems}
            selectedIndex={selectedIndex}
            selectOptionAndCleanUp={selectOptionAndCleanUp}
            setHighlightedIndex={setHighlightedIndex}
          />,
          anchorElementRef.current,
        )
      }}
    />
  )
}
