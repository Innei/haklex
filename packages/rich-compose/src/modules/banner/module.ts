import { BannerRenderer } from '@haklex/rich-renderer-banner/static';

import type { RichRendererModule } from '../../core/types';

export const BANNER_MODULE_NAME = 'banner' as const;

export const bannerModule: RichRendererModule = {
  name: BANNER_MODULE_NAME,
  renderers: { Banner: BannerRenderer },
};
