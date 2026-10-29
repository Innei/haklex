import { getCommandMeta } from '@haklex/rich-editor/command-registry';
import { $toggleSpoilerSelection } from '@haklex/rich-editor/commands';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import type { LexicalEditor } from 'lexical';
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import type { LucideIcon } from 'lucide-react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  EyeOff,
  Highlighter,
  Italic,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ToolbarButton } from './ToolbarButton';
import type { ToolbarDropdownItem } from './ToolbarDropdown';
import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarSeparator } from './ToolbarSeparator';
import type { ToolbarTooltipHandle } from './types';
import type { ToolbarState } from './use-toolbar-state';

export const TOOLBAR_GAP = 2;
export const TOOLBAR_BUTTON_SIZE = 28;
const SEPARATOR_WIDTH = 13;

export interface ToolbarMenuItem {
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onSelect: () => void;
  shortcut?: string;
}

export interface ToolbarEntry {
  key: string;
  menu?: { items: ToolbarMenuItem[]; label?: string };
  node: ReactNode;
  separator?: boolean;
  width: number;
}

export interface ToolbarButtonSpec extends ToolbarMenuItem {
  key: string;
}

export function separatorEntry(key: string): ToolbarEntry {
  return { key, node: <ToolbarSeparator key={key} />, separator: true, width: SEPARATOR_WIDTH };
}

export function buttonEntry(spec: ToolbarButtonSpec, handle: ToolbarTooltipHandle): ToolbarEntry {
  return {
    key: spec.key,
    width: TOOLBAR_BUTTON_SIZE,
    menu: { items: [spec] },
    node: (
      <ToolbarButton
        active={spec.active}
        disabled={spec.disabled}
        icon={spec.icon}
        key={spec.key}
        shortcut={spec.shortcut}
        title={spec.label}
        tooltipHandle={handle}
        onClick={spec.onSelect}
      />
    ),
  };
}

export function dropdownEntry(
  key: string,
  options: { items: ToolbarDropdownItem[]; label: string; title: string; width: number },
  handle: ToolbarTooltipHandle,
): ToolbarEntry {
  return {
    key,
    width: options.width,
    menu: {
      label: options.title,
      items: options.items.map((item) => ({ ...item, onSelect: item.onSelect })),
    },
    node: (
      <ToolbarDropdown
        items={options.items}
        key={key}
        label={options.label}
        title={options.title}
        tooltipHandle={handle}
        triggerWidth={options.width}
      />
    ),
  };
}

const icon = (Icon: LucideIcon) => <Icon size={16} strokeWidth={2} />;

export function formattingButtons(
  editor: LexicalEditor,
  state: ToolbarState,
): ToolbarButtonSpec[][] {
  const text =
    (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'highlight') => () =>
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  const align = (format: 'left' | 'center' | 'right' | 'justify') => () =>
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);

  return [
    [
      {
        key: 'undo',
        label: 'Undo',
        icon: icon(Undo),
        shortcut: 'Mod+Z',
        disabled: !state.canUndo,
        onSelect: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
      {
        key: 'redo',
        label: 'Redo',
        icon: icon(Redo),
        shortcut: 'Mod+Shift+Z',
        disabled: !state.canRedo,
        onSelect: () => editor.dispatchCommand(REDO_COMMAND, undefined),
      },
    ],
    [
      {
        key: 'bold',
        label: 'Bold',
        icon: icon(Bold),
        shortcut: 'Mod+B',
        active: state.isBold,
        onSelect: text('bold'),
      },
      {
        key: 'italic',
        label: 'Italic',
        icon: icon(Italic),
        shortcut: 'Mod+I',
        active: state.isItalic,
        onSelect: text('italic'),
      },
      {
        key: 'underline',
        label: 'Underline',
        icon: icon(Underline),
        shortcut: 'Mod+U',
        active: state.isUnderline,
        onSelect: text('underline'),
      },
      {
        key: 'strikethrough',
        label: 'Strikethrough',
        icon: icon(Strikethrough),
        active: state.isStrikethrough,
        onSelect: text('strikethrough'),
      },
      {
        key: 'code',
        label: 'Inline code',
        icon: icon(Code),
        active: state.isCode,
        onSelect: text('code'),
      },
    ],
    [
      {
        key: 'highlight',
        label: 'Highlight',
        icon: icon(Highlighter),
        active: state.isHighlight,
        onSelect: text('highlight'),
      },
      {
        key: 'spoiler',
        label: 'Spoiler',
        icon: icon(EyeOff),
        active: state.isSpoiler,
        onSelect: () => editor.update($toggleSpoilerSelection),
      },
    ],
    [
      {
        key: 'bullet',
        label: getCommandMeta('bullet')!.title,
        icon: icon(getCommandMeta('bullet')!.icon),
        active: state.blockType === 'bullet',
        onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
      },
      {
        key: 'number',
        label: getCommandMeta('number')!.title,
        icon: icon(getCommandMeta('number')!.icon),
        active: state.blockType === 'number',
        onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      },
      {
        key: 'check',
        label: getCommandMeta('check')!.title,
        icon: icon(getCommandMeta('check')!.icon),
        active: state.blockType === 'check',
        onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      },
    ],
    [
      {
        key: 'align-left',
        label: 'Align left',
        icon: icon(AlignLeft),
        active: state.elementFormat === 'left' || state.elementFormat === '',
        onSelect: align('left'),
      },
      {
        key: 'align-center',
        label: 'Align center',
        icon: icon(AlignCenter),
        active: state.elementFormat === 'center',
        onSelect: align('center'),
      },
      {
        key: 'align-right',
        label: 'Align right',
        icon: icon(AlignRight),
        active: state.elementFormat === 'right',
        onSelect: align('right'),
      },
      {
        key: 'align-justify',
        label: 'Justify',
        icon: icon(AlignJustify),
        active: state.elementFormat === 'justify',
        onSelect: align('justify'),
      },
    ],
  ];
}
