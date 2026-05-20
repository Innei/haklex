import { defineConfigurableModule } from '../../core/configurable-module';
import type { ExcalidrawModuleConfig } from './types';

export const { createModule: createExcalidrawModule, useConfig: useExcalidrawModuleConfig } =
  defineConfigurableModule<ExcalidrawModuleConfig>({
    name: 'excalidraw',
    defaultConfig: {},
  });
