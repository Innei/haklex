import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Table,
  TextQuote,
  Type,
} from 'lucide-react'
import { createElement } from 'react'

import { SlashMenuItem } from './SlashMenuItem'

const SECTION_BASIC = 'BASIC BLOCKS'
const SECTION_LIST = 'LISTS'
const ICON_SIZE = 20

export function getBuiltinItems(): SlashMenuItem[] {
  return [
    new SlashMenuItem('Text', {
      icon: createElement(Type, { size: ICON_SIZE }),
      description: 'Plain text block',
      keywords: ['paragraph', 'text', 'plain'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        })
      },
    }),
    new SlashMenuItem('Heading 1', {
      icon: createElement(Heading1, { size: ICON_SIZE }),
      description: 'Large section heading',
      keywords: ['heading', 'h1', 'title'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'))
          }
        })
      },
    }),
    new SlashMenuItem('Heading 2', {
      icon: createElement(Heading2, { size: ICON_SIZE }),
      description: 'Medium section heading',
      keywords: ['heading', 'h2', 'subtitle'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'))
          }
        })
      },
    }),
    new SlashMenuItem('Heading 3', {
      icon: createElement(Heading3, { size: ICON_SIZE }),
      description: 'Small section heading',
      keywords: ['heading', 'h3'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'))
          }
        })
      },
    }),
    new SlashMenuItem('Quote', {
      icon: createElement(TextQuote, { size: ICON_SIZE }),
      description: 'Capture a quote',
      keywords: ['quote', 'blockquote'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return
          const anchorNode = selection.anchor.getNode()
          const element = anchorNode.getTopLevelElementOrThrow()
          const quoteNode = $createQuoteNode()
          const paragraph = $createParagraphNode()
          paragraph.append(...element.getChildren())
          quoteNode.append(paragraph)
          element.replace(quoteNode)
          paragraph.selectEnd()
        })
      },
    }),
    new SlashMenuItem('Divider', {
      icon: createElement(Minus, { size: ICON_SIZE }),
      description: 'Visual separator',
      keywords: ['divider', 'hr', 'rule', 'separator'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0)
      },
    }),
    new SlashMenuItem('Table', {
      icon: createElement(Table, { size: ICON_SIZE }),
      description: 'Add a table',
      keywords: ['table', 'grid'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: '3',
          rows: '3',
          includeHeaders: true,
        })
      },
    }),

    new SlashMenuItem('Bulleted List', {
      icon: createElement(List, { size: ICON_SIZE }),
      description: 'Unordered list',
      keywords: ['list', 'bullet', 'unordered'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0)
      },
    }),
    new SlashMenuItem('Numbered List', {
      icon: createElement(ListOrdered, { size: ICON_SIZE }),
      description: 'Ordered list with numbers',
      keywords: ['list', 'ordered', 'number'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0)
      },
    }),
    new SlashMenuItem('To-do List', {
      icon: createElement(ListChecks, { size: ICON_SIZE }),
      description: 'Track tasks with checkboxes',
      keywords: ['task', 'todo', 'checkbox', 'checklist'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0)
      },
    }),
  ]
}
