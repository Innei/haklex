import { BannerRenderer } from '@haklex/rich-renderer-banner/static';

import type { RichRendererModule } from '../../core/types';

export const bannerModule: RichRendererModule = {
  name: 'banner',
  renderers: { Banner: BannerRenderer },
};
