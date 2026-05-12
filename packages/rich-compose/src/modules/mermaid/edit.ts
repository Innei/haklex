import { MermaidEditRenderer } from '@haklex/rich-renderer-mermaid';

import type { RichEditorModule } from '../../core/types';
import { mermaidModule } from './module';

export const mermaidEditModule: RichEditorModule = {
  ...mermaidModule,
  editRenderers: { Mermaid: MermaidEditRenderer },
};
