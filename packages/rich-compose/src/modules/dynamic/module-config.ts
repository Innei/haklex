import { defineConfigurableModule } from '../../core/configurable-module';
import type { DynamicModuleConfig } from './types';

export const { createModule: createDynamicModule, useConfig: useDynamicModuleConfig } =
  defineConfigurableModule<DynamicModuleConfig>({
    name: 'dynamic',
    defaultConfig: {},
  });
