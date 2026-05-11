import type { RichRendererModule } from '../../core/types';
import { nestedDocNodes } from './node';

export const nestedDocModule: RichRendererModule = {
  name: 'nested-doc',
  nodes: nestedDocNodes,
};
