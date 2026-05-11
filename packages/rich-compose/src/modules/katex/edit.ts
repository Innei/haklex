import '@haklex/rich-renderer-katex/style.css';

import { katexEditNodes } from '@haklex/rich-renderer-katex';

import type { RichEditorModule } from '../../core/types';

export const katexEditModule: RichEditorModule = {
  name: 'katex',
  editNodes: katexEditNodes,
};
