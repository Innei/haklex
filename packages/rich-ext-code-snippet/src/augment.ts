import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { CodeSnippetRendererProps } from './types';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    CodeSnippet?: ComponentType<CodeSnippetRendererProps>;
  }
}

export const __augmentLoaded_code_snippet = true;
