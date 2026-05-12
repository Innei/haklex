import { CodeBlockEditRenderer } from '@haklex/rich-renderer-codeblock';

import type { RichEditorModule } from '../../core/types';
import { codeBlockModule } from './module';

export const codeBlockEditModule: RichEditorModule = {
  ...codeBlockModule,
  editRenderers: { CodeBlock: CodeBlockEditRenderer },
};
