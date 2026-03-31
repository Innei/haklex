import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import type { JSX } from 'react';

export type MentionMenuItemType = 'platform' | 'confirm';

export class MentionMenuItem extends MenuOption {
  type: MentionMenuItemType;
  platformKey: string;
  icon: JSX.Element | undefined;
  label: string;
  description: string;
  handleText: string;

  constructor(options: {
    type: MentionMenuItemType;
    platformKey: string;
    icon?: JSX.Element;
    label: string;
    description?: string;
    handleText?: string;
  }) {
    super(options.platformKey + (options.handleText ?? ''));
    this.type = options.type;
    this.platformKey = options.platformKey;
    this.icon = options.icon;
    this.label = options.label;
    this.description = options.description ?? '';
    this.handleText = options.handleText ?? '';
  }
}
