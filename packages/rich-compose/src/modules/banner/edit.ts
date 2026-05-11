import '@haklex/rich-renderer-banner/style.css';

import { BannerEditRenderer } from '@haklex/rich-renderer-banner';

import type { RichEditorModule } from '../../core/types';
import { bannerModule } from './module';

export const bannerEditModule: RichEditorModule = {
  ...bannerModule,
  editRenderers: { Banner: BannerEditRenderer },
};
