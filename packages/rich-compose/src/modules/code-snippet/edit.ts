import { codeSnippetEditNodes, CodeSnippetEditRenderer } from '@haklex/rich-ext-code-snippet/edit';

import type { RichEditorModule } from '../../core/types';
import { codeSnippetModule } from './module';

export const codeSnippetEditModule: RichEditorModule = {
  ...codeSnippetModule,
  editNodes: codeSnippetEditNodes,
  editRenderers: { CodeSnippet: CodeSnippetEditRenderer },
};
