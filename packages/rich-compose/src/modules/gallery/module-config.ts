import { defineConfigurableModule } from '../../core/configurable-module';
import type { ImageModuleConfig } from '../image/types';

export const { createModule: createGalleryModule, useConfig: useGalleryConfig } =
  defineConfigurableModule<ImageModuleConfig>({
    name: 'gallery',
    defaultConfig: {},
  });
