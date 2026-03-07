import type { LexicalEditor } from 'lexical';
import type { ReactNode } from 'react';

export type CommandPlacement = 'slash' | 'toolbar' | 'blockHandle';

export type ToolbarGroup = 'history' | 'heading' | 'format' | 'color' | 'list' | 'align' | 'insert';

export interface CommandItemConfig {
  description?: string;
  group?: ToolbarGroup;
  icon?: ReactNode;
  isActive?: (editor: LexicalEditor) => boolean;
  isDisabled?: (editor: LexicalEditor) => boolean;
  keywords?: string[];

  onSelect: (editor: LexicalEditor, queryString: string) => void;
  placement?: CommandPlacement[];
  section?: string;
  shortcut?: string;
  title: string;
}

/** @deprecated Use CommandItemConfig */
export type SlashMenuItemConfig = CommandItemConfig;
