import { VideoRenderer } from '@haklex/rich-renderer-video/static';

import type { RichRendererModule } from '../../core/types';

export const videoModule: RichRendererModule = {
  name: 'video',
  renderers: { Video: VideoRenderer },
};
