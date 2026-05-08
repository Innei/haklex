import { MentionRenderer } from '@haklex/rich-renderer-mention/static';

import type { RichRendererModule } from '../../core/types';

export const mentionModule: RichRendererModule = {
  name: 'mention',
  renderers: { Mention: MentionRenderer },
};
