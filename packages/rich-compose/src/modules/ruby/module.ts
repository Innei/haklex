import { RubyRenderer } from '@haklex/rich-renderer-ruby/static';

import type { RichRendererModule } from '../../core/types';

export const rubyModule: RichRendererModule = {
  name: 'ruby',
  renderers: { Ruby: RubyRenderer },
};
