import { $createCodeNode } from '@lexical/code'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import {
  INSERT_ALERT_COMMAND,
  INSERT_IMAGE_COMMAND,
  INSERT_KATEX_BLOCK_COMMAND,
  INSERT_MERMAID_COMMAND,
} from '@shiro/rich-editor'
import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical'

import { SlashMenuItem } from './SlashMenuItem'

const SECTION_BASIC = 'BASIC BLOCKS'
const SECTION_LIST = 'LISTS'
const SECTION_MEDIA = 'MEDIA'
const SECTION_ADVANCED = 'ADVANCED'

export function getDefaultItems(): SlashMenuItem[] {
  return [
    // ─── Basic Blocks ─────────────────────────────────────
    new SlashMenuItem('Text', {
      icon: 'Aa',
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
      icon: 'H1',
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
      icon: 'H2',
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
      icon: 'H3',
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
      icon: '\u201C',
      description: 'Capture a quote',
      keywords: ['quote', 'blockquote'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode())
          }
        })
      },
    }),
    new SlashMenuItem('Divider', {
      icon: '\u2014',
      description: 'Visual separator',
      keywords: ['divider', 'hr', 'rule', 'separator'],
      section: SECTION_BASIC,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND)
      },
    }),
    new SlashMenuItem('Table', {
      icon: '\u25A6',
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

    // ─── Lists ────────────────────────────────────────────
    new SlashMenuItem('Bulleted List', {
      icon: '\u2022',
      description: 'Unordered list',
      keywords: ['list', 'bullet', 'unordered'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
      },
    }),
    new SlashMenuItem('Numbered List', {
      icon: '1.',
      description: 'Ordered list with numbers',
      keywords: ['list', 'ordered', 'number'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
      },
    }),
    new SlashMenuItem('To-do List', {
      icon: '\u2610',
      description: 'Track tasks with checkboxes',
      keywords: ['task', 'todo', 'checkbox', 'checklist'],
      section: SECTION_LIST,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND)
      },
    }),

    // ─── Media ────────────────────────────────────────────
    new SlashMenuItem('Image', {
      icon: '\uD83D\uDDBC',
      description: 'Upload or embed an image',
      keywords: ['image', 'picture', 'photo'],
      section: SECTION_MEDIA,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: '',
          altText: '',
        })
      },
    }),
    new SlashMenuItem('Code Block', {
      icon: '</>',
      description: 'Syntax-highlighted code',
      keywords: ['code', 'snippet', 'codeblock'],
      section: SECTION_MEDIA,
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode())
          }
        })
      },
    }),
    new SlashMenuItem('Mermaid Diagram', {
      icon: '\u25C7',
      description: 'Flowchart, sequence diagram',
      keywords: ['mermaid', 'diagram', 'chart', 'flowchart'],
      section: SECTION_MEDIA,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(
          INSERT_MERMAID_COMMAND,
          'graph TD\n    A[Start] --> B[End]',
        )
      },
    }),

    // ─── Advanced ─────────────────────────────────────────
    new SlashMenuItem('Math Equation', {
      icon: '\u2211',
      description: 'KaTeX block formula',
      keywords: ['math', 'equation', 'latex', 'katex'],
      section: SECTION_ADVANCED,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_KATEX_BLOCK_COMMAND, '')
      },
    }),
    new SlashMenuItem('Callout', {
      icon: '\u2139',
      description: 'Info callout block',
      keywords: ['alert', 'note', 'info', 'callout'],
      section: SECTION_ADVANCED,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ALERT_COMMAND, 'note')
      },
    }),
    new SlashMenuItem('Tip', {
      icon: '\uD83D\uDCA1',
      description: 'Highlight a useful tip',
      keywords: ['alert', 'tip', 'hint'],
      section: SECTION_ADVANCED,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ALERT_COMMAND, 'tip')
      },
    }),
    new SlashMenuItem('Warning', {
      icon: '\u26A0',
      description: 'Warn about something',
      keywords: ['alert', 'warning', 'caution'],
      section: SECTION_ADVANCED,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ALERT_COMMAND, 'warning')
      },
    }),
  ]
}
