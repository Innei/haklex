import { KaTeXRenderer } from '@haklex/rich-editor/renderers';

import type { RichRendererModule } from '../../core/types';

export const katexModule: RichRendererModule = {
  name: 'katex',
  renderers: { KaTeX: KaTeXRenderer },
};
