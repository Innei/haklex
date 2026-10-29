import { getCommandGroupLabel, getCommandMeta } from '@haklex/rich-editor/command-registry';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';
import { createElement } from 'react';

import { SlashMenuItem } from './SlashMenuItem';

const ICON_SIZE = 20;

type BuiltinOptions = Omit<ConstructorParameters<typeof SlashMenuItem>[1], 'icon' | 'section'>;

function builtin(id: string, options: BuiltinOptions): SlashMenuItem {
  const meta = getCommandMeta(id)!;
  return new SlashMenuItem(meta.title, {
    ...options,
    icon: createElement(meta.icon, { size: ICON_SIZE }),
    description: options.description ?? meta.description,
    section: getCommandGroupLabel(meta.group),
  });
}

export function getBuiltinItems(): SlashMenuItem[] {
  return [
    builtin('paragraph', {
      keywords: ['paragraph', 'text', 'plain'],
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
      },
    }),
    builtin('h1', {
      keywords: ['heading', 'h1', 'title'],
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'));
          }
        });
      },
    }),
    builtin('h2', {
      keywords: ['heading', 'h2', 'subtitle'],
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'));
          }
        });
      },
    }),
    builtin('h3', {
      keywords: ['heading', 'h3'],
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'));
          }
        });
      },
    }),
    builtin('quote', {
      keywords: ['quote', 'blockquote'],
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getTopLevelElementOrThrow();
          const quoteNode = $createQuoteNode();
          const paragraph = $createParagraphNode();
          paragraph.append(...element.getChildren());
          quoteNode.append(paragraph);
          element.replace(quoteNode);
          paragraph.selectEnd();
        });
      },
    }),
    builtin('divider', {
      keywords: ['divider', 'hr', 'rule', 'separator'],
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0);
      },
    }),
    builtin('table', {
      keywords: ['table', 'grid'],
      nested: false,
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: '3',
          rows: '3',
          includeHeaders: true,
        });
      },
    }),

    builtin('bullet', {
      keywords: ['list', 'bullet', 'unordered'],
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
      },
    }),
    builtin('number', {
      keywords: ['list', 'ordered', 'number'],
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
      },
    }),
    builtin('check', {
      keywords: ['task', 'todo', 'checkbox', 'checklist'],
      onSelect: (editor: LexicalEditor) => {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0);
      },
    }),
  ];
}
