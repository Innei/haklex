import { RubyEditRenderer } from '@haklex/rich-renderer-ruby';

import type { RichEditorModule } from '../../core/types';
import { rubyModule } from './module';

export const rubyEditModule: RichEditorModule = {
  ...rubyModule,
  editRenderers: { Ruby: RubyEditRenderer },
};
