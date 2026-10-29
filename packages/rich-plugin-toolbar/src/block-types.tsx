import { getCommandMeta } from '@haklex/rich-editor/command-registry';
import type { LexicalEditor } from 'lexical';
import { createElement } from 'react';

import { applyBlockType, getCodeBlockKlass } from './actions';
import type { BlockType } from './constants';
import { TURN_INTO_BLOCK_TYPES } from './constants';
import type { ToolbarDropdownItem } from './ToolbarDropdown';

export function blockTypeItems(editor: LexicalEditor, active: BlockType): ToolbarDropdownItem[] {
  const hasCodeBlock = getCodeBlockKlass(editor) !== null;
  return TURN_INTO_BLOCK_TYPES.filter(
    (type) => type !== 'code' || hasCodeBlock || active === 'code',
  ).map((type) => {
    const meta = getCommandMeta(type)!;
    return {
      label: meta.title,
      icon: createElement(meta.icon, { size: 16 }),
      active: active === type,
      onSelect: () => applyBlockType(editor, type),
    };
  });
}
