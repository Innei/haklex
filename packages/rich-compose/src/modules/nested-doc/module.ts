import type { RichRendererModule } from '../../core/types';
import { nestedDocNodes } from './node';

export const NESTED_DOC_MODULE_NAME = 'nested-doc' as const;

export const nestedDocModule: RichRendererModule = {
  name: NESTED_DOC_MODULE_NAME,
  nodes: nestedDocNodes,
};
