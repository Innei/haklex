import { VideoEditRenderer } from '@haklex/rich-renderer-video';

import type { RichEditorModule } from '../../core/types';
import { videoModule } from './module';

export const videoEditModule: RichEditorModule = {
  ...videoModule,
  editRenderers: { Video: VideoEditRenderer },
};
