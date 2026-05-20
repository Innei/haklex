import { defineConfigurableModule } from '../../core/configurable-module';
import type { ImageModuleConfig } from './types';

export const { createModule: createImageModule, useConfig: useImageConfig } =
  defineConfigurableModule<ImageModuleConfig>({
    name: 'image',
    defaultConfig: {},
  });
