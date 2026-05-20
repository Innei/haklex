import { defineConfigurableModule } from '../../core/configurable-module';
import type { NestedDocModuleConfig } from './types';

export const { createModule: createNestedDocModule, useConfig: useNestedDocConfig } =
  defineConfigurableModule<NestedDocModuleConfig>({
    name: 'nested-doc',
    defaultConfig: {},
  });
