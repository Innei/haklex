import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { LexicalEditor } from 'lexical';
import type { JSX } from 'react';

export class SlashMenuItem extends MenuOption {
  title: string;
  icon: JSX.Element | undefined;
  description: string;
  keywords: string[];
  section: string;
  nested: boolean;
  onSelect: (editor: LexicalEditor, queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      description?: string;
      keywords?: string[];
      section?: string;
      nested?: boolean;
      onSelect: (editor: LexicalEditor, queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.icon = options.icon;
    this.description = options.description ?? '';
    this.keywords = options.keywords ?? [];
    this.section = options.section ?? 'BASIC BLOCKS';
    this.nested = options.nested ?? true;
    this.onSelect = options.onSelect;
  }
}
