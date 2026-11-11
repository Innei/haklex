import { defineConfigurableModule } from '../../core/configurable-module';
import type { WhiteboardModuleConfig } from './types';

export const { createModule: createWhiteboardModule, useConfig: useWhiteboardModuleConfig } =
  defineConfigurableModule<WhiteboardModuleConfig>({
    name: 'whiteboard',
    defaultConfig: {},
  });
